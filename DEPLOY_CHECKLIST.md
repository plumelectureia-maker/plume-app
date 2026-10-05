# 🚀 Deployment Checklist — Plume

## ✅ Étape 1 : GitHub (5 min)

**Tu fais :**
1. Va sur [github.com](https://github.com) → New Repository
2. Nomme-le `plume-app`
3. **Public** (obligatoire pour Vercel free tier)
4. **Initialize empty** (pas de README/gitignore)
5. Copie l'URL du repo → `https://github.com/[TON_USERNAME]/plume-app.git`

**Commande pour moi (tu dois l'exécuter après avoir créé le repo vide) :**
```bash
cd /home/claude/plume-app
git init
git add .
git commit -m "Initial commit: Plume fullstack app"
git branch -M main
git remote add origin https://github.com/[TON_USERNAME]/plume-app.git
git push -u origin main
```

*(Je peux le faire si tu me donnes ton GitHub token, sinon tu exécutes ces commandes)*

---

## ✅ Étape 2 : Supabase SQL Setup (3 min)

**Dans Supabase Dashboard :**
1. Ouvre [SQL Editor](https://app.supabase.com/project/yeaomblkrskgenvwlrqf/sql)
2. Clique `New Query`
3. Copie-colle **TOUT** le contenu de `SUPABASE_SETUP.sql`
4. Clique `Run` (ou Ctrl+Enter)
5. Attends que tout passe ✅

**Puis crée le bucket Storage :**
1. Settings → Storage → Buckets
2. `New Bucket` → nom: `avatars`
3. **Public** (cocher "Public bucket")
4. Save

---

## ✅ Étape 3 : Vercel Deploy (5 min)

**Tu fais :**
1. Va sur [vercel.com](https://vercel.com)
2. Clique `Add new project`
3. "Import Git Repository" → cherche `plume-app`
4. Clique `Import`
5. Dans "Environment Variables" → ajoute **exactement** ces 2 vars :
   ```
   VITE_SUPABASE_URL = https://yeaomblkrskgenvwlrqf.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllYW9tYmxrcnNrZ2VudndscnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTM2MzcsImV4cCI6MjEwNjc4OTYzN30.2s6n72XoSpmfPM_k_ErhXcTcMOfikRyNwsEDOWv96bY
   ```
6. Clique `Deploy`
7. Attends ~2 min → tu dois voir "Congratulations!" + une URL comme `https://plume-app-xyz.vercel.app`

**Puis dans Supabase :**
1. Settings → Authentication → Allowed Redirect URLs
2. Ajoute :
   ```
   https://[TON_VERCEL_URL]/auth/callback
   ```
   *(remplace `[TON_VERCEL_URL]` par ce que Vercel te donne)*
3. Save

---

## 🎯 Résultat final

Si tout est ✅ :
- Frontend live sur Vercel
- Backend connected à Supabase
- Utilisateurs peuvent se signup/signin
- Prêt pour tester 🎉

**Problème ?** Les logs Vercel ou Supabase vont te dire quoi.

---

## 📝 Notes

- `.env.local` est déjà configuré localement (variable Supabase)
- Vercel utilise le `package.json` + `vite.config.ts` → build auto
- Supabase triggers/policies gèrent les compteurs auto (followers, likes, etc.)
