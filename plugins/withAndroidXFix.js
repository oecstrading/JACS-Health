/**
 * Custom Expo Config Plugin: withAndroidXFix
 *
 * Fixes the Gradle build error:
 *   "Duplicate class androidx.versionedparcelable.* found in modules
 *    versionedparcelable-1.1.1.aar (androidx) and versionedparcelable-28.0.0.aar (com.android.support)"
 *
 * Root cause: Some transitive dependencies still pull in the legacy
 * com.android.support:versionedparcelable:28.0.0 alongside the AndroidX version.
 *
 * Fix: Inject a Gradle allprojects resolution strategy that:
 *   1. Forces androidx.versionedparcelable:versionedparcelable:1.1.1
 *   2. Excludes com.android.support:versionedparcelable from all configurations
 *   3. Enables android.useAndroidX and android.enableJetifier in gradle.properties
 */

const { withAppBuildGradle, withGradleProperties } = require("@expo/config-plugins");

/**
 * Step 1: Inject resolution strategy into android/build.gradle (project-level)
 * We use withAppBuildGradle which gives us the app/build.gradle, but the
 * allprojects block needs to go in the root build.gradle.
 * We use a withProjectBuildGradle approach via a raw mod.
 */
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const RESOLUTION_STRATEGY = `
// ── AndroidX / Support Library duplicate class fix ──────────────────────────
// Prevents: "Duplicate class androidx.versionedparcelable.* found in modules
//            versionedparcelable-1.1.1.aar and versionedparcelable-28.0.0.aar"
configurations.all {
    resolutionStrategy {
        force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
        force 'androidx.core:core:1.12.0'
        force 'androidx.annotation:annotation:1.7.0'
    }
    exclude group: 'com.android.support', module: 'versionedparcelable'
}
// ─────────────────────────────────────────────────────────────────────────────
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

      // Only inject once
      if (contents.includes("AndroidX / Support Library duplicate class fix")) {
        return config;
      }

      // Inject after the last closing brace of the allprojects block if it exists,
      // otherwise append before the last line
      if (contents.includes("allprojects {")) {
        // Insert resolution strategy inside the existing allprojects block
        contents = contents.replace(
          /allprojects\s*\{/,
          `allprojects {\n${RESOLUTION_STRATEGY}`
        );
      } else {
        // Append a new allprojects block at the end
        contents += `\nallprojects {\n${RESOLUTION_STRATEGY}\n}\n`;
      }

      fs.writeFileSync(rootBuildGradlePath, contents);
      console.log("[withAndroidXFix] Injected resolution strategy into android/build.gradle");
      return config;
    },
  ]);

  // Step 2: Ensure gradle.properties has AndroidX and Jetifier enabled
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

    setOrReplace("android.useAndroidX", "true");
    setOrReplace("android.enableJetifier", "true");
    // Increase heap for large dependency trees
    setOrReplace("org.gradle.jvmargs", "-Xmx4096m -XX:MaxMetaspaceSize=512m");

    return config;
  });

  return config;
};

module.exports = withAndroidXFix;
