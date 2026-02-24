# JACS Health Companion - Local Build Guide

This guide will help you build production-ready APK (Android) and IPA (iOS) files on your own computer using Expo Application Services (EAS).

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed on your computer
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Git** installed
   - Download from: https://git-scm.com/
   - Verify: `git --version`

3. **Expo Account** (free)
   - Sign up at: https://expo.dev/signup

4. **For iOS builds**: macOS computer with Xcode installed (optional, EAS can build in the cloud)

---

## Step 1: Download Your Project

Download all project files from Manus to your computer:

1. In the Manus UI, click the **"Code"** panel (right side)
2. Click **"Download All Files"** button
3. Extract the ZIP file to a folder (e.g., `~/health_companion`)

---

## Step 2: Install EAS CLI

Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

---

## Step 3: Navigate to Project Directory

```bash
cd ~/health_companion
# Or wherever you extracted the files
```

---

## Step 4: Install Dependencies

```bash
npm install
# or
pnpm install
```

This will install all required packages (may take 5-10 minutes).

---

## Step 5: Login to Expo

```bash
eas login
```

Enter your Expo account credentials when prompted.

---

## Step 6: Configure EAS Build

```bash
eas build:configure
```

This will:
- Link your project to your Expo account
- Set up build profiles
- Create necessary configuration files

When prompted:
- **Project name**: Press Enter to use "health_companion"
- **Bundle identifier**: Press Enter to use the default
- **Would you like to automatically create an EAS project?**: Yes

---

## Step 7: Build for Android (APK)

```bash
eas build --platform android --profile production
```

**What happens:**
- EAS uploads your code to Expo's build servers
- Builds the APK in the cloud (takes 10-20 minutes)
- Provides a download link when complete

**Build options:**
- `--profile production` - Full production build (recommended)
- `--profile preview` - Quick preview build for testing
- `--local` - Build on your computer (requires Android SDK)

---

## Step 8: Build for iOS (IPA)

```bash
eas build --platform ios --profile production
```

**Requirements for iOS:**
- Apple Developer Account ($99/year)
- OR use `--profile preview` for simulator builds (free)

**For testing without Apple Developer Account:**
```bash
eas build --platform ios --profile preview
```

This creates a simulator build you can test on Mac.

---

## Step 9: Download Your Builds

After the build completes:

1. EAS will provide a download URL
2. Click the link to download your APK/IPA
3. Or visit: https://expo.dev/accounts/[your-username]/projects/health_companion/builds

---

## Step 10: Install on Devices

### Android APK:
1. Transfer the APK file to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install

### iOS IPA:
1. Use TestFlight for distribution (requires Apple Developer Account)
2. Or use tools like Xcode/AltStore for local installation

---

## Troubleshooting

### Build fails with "Missing credentials"

For Android:
```bash
eas credentials
```
Select "Android" → "Set up a new keystore"

For iOS:
```bash
eas credentials
```
Select "iOS" → Follow prompts to set up certificates

### Build takes too long

Use preview profile for faster builds:
```bash
eas build --platform android --profile preview
```

### "Not logged in" error

```bash
eas logout
eas login
```

### Need to update app configuration

Edit `app.config.ts` and run build again.

---

## Alternative: Local Builds

If you want to build entirely on your computer (no cloud):

### Android (requires Android Studio):
```bash
eas build --platform android --local
```

### iOS (requires macOS + Xcode):
```bash
eas build --platform ios --local
```

**Note:** Local builds require:
- Android: Android Studio + Android SDK
- iOS: macOS + Xcode + Apple Developer Account

---

## Build Profiles Explained

Your project has 3 build profiles (configured in `eas.json`):

1. **development** - For development with debugging enabled
2. **preview** - Quick builds for testing (APK only, no signing)
3. **production** - Full production builds ready for app stores

---

## Cost Information

- **EAS Build**: Free tier includes 30 builds/month
- **Paid plans**: Start at $29/month for unlimited builds
- **Apple Developer**: $99/year (required for iOS App Store)
- **Google Play**: $25 one-time fee (required for Android Play Store)

---

## Next Steps After Building

1. **Test the APK/IPA** on real devices
2. **Submit to App Stores**:
   - Google Play: https://play.google.com/console
   - Apple App Store: https://appstoreconnect.apple.com/

3. **Set up OTA Updates** (optional):
   ```bash
   eas update:configure
   ```
   This allows you to push updates without rebuilding.

---

## Support Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **Discord**: https://chat.expo.dev/

---

## Quick Reference Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel a build
eas build:cancel

# Configure credentials
eas credentials

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

---

## Estimated Build Times

- **Android APK (cloud)**: 10-20 minutes
- **iOS IPA (cloud)**: 15-30 minutes
- **Local builds**: 5-15 minutes (after initial setup)

---

**Your app is ready to build! Start with Step 1 above.**
