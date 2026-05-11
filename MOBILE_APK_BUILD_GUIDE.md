# PK-Manager Android APK Build + Download Guide

This guide explains how to build an Android APK from the PK-Manager frontend (Next.js + Capacitor), test it locally, and make it downloadable from your website without using the Play Store.

## 1) Prerequisites

### Required installs

1. Node.js LTS (18+ recommended)
2. Android Studio (latest stable)
3. Android SDK Platform + Build Tools (install inside Android Studio)
4. Java (JDK)

### About JDK 17

For modern Android builds, JDK 17 is the safest choice.

You can use Android Studio even if you do not have a standalone JDK installed, because Android Studio can use its embedded JBR/JDK.

If Gradle complains about Java version, set your JAVA_HOME to JDK 17 (or configure Gradle JDK inside Android Studio: Settings -> Build, Execution, Deployment -> Build Tools -> Gradle -> Gradle JDK).

## 2) Build the web app output for Capacitor

In a terminal:

```powershell
cd C:\Users\Akanji Anthony\Desktop\Guseltony\PK-Manager\frontend
npm install
npm run build
```

Notes:

- `npm run build` should generate the production output used by Capacitor.
- If you are using `next export`/static output, ensure the project is configured for static output.

## 3) Sync Capacitor assets to Android

Still inside the frontend folder:

```powershell
npx cap sync android
```

This copies the built web output into the native Android project under `frontend/android/`.

## 4) Open Android Studio

```powershell
npx cap open android
```

This opens Android Studio on the generated native project.

If you prefer to open manually:

- Open Android Studio
- File -> Open
- Select: `PK-Manager\frontend\android`

## 5) Build an APK in Android Studio

### Debug APK (fastest for testing)

1. In Android Studio: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
2. Android Studio will show a message with a link to the APK location

Typical output path:

- `PK-Manager\frontend\android\app\build\outputs\apk\debug\app-debug.apk`

### Release APK (for distributing to users)

Release APK requires signing.

1. Build -> Generate Signed Bundle / APK
2. Choose APK
3. Create or select a keystore
4. Choose build variant: `release`

Typical output path:

- `PK-Manager\frontend\android\app\build\outputs\apk\release\app-release.apk`

## 6) How to test the APK

### Option A: Install on a real device (recommended)

1. Enable Developer Options on Android
2. Enable USB debugging
3. Connect USB
4. Install:

```powershell
adb install -r "path\to\app-debug.apk"
```

### Option B: Use an emulator

1. Android Studio -> Device Manager
2. Create a virtual device
3. Drag the APK into the emulator window OR use adb:

```powershell
adb install -r "path\to\app-debug.apk"
```

## 7) Make APK downloadable from your website (no Play Store)

You have two good options:

### Option A (simple): Host the APK file as a static download

1. Copy your APK into your deployed site’s static directory.

For this repo, the simplest is:

- Put the file here:
  `PK-Manager/frontend/public/downloads/pk-manager.apk`

2. Add a “Download APK” button/link on your homepage pointing to:

- `/downloads/pk-manager.apk`

3. The user will download it.

Important notes:

- Android will show an “Unknown app sources” warning. Users must allow installs from browser.
- If you update the APK, keep filename stable or version it (e.g. `pk-manager-v1.0.3.apk`).

### Option B (recommended for versioning): Host externally and link

Host the APK in:

- GitHub Releases
- Cloudflare R2
- S3

And link to it from the homepage.

This avoids making your web deploy very large.

## 8) Common gotchas

- If the app opens but shows a blank screen:
  - confirm Capacitor `webDir` matches the built output
  - confirm your Next build is compatible with static hosting if you’re exporting

- If Google Auth redirect issues appear in the APK:
  - you may need to configure redirect handling for Capacitor deep links

- If builds fail with Java version:
  - set Gradle JDK to 17 in Android Studio settings

## 9) What to do after building successfully

1. Test the debug APK locally
2. Generate a signed release APK for distribution
3. Place the release APK into `public/downloads/` (Option A) or upload it to a release bucket (Option B)
4. Verify the homepage download works in production
5. Update the version number and changelog for each new release
