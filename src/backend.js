import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const sb = url && key ? createClient(url, key) : null;

const fail = (m) => { throw new Error(m); };
const need = () => sb || fail('Le serveur Plume est injoignable.');

const AUTH_ERR = {
  'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
  'User already registered': 'Un compte existe déjà avec cet e-mail. Connecte-toi.',
  'Email not confirmed': 'Confirme ton adresse e-mail avant de te connecter.',
};
const authMsg = (e) => {
  const m = (e && e.message) || '';
  if (AUTH_ERR[m]) return AUTH_ERR[m];
  if (/rate limit/i.test(m)) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (/at least 6/i.test(m)) return 'Le mot de passe doit contenir au moins 6 caractères.';
  return m || 'La connexion a échoué.';
};

/* ===== auth ===== */
export async function getSession() {
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session || null;
}
export async function signUp(name, email, password) {
  const { data, error } = await need().auth.signUp({
    email, password, options: { data: { name }, emailRedirectTo: location.origin },
  });
  if (error) fail(authMsg(error));
  if (!data.session) fail('Compte créé. Confirme ton adresse e-mail, puis connecte-toi.');
  return data.session;
}
export async function signIn(email, password) {
  const { data, error } = await need().auth.signInWithPassword({ email, password });
  if (error && error.message === 'Email not confirmed') {
    await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: location.origin } });
    fail('Confirme ton adresse e-mail avant de te connecter. On vient de te renvoyer le lien.');
  }
  if (error) fail(authMsg(error));
  return data.session;
}
export async function signOut() {
  if (sb) await sb.auth.signOut();
}
export const userName = (session) =>
  (session.user.user_metadata && session.user.user_metadata.name) || session.user.email.split('@')[0];

/* ===== état utilisateur ===== */
export async function loadState(uid) {
  const { data, error } = await need().from('plume_state').select('state').eq('user_id', uid).maybeSingle();
  if (error) throw error;
  return data ? data.state : null;
}
let stateT = null, stateRun = null;
export function saveState(uid, state) {
  clearTimeout(stateT);
  const snapshot = JSON.stringify(state);
  stateRun = async () => {
    stateRun = null;
    try {
      const { error } = await sb.from('plume_state')
        .upsert({ user_id: uid, state: JSON.parse(snapshot), updated_at: new Date().toISOString() });
      if (error) console.error('plume_state', error);
    } catch (e) { console.error(e); }
  };
  stateT = setTimeout(stateRun, 800);
}

/* ===== histoires publiées ===== */
export const remoteId = (msId, uid) => msId + '.' + uid.slice(0, 8);
export async function loadPublished() {
  if (!sb) return [];
  const { data, error } = await sb.from('plume_published').select('id,author_id,author_name,story').order('updated_at', { ascending: false });
  if (error) { console.error('plume_published', error); return []; }
  return data || [];
}
let pubT = null, pubRun = null;
export function syncPublished(uid, authorName, stories) {
  clearTimeout(pubT);
  const rows = stories.map((s) => ({ id: remoteId(s.id, uid), author_id: uid, author_name: authorName, story: s, updated_at: new Date().toISOString() }));
  pubRun = async () => {
    pubRun = null;
    try {
      if (rows.length) {
        const { error } = await sb.from('plume_published').upsert(rows);
        if (error) console.error('plume_published upsert', error);
      }
      let q = sb.from('plume_published').delete().eq('author_id', uid);
      if (rows.length) q = q.not('id', 'in', '(' + rows.map((r) => '"' + r.id + '"').join(',') + ')');
      const { error } = await q;
      if (error) console.error('plume_published delete', error);
    } catch (e) { console.error(e); }
  };
  pubT = setTimeout(pubRun, 1000);
}

// Envoie immédiatement les sauvegardes en attente (avant déconnexion).
export async function flush() {
  clearTimeout(stateT); clearTimeout(pubT);
  await Promise.all([stateRun && stateRun(), pubRun && pubRun()]);
}

/* ===== commentaires partagés ===== */
export async function loadComments() {
  if (!sb) return [];
  const { data, error } = await sb.from('plume_comments').select('key,author_name,body').order('created_at', { ascending: true }).limit(5000);
  if (error) { console.error('plume_comments', error); return []; }
  return data || [];
}
export async function addComment(uid, authorName, key, body) {
  const { error } = await need().from('plume_comments').insert({ key, author_id: uid, author_name: authorName, body });
  if (error) fail('Le commentaire n’a pas pu être publié.');
}

/* ===== coach IA (fonction serveur /api/coach) ===== */
let credits = null;
export const lastCredits = () => credits;
export async function loadCreditsUsed() {
  const d = new Date(), start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
  const { data, error } = await need().from('plume_ai_usage').select('credits').gte('created_at', start);
  if (error) { console.error('plume_ai_usage', error); return null; }
  return (data || []).reduce((a, x) => a + x.credits, 0);
}
const coachErr = (code) => Object.assign(new Error(code), { code });
export async function coachAvailable() {
  try {
    const r = await fetch('/api/coach', { method: 'GET' });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.ok;
  } catch (e) { return false; }
}
export async function coachJson(prompt, signal) {
  const session = await getSession();
  if (!session) throw coachErr('session_expired');
  let r;
  try {
    r = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
      body: JSON.stringify({ prompt }),
      signal,
    });
  } catch (e) {
    if (e && e.name === 'AbortError') throw coachErr('cancelled');
    throw coachErr('network');
  }
  if (r.status === 401) throw coachErr('session_expired');
  if (r.status === 429) throw coachErr('rate_limited');
  if (r.status === 413) throw coachErr('prompt_too_large');
  if (r.status === 402) { const j = await r.json().catch(() => ({})); if (j.credits) credits = j.credits; throw coachErr('budget'); }
  if (r.status === 503 || r.status === 403) throw coachErr('not_granted');
  if (!r.ok) throw coachErr('server');
  const j = await r.json();
  if (j && j.credits) credits = j.credits;
  if (!j || !j.result) throw coachErr('invalid_json');
  return j.result;
}

/* ===== forfait attribué (géré côté serveur) ===== */
export async function loadPlan() {
  const { data, error } = await need().from('plume_entitlements').select('plan').maybeSingle();
  if (error) { console.error('plume_entitlements', error); return null; }
  return data ? data.plan : null;
}

/* ===== compteurs partagés ===== */
const warn = (t) => ({ error }) => { if (error) console.error(t, error); };
export async function loadCounts() {
  if (!sb) return { reads: {}, follows: {} };
  const [r, f] = await Promise.all([
    sb.from('plume_read_counts').select('story_id,n'),
    sb.from('plume_follow_counts').select('followee,n'),
  ]);
  const reads = {}, follows = {};
  (r.data || []).forEach((x) => { reads[x.story_id] = x.n; });
  (f.data || []).forEach((x) => { follows[x.followee] = x.n; });
  if (r.error) console.error(r.error);
  if (f.error) console.error(f.error);
  return { reads, follows };
}
export async function chapterStats(keys) {
  if (!sb || !keys.length) return { reactions: {}, likes: {} };
  const [r, l] = await Promise.all([
    sb.from('plume_reaction_counts').select('key,reaction,n').in('key', keys),
    sb.from('plume_like_counts').select('key,n').in('key', keys),
  ]);
  const reactions = {}, likes = {};
  (r.data || []).forEach((x) => { (reactions[x.key] = reactions[x.key] || {})[x.reaction] = x.n; });
  (l.data || []).forEach((x) => { likes[x.key] = x.n; });
  return { reactions, likes };
}
export function setReaction(uid, key, reaction) {
  const q = reaction
    ? sb.from('plume_reactions').upsert({ user_id: uid, key, reaction })
    : sb.from('plume_reactions').delete().eq('user_id', uid).eq('key', key);
  return q.then(warn('plume_reactions'));
}
export function setLike(uid, key, on) {
  const q = on
    ? sb.from('plume_likes').upsert({ user_id: uid, key })
    : sb.from('plume_likes').delete().eq('user_id', uid).eq('key', key);
  return q.then(warn('plume_likes'));
}
export function markRead(uid, storyId, ch) {
  return sb.from('plume_reads').upsert({ user_id: uid, story_id: storyId, ch }, { ignoreDuplicates: true }).then(warn('plume_reads'));
}
export function setFollow(uid, followee, on) {
  const q = on
    ? sb.from('plume_follows').upsert({ follower: uid, followee })
    : sb.from('plume_follows').delete().eq('follower', uid).eq('followee', followee);
  return q.then(warn('plume_follows'));
}

/* ===== jaquette ===== */
export async function uploadCover(uid, blob) {
  const path = uid + '/' + Date.now() + '.jpg';
  const { error } = await need().storage.from('covers').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) fail('La jaquette n’a pas pu être envoyée.');
  return sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
}
