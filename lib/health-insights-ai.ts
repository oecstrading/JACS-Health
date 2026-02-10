/**
 * Health Insights AI Module
 * 
 * Analyzes synced vitals data to detect patterns and provide personalized recommendations
 */

export interface HealthInsight {
  id: string;
  category: "blood_pressure" | "heart_rate" | "weight" | "activity";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  recommendation: string;
  learnMoreUrl?: string;
  timestamp: string;
}

interface VitalsData {
  bloodPressure: Array<{
    systolic: number;
    diastolic: number;
    pulse: number;
    timestamp: string;
  }>;
  heartRate: Array<{
    heartRate: number;
    timestamp: string;
  }>;
  weight: Array<{
    weight: number;
    bmi?: number;
    timestamp: string;
  }>;
}

/**
 * Analyze vitals data and generate health insights
 */
export function analyzeHealthData(vitalsData: VitalsData): HealthInsight[] {
  const insights: HealthInsight[] = [];

  // Analyze blood pressure
  const bpInsights = analyzeBloodPressure(vitalsData.bloodPressure);
  insights.push(...bpInsights);

  // Analyze heart rate
  const hrInsights = analyzeHeartRate(vitalsData.heartRate);
  insights.push(...hrInsights);

  // Analyze weight
  const weightInsights = analyzeWeight(vitalsData.weight);
  insights.push(...weightInsights);

  // Sort by severity (critical first, then warning, then info)
  insights.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return insights;
}

/**
 * Analyze blood pressure trends
 */
function analyzeBloodPressure(
  readings: Array<{
    systolic: number;
    diastolic: number;
    pulse: number;
    timestamp: string;
  }>
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  if (readings.length === 0) {
    return insights;
  }

  // Calculate averages
  const avgSystolic =
    readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
  const avgDiastolic =
    readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;

  // Check for consistently high blood pressure
  if (avgSystolic >= 140 || avgDiastolic >= 90) {
    insights.push({
      id: "bp_high",
      category: "blood_pressure",
      severity: "critical",
      title: "Elevated Blood Pressure Detected",
      description: `Your average blood pressure is ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg, which is in the hypertension range (≥140/90). This requires immediate attention.`,
      recommendation:
        "Schedule an appointment with your doctor as soon as possible. In the meantime, reduce sodium intake, increase physical activity, and monitor your BP daily.",
      learnMoreUrl: "https://www.heart.org/en/health-topics/high-blood-pressure",
      timestamp: new Date().toISOString(),
    });
  } else if (avgSystolic >= 130 || avgDiastolic >= 80) {
    insights.push({
      id: "bp_elevated",
      category: "blood_pressure",
      severity: "warning",
      title: "Blood Pressure Trending Higher",
      description: `Your average blood pressure is ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg, which is in the elevated range (130-139/80-89).`,
      recommendation:
        "Consider lifestyle changes: reduce salt intake, exercise 30 minutes daily, limit alcohol, and manage stress. Discuss with your doctor at your next visit.",
      learnMoreUrl: "https://www.heart.org/en/health-topics/high-blood-pressure",
      timestamp: new Date().toISOString(),
    });
  }

  // Check for morning hypertension pattern
  const morningReadings = readings.filter((r) => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 6 && hour <= 10;
  });

  if (morningReadings.length >= 3) {
    const avgMorningSystolic =
      morningReadings.reduce((sum, r) => sum + r.systolic, 0) /
      morningReadings.length;
    const avgMorningDiastolic =
      morningReadings.reduce((sum, r) => sum + r.diastolic, 0) /
      morningReadings.length;

    if (avgMorningSystolic >= 135 || avgMorningDiastolic >= 85) {
      insights.push({
        id: "bp_morning_pattern",
        category: "blood_pressure",
        severity: "warning",
        title: "Morning Blood Pressure Pattern Detected",
        description: `Your blood pressure is consistently higher in the mornings (avg ${Math.round(avgMorningSystolic)}/${Math.round(avgMorningDiastolic)} mmHg). Morning hypertension increases cardiovascular risk.`,
        recommendation:
          "Take your BP medication in the evening (if prescribed), avoid caffeine before morning readings, and practice deep breathing exercises upon waking.",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check for good blood pressure control
  if (avgSystolic < 120 && avgDiastolic < 80 && readings.length >= 5) {
    insights.push({
      id: "bp_healthy",
      category: "blood_pressure",
      severity: "info",
      title: "Excellent Blood Pressure Control",
      description: `Your average blood pressure is ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg, which is in the normal range (<120/80). Great job!`,
      recommendation:
        "Keep up the good work! Continue your current lifestyle habits: healthy diet, regular exercise, stress management, and adequate sleep.",
      timestamp: new Date().toISOString(),
    });
  }

  // Check for high variability
  const systolicStdDev = calculateStdDev(readings.map((r) => r.systolic));
  if (systolicStdDev > 15 && readings.length >= 7) {
    insights.push({
      id: "bp_variability",
      category: "blood_pressure",
      severity: "warning",
      title: "High Blood Pressure Variability",
      description: `Your blood pressure readings vary significantly (standard deviation: ${systolicStdDev.toFixed(1)} mmHg). High variability can indicate poor BP control.`,
      recommendation:
        "Take readings at the same time each day, avoid caffeine/exercise before measurements, and discuss this pattern with your doctor.",
      timestamp: new Date().toISOString(),
    });
  }

  return insights;
}

/**
 * Analyze heart rate trends
 */
function analyzeHeartRate(
  readings: Array<{
    heartRate: number;
    timestamp: string;
  }>
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  if (readings.length === 0) {
    return insights;
  }

  const avgHR = readings.reduce((sum, r) => sum + r.heartRate, 0) / readings.length;

  // Check for tachycardia (resting HR > 100)
  if (avgHR > 100) {
    insights.push({
      id: "hr_high",
      category: "heart_rate",
      severity: "warning",
      title: "Elevated Resting Heart Rate",
      description: `Your average resting heart rate is ${Math.round(avgHR)} bpm, which is above the normal range (60-100 bpm). This may indicate stress, dehydration, or an underlying condition.`,
      recommendation:
        "Stay hydrated, reduce caffeine intake, practice relaxation techniques, and consult your doctor if this persists.",
      learnMoreUrl: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
      timestamp: new Date().toISOString(),
    });
  }

  // Check for bradycardia (resting HR < 60)
  if (avgHR < 60 && readings.length >= 5) {
    // Check if user is an athlete (low HR can be normal for athletes)
    insights.push({
      id: "hr_low",
      category: "heart_rate",
      severity: "info",
      title: "Low Resting Heart Rate Detected",
      description: `Your average resting heart rate is ${Math.round(avgHR)} bpm, which is below 60 bpm. This can be normal for athletes but may indicate a heart rhythm issue in others.`,
      recommendation:
        "If you're not an athlete and experience dizziness, fatigue, or shortness of breath, consult your doctor. Otherwise, this may be a sign of good cardiovascular fitness!",
      timestamp: new Date().toISOString(),
    });
  }

  // Check for healthy heart rate
  if (avgHR >= 60 && avgHR <= 80 && readings.length >= 5) {
    insights.push({
      id: "hr_healthy",
      category: "heart_rate",
      severity: "info",
      title: "Healthy Resting Heart Rate",
      description: `Your average resting heart rate is ${Math.round(avgHR)} bpm, which is in the optimal range (60-80 bpm). This indicates good cardiovascular health.`,
      recommendation:
        "Maintain your current fitness routine and healthy lifestyle habits to keep your heart strong.",
      timestamp: new Date().toISOString(),
    });
  }

  // Check for increasing trend
  if (readings.length >= 7) {
    const recentAvg =
      readings
        .slice(-3)
        .reduce((sum, r) => sum + r.heartRate, 0) / 3;
    const olderAvg =
      readings
        .slice(0, 3)
        .reduce((sum, r) => sum + r.heartRate, 0) / 3;

    if (recentAvg > olderAvg + 10) {
      insights.push({
        id: "hr_increasing",
        category: "heart_rate",
        severity: "warning",
        title: "Heart Rate Trending Upward",
        description: `Your resting heart rate has increased by ${Math.round(recentAvg - olderAvg)} bpm over the past week. This may indicate increased stress, illness, or overtraining.`,
        recommendation:
          "Ensure adequate rest, stay hydrated, manage stress, and monitor for other symptoms. Consult your doctor if this continues.",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return insights;
}

/**
 * Analyze weight trends
 */
function analyzeWeight(
  readings: Array<{
    weight: number;
    bmi?: number;
    timestamp: string;
  }>
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  if (readings.length === 0) {
    return insights;
  }

  const avgWeight = readings.reduce((sum, r) => sum + r.weight, 0) / readings.length;
  const latestBMI = readings[readings.length - 1]?.bmi;

  // Check BMI if available
  if (latestBMI) {
    if (latestBMI >= 30) {
      insights.push({
        id: "weight_obese",
        category: "weight",
        severity: "warning",
        title: "BMI in Obese Range",
        description: `Your BMI is ${latestBMI.toFixed(1)}, which is in the obese range (≥30). This increases risk for heart disease, diabetes, and other conditions.`,
        recommendation:
          "Work with your doctor or a registered dietitian to create a safe weight loss plan. Aim for 1-2 lbs per week through diet and exercise.",
        learnMoreUrl: "https://www.cdc.gov/healthyweight/losing_weight/index.html",
        timestamp: new Date().toISOString(),
      });
    } else if (latestBMI >= 25) {
      insights.push({
        id: "weight_overweight",
        category: "weight",
        severity: "info",
        title: "BMI in Overweight Range",
        description: `Your BMI is ${latestBMI.toFixed(1)}, which is in the overweight range (25-29.9). Maintaining a healthy weight reduces disease risk.`,
        recommendation:
          "Focus on portion control, increase physical activity to 150 minutes/week, and choose whole foods over processed options.",
        timestamp: new Date().toISOString(),
      });
    } else if (latestBMI >= 18.5 && latestBMI < 25) {
      insights.push({
        id: "weight_healthy",
        category: "weight",
        severity: "info",
        title: "Healthy BMI Range",
        description: `Your BMI is ${latestBMI.toFixed(1)}, which is in the healthy range (18.5-24.9). Excellent work maintaining a healthy weight!`,
        recommendation:
          "Continue your current healthy eating and exercise habits to maintain your weight.",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check for rapid weight gain
  if (readings.length >= 7) {
    const recentAvg =
      readings
        .slice(-3)
        .reduce((sum, r) => sum + r.weight, 0) / 3;
    const olderAvg =
      readings
        .slice(0, 3)
        .reduce((sum, r) => sum + r.weight, 0) / 3;

    const weightChange = recentAvg - olderAvg;

    if (weightChange > 5) {
      insights.push({
        id: "weight_rapid_gain",
        category: "weight",
        severity: "warning",
        title: "Rapid Weight Gain Detected",
        description: `You've gained ${weightChange.toFixed(1)} lbs over the past week. Rapid weight gain can indicate fluid retention or other health issues.`,
        recommendation:
          "Monitor for swelling in legs/ankles, shortness of breath, or fatigue. Contact your doctor if you have these symptoms or if rapid gain continues.",
        timestamp: new Date().toISOString(),
      });
    } else if (weightChange < -5) {
      insights.push({
        id: "weight_rapid_loss",
        category: "weight",
        severity: "warning",
        title: "Rapid Weight Loss Detected",
        description: `You've lost ${Math.abs(weightChange).toFixed(1)} lbs over the past week. Rapid weight loss can be concerning if unintentional.`,
        recommendation:
          "If this weight loss is unintentional, consult your doctor. Healthy weight loss is 1-2 lbs per week.",
        timestamp: new Date().toISOString(),
      });
    } else if (weightChange >= -2 && weightChange <= 2) {
      insights.push({
        id: "weight_stable",
        category: "weight",
        severity: "info",
        title: "Stable Weight Trend",
        description: `Your weight has remained stable over the past week (${Math.abs(weightChange).toFixed(1)} lbs change). This indicates good weight management.`,
        recommendation:
          "Keep up your current eating and activity habits to maintain this stability.",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return insights;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: "info" | "warning" | "critical"): string {
  switch (severity) {
    case "critical":
      return "#EF4444"; // red
    case "warning":
      return "#F59E0B"; // orange
    case "info":
      return "#0a7ea4"; // blue
  }
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: "info" | "warning" | "critical"): string {
  switch (severity) {
    case "critical":
      return "🚨";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
  }
}
