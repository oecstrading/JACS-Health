/**
 * Custom Expo Config Plugin: withAndroidXFix
 *
 * Fixes two Android Gradle build errors:
 *
 * Error 1: Duplicate class androidx.versionedparcelable.*
 *   "Duplicate class found in versionedparcelable-1.1.1.aar (androidx) and
 *    versionedparcelable-28.0.0.aar (com.android.support)"
 *   Fix: Force androidx version, exclude legacy com.android.support module.
 *
 * Error 2: Kotlin compilation error in expo module
 *   "Cannot access 'OnUserLeaveHintProvider' which is a supertype of 'AppCompatActivity'"
 *   Root cause: expo SDK 54 requires androidx.appcompat >= 1.6.1 which introduced
 *   OnUserLeaveHintProvider. An older transitive appcompat version on the classpath
 *   causes this compile-time failure.
 *   Fix: Force androidx.appcompat:appcompat:1.6.1 in resolution strategy.
 */

const { withDangerousMod, withGradleProperties } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const RESOLUTION_STRATEGY = `
    // ── AndroidX dependency conflict fixes ────────────────────────────────────
    // Fix 1: Duplicate class androidx.versionedparcelable.* (androidx vs com.android.support)
    // Fix 2: Cannot access 'OnUserLeaveHintProvider' (appcompat version mismatch with expo SDK 54)
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
  // Step 1: Patch android/build.gradle (root-level) to add allprojects resolution
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

      // Only inject once (idempotent)
      if (contents.includes("AndroidX dependency conflict fixes")) {
        console.log("[withAndroidXFix] Resolution strategy already injected, skipping.");
        return config;
      }

      // Inject inside the existing allprojects block, or create one
      if (contents.includes("allprojects {")) {
        contents = contents.replace(
          /allprojects\s*\{/,
          `allprojects {\n${RESOLUTION_STRATEGY}`
        );
      } else {
        contents += `\nallprojects {\n${RESOLUTION_STRATEGY}\n}\n`;
      }

      fs.writeFileSync(rootBuildGradlePath, contents);
      console.log("[withAndroidXFix] Injected resolution strategy into android/build.gradle");
      return config;
    },
  ]);

  // Step 2: Ensure gradle.properties has AndroidX, Jetifier, and sufficient heap
  config = withGradleProperties(config, (config) => {
    const props = config.modResults;

    const setOrReplace = (key, value) => {
      const existing = props.find((p) => p.type === "property" && p.key === key);
      if (existing) {
        existing.value = value;
      } else {
        props.push({ type: "property", key, value });
      }
    };

    // Required for AndroidX migration
    setOrReplace("android.useAndroidX", "true");
    // Jetifier rewrites legacy support library references to AndroidX at build time
    setOrReplace("android.enableJetifier", "true");
    // Increase heap to handle large dependency trees without OOM during build
    setOrReplace("org.gradle.jvmargs", "-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError");
    // Parallel builds for faster compilation
    setOrReplace("org.gradle.parallel", "true");
    // Gradle daemon reuse
    setOrReplace("org.gradle.daemon", "true");

    return config;
  });

  return config;
};

module.exports = withAndroidXFix;
