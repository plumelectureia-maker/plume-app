# Plume - Plateforme d'écriture et de lecture

Plume est une plateforme web complète d'écriture et de lecture de fiction avec authentification, système de suivi d'auteurs, commentaires, et bien plus.

## Stack

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS
- **Backend** : Supabase (PostgreSQL)
- **Auth** : Email/Password via Supabase Auth
- **Stockage** : Supabase Storage (avatars, couvertures)
- **Déploiement** : Vercel + Supabase

## Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd plume-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase** (voir section ci-dessous)

4. **Créer le fichier .env**
```bash
cp .env.example .env
# Remplir avec vos clés Supabase
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

## Configuration Supabase

### 1. Créer un compte Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Attendre que le projet soit prêt

### 2. Configurer la base de données

1. Dans l'interface Supabase, aller à **SQL Editor**
2. Créer une nouvelle query
3. Copier tout le contenu du fichier `SUPABASE_SETUP.sql`
4. Paster dans l'éditeur SQL
5. Exécuter la query
6. Attendre que tous les triggers et fonctions se créent

### 3. Configurer Storage (Stockage d'avatars)

1. Aller à **Storage**
2. Créer un nouveau bucket nommé `avatars`
3. Configurer les permissions :
   - Cliquer sur `avatars` → **Policies**
   - Créer une policy :
     - Name: `Allow public upload`
     - For: `SELECT, INSERT, UPDATE`
     - Using: `true`

### 4. Récupérer les clés

1. Aller à **Settings** → **API**
2. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`

3. Créer `.env` à la racine :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Déploiement sur Vercel

### 1. Préparer le projet

```bash
npm run build
# Vérifier que dist/ a été créé
```

### 2. Sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. **New Project** → Sélectionner le repo GitHub
3. Dans **Environment Variables** :
   - Ajouter `VITE_SUPABASE_URL`
   - Ajouter `VITE_SUPABASE_ANON_KEY`
4. Framework Preset : `Vite`
5. Build Command : `npm run build`
6. Output Directory : `dist`
7. Cliquer **Deploy**

Vercel va :
- Cloner le repo
- Installer les dépendances
- Build le projet
- Deployer automatiquement
- Donner une URL publique (ex: `plume.vercel.app`)

### 3. Autoriser l'URL dans Supabase

1. Dans Supabase, aller à **Settings** → **Auth**
2. Ajouter votre URL Vercel dans **Allowed URLs** :
   ```
   https://plume.vercel.app
   https://plume.vercel.app/auth
   ```

## Fonctionnalités implémentées

### Core
- ✅ Authentification (email/password)
- ✅ Profils utilisateur avec avatar
- ✅ Système de suivi (followers)
- ✅ Création et publication d'histoires
- ✅ Chapitres avec éditeur
- ✅ Commentaires sur les histoires
- ✅ Likes et bookmarks
- ✅ Système de genres
- ✅ Découverte d'histoires
- ✅ Feed personnalisé

### UI/UX
- ✅ Dark mode
- ✅ Mobile-first design
- ✅ Responsive layout
- ✅ Navigation intuitive
- ✅ Système de notifications

### Advanced
- ✅ Real-time updates (Supabase)
- ✅ Historique de lecture
- ✅ Statistiques utilisateur
- ✅ Système de forfaits
- ✅ Upload d'avatars

## Bonus à implémenter

Ces fonctionnalités peuvent être ajoutées facilement :

- [ ] Système d'IA pour suggestions de continuation
- [ ] Export story (PDF/EPUB)
- [ ] Recherche plein texte
- [ ] Système de tags
- [ ] Statistiques d'auteur (lisseurs par jour/semaine)
- [ ] Mode hors-ligne avec Service Worker
- [ ] Notifications en temps réel (WebSocket)
- [ ] Système de rating/étoiles
- [ ] Discussions sur les chapitres
- [ ] Collections publiques d'histoires

## Structure du projet

```
plume-app/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Common.tsx     # Boutons, cards, input, etc.
│   │   └── Navigation.tsx # Top bar + nav tabs
│   ├── pages/             # Pages de l'app
│   │   ├── Home.tsx       # Feed personnalisé
│   │   └── Pages.tsx      # Discover, Write, Profile, Auth, etc.
│   ├── services/          # Services Supabase
│   │   └── supabase.ts    # Toutes les requêtes API
│   ├── store.ts           # Stores Zustand (auth, notifications, UI)
│   ├── types.ts           # Types TypeScript
│   ├── App.tsx            # Routeur principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Styles Tailwind
├── .env.example           # Variables d'environnement
├── SUPABASE_SETUP.sql     # Schéma base de données
├── package.json           # Dépendances
├── vite.config.ts         # Config Vite
├── tsconfig.json          # Config TypeScript
├── index.html             # HTML template
└── README.md              # Ce fichier
```

## Variables d'environnement

```
VITE_SUPABASE_URL       - URL de votre projet Supabase
VITE_SUPABASE_ANON_KEY  - Clé anon de Supabase (publique, sans danger)
```

## Commandes disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Prévisualiser la build
npm run preview

# Lint
npm run lint
```

## Dépannage

### Erreur : "Missing Supabase environment variables"
→ Vérifier que `.env` contient `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Erreur : "401 Unauthorized" sur Supabase
→ Vérifier que les clés dans `.env` sont correctes

### Authentification ne fonctionne pas
→ Vérifier **Auth** → **Allowed URLs** dans Supabase inclut votre URL Vercel

### Page blanche
→ Ouvrir la console du navigateur (F12) et vérifier les erreurs

## Support

Pour toute question ou bug report, créer une issue GitHub.

## Licence

MIT
