# APK Build + Direct Download Guide (PK-Manager)

This guide covers:
1. Building a Capacitor Android APK in Android Studio
2. Testing it on a real device
3. Hosting it on your website so users can download it from the homepage (no Play Store)

## How This App Works On Android

This is a Capacitor Android wrapper that loads your deployed web app in a WebView.
For production you should point it to:
`https://pkmanager.vercel.app`

That means:
- the APK will be small
- the app needs internet
- updates happen when you deploy the website (no app-store update required)

## Prerequisites

- Android Studio installed
- An Android SDK installed (Android Studio will prompt you)
- A deployed frontend URL: `https://pkmanager.vercel.app`

You do not have to install a separate JDK manually if Android Studio is using its embedded JDK.

## Step 1: Build + Sync Web Assets

Open PowerShell in:
`PK-Manager/frontend`

1. Set the production WebView URL:
```powershell
$env:CAPACITOR_SERVER_URL="https://pkmanager.vercel.app"
```

2. Build the frontend and generate PWA artifacts:
```powershell
npm run build
```

3. Sync the native Android project:
```powershell
npx cap sync android
```

## Step 2: Open In Android Studio

1. Open Android Studio
2. `File -> Open...`
3. Select:
`PK-Manager/frontend/android`
4. Wait for Gradle sync to finish

## Step 3: Ensure JDK Is Set (Android Studio)

1. `File -> Settings`
2. `Build, Execution, Deployment -> Build Tools -> Gradle`
3. Set **Gradle JDK** to:
   - Android Studio's embedded JDK (recommended), or
   - JDK 17

If Gradle cannot find Java, builds will fail.

## Step 4: Build A Debug APK (Quick Test)

Android Studio:
- `Build -> Build Bundle(s) / APK(s) -> Build APK(s)`

APK output:
`PK-Manager/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Step 5: Build A Signed Release APK (For Users)

Android Studio:
1. `Build -> Generate Signed Bundle / APK...`
2. Choose `APK`
3. Create or select a keystore (keep it safe)
4. Select `release`
5. Finish

APK output (typical):
`PK-Manager/frontend/android/app/build/outputs/apk/release/app-release.apk`

## Step 6: Test On A Real Phone

### Option A: Install From Android Studio
- Connect phone via USB
- Enable Developer Options + USB debugging
- `Run -> Run 'app'`

### Option B: Install The APK Manually
1. Copy the APK to your phone
2. Enable installs from unknown sources:
   - Settings -> Security/Privacy -> Install unknown apps -> allow for your browser/file manager
3. Tap the APK and install

What to test:
- Login (Google + email flows)
- Notes creation/editing
- Task recurrence (Mon/Wed/Fri / daily)
- Offline behavior expectations (it will not work offline if using `CAPACITOR_SERVER_URL`)
- Notifications/permissions if you add them later

## Step 7: Host The APK For Direct Download

This repo is already wired so the landing page button points to:
`/downloads/pkm.apk`

Do this:
1. Copy your signed release APK to:
`PK-Manager/frontend/public/downloads/pkm.apk`

2. Deploy the frontend again (Vercel)

Now users can download it from:
`https://pkmanager.vercel.app/downloads/pkm.apk`

Notes:
- The browser will warn users about APK security. That is normal for non-Play-Store installs.
- Make sure the APK file size is within your hosting limits.

## Updating The App Later

If you keep using the WebView `server.url` approach:
- Most updates are just website deploys
- Only rebuild/re-distribute the APK when:
  - you change native plugins/permissions
  - you change the appId/appName/icons
  - you need a new signing key / versionCode strategy

