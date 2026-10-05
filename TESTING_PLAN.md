# 🧪 PLUME - QUICK TEST GUIDE

**App:** https://n-plume9.vercel.app | **Supabase:** https://app.supabase.com

---

## 1️⃣ SETUP (Required First)

1. Supabase SQL Editor → New query → Paste `INSERT_TEST_DATA.sql` → Execute
2. Result: 5 stories + 2 chapters inserted

---

## 2️⃣ AUTH TESTS

**Signup** → New email + password + username → Should redirect to home  
**Login** → Use credentials → Should access app  
**Logout** → Should redirect to /auth

---

## 3️⃣ HOME/DISCOVER TESTS

**Feed** → Should show 5 test stories  
**Like/Bookmark** → Icons change color → Persist on refresh  
**Genre Filter** → Click genre → Show only that genre → Click "Tous" → Show all

---

## 4️⃣ WRITE TEST

**Create Story** → "+ Nouvelle" → Title "Alice" → "Créer"  
**Expected:** No duplicate slug error, redirects to /story/{slug}  
**List Stories** → Go back to Write → Your stories appear

---

## 5️⃣ STORY DETAIL TEST

**Open Story** → Click any story from feed  
**Expected:** Title, author, genre, cover displayed  
**Read Chapter** → Chapters listed, content shown  
**Next Chapter** → Click "Chapitre suivant" → Content changes

---

## 6️⃣ PROFILE TEST

**View Profile** → Tab "Profil" → Username, email, avatar, stats  
**Edit** → Change info → Save  
**Follow/Unfollow** → Works on other profiles

---

## 7️⃣ EDGE CASES

| Test | Action | Expected |
|------|--------|----------|
| **Not Logged In** | Logout → Try `/home`, `/write`, `/profile` | Redirect to /auth |
| **404 Page** | Access `/story/nonexistent` | Show 404 |
| **Duplicate Slug** | Create "Alice" twice | Second gets -1 suffix |
| **RLS Check** | F12 → Like/Bookmark → Console | No 403 errors |

---

## ✅ QUICK CHECKLIST

- [ ] Test data inserted
- [ ] Signup/Login works
- [ ] Feed shows stories
- [ ] Like/Bookmark works
- [ ] Genre filters work
- [ ] Create story works (no slug errors)
- [ ] View story details
- [ ] Read chapters
- [ ] Profile works
- [ ] Logout redirects
- [ ] No RLS errors in console

---

## 🐛 Found a Bug?

1. Take screenshot
2. Open F12 → Console → Copy error
3. Note the steps to reproduce
4. Share all three
