# ⚡ Quick Start - Plume en 15 min

## Prérequis
- Node.js 18+
- Compte GitHub (pour Vercel)

## Phase 1 : Local (5 min)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env (copier de .env.example)
cp .env.example .env

# 3. Remplir .env avec des clés Supabase
# (voir DEPLOYMENT_GUIDE.md pour obtenir les clés)

# 4. Lancer
npm run dev

# 5. Ouvrir http://localhost:5173
```

## Phase 2 : Supabase (5 min)

1. Aller sur https://supabase.com
2. Créer un projet
3. Dans **SQL Editor**, copier tout `SUPABASE_SETUP.sql` et exécuter
4. Créer bucket `avatars` dans **Storage**
5. Dans **Settings → API**, copier les clés
6. Les paster dans `.env`

## Phase 3 : Deploy (5 min)

```bash
# 1. Push sur GitHub
git add . && git commit -m "Initial" && git push

# 2. Sur vercel.com
# - Importer le repo GitHub
# - Ajouter les variables d'env (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY)
# - Cliquer Deploy

# 3. Dans Supabase Settings → Auth, ajouter votre URL Vercel dans Allowed URLs
```

## Fichiers clés à connaître

| Fichier | Ce qu'il fait |
|---------|---------------|
| `src/App.tsx` | Routing de l'app |
| `src/store.ts` | État global (auth, notifications) |
| `src/services/supabase.ts` | Tous les appels API |
| `src/components/Common.tsx` | Composants réutilisables |
| `SUPABASE_SETUP.sql` | Schéma base de données |
| `.env` | Variables d'environnement |

## Commandes utiles

```bash
npm run dev          # Développement local
npm run build        # Builder pour production
npm run preview      # Prévisualiser la build
npm run lint         # Vérifier le code

# Scripts de setup
bash scripts/setup.sh      # Mac/Linux
scripts/setup.bat          # Windows
```

## Créer une nouvelle fonctionnalité

1. **Créer le composant** : `src/components/MonComposant.tsx`
2. **Ajouter l'appel API** : Dans `src/services/supabase.ts`
3. **Créer une page si besoin** : `src/pages/MonPage.tsx`
4. **Ajouter la route** : `src/App.tsx`
5. **Tester localement** : `npm run dev`

## Exemple : Ajouter un bouton "Favoris"

```typescript
// 1. Dans Common.tsx
<button onClick={onFavorite}>⭐ Favoris</button>

// 2. Dans supabase.ts
export const favorites = {
  add: async (userId, storyId) => {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, story_id: storyId });
  },
};

// 3. Dans le composant
const handleFavorite = async () => {
  await storiesService.favorites.add(user.id, story.id);
};
```

## Où trouver de l'aide

- Erreurs Supabase ? → Checker la console SQL de Supabase
- Erreurs build ? → Voir les logs de Vercel
- Erreurs runtime ? → F12 dans le navigateur, onglet Console
- Architecture ? → Lire `ARCHITECTURE.md`
- Déploiement ? → Lire `DEPLOYMENT_GUIDE.md`

## Points de référence

- **Frontend** : React 19, TypeScript, Tailwind
- **Backend** : Supabase (PostgreSQL)
- **Auth** : Email/password
- **State** : Zustand
- **Build** : Vite

## Test de deploy

Pour vérifier que tout marche :

```bash
npm run build
npm run preview
```

Si ça marche localement, ça marchera sur Vercel.

---

🚀 **C'est tout ! Vous êtes prêt à développer !**

Besoin d'aide ? Voir README.md ou ARCHITECTURE.md
