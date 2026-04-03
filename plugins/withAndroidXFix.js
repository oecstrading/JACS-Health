/**
 * withAndroidXFix.js — Expo Config Plugin (applied LAST in app.config.ts)
 *
 * Permanently fixes the recurring Android CMake build error:
 *   [CXX1214] User has minSdkVersion 22 but library was built for 24
 *
 * ROOT CAUSE: expo-build-properties sets gradle.properties keys, but the EAS
 * cloud build CMake toolchain reads minSdkVersion from android/app/build.gradle
 * defaultConfig, NOT from gradle.properties. This plugin directly patches that
 * file so the value is always 24 regardless of what any other plugin sets.
 *
 * Also fixes:
 *   - Duplicate class androidx.versionedparcelable.*
 *   - Cannot access 'OnUserLeaveHintProvider' (appcompat mismatch)
 */

const { withDangerousMod, withGradleProperties } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MIN_SDK = "24";
const COMPILE_SDK = "35";
const TARGET_SDK = "35";
const KOTLIN_VERSION = "2.0.21";

const RESOLUTION_STRATEGY = `
    // ── AndroidX dependency conflict fixes (withAndroidXFix) ─────────────────
    configurations.all {
        resolutionStrategy {
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.appcompat:appcompat-resources:1.6.1'
            force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
            force 'androidx.core:core:1.12.0'
            force 'androidx.core:core-ktx:1.12.0'
            force 'androidx.annotation:annotation:1.7.0'
            force 'androidx.activity:activity:1.8.0'
            force 'androidx.activity:activity-ktx:1.8.0'
            force 'androidx.fragment:fragment:1.6.2'
            force 'androidx.fragment:fragment-ktx:1.6.2'
        }
        exclude group: 'com.android.support', module: 'versionedparcelable'
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-annotations'
    }
    // ─────────────────────────────────────────────────────────────────────────
`;

const withAndroidXFix = (config) => {
  // ── PRIMARY FIX: Directly patch android/app/build.gradle defaultConfig ─────
  // CMake reads minSdkVersion from this Gradle DSL file, not gradle.properties.
  // This is the authoritative fix for [CXX1214] minSdkVersion mismatch.
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const appBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "build.gradle"
      );

      if (!fs.existsSync(appBuildGradlePath)) {
        console.warn("[withAndroidXFix] android/app/build.gradle not found, skipping.");
        return config;
      }

      let contents = fs.readFileSync(appBuildGradlePath, "utf8");

      // Replace all forms: "minSdkVersion 22", "minSdkVersion = 22", "minSdkVersion=22"
      contents = contents.replace(/minSdkVersion\s*=?\s*\d+/g, `minSdkVersion ${MIN_SDK}`);
      contents = contents.replace(/compileSdkVersion\s*=?\s*\d+/g, `compileSdkVersion ${COMPILE_SDK}`);
      contents = contents.replace(/targetSdkVersion\s*=?\s*\d+/g, `targetSdkVersion ${TARGET_SDK}`);

      fs.writeFileSync(appBuildGradlePath, contents);
      console.log(`[withAndroidXFix] Patched app/build.gradle → minSdk=${MIN_SDK}, compileSdk=${COMPILE_SDK}, targetSdk=${TARGET_SDK}`);
      return config;
    },
  ]);

  // ── SECONDARY FIX: Patch root android/build.gradle allprojects resolution ──
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const rootBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "build.gradle"
      );
      if (!fs.existsSync(rootBuildGradlePath)) {
        console.warn("[withAndroidXFix] android/build.gradle not found, skipping.");
        return config;
      }
      let contents = fs.readFileSync(rootBuildGradlePath, "utf8");
      if (contents.includes("AndroidX dependency conflict fixes")) {
        console.log("[withAndroidXFix] Resolution strategy already injected, skipping.");
        return config;
      }
      if (contents.includes("allprojects {")) {
        contents = contents.replace(/allprojects\s*\{/, `allprojects {\n${RESOLUTION_STRATEGY}`);
      } else {
        contents += `\nallprojects {\n${RESOLUTION_STRATEGY}\n}\n`;
      }
      fs.writeFileSync(rootBuildGradlePath, contents);
      console.log("[withAndroidXFix] Injected resolution strategy into android/build.gradle");
      return config;
    },
  ]);

  // ── BELT-AND-SUSPENDERS: Also set gradle.properties ────────────────────────
  config = withGradleProperties(config, (config) => {
    const props = config.modResults;
    const setOrReplace = (key, value) => {
      const existing = props.find((p) => p.type === "property" && p.key === key);
      if (existing) { existing.value = value; }
      else { props.push({ type: "property", key, value }); }
    };
    setOrReplace("android.minSdkVersion", MIN_SDK);
    setOrReplace("android.compileSdkVersion", COMPILE_SDK);
    setOrReplace("android.targetSdkVersion", TARGET_SDK);
    setOrReplace("android.kotlinVersion", KOTLIN_VERSION);
    setOrReplace("android.useAndroidX", "true");
    setOrReplace("android.enableJetifier", "true");
    setOrReplace("org.gradle.jvmargs", "-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError");
    setOrReplace("org.gradle.parallel", "true");
    setOrReplace("org.gradle.daemon", "true");
    setOrReplace("org.gradle.configureondemand", "true");
    return config;
  });

  return config;
};

module.exports = withAndroidXFix;
