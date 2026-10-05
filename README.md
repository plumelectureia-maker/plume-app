# Plume

Application d'écriture et de lecture de fiction avec coach IA. Interface identique au prototype (HTML/CSS/JS), servie par Vite, données dans Supabase, coach IA via une fonction Vercel.

## Mise en route

1. Supabase > SQL Editor : exécuter `SUPABASE_PLUME.sql` (une seule fois).
2. Vercel > Settings > Environment Variables :
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (déjà en place)
   - `ANTHROPIC_API_KEY` pour activer le coach IA (sans elle, le coach fait l'analyse locale simplifiée)
   - `ANTHROPIC_MODEL` (facultatif)
3. Redéployer.

## Local

```
npm install
npm run dev
```

## Fichiers

- `index.html`, `src/style.css`, `src/app.js` : l'interface du prototype
- `src/backend.js` : comptes, sauvegarde, histoires publiées, commentaires, appel du coach
- `api/coach.js` : fonction serveur qui appelle l'API Anthropic (clé jamais exposée au navigateur)
- `SUPABASE_PLUME.sql` : tables `plume_state`, `plume_published`, `plume_comments` et règles d'accès
