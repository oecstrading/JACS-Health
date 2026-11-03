// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
// Bundle ID can only contain letters, numbers, and dots
// Android requires each dot-separated segment to start with a letter
const rawBundleId = "space.manus.health_companion.t20260208103805";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
    .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
    .replace(/\.+/g, ".") // Collapse consecutive dots
    .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
    .toLowerCase()
    .split(".")
    .map((segment) => {
      // Android requires each segment to start with a letter
      // Prefix with 'x' if segment starts with a digit
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "JACS Medical Monitoring System",
  appSlug: "health_companion",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/app-icon-1024_e7935259.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/UZykvIgyKgXxArxm.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      },
    associatedDomains: [
      "applinks:healthmate.app",
      "applinks:*.healthmate.app"
    ]
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/DJqsbQDSEyZOgpse.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
          {
            scheme: "https",
            host: "healthmate.app",
            pathPrefix: "/",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/xzypbNibxNIvuCiO.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/GIoxyTwgfqLGpEpQ.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          // minSdkVersion 24 is required by Hermes C++ toolchain and expo-modules-core.
          // Setting compileSdk and targetSdk to 35 (latest stable) ensures all native
          // CMakeLists.txt files agree on the same SDK level — prevents the
          // "User has minSdkVersion 22 but library was built for 24" CMake error.
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          // Kotlin 1.9.x is required by React Native 0.81 + Expo SDK 54
          kotlinVersion: "2.1.20",
          // Build only the two ABIs needed for Play Store / Amazon Appstore
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
        },
        ios: {
          // iOS 15.1+ required by Expo SDK 54
          deploymentTarget: "15.1",
        },
      },
    ],
    // Must be LAST — overrides any SDK version set by expo-build-properties above
    // Fixes: [CXX1214] User has minSdkVersion 22 but library was built for 24
    "./plugins/withAndroidXFix",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    // GitHub Pages serves this repository under a subpath, not at the domain root.
    ...(process.env.GITHUB_PAGES === "true" ? { baseUrl: "/jacs-health-companion" } : {}),
  },
};

export default config;
