import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

export interface AppVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface RemoteVersion {
  version: string;
  releaseDate: string;
  priority: "critical" | "recommended" | "optional";
  features: FeatureUpdate[];
  bugFixes: string[];
  minRequiredVersion: string;
  downloadUrl?: string;
}

export interface FeatureUpdate {
  category: "new" | "improved" | "fixed";
  title: string;
  description: string;
  icon?: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  priority: "critical" | "recommended" | "optional";
  features: FeatureUpdate[];
  shouldForceUpdate: boolean;
}

class UpdateService {
  private static instance: UpdateService;
  private readonly STORAGE_KEY = "last_version_check";
  private readonly UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  // In production, this would be an API endpoint
  private readonly VERSION_API_URL = "https://api.healthmate.app/version";

  private constructor() {}

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  /**
   * Parse semantic version string to AppVersion object
   */
  parseVersion(versionString: string): AppVersion {
    const parts = versionString.split(".").map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  }

  /**
   * Compare two versions
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  compareVersions(v1: AppVersion, v2: AppVersion): number {
    if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1;
    if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1;
    if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1;
    return 0;
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    // In production, this would come from app.config.ts or expo-constants
    return Application.nativeApplicationVersion || "1.0.0";
  }

  /**
   * Fetch latest version from remote server
   */
  async fetchLatestVersion(): Promise<RemoteVersion> {
    try {
      // In production, this would be a real API call
      // For now, return mock data
      const mockRemoteVersion: RemoteVersion = {
        version: "1.1.0",
        releaseDate: "2026-02-09",
        priority: "recommended",
        features: [
          {
            category: "new",
            title: "Account Management",
            description: "Edit and update your profile information with ease",
            icon: "person.fill",
          },
          {
            category: "new",
            title: "Medical Library Categories",
            description: "Browse 15 conditions across 6 clinical categories",
            icon: "book.fill",
          },
          {
            category: "new",
            title: "Symptom Checker",
            description: "Interactive questionnaire to identify potential conditions",
            icon: "stethoscope",
          },
          {
            category: "improved",
            title: "Voice Intake Forms",
            description: "Enhanced speech recognition with medical terminology",
            icon: "mic.fill",
          },
          {
            category: "fixed",
            title: "Profile Update Bug",
            description: "Fixed issue preventing profile edits in account management",
            icon: "checkmark.circle.fill",
          },
        ],
        bugFixes: [
          "Fixed profile update functionality in account management",
          "Improved image loading performance in medical library",
          "Enhanced voice recognition accuracy for medical terms",
        ],
        minRequiredVersion: "1.0.0",
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockRemoteVersion;
    } catch (error) {
      console.error("Error fetching latest version:", error);
      throw error;
    }
  }

  /**
   * Check if update is available
   */
  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const currentVersion = this.getCurrentVersion();
      const remoteVersion = await this.fetchLatestVersion();

      const current = this.parseVersion(currentVersion);
      const latest = this.parseVersion(remoteVersion.version);
      const minRequired = this.parseVersion(remoteVersion.minRequiredVersion);

      const updateAvailable = this.compareVersions(latest, current) > 0;
      const shouldForceUpdate =
        remoteVersion.priority === "critical" ||
        this.compareVersions(current, minRequired) < 0;

      // Save last check timestamp
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          latestVersion: remoteVersion.version,
        })
      );

      return {
        updateAvailable,
        currentVersion,
        latestVersion: remoteVersion.version,
        priority: remoteVersion.priority,
        features: remoteVersion.features,
        shouldForceUpdate,
      };
    } catch (error) {
      console.error("Error checking for updates:", error);
      throw error;
    }
  }

  /**
   * Check if we should check for updates (based on last check time)
   */
  async shouldCheckForUpdates(): Promise<boolean> {
    try {
      const lastCheckData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!lastCheckData) return true;

      const { timestamp } = JSON.parse(lastCheckData);
      const timeSinceLastCheck = Date.now() - timestamp;

      return timeSinceLastCheck >= this.UPDATE_CHECK_INTERVAL;
    } catch (error) {
      console.error("Error checking last update time:", error);
      return true;
    }
  }

  /**
   * Get update preferences
   */
  async getUpdatePreferences(): Promise<{
    autoCheck: boolean;
    skipVersion?: string;
  }> {
    try {
      const prefs = await AsyncStorage.getItem("update_preferences");
      return prefs
        ? JSON.parse(prefs)
        : { autoCheck: true, skipVersion: undefined };
    } catch (error) {
      console.error("Error getting update preferences:", error);
      return { autoCheck: true };
    }
  }

  /**
   * Set update preferences
   */
  async setUpdatePreferences(preferences: {
    autoCheck?: boolean;
    skipVersion?: string;
  }): Promise<void> {
    try {
      const current = await this.getUpdatePreferences();
      await AsyncStorage.setItem(
        "update_preferences",
        JSON.stringify({ ...current, ...preferences })
      );
    } catch (error) {
      console.error("Error setting update preferences:", error);
    }
  }

  /**
   * Mark version as skipped
   */
  async skipVersion(version: string): Promise<void> {
    await this.setUpdatePreferences({ skipVersion: version });
  }

  /**
   * Clear skipped version
   */
  async clearSkippedVersion(): Promise<void> {
    await this.setUpdatePreferences({ skipVersion: undefined });
  }

  /**
   * Get changelog for version range
   */
  async getChangelog(fromVersion: string, toVersion: string): Promise<FeatureUpdate[]> {
    try {
      const remoteVersion = await this.fetchLatestVersion();
      return remoteVersion.features;
    } catch (error) {
      console.error("Error fetching changelog:", error);
      return [];
    }
  }
}

export default UpdateService.getInstance();
