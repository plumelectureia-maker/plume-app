# Guide complet de déploiement - Plume App

Ce guide vous accompagne pas à pas pour déployer Plume en production.

## Phase 1 : Supabase (10 min)

### Étape 1.1 - Créer un compte Supabase

1. Aller sur https://supabase.com
2. Cliquer sur **Start your project**
3. S'authentifier avec GitHub/Google
4. Créer une nouvelle organisation
5. Créer un nouveau projet :
   - Nom : "plume-app" (ou ce que vous voulez)
   - Database password : **à NOTER (très important)**
   - Région : la plus proche de vos utilisateurs
   - Cliquer **Create new project**
6. Attendre 3-5 min que le projet soit prêt

### Étape 1.2 - Configurer la base de données

1. Dans Supabase, aller à **SQL Editor** (menu de gauche)
2. Créer une nouvelle query :
   - Cliquer **New query**
3. Copier TOUT le contenu de `SUPABASE_SETUP.sql` du projet
4. Coller dans l'éditeur SQL
5. Cliquer **Run** (le bouton bleu en bas à droite)
6. Attendre que tout s'exécute (les tables et triggers se créent)
7. Vous devriez voir "Query succeeded" en vert

**⚠️ Important** : Vérifiez qu'il n'y a pas d'erreurs en rouge. Si oui, signaler-les à Claude.

### Étape 1.3 - Créer le bucket Storage pour les avatars

1. Dans Supabase, aller à **Storage** (menu de gauche)
2. Cliquer **Create a new bucket**
3. Nom : `avatars`
4. Cocher **Public bucket** (important pour les images)
5. Cliquer **Create bucket**

### Étape 1.4 - Configurer les permissions Storage

1. Cliquer sur le bucket `avatars` qu'on vient de créer
2. Aller à l'onglet **Policies**
3. Cliquer **New policy**
4. Choisir **For every user** dans "Who can access this?"
5. Policy name : `Allow public read`
6. Operation : cocher `SELECT`
7. Cliquer **Review** puis **Save policy**

Répéter pour :
- Operation: `INSERT` | Policy name: `Allow public upload`
- Operation: `UPDATE` | Policy name: `Allow public update`

### Étape 1.5 - Récupérer les clés API

1. Aller à **Settings** (en bas du menu de gauche)
2. Cliquer **API**
3. Vous verrez :
   - **Project URL** → copier cette URL
   - **Anon Key** → copier cette clé
4. Les noter quelque part (on en aura besoin)

## Phase 2 : Installer l'app locale (5 min)

### Étape 2.1 - Télécharger et installer

```bash
# Télécharger le code (ou cloner si sur GitHub)
cd plume-app

# Installer les dépendances
npm install
# (Attendre que tout s'installe, 2-3 min)
```

### Étape 2.2 - Configurer les variables d'environnement

1. Créer un fichier `.env` à la racine du projet
2. Y ajouter :

```env
VITE_SUPABASE_URL=https://votre-project.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key-ici
```

**Attention** : Remplacer par les vraies valeurs de l'étape 1.5

### Étape 2.3 - Tester localement

```bash
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur.

Vous devriez voir la page d'authentification.

Tester :
1. Créer un compte (email fictif OK, ex: test@exemple.com)
2. Se connecter
3. Naviguer sur chaque page pour vérifier que tout marche

**Ctrl+C** pour arrêter le serveur quand vous avez fini.

## Phase 3 : Vercel Deployment (5 min)

### Étape 3.1 - Préparer le code

```bash
# Vérifier que la build fonctionne
npm run build

# Si pas d'erreurs, c'est bon
```

### Étape 3.2 - Pousser sur GitHub

Si pas encore fait :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/plume-app.git
git push -u origin main
```

### Étape 3.3 - Déployer sur Vercel

1. Aller sur https://vercel.com
2. S'authentifier (GitHub recommandé)
3. Cliquer **Add New...** → **Project**
4. Importer le repo `plume-app`
5. Laisser les defaults :
   - Framework Preset : `Vite`
   - Build Command : `npm run build`
   - Output Directory : `dist`
6. Mais **IMPORTANT** : Dans **Environment Variables**, ajouter :
   - Clé : `VITE_SUPABASE_URL` | Valeur : votre URL Supabase
   - Clé : `VITE_SUPABASE_ANON_KEY` | Valeur : votre Anon Key
7. Cliquer **Deploy**

Vercel va lancer le build. Attendre quelques minutes...

Vous allez recevoir une URL : `https://plume-app-xxxx.vercel.app`

### Étape 3.4 - Configurer Supabase pour l'URL Vercel

1. Retourner dans Supabase
2. Aller à **Settings** → **Auth**
3. Trouver **Allowed URLs** (onglet)
4. Ajouter ces URLs :
   ```
   https://plume-app-xxxx.vercel.app
   https://plume-app-xxxx.vercel.app/auth
   ```
   (Remplacer `plume-app-xxxx` par votre vrai slug Vercel)

5. Cliquer **Save**

### Étape 3.5 - Test final

1. Ouvrir votre URL Vercel dans le navigateur
2. Créer un compte
3. Se connecter
4. Tester les fonctionnalités

🎉 **Vous avez déployé Plume !**

## Debugging

### Erreur : "Supabase keys are missing"
→ Vous avez oublié les variables d'environnement dans Vercel
→ Solution : Aller dans Vercel **Settings** → **Environment Variables**, les ajouter, et redéployer

### Erreur : "401 Unauthorized"
→ Les clés Supabase ne sont pas les bonnes
→ Solution : Vérifier dans Supabase Settings → API

### Erreur : "Auth failed"
→ L'URL Vercel n'est pas dans "Allowed URLs" de Supabase
→ Solution : Voir étape 3.4

### Erreur : "Page blanche"
→ Ouvrir la console du navigateur (F12)
→ Chercher les erreurs en rouge
→ Signaler-les

## Mise à jour du code

Si vous changez le code localement :

```bash
git add .
git commit -m "Description des changements"
git push
```

Vercel va automatiquement redéployer ! (attendre 2-3 min)

## Domaine personnalisé (optionnel)

1. Dans Vercel, aller au projet → **Settings** → **Domains**
2. Ajouter votre domaine
3. Suivre les instructions pour pointer le DNS

## Support

- Erreurs Supabase ? → Checker la console SQL de Supabase
- Erreurs build ? → Checker les logs Vercel
- Questions générales ? → GitHub issues ou contacter Claude

Bon déploiement ! 🚀
