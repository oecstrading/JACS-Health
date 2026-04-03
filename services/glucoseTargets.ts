import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Personalized Glucose Target Settings Service
 * 
 * Allows users to set custom glucose target ranges and time-in-range goals
 * based on their individual diabetes management plan and doctor recommendations.
 */

export interface GlucoseTargetRanges {
  veryLow: number; // mg/dL threshold for very low (default: 54)
  low: number; // mg/dL threshold for low (default: 70)
  targetLow: number; // mg/dL lower bound of target range (default: 70)
  targetHigh: number; // mg/dL upper bound of target range (default: 180)
  high: number; // mg/dL threshold for high (default: 250)
  veryHigh: number; // mg/dL threshold for very high (default: 400)
}

export interface TimeInRangeGoals {
  veryLowMax: number; // % maximum time in very low (<54) - default: 1%
  lowMax: number; // % maximum time in low (54-69) - default: 4%
  inRangeMin: number; // % minimum time in range (70-180) - default: 70%
  highMax: number; // % maximum time in high (181-250) - default: 25%
  veryHighMax: number; // % maximum time in very high (>250) - default: 5%
}

export interface GlucoseSettings {
  targetRanges: GlucoseTargetRanges;
  tirGoals: TimeInRangeGoals;
  lastUpdated: Date;
  notes?: string; // Doctor's recommendations or personal notes
}

// Default settings based on ADA (American Diabetes Association) guidelines
const DEFAULT_SETTINGS: GlucoseSettings = {
  targetRanges: {
    veryLow: 54,
    low: 70,
    targetLow: 70,
    targetHigh: 180,
    high: 250,
    veryHigh: 400,
  },
  tirGoals: {
    veryLowMax: 1,
    lowMax: 4,
    inRangeMin: 70,
    highMax: 25,
    veryHighMax: 5,
  },
  lastUpdated: new Date(),
};

class GlucoseTargetsService {
  private static instance: GlucoseTargetsService;
  private settings: GlucoseSettings = DEFAULT_SETTINGS;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): GlucoseTargetsService {
    if (!GlucoseTargetsService.instance) {
      GlucoseTargetsService.instance = new GlucoseTargetsService();
    }
    return GlucoseTargetsService.instance;
  }

  private async loadSettings() {
    try {
      const data = await AsyncStorage.getItem("glucose_target_settings");
      if (data) {
        const parsed = JSON.parse(data);
        this.settings = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }
    } catch (error) {
      console.error("Error loading glucose target settings:", error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem("glucose_target_settings", JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving glucose target settings:", error);
    }
  }

  // Get current settings
  getSettings(): GlucoseSettings {
    return this.settings;
  }

  // Get target ranges
  getTargetRanges(): GlucoseTargetRanges {
    return this.settings.targetRanges;
  }

  // Get TIR goals
  getTIRGoals(): TimeInRangeGoals {
    return this.settings.tirGoals;
  }

  // Update target ranges
  async updateTargetRanges(ranges: Partial<GlucoseTargetRanges>): Promise<void> {
    this.settings.targetRanges = {
      ...this.settings.targetRanges,
      ...ranges,
    };
    this.settings.lastUpdated = new Date();
    await this.saveSettings();
  }

  // Update TIR goals
  async updateTIRGoals(goals: Partial<TimeInRangeGoals>): Promise<void> {
    this.settings.tirGoals = {
      ...this.settings.tirGoals,
      ...goals,
    };
    this.settings.lastUpdated = new Date();
    await this.saveSettings();
  }

  // Update all settings at once
  async updateSettings(settings: Partial<GlucoseSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...settings,
      lastUpdated: new Date(),
    };
    await this.saveSettings();
  }

  // Reset to default settings
  async resetToDefaults(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      lastUpdated: new Date(),
    };
    await this.saveSettings();
  }

  // Check if glucose value is in target range
  isInTargetRange(glucose: number): boolean {
    const { targetLow, targetHigh } = this.settings.targetRanges;
    return glucose >= targetLow && glucose <= targetHigh;
  }

  // Get glucose category
  getGlucoseCategory(glucose: number): "very_low" | "low" | "in_range" | "high" | "very_high" {
    const { veryLow, low, targetHigh, high } = this.settings.targetRanges;

    if (glucose < veryLow) return "very_low";
    if (glucose < low) return "low";
    if (glucose <= targetHigh) return "in_range";
    if (glucose <= high) return "high";
    return "very_high";
  }

  // Get color for glucose value
  getGlucoseColor(glucose: number): string {
    const category = this.getGlucoseCategory(glucose);
    
    switch (category) {
      case "very_low":
        return "#DC2626"; // Red
      case "low":
        return "#F59E0B"; // Orange
      case "in_range":
        return "#22C55E"; // Green
      case "high":
        return "#F59E0B"; // Orange
      case "very_high":
        return "#DC2626"; // Red
    }
  }

  // Calculate TIR goal progress
  calculateGoalProgress(actualTIR: {
    veryLow: number;
    low: number;
    inRange: number;
    high: number;
    veryHigh: number;
  }): {
    veryLowStatus: "good" | "warning" | "bad";
    lowStatus: "good" | "warning" | "bad";
    inRangeStatus: "good" | "warning" | "bad";
    highStatus: "good" | "warning" | "bad";
    veryHighStatus: "good" | "warning" | "bad";
    overallScore: number; // 0-100
  } {
    const goals = this.settings.tirGoals;

    // Check each category
    const veryLowStatus = actualTIR.veryLow <= goals.veryLowMax ? "good" : 
                          actualTIR.veryLow <= goals.veryLowMax * 2 ? "warning" : "bad";
    
    const lowStatus = actualTIR.low <= goals.lowMax ? "good" : 
                      actualTIR.low <= goals.lowMax * 1.5 ? "warning" : "bad";
    
    const inRangeStatus = actualTIR.inRange >= goals.inRangeMin ? "good" : 
                          actualTIR.inRange >= goals.inRangeMin * 0.8 ? "warning" : "bad";
    
    const highStatus = actualTIR.high <= goals.highMax ? "good" : 
                       actualTIR.high <= goals.highMax * 1.5 ? "warning" : "bad";
    
    const veryHighStatus = actualTIR.veryHigh <= goals.veryHighMax ? "good" : 
                           actualTIR.veryHigh <= goals.veryHighMax * 2 ? "warning" : "bad";

    // Calculate overall score (0-100)
    let score = 0;
    
    // In range is most important (50 points)
    if (actualTIR.inRange >= goals.inRangeMin) {
      score += 50;
    } else {
      score += (actualTIR.inRange / goals.inRangeMin) * 50;
    }
    
    // Very low is critical (20 points)
    if (actualTIR.veryLow <= goals.veryLowMax) {
      score += 20;
    } else if (actualTIR.veryLow <= goals.veryLowMax * 2) {
      score += 10;
    }
    
    // Low (15 points)
    if (actualTIR.low <= goals.lowMax) {
      score += 15;
    } else if (actualTIR.low <= goals.lowMax * 1.5) {
      score += 7;
    }
    
    // High (10 points)
    if (actualTIR.high <= goals.highMax) {
      score += 10;
    } else if (actualTIR.high <= goals.highMax * 1.5) {
      score += 5;
    }
    
    // Very high (5 points)
    if (actualTIR.veryHigh <= goals.veryHighMax) {
      score += 5;
    } else if (actualTIR.veryHigh <= goals.veryHighMax * 2) {
      score += 2;
    }

    return {
      veryLowStatus,
      lowStatus,
      inRangeStatus,
      highStatus,
      veryHighStatus,
      overallScore: Math.round(score),
    };
  }

  // Get preset configurations
  static getPresets(): Record<string, GlucoseSettings> {
    return {
      standard: {
        targetRanges: {
          veryLow: 54,
          low: 70,
          targetLow: 70,
          targetHigh: 180,
          high: 250,
          veryHigh: 400,
        },
        tirGoals: {
          veryLowMax: 1,
          lowMax: 4,
          inRangeMin: 70,
          highMax: 25,
          veryHighMax: 5,
        },
        lastUpdated: new Date(),
        notes: "ADA Standard Guidelines for Adults with Type 1 or Type 2 Diabetes",
      },
      tight_control: {
        targetRanges: {
          veryLow: 54,
          low: 70,
          targetLow: 70,
          targetHigh: 140,
          high: 180,
          veryHigh: 250,
        },
        tirGoals: {
          veryLowMax: 1,
          lowMax: 4,
          inRangeMin: 80,
          highMax: 15,
          veryHighMax: 2,
        },
        lastUpdated: new Date(),
        notes: "Tight Control for Highly Motivated Patients (Discuss with Doctor)",
      },
      pregnancy: {
        targetRanges: {
          veryLow: 54,
          low: 60,
          targetLow: 60,
          targetHigh: 140,
          high: 180,
          veryHigh: 250,
        },
        tirGoals: {
          veryLowMax: 1,
          lowMax: 4,
          inRangeMin: 70,
          highMax: 25,
          veryHighMax: 5,
        },
        lastUpdated: new Date(),
        notes: "Gestational Diabetes or Pregnancy with Diabetes (Consult Endocrinologist)",
      },
      older_adults: {
        targetRanges: {
          veryLow: 54,
          low: 70,
          targetLow: 90,
          targetHigh: 200,
          high: 250,
          veryHigh: 400,
        },
        tirGoals: {
          veryLowMax: 1,
          lowMax: 4,
          inRangeMin: 50,
          highMax: 45,
          veryHighMax: 10,
        },
        lastUpdated: new Date(),
        notes: "Relaxed Targets for Older Adults or Those with Hypoglycemia Unawareness",
      },
    };
  }

  // Apply a preset
  async applyPreset(presetName: "standard" | "tight_control" | "pregnancy" | "older_adults"): Promise<void> {
    const presets = GlucoseTargetsService.getPresets();
    const preset = presets[presetName];
    
    if (preset) {
      this.settings = {
        ...preset,
        lastUpdated: new Date(),
      };
      await this.saveSettings();
    }
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: GlucoseTargetsService | null = null;
const _lazy = new Proxy({} as GlucoseTargetsService, {
  get(_: GlucoseTargetsService, prop: string | symbol) {
    if (!_instance) _instance = GlucoseTargetsService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: GlucoseTargetsService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = GlucoseTargetsService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
