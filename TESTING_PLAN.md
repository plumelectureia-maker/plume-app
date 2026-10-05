# 🧪 PLUME - TESTING PLAN

## Étape 1 : Insérer les données de test (REQUIS)

### Via SQL Editor Supabase

1. Ouvre https://app.supabase.com → Select Project "plume"
2. Vais dans `SQL Editor` → `New query`
3. Copie-colle le contenu du fichier `INSERT_TEST_DATA.sql`
4. Remplace `dc48646f-aae6-4559-971b-5a4e18120b11` par ton user UUID si tu as un autre compte
5. Execute la query

Tu dois voir :
```
Stories crées: 5
Chapters total: 2
```

---

## Étape 2 : Test Auth & Signup

**URL:** https://n-plume9.vercel.app

### Test 2.1 : Signup avec email/password

- Clique sur "S'inscrire"
- Entre un email valide (ex: `testuser@example.com`)
- Entre un mot de passe fort
- Entre un username
- Clique "S'inscrire"

**Attendus:**
- ✅ Pas d'erreur
- ✅ Redirigé vers `/home` ou `/discover`
- ✅ Username affiché en haut
- ✅ Confirmation email peut être ignorée (Supabase free tier)

### Test 2.2 : Login

- Logout
- Rentre tes credentials
- Clique "Se connecter"

**Attendus:**
- ✅ Login réussi
- ✅ Redirigé vers `/discover` ou `/home`

---

## Étape 3 : Test Découvrir (Home Page)

**URL:** https://n-plume9.vercel.app

### Test 3.1 : Affichage du feed

- Accède à la page d'accueil
- Scroll pour voir les histoires

**Attendus:**
- ✅ Les 5 histoires de test s'affichent
- ✅ Chaque histoire montre : titre, auteur, genre, reading time
- ✅ Pas de "Aucune histoire" message

### Test 3.2 : Like & Bookmark

- Clique sur le cœur d'une histoire
- Clique sur le bookmark d'une autre

**Attendus:**
- ✅ Les icônes changent de couleur (filled → empty ou vice versa)
- ✅ Pas d'erreur console
- ✅ Si refresh la page, les likes/bookmarks persistent

### Test 3.3 : Pagination

- Scroll jusqu'en bas si > 10 histoires
- Clique "Suivant"

**Attendus:**
- ✅ Charge la page suivante

---

## Étape 4 : Test Découvrir (Discover Page)

**URL:** https://n-plume9.vercel.app → Tab "Découvrir"

### Test 4.1 : Filtre par genre

- Clique sur un genre (ex: "Fantasy")

**Attendus:**
- ✅ Affiche uniquement les histoires de ce genre
- ✅ "Les Vagues de l'Infini" (Fantasy) s'affiche
- ✅ Les autres disparaissent

### Test 4.2 : Reset filtres

- Clique "Tous"

**Attendus:**
- ✅ Affiche toutes les histoires

---

## Étape 5 : Test Écrire (Write Page)

**URL:** https://n-plume9.vercel.app → Tab "Écrire"

### Test 5.1 : Créer une nouvelle histoire

- Clique "+ Nouvelle"
- Entre un titre (ex: "Mon Premier Chapitre")
- Clique "Créer"

**Attendus:**
- ✅ Crée l'histoire
- ✅ Redirige vers `/story/{slug}`
- ✅ L'histoire s'affiche avec status "Brouillon"

### Test 5.2 : Lister les histoires de l'auteur

- Reviens à la page "Écrire"

**Attendus:**
- ✅ Les histoires que tu as créées s'affichent
- ✅ Inclut "Mon Premier Chapitre"

---

## Étape 6 : Test Profil (Profile Page)

**URL:** https://n-plume9.vercel.app → Tab "Profil"

### Test 6.1 : Affichage du profil

- Ouvre le profil

**Attendus:**
- ✅ Affiche username, email, avatar (ou placeholder)
- ✅ Affiche stats : histoires écrites, followers, following

### Test 6.2 : Logout

- Clique "Se déconnecter"

**Attendus:**
- ✅ Déconnecte
- ✅ Redirige vers `/auth`

---

## Étape 7 : Test Détail Story

**URL:** https://n-plume9.vercel.app → Clique sur une histoire

### Test 7.1 : Affichage du détail

**Attendus:**
- ✅ Affiche titre, auteur, genre, cover
- ✅ Affiche les chapitres (si exist)
- ✅ Affiche le texte du chapitre

### Test 7.2 : Navigation entre chapitres

Si l'histoire a 2+ chapitres :
- Clique "Chapitre suivant"

**Attendus:**
- ✅ Navigue vers le chapitre suivant
- ✅ Le contenu change

---

## Étape 8 : Test Erreurs & Edge Cases

### Test 8.1 : Accès non-authentifié

- Logout
- Tente d'accéder à `/home`, `/write`, `/profile`

**Attendus:**
- ✅ Redirige vers `/auth`

### Test 8.2 : 404 Story non-existante

- Accède à `/story/histoire-inexistante`

**Attendus:**
- ✅ Affiche page 404

### Test 8.3 : RLS Violations

- Ouvre console (F12)
- Fais un like/bookmark

**Attendus:**
- ✅ Pas d'erreur 403 dans la console
- ✅ Opération réussit

---

## 🎯 Résumé Checklist

- [ ] Données de test insérées (5 histoires + 2 chapitres)
- [ ] Signup fonctionne
- [ ] Login fonctionne
- [ ] Home affiche les histoires
- [ ] Like/Bookmark sauvegardent
- [ ] Filtres genre fonctionnent
- [ ] Créer histoire fonctionne
- [ ] Profil affiche les données
- [ ] Détail story s'ouvre
- [ ] Pas d'erreur 403/401 en console
- [ ] Logout redirige vers auth
- [ ] Routes non-authentifiées redirigent vers auth

---

## 📋 Résultats

Après avoir testé tous ces flux :

1. **Tout passe ✅** → L'app est prête pour la production
2. **Certains bugs** → Note-les et partage les erreurs console
3. **Erreurs critiques** → Reviens avec :
   - Screenshot de l'erreur
   - Erreur console (F12 → Console)
   - Les steps pour reproduire

---

## 🔗 URLs Utiles

- **App:** https://n-plume9.vercel.app
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub:** https://github.com/plumelectureia-maker/plume-app
- **Vercel:** https://vercel.com/dashboard
