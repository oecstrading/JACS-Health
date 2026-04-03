# JACS — Publish Guide (Personal Device Testing)

## How to Get the App on Your Device After Every Update

### Step 1 — Make your changes in Manus
Work normally. When you're happy with the changes, Manus will save a **Checkpoint**.

---

### Step 2 — Click Publish (in the Manus UI)
1. In the Manus Management UI, click the **Publish** button (top-right corner)
2. The build system will automatically:
   - Run `expo prebuild` to generate native Android/iOS code
   - Apply the `withAndroidXFix` plugin (sets `minSdkVersion=24`, `compileSdkVersion=35`, `kotlinVersion=2.0.21`)
   - Build a **Release APK** for Android
   - Build a **Release IPA** for iOS (ad-hoc, installable on your registered device)
   - Auto-increment the build number so each build is unique

---

### Step 3 — Install on Android
1. Download the `.apk` file from the build result
2. On your Android phone: **Settings → Security → Install Unknown Apps → Allow**
3. Open the downloaded APK file and tap **Install**
4. Done — JACS is on your phone ✓

### Step 3 — Install on iPhone (iOS)
> **Note:** iOS requires your device UDID to be registered before installing an ad-hoc build.

**One-time setup (first time only):**
1. Connect your iPhone to a Mac and open Finder (or iTunes on Windows)
2. Click your device → find the **UDID** (40-character string)
3. Send the UDID to your Apple Developer account:
   - Go to [developer.apple.com](https://developer.apple.com) → Certificates, IDs & Profiles → Devices → Add Device
   - Paste your UDID and name it (e.g., "My iPhone")
4. EAS will include your device in the next build automatically

**Install the IPA:**
1. Download the `.ipa` file from the build result
2. Use **AltStore** (free) or **Apple Configurator 2** (Mac App Store, free) to install it
3. On your iPhone: **Settings → General → VPN & Device Management → Trust** the developer certificate
4. Done — JACS is on your iPhone ✓

---

## Build Profiles Reference

| Profile | Platform | Output | Use For |
|---------|----------|--------|---------|
| `preview` | Android + iOS | APK + IPA (ad-hoc) | **Personal device testing** ← USE THIS |
| `preview-simulator` | Android + iOS Simulator | APK + Simulator IPA | Mac simulator testing |
| `development` | Android + iOS | Debug APK + Simulator | Active development |
| `production` | Android + iOS | AAB + Store IPA | Google Play + App Store (needs credentials) |

---

## When You're Ready for Google Play & App Store

Once you have:
- **Google Play**: A `google-service-account.json` key from Google Play Console
- **Apple App Store**: Your Apple ID, App-Specific Password, and Team ID

Update the `submit.production` section in `eas.json` with your real credentials, then use the `production` build profile to submit directly to the stores.

---

## Build Checklist (Before Each Publish)

- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] `version` in `app.config.ts` updated if this is a new release
- [ ] All new screens added to tab navigation
- [ ] Checkpoint saved in Manus

---

*JACS Medical Monitoring System — Build automation configured April 2026*
