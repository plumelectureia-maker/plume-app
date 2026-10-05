# 🚀 PLUME - STATUS & INSTRUCTIONS DE TEST

## ✅ Statut Actuel

- **Build** : ✅ Pass (TypeScript + Vite)
- **Déploiement** : ✅ Live sur Vercel (https://n-plume9.vercel.app)
- **Database** : ✅ Configurée sur Supabase
- **Auth** : ✅ Supabase Auth configuré
- **Routes** : ✅ Routing SPA configuré via vercel.json
- **RLS Policies** : ✅ Toutes les policies en place

## 📋 Avant de commencer les tests

### 1️⃣ Insérer les données de test (OBLIGATOIRE)

**Fichier** : `INSERT_TEST_DATA.sql`

1. Ouvre https://app.supabase.com
2. Sélectionne le projet "plume"
3. Va dans `SQL Editor` → `New query`
4. Copie-colle le contenu du fichier `INSERT_TEST_DATA.sql`
5. Si tu as un autre user UUID que `dc48646f-aae6-4559-971b-5a4e18120b11`, remplace-le
6. Clique "RUN"

**Résultat attendu** :
```
Stories crées: 5
Chapters total: 2
```

---

## 🧪 Tests à Effectuer

Suis le fichier **`TESTING_PLAN.md`** complet avec checklist.

Les tests couvrent :
- ✅ Auth (signup/login)
- ✅ Home feed (affichage des histoires)
- ✅ Discover (filtres par genre)
- ✅ Write (créer une histoire)
- ✅ Profile (voir profil)
- ✅ Story detail (lire une histoire)
- ✅ Like/Bookmark
- ✅ Edge cases & erreurs

---

## 🐛 Si tu trouves un bug

Avant de revenir vers moi :

1. **Ouvre la console** (F12 → Console)
2. **Note le message d'erreur exact**
3. **Fais une screenshot** si visuel
4. **Listes les étapes pour reproduire**
5. **Reviens avec** :
   - Screenshot de l'erreur
   - Erreur console
   - Steps exactes pour reproduire

### Erreurs Connues à Éviter

❌ **Email rate limit** → Supabase free tier limite les signups
**Fix** : Supabase Settings → Auth → Désactiver "Confirm email"

❌ **403 RLS Violations** → Rare mais possible selon les policies
**Fix** : Vérifier que les RLS policies sont toutes créées

---

## 📚 Fichiers Importants

- **App principales** : https://n-plume9.vercel.app
- **Code** : https://github.com/plumelectureia-maker/plume-app
- **Supabase** : https://app.supabase.com (projet "plume")
- **Plan de test** : `TESTING_PLAN.md`
- **Données de test** : `INSERT_TEST_DATA.sql`

---

## 🎯 Réussite = ✅

Une fois que **tous les tests de TESTING_PLAN.md** passent :

- L'app est **fonctionnelle** ✅
- Les utilisateurs peuvent **s'inscrire** ✅
- Les utilisateurs peuvent **lire des histoires** ✅
- Les utilisateurs peuvent **écrire des histoires** ✅
- Les utilisateurs peuvent **interagir** (like/bookmark) ✅

---

## 💬 Questions?

Si tu rencontres un problème ou une question :
1. Consult **TESTING_PLAN.md**
2. Vérifie la console (F12)
3. Reviens avec la screenshot + erreur + steps

Bonne chance! 🚀
