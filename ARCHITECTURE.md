# Architecture de Plume

## Vue d'ensemble

Plume est une application single-page React fullstack avec :
- **Frontend** : React 19 + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **State Management** : Zustand
- **Build Tool** : Vite
- **Hosting** : Vercel (frontend) + Supabase (backend)

## Flux de données

```
User Input (UI)
      ↓
React Components
      ↓
Zustand Stores (state global)
      ↓
Custom Hooks (logique métier)
      ↓
Supabase Service (API calls)
      ↓
Supabase Backend (DB + Auth + RLS)
```

## Structure des fichiers

```
src/
├── main.tsx              # Entry point React
├── App.tsx               # Router principal + routing
├── index.css             # Styles Tailwind global
├── types.ts              # Types TypeScript
├── store.ts              # Zustand stores (auth, notifications, UI)
├── hooks.ts              # Custom React hooks
├── utils.ts              # Fonctions utilitaires
│
├── components/
│   ├── Navigation.tsx    # Top bar + bottom nav
│   ├── Common.tsx        # Composants réutilisables
│   │                     #  - Button, Card, Input, Textarea
│   │                     #  - StoryCover, StoryItem
│   │                     #  - Modal, Loading, EmptyState
│   └── (autres)
│
├── pages/
│   ├── Home.tsx          # Feed personnalisé
│   ├── Pages.tsx         # Discover, Write, Profile, Auth,
│   │                     # StoryDetail, NotFound
│   └── index.ts          # Réexports
│
└── services/
    └── supabase.ts       # Tous les appels API
```

## Flux d'authentification

```
1. Utilisateur clique "S'inscrire" (page Auth)
2. Soumettre email + password + username
3. useAuthStore.signUp() appelé
4. supabase.auth.signUp() crée un utilisateur auth
5. Créer un profil utilisateur dans la table users
6. Rediriger vers Home
7. useAuthStore.fetchUser() récupère le profil
8. L'utilisateur est connecté
```

## Flux de création d'une histoire

```
1. Utilisateur clique "+ Nouvelle" (page Write)
2. Remplir le titre
3. storiesService.createStory(userId, {title})
4. Supabase insère dans la table stories
5. Rediriger vers /story/{slug}
6. Utilisateur peut ajouter des chapitres
7. chaptersService.createChapter() pour chaque chapitre
8. Publier avec storiesService.publishStory()
```

## Système de notifications

Les notifications sont créées automatiquement par des **triggers SQL** quand :
- Quelqu'un follow l'utilisateur → `new_follower`
- Quelqu'un like une histoire → `new_like`
- Quelqu'un commente une histoire → `new_comment`
- Un auteur suivi publie un chapitre → `new_chapter`

Frontend : polling toutes les 30s via `useNotificationStore.fetchNotifications()`

## Row Level Security (RLS)

Chaque table a des policies qui définissent qui peut lire/écrire :

```
users: 
  - Lire : public (SELECT)
  - Modifier : que soi-même (UPDATE self)

stories:
  - Lire : publiques ou propres (SELECT published OR own)
  - Créer : authentifiés (INSERT)
  - Modifier : auteur seulement (UPDATE owner)

comments:
  - Lire : public (SELECT)
  - Créer : authentifiés (INSERT)
  - Modifier : sa propre (UPDATE self)
```

## Stores Zustand

### useAuthStore
```typescript
{
  user: User | null        // Profil connecté
  loading: boolean
  signUp()                 // Créer compte
  signIn()                 // Se connecter
  signOut()                // Déconnecter
  fetchUser()              // Charger profil actuel
}
```

### useNotificationStore
```typescript
{
  notifications: Notification[]
  unreadCount: number
  fetchNotifications(userId)
  markAsRead(id)
  markAllAsRead(userId)
}
```

### useUIStore
```typescript
{
  isDarkMode: boolean
  toggleDarkMode()
  sidebarOpen: boolean
  toggleSidebar()
}
```

## Services Supabase

Le fichier `services/supabase.ts` contient tous les appels API :

### auth
- `signUp(email, password, username)`
- `signIn(email, password)`
- `signOut()`
- `getCurrentUser()`

### users
- `getProfile(userId)`
- `getProfileByUsername(username)`
- `updateProfile(userId, updates)`
- `follow(followerId, followingId)`
- `isFollowing(followerId, followingId)`
- `getFollowers(userId)`
- `getFollowing(userId)`

### stories
- `getStory(storyId)`
- `getStoriesByAuthor(authorId)`
- `getDiscoverStories(genre?, page)`
- `getFeedStories(userId, page)`
- `createStory(authorId, story)`
- `updateStory(storyId, updates)`
- `publishStory(storyId)`
- `like(storyId, userId)`
- `unlike(storyId, userId)`
- `bookmark(storyId, userId)`
- `isBookmarked(storyId, userId)`

### chapters
- `getChapters(storyId)`
- `getChapter(chapterId)`
- `createChapter(storyId, chapter)`
- `updateChapter(chapterId, updates)`
- `deleteChapter(chapterId)`

### comments
- `getComments(storyId, page)`
- `addComment(storyId, userId, content)`
- `deleteComment(commentId)`

### readingHistory
- `updateProgress(userId, storyId, progress)`
- `getHistory(userId, page)`

### notifications
- `getNotifications(userId)`
- `markAsRead(notificationId)`
- `markAllAsRead(userId)`

## Types principaux

```typescript
User {
  id, email, username, avatar_url, bio, role,
  followers_count, stories_count, reading_time_minutes,
  plan, plan_expires_at, created_at, updated_at
}

Story {
  id, author_id, title, slug, summary,
  cover_color_1, cover_color_2, cover_pattern,
  genre, status (draft|published|completed),
  reading_time_minutes, views_count, likes_count,
  comments_count, created_at, updated_at, published_at,
  author, is_liked, is_bookmarked
}

Chapter {
  id, story_id, title, content, chapter_number,
  reading_time_minutes, created_at, updated_at
}

Comment {
  id, story_id, user_id, content, likes_count,
  created_at, updated_at, user
}

Notification {
  id, user_id, type (new_follower|new_like|new_comment|new_chapter),
  from_user_id, story_id, is_read, created_at,
  from_user, story
}
```

## Conventions de code

### Nommage
- Fichiers composants : PascalCase (Home.tsx)
- Fichiers services : camelCase (supabase.ts)
- Variables : camelCase
- Types : PascalCase

### Organisation des composants
```typescript
// Imports
import React, { useState } from 'react';

// Props interface
interface ComponentProps {
  title: string;
  onClose?: () => void;
}

// Component
export const Component: React.FC<ComponentProps> = ({
  title,
  onClose
}) => {
  const [state, setState] = useState('');

  return (
    <div>{title}</div>
  );
};

export default Component;
```

### Gestion des erreurs
```typescript
try {
  const data = await someAsyncCall();
  // success
} catch (error) {
  const message = parseSupabaseError(error);
  showError(message);
}
```

## Performance

### Code splitting
Les pages sont automatiquement lazy-loaded par React Router.

### Optimisations
- Zustand pour les updates granulaires du state
- Memoization avec `React.memo` pour les composants coûteux
- Debounce pour les inputs (voir `useDebounce` hook)

### Images
- Stockage sur Supabase Storage
- URLs CDN automatiques
- WebP si supporté

## Sécurité

### Authentification
- Supabase Auth gère les sessions
- Tokens JWT côté client
- Session Storage dans le navigateur

### RLS (Row Level Security)
- Chaque utilisateur ne voit que ce qu'il a permission de voir
- Les policies empêchent les accès non-autorisés au niveau BD

### Données sensibles
- Les clés Supabase ne doivent PAS contenir la clé admin
- Utiliser la clé "Anon" (limiter les permissions)
- Variables d'environnement pour les clés

## Déploiement

```
git push → GitHub
         ↓
    Vercel détecte
         ↓
    npm run build
         ↓
    dist/ est déployé
         ↓
    URL publique
```

Les variables d'environnement sont définies dans Vercel Settings.

## Améliorations futures

- [ ] Service Workers (offline mode)
- [ ] WebSockets (real-time notifications)
- [ ] Full-text search
- [ ] AI recommendations
- [ ] PDF export
- [ ] Analytics dashboard
- [ ] Admin panel
