# Plume pour Android

Coque Android (WebView plein écran) qui affiche https://plume-app-lyart.vercel.app.
Elle suit toujours la dernière version du site : pas besoin de regénérer l'APK à chaque mise à jour.

- `src/app/plume/web/MainActivity.java` : WebView, bouton retour, choix de fichier (jaquette), couleur des barres système, page hors connexion
- `res/` : icône adaptative (plume), thème, textes
- `build.sh` : compile et signe `plume.apk`. Il demande `android-34.jar` (à placer dans ce dossier) et les paquets Ubuntu `aapt apksigner zipalign dalvik-exchange default-jdk-headless`.

L'APK est signé avec une clé de test (`plume-test.keystore`, non versionnée). Pour mettre à jour une installation existante, il faut la même clé.
