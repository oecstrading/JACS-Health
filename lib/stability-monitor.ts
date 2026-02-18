import { Accelerometer } from "expo-sensors";
import * as Notifications from "expo-notifications";

interface GaitData {
  timestamp: Date;
  stepLength: number;
  stepTime: number;
  variability: number;
  shuffling: boolean;
}

interface StabilityScore {
  score: number; // 0-100, higher is better
  trend: "improving" | "stable" | "declining";
  riskLevel: "low" | "moderate" | "high";
  indicators: string[];
}

class StabilityMonitor {
  private gaitHistory: GaitData[] = [];
  private analysisWindow = 7; // days
  private isMonitoring = false;
  private subscription: any = null;

  /**
   * Start background monitoring of gait patterns
   */
  async startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Set update interval to 100ms for detailed gait analysis
    Accelerometer.setUpdateInterval(100);

    this.subscription = Accelerometer.addListener((accelerometerData) => {
      this.analyzeGait(accelerometerData);
    });
  }

  /**
   * Stop background monitoring
   */
  stopMonitoring() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Analyze accelerometer data for gait patterns
   */
  private analyzeGait(data: { x: number; y: number; z: number }) {
    // Calculate magnitude of acceleration
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

    // Detect step (simplified - production would use more sophisticated algorithm)
    if (magnitude > 1.2) {
      const now = new Date();
      const lastStep = this.gaitHistory[this.gaitHistory.length - 1];

      if (lastStep) {
        const stepTime = (now.getTime() - lastStep.timestamp.getTime()) / 1000;
        const stepLength = this.estimateStepLength(magnitude);
        const variability = this.calculateVariability();
        const shuffling = this.detectShuffling(stepLength, stepTime);

        const gaitData: GaitData = {
          timestamp: now,
          stepLength,
          stepTime,
          variability,
          shuffling,
        };

        this.gaitHistory.push(gaitData);

        // Keep only last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - this.analysisWindow);
        this.gaitHistory = this.gaitHistory.filter(
          (d) => d.timestamp > sevenDaysAgo
        );

        // Check for stability decline every 100 steps
        if (this.gaitHistory.length % 100 === 0) {
          this.checkStabilityDecline();
        }
      } else {
        // First step
        this.gaitHistory.push({
          timestamp: now,
          stepLength: 0.7, // average step length in meters
          stepTime: 0.6, // average step time in seconds
          variability: 0,
          shuffling: false,
        });
      }
    }
  }

  /**
   * Estimate step length from acceleration magnitude
   */
  private estimateStepLength(magnitude: number): number {
    // Simplified formula - production would use calibrated model
    return Math.max(0.3, Math.min(1.0, magnitude * 0.5));
  }

  /**
   * Calculate gait variability over recent steps
   */
  private calculateVariability(): number {
    if (this.gaitHistory.length < 10) return 0;

    const recentSteps = this.gaitHistory.slice(-10);
    const stepTimes = recentSteps.map((s) => s.stepTime);
    const mean = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
    const variance =
      stepTimes.reduce((sum, time) => sum + (time - mean) ** 2, 0) /
      stepTimes.length;
    const stdDev = Math.sqrt(variance);

    return stdDev;
  }

  /**
   * Detect shuffling gait pattern
   */
  private detectShuffling(stepLength: number, stepTime: number): boolean {
    // Shuffling is characterized by:
    // - Short step length (< 0.5m)
    // - Longer step time (> 0.7s)
    // - Reduced foot clearance (approximated by low step length)
    return stepLength < 0.5 && stepTime > 0.7;
  }

  /**
   * Check for stability decline over 7-day window
   */
  private async checkStabilityDecline() {
    const stabilityScore = this.calculateStabilityScore();

    // Trigger alert if high risk detected
    if (stabilityScore.riskLevel === "high") {
      await this.sendStabilityAlert(stabilityScore);
    }
  }

  /**
   * Calculate overall stability score
   */
  calculateStabilityScore(): StabilityScore {
    if (this.gaitHistory.length < 100) {
      return {
        score: 75,
        trend: "stable",
        riskLevel: "low",
        indicators: ["Insufficient data for analysis"],
      };
    }

    const indicators: string[] = [];
    let score = 100;

    // Analyze shuffling frequency
    const shufflingSteps = this.gaitHistory.filter((d) => d.shuffling).length;
    const shufflingRate = shufflingSteps / this.gaitHistory.length;

    if (shufflingRate > 0.3) {
      score -= 30;
      indicators.push("Frequent shuffling gait detected");
    } else if (shufflingRate > 0.15) {
      score -= 15;
      indicators.push("Occasional shuffling gait");
    }

    // Analyze step length decline
    const recentSteps = this.gaitHistory.slice(-100);
    const olderSteps = this.gaitHistory.slice(0, 100);

    const recentAvgLength =
      recentSteps.reduce((sum, d) => sum + d.stepLength, 0) / recentSteps.length;
    const olderAvgLength =
      olderSteps.reduce((sum, d) => sum + d.stepLength, 0) / olderSteps.length;

    const lengthDecline = ((olderAvgLength - recentAvgLength) / olderAvgLength) * 100;

    if (lengthDecline > 15) {
      score -= 25;
      indicators.push(`Step length declined by ${lengthDecline.toFixed(1)}%`);
    } else if (lengthDecline > 8) {
      score -= 12;
      indicators.push(`Step length slightly reduced`);
    }

    // Analyze gait variability
    const avgVariability =
      this.gaitHistory.reduce((sum, d) => sum + d.variability, 0) /
      this.gaitHistory.length;

    if (avgVariability > 0.15) {
      score -= 20;
      indicators.push("High gait variability (unsteady walking)");
    } else if (avgVariability > 0.1) {
      score -= 10;
      indicators.push("Moderate gait variability");
    }

    // Determine risk level
    let riskLevel: "low" | "moderate" | "high";
    if (score >= 75) {
      riskLevel = "low";
    } else if (score >= 50) {
      riskLevel = "moderate";
    } else {
      riskLevel = "high";
    }

    // Determine trend
    let trend: "improving" | "stable" | "declining";
    if (lengthDecline > 10 || shufflingRate > 0.25) {
      trend = "declining";
    } else if (lengthDecline < -5) {
      trend = "improving";
    } else {
      trend = "stable";
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      trend,
      riskLevel,
      indicators,
    };
  }

  /**
   * Send stability alert to user and caregivers
   */
  private async sendStabilityAlert(stabilityScore: StabilityScore) {
    // Send notification to user
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Stability Alert",
        body: `Your walking pattern shows signs of instability. Consider a balance check-up.`,
        data: { stabilityScore },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    // In production, also send alert to caregivers via push notification or SMS
    console.log("Stability alert sent to caregivers:", stabilityScore);
  }

  /**
   * Get gait trend data for visualization
   */
  getGaitTrend(days: number = 7): {
    dates: Date[];
    stepLengths: number[];
    shufflingRates: number[];
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantData = this.gaitHistory.filter((d) => d.timestamp > cutoffDate);

    // Group by day
    const dayGroups = new Map<string, GaitData[]>();

    relevantData.forEach((data) => {
      const dayKey = data.timestamp.toDateString();
      if (!dayGroups.has(dayKey)) {
        dayGroups.set(dayKey, []);
      }
      dayGroups.get(dayKey)!.push(data);
    });

    const dates: Date[] = [];
    const stepLengths: number[] = [];
    const shufflingRates: number[] = [];

    dayGroups.forEach((dayData, dayKey) => {
      dates.push(new Date(dayKey));

      const avgLength =
        dayData.reduce((sum, d) => sum + d.stepLength, 0) / dayData.length;
      stepLengths.push(avgLength);

      const shufflingCount = dayData.filter((d) => d.shuffling).length;
      shufflingRates.push((shufflingCount / dayData.length) * 100);
    });

    return { dates, stepLengths, shufflingRates };
  }

  /**
   * Get current monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    dataPoints: number;
    analysisWindow: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      dataPoints: this.gaitHistory.length,
      analysisWindow: this.analysisWindow,
    };
  }
}

// Singleton instance
export const stabilityMonitor = new StabilityMonitor();

// Export functions for easy access
export const startStabilityMonitoring = () => stabilityMonitor.startMonitoring();
export const stopStabilityMonitoring = () => stabilityMonitor.stopMonitoring();
export const getStabilityScore = () => stabilityMonitor.calculateStabilityScore();
export const getGaitTrend = (days?: number) => stabilityMonitor.getGaitTrend(days);
export const getMonitoringStatus = () => stabilityMonitor.getStatus();
