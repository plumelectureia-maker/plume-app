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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const prompt = String(body.prompt || '');
  if (!prompt) return res.status(400).json({ error: 'empty' });
  if (prompt.length > MAX_PROMPT) return res.status(413).json({ error: 'prompt_too_large' });

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
  return res.status(200).json({ result });
}
