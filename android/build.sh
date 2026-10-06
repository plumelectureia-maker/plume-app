#!/bin/sh
# Construit plume.apk : aapt (ressources) + javac (Java 8) + dx (dex) + zipalign + apksigner
set -e
cd "$(dirname "$0")"
JAR=android-34.jar
[ -f plume-test.keystore ] || keytool -genkeypair -keystore plume-test.keystore -alias plume -keyalg RSA -keysize 2048 -validity 36500 \
  -storepass plumeplume -keypass plumeplume -dname "CN=Plume, OU=Test, O=Plume, C=FR" >/dev/null 2>&1
rm -rf build && mkdir -p build/gen build/classes build/dex
aapt package -f -M AndroidManifest.xml -S res -I $JAR -J build/gen -F build/unsigned.apk \
  --min-sdk-version 23 --target-sdk-version 34 --version-code 2 --version-name 1.0.1
javac --release 8 -Xlint:-options -cp $JAR -d build/classes $(find src build/gen -name '*.java')
dalvik-exchange --dex --min-sdk-version=23 --output=build/dex/classes.dex build/classes
(cd build/dex && aapt add -f ../unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 build/unsigned.apk build/aligned.apk
apksigner sign --ks plume-test.keystore --ks-pass pass:plumeplume --key-pass pass:plumeplume --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out plume.apk build/aligned.apk
apksigner verify -v plume.apk
ls -la plume.apk
