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
let fetchFailed = false;
export const lastFetchFailed = () => fetchFailed;
export async function loadPublished() {
  fetchFailed = false;
  if (!sb) return [];
  try {
    const { data, error } = await sb.from('plume_published').select('id,author_id,author_name,story,hidden').order('updated_at', { ascending: false });
    if (error) { console.error('plume_published', error); fetchFailed = true; return []; }
    return data || [];
  } catch (e) { fetchFailed = true; return []; }
}
let pubT = null, pubRun = null, useSched = true;
export const schedulingAvailable = () => useSched;
export function syncPublished(uid, authorName, items) {
  clearTimeout(pubT);
  const rows = items.map((it) => ({
    id: remoteId(it.story.id, uid), author_id: uid, author_name: authorName, story: it.story,
    publish_at: it.publishAt ? new Date(it.publishAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  }));
  pubRun = async () => {
    pubRun = null;
    try {
      if (rows.length) {
        const strip = (r) => { const c = { ...r }; delete c.publish_at; return c; };
        let { error } = await sb.from('plume_published').upsert(useSched ? rows : rows.map(strip));
        // base pas encore mise à jour (colonne d'heure programmée absente) : on publie quand même, sans programmation
        if (error && /publish_at/.test(error.message || '') && useSched) {
          useSched = false;
          ({ error } = await sb.from('plume_published').upsert(rows.map(strip)));
        }
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
  const { data, error } = await sb.from('plume_comments').select('id,key,author_id,author_name,body,hidden').order('created_at', { ascending: true }).limit(5000);
  if (error) { console.error('plume_comments', error); return []; }
  return data || [];
}
export async function addComment(uid, authorName, key, body) {
  const { data, error } = await need().from('plume_comments').insert({ key, author_id: uid, author_name: authorName, body }).select('id');
  if (error) fail('Le commentaire n’a pas pu être publié.');
  return data && data[0] ? data[0].id : null;
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
  if (!sb) return { reads: {}, follows: {}, likes: {}, favs: {} };
  const [r, f, l, v] = await Promise.all([
    sb.from('plume_read_counts').select('story_id,n'),
    sb.from('plume_follow_counts').select('followee,n'),
    sb.from('plume_story_like_counts').select('story_id,n'),
    sb.from('plume_fav_counts').select('story_id,n'),
  ]);
  const reads = {}, follows = {}, likes = {}, favs = {};
  (r.data || []).forEach((x) => { reads[x.story_id] = x.n; });
  (f.data || []).forEach((x) => { follows[x.followee] = x.n; });
  (l.data || []).forEach((x) => { likes[x.story_id] = x.n; });
  (v.data || []).forEach((x) => { favs[x.story_id] = x.n; });
  [r, f, l, v].forEach((q) => { if (q.error) console.error(q.error); });
  return { reads, follows, likes, favs };
}
export function setFavorite(uid, storyId, on) {
  const q = on
    ? sb.from('plume_favorites').upsert({ user_id: uid, story_id: storyId })
    : sb.from('plume_favorites').delete().eq('user_id', uid).eq('story_id', storyId);
  return q.then(warn('plume_favorites'));
}
export function syncFavorites(uid, ids) {
  if (!ids.length) return Promise.resolve();
  return sb.from('plume_favorites')
    .upsert(ids.map((story_id) => ({ user_id: uid, story_id })), { ignoreDuplicates: true })
    .then(warn('plume_favorites sync'));
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

/* ===== mot de passe oublié ===== */
let recovering = false;
const recoveryCbs = [];
if (sb) {
  sb.auth.onAuthStateChange((ev) => {
    if (ev === 'PASSWORD_RECOVERY') { recovering = true; recoveryCbs.forEach((f) => f()); }
  });
}
export const isRecovering = () => recovering;
export const clearRecovering = () => { recovering = false; };
export const onRecovery = (f) => { recoveryCbs.push(f); };
export async function resetPassword(email) {
  const { error } = await need().auth.resetPasswordForEmail(email, { redirectTo: location.origin });
  // On ne révèle jamais si l'adresse existe ; seul un blocage de fréquence est signalé.
  if (error && /rate|seconds/i.test(error.message || '')) fail('Trop de demandes. Réessaie dans quelques minutes.');
}
export async function updatePassword(pw) {
  const { error } = await need().auth.updateUser({ password: pw });
  if (error) {
    if (/same/i.test(error.message || '')) fail('Choisis un mot de passe différent de l’ancien.');
    if (/at least/i.test(error.message || '')) fail('Le mot de passe doit contenir au moins 6 caractères.');
    fail('Le mot de passe n’a pas pu être modifié. Le lien a peut-être expiré : redemande-en un.');
  }
}

/* ===== suppression du compte ===== */
export function cancelPending() { clearTimeout(stateT); clearTimeout(pubT); stateRun = null; pubRun = null; }
export async function deleteAccount(uid) {
  cancelPending();
  try {
    const { data } = await need().storage.from('covers').list(uid, { limit: 200 });
    if (data && data.length) await sb.storage.from('covers').remove(data.map((f) => uid + '/' + f.name));
  } catch (e) { console.error('covers', e); }
  const { error } = await sb.rpc('delete_my_account');
  if (error) fail('La suppression n’a pas pu aboutir. Réessaie plus tard.');
  await sb.auth.signOut();
}

/* ===== signalements, blocages, commentaires ===== */
export async function reportContent(uid, type, id, reason, details) {
  const { error } = await need().from('plume_reports').upsert(
    { reporter: uid, target_type: type, target_id: String(id), reason, details: details || null },
    { onConflict: 'reporter,target_type,target_id', ignoreDuplicates: true });
  if (error) fail('Le signalement n’a pas pu être envoyé.');
}
export async function loadBlocks() {
  if (!sb) return [];
  const { data, error } = await sb.from('plume_blocks').select('blocked,blocked_name');
  if (error) { console.error('plume_blocks', error); return []; }
  return data || [];
}
export async function blockUser(uid, blocked, name) {
  const { error } = await need().from('plume_blocks').upsert({ blocker: uid, blocked, blocked_name: name || null });
  if (error) fail('Le blocage n’a pas pu être enregistré.');
}
export async function unblockUser(uid, blocked) {
  const { error } = await need().from('plume_blocks').delete().eq('blocker', uid).eq('blocked', blocked);
  if (error) fail('Le déblocage n’a pas pu être enregistré.');
}
export async function deleteComment(id) {
  const { error } = await need().from('plume_comments').delete().eq('id', id);
  if (error) fail('Le commentaire n’a pas pu être supprimé.');
}

/* ===== statistiques d'auteur ===== */
export async function loadStoryStats(storyId, nChapters) {
  const chKeys = [], cmKeys = ['s:' + storyId];
  for (let i = 0; i < nChapters; i++) { chKeys.push(storyId + ':' + i); cmKeys.push('c:' + storyId + ':' + i); }
  const [r, l, c, t] = await Promise.all([
    need().from('plume_chapter_reads').select('ch,n').eq('story_id', storyId),
    sb.from('plume_like_counts').select('key,n').in('key', chKeys),
    sb.from('plume_comment_counts').select('key,n').in('key', cmKeys),
    sb.from('plume_read_trend').select('d7,d14').eq('story_id', storyId),
  ]);
  [r, l, c, t].forEach((q) => { if (q.error) console.error('stats', q.error); });
  if (r.error) throw new Error('stats');
  const chapters = [];
  for (let i = 0; i < nChapters; i++) chapters.push({ reads: 0, likes: 0, comments: 0 });
  (r.data || []).forEach((x) => { if (chapters[x.ch]) chapters[x.ch].reads = x.n; });
  (l.data || []).forEach((x) => { const i = +x.key.split(':').pop(); if (chapters[i]) chapters[i].likes = x.n; });
  let storyComments = 0;
  (c.data || []).forEach((x) => {
    if (x.key === 's:' + storyId) storyComments = x.n;
    else { const i = +x.key.split(':').pop(); if (chapters[i]) chapters[i].comments = x.n; }
  });
  const tr = (t.data && t.data[0]) || { d7: 0, d14: 0 };
  return { chapters, storyComments, d7: tr.d7, d14: tr.d14 };
}

/* ===== notifications ===== */
export async function loadNotifications() {
  const [n, a] = await Promise.all([
    need().from('plume_notifications').select('id,kind,actor_id,actor_name,story_id,story_title,body,read,visible_at').order('visible_at', { ascending: false }).limit(60),
    sb.from('plume_announcements').select('id,title,body,created_at').order('created_at', { ascending: false }).limit(10),
  ]);
  if (n.error) throw new Error('notifications');
  return { notifs: n.data || [], announcements: a.error ? [] : (a.data || []) };
}
export async function markNotifsRead(ids) {
  if (!ids.length) return;
  const { error } = await need().from('plume_notifications').update({ read: true }).in('id', ids);
  if (error) console.error('notifications', error);
}
export async function clearNotifications(uid) {
  const { error } = await need().from('plume_notifications').delete().eq('user_id', uid);
  if (error) fail('Les notifications n’ont pas pu être effacées.');
}

/* ===== historique des versions ===== */
export async function loadVersions(uid, msId, ch) {
  const { data, error } = await need().from('plume_versions').select('snaps').eq('user_id', uid).eq('ms_id', msId).eq('ch', ch).maybeSingle();
  if (error) throw new Error('versions');
  return data && Array.isArray(data.snaps) ? data.snaps : [];
}
export async function saveVersions(uid, msId, ch, snaps) {
  const { error } = await need().from('plume_versions').upsert({ user_id: uid, ms_id: msId, ch, snaps, updated_at: new Date().toISOString() });
  if (error) throw new Error('versions');
}
