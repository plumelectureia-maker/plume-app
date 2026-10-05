// Coach IA : relaie le prompt vers l'API Anthropic. La clé reste côté serveur.
const MAX_PROMPT = 40000;

const supabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function verifyUser(token) {
  if (!token || !supabaseUrl() || !supabaseKey()) return null;
  const r = await fetch(supabaseUrl() + '/auth/v1/user', {
    headers: { apikey: supabaseKey(), Authorization: 'Bearer ' + token },
  });
  return r.ok ? r.json() : null;
}

// Crédits mensuels par forfait et coût de chaque utilisation.
const QUOTA = { plus: 50, pp: 200 };
const costOf = (prompt) => (prompt.includes('"priorite"') ? 4 : 1);

const rest = (token, path, init = {}) =>
  fetch(supabaseUrl() + '/rest/v1/' + path, {
    ...init,
    headers: { apikey: supabaseKey(), Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

// Seuls les comptes dont le forfait est attribué dans plume_entitlements utilisent l'IA.
async function getPlan(token) {
  const r = await rest(token, 'plume_entitlements?select=plan');
  if (!r.ok) return null;
  const rows = await r.json();
  const p = rows.map((x) => x.plan).find((x) => QUOTA[x]);
  return p || null;
}

async function creditsUsed(token) {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
  const r = await rest(token, 'plume_ai_usage?select=credits&created_at=gte.' + encodeURIComponent(start));
  if (!r.ok) return null;
  return (await r.json()).reduce((a, x) => a + x.credits, 0);
}

function extractJson(text) {
  const clean = String(text || '').replace(/```json|```/g, '').trim();
  try { return JSON.parse(clean); } catch (e) { /* continue */ }
  const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(clean.slice(a, b + 1)); } catch (e) { return null; }
}

export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ ok: !!key });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!key) return res.status(503).json({ error: 'not_configured' });

  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const user = await verifyUser(token);
  if (!user) return res.status(401).json({ error: 'session_expired' });
  const plan = await getPlan(token);
  if (!plan) return res.status(403).json({ error: 'not_subscribed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const prompt = String(body.prompt || '');
  if (!prompt) return res.status(400).json({ error: 'empty' });
  if (prompt.length > MAX_PROMPT) return res.status(413).json({ error: 'prompt_too_large' });

  const quota = QUOTA[plan], cost = costOf(prompt);
  const used = await creditsUsed(token);
  if (used == null) return res.status(503).json({ error: 'usage_unavailable' });
  if (used + cost > quota) return res.status(402).json({ error: 'budget', credits: { used, quota } });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
  if (!r.ok) {
    console.error('anthropic', r.status, await r.text());
    return res.status(502).json({ error: 'upstream' });
  }
  const data = await r.json();
  const text = (data.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('\n');
  const result = extractJson(text);
  if (!result) return res.status(502).json({ error: 'invalid_json' });
  const ins = await rest(token, 'plume_ai_usage', {
    method: 'POST',
    body: JSON.stringify({ user_id: user.id, credits: cost, kind: cost === 4 ? 'global' : 'single' }),
  });
  if (!ins.ok) console.error('plume_ai_usage insert', ins.status, await ins.text());
  return res.status(200).json({ result, credits: { used: used + cost, quota } });
}
