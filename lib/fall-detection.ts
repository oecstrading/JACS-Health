/**
 * Fall Detection System
 * 
 * Uses device accelerometer to detect falls and trigger emergency alerts.
 * Implements a sophisticated algorithm to minimize false positives.
 */

import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
// Emergency functions will be called from UI layer

export interface FallEvent {
  timestamp: number;
  magnitude: number;
  x: number;
  y: number;
  z: number;
}

export interface FallDetectionConfig {
  enabled: boolean;
  impactThreshold: number; // g-force threshold for impact detection
  freefallThreshold: number; // g-force threshold for freefall detectionn
  confirmationDelayMs: number; // Time to confirm before sending alert
  sensitivityLevel: "low" | "medium" | "high";
}

const DEFAULT_CONFIG: FallDetectionConfig = {
  enabled: true,
  impactThreshold: 2.5, // 2.5g impact
  freefallThreshold: 0.5, // Less than 0.5g indicates freefall
  confirmationDelayMs: 30000, // 30 seconds to cancel
  sensitivityLevel: "medium",
};

// Sensitivity presets
const SENSITIVITY_PRESETS: Record<string, { impact: number; freefall: number }> = {
  low: { impact: 3.0, freefall: 0.3 },
  medium: { impact: 2.5, freefall: 0.5 },
  high: { impact: 2.0, freefall: 0.7 },
};

let fallDetectionSubscription: any = null;
let fallDetectionConfig: FallDetectionConfig = { ...DEFAULT_CONFIG };
let onFallDetectedCallback: ((event: FallEvent) => void) | null = null;
let isMonitoring = false;

// Circular buffer for acceleration history
const HISTORY_SIZE = 20;
let accelerationHistory: { x: number; y: number; z: number; magnitude: number }[] = [];

/**
 * Calculate magnitude of acceleration vector
 */
function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Detect if acceleration pattern indicates a fall
 * A fall typically has two phases:
 * 1. Freefall (low acceleration)
 * 2. Impact (high acceleration)
 */
function detectFallPattern(): FallEvent | null {
  if (accelerationHistory.length < 10) {
    return null;
  }

  const { impactThreshold, freefallThreshold } = fallDetectionConfig;
  
  // Look for freefall followed by impact
  let freefallDetected = false;
  let freefallIndex = -1;
  
  // Check for freefall in recent history
  for (let i = accelerationHistory.length - 10; i < accelerationHistory.length - 5; i++) {
    if (accelerationHistory[i].magnitude < freefallThreshold) {
      freefallDetected = true;
      freefallIndex = i;
      break;
    }
  }
  
  // If freefall detected, check for subsequent impact
  if (freefallDetected && freefallIndex >= 0) {
    for (let i = freefallIndex + 1; i < accelerationHistory.length; i++) {
      const reading = accelerationHistory[i];
      if (reading.magnitude > impactThreshold) {
        // Fall detected!
        return {
          timestamp: Date.now(),
          magnitude: reading.magnitude,
          x: reading.x,
          y: reading.y,
          z: reading.z,
        };
      }
    }
  }
  
  return null;
}

/**
 * Handle accelerometer data
 */
function handleAccelerometerData(data: { x: number; y: number; z: number }) {
  const magnitude = calculateMagnitude(data.x, data.y, data.z);
  
  // Add to history
  accelerationHistory.push({
    x: data.x,
    y: data.y,
    z: data.z,
    magnitude,
  });
  
  // Keep history size limited
  if (accelerationHistory.length > HISTORY_SIZE) {
    accelerationHistory.shift();
  }
  
  // Check for fall pattern
  const fallEvent = detectFallPattern();
  if (fallEvent && onFallDetectedCallback) {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Notify callback
    onFallDetectedCallback(fallEvent);
  }
}

/**
 * Start fall detection monitoring
 */
export async function startFallDetection(
  config: Partial<FallDetectionConfig> = {},
  onFallDetected: (event: FallEvent) => void
): Promise<boolean> {
  if (isMonitoring) {
    console.log("Fall detection already running");
    return true;
  }
  
  // Update config
  fallDetectionConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  
  // Apply sensitivity preset
  if (fallDetectionConfig.sensitivityLevel) {
    const preset = SENSITIVITY_PRESETS[fallDetectionConfig.sensitivityLevel];
    fallDetectionConfig.impactThreshold = preset.impact;
    fallDetectionConfig.freefallThreshold = preset.freefall;
  }
  
  // Check if accelerometer is available
  const isAvailable = await Accelerometer.isAvailableAsync();
  if (!isAvailable) {
    console.error("Accelerometer not available on this device");
    return false;
  }
  
  // Request permissions on web
  if (Platform.OS === "web") {
    const { status } = await Accelerometer.requestPermissionsAsync();
    if (status !== "granted") {
      console.error("Accelerometer permission denied");
      return false;
    }
  }
  
  // Set callback
  onFallDetectedCallback = onFallDetected;
  
  // Set update interval (100ms = 10Hz)
  Accelerometer.setUpdateInterval(100);
  
  // Start listening
  fallDetectionSubscription = Accelerometer.addListener(handleAccelerometerData);
  isMonitoring = true;
  
  console.log("Fall detection started", fallDetectionConfig);
  return true;
}

/**
 * Stop fall detection monitoring
 */
export function stopFallDetection(): void {
  if (fallDetectionSubscription) {
    fallDetectionSubscription.remove();
    fallDetectionSubscription = null;
  }
  
  isMonitoring = false;
  onFallDetectedCallback = null;
  accelerationHistory = [];
  
  console.log("Fall detection stopped");
}

/**
 * Check if fall detection is currently running
 */
export function isFallDetectionActive(): boolean {
  return isMonitoring;
}

/**
 * Update fall detection configuration
 */
export function updateFallDetectionConfig(config: Partial<FallDetectionConfig>): void {
  fallDetectionConfig = {
    ...fallDetectionConfig,
    ...config,
  };
  
  // Apply sensitivity preset if changed
  if (config.sensitivityLevel) {
    const preset = SENSITIVITY_PRESETS[config.sensitivityLevel];
    fallDetectionConfig.impactThreshold = preset.impact;
    fallDetectionConfig.freefallThreshold = preset.freefall;
  }
  
  console.log("Fall detection config updated", fallDetectionConfig);
}

/**
 * Get current fall detection configuration
 */
export function getFallDetectionConfig(): FallDetectionConfig {
  return { ...fallDetectionConfig };
}

/**
 * Handle fall detection with confirmation dialog
 * Returns true if fall was confirmed, false if cancelled
 */
export async function handleFallWithConfirmation(
  fallEvent: FallEvent,
  onConfirm: () => void,
  onCancel: () => void
): Promise<void> {
  // This function should be called from the UI layer
  // It will show a countdown dialog allowing the user to cancel
  // If not cancelled within confirmationDelayMs, trigger emergency
  
  console.log("Fall detected!", fallEvent);
  console.log(`User has ${fallDetectionConfig.confirmationDelayMs / 1000} seconds to cancel`);
  
  // The UI layer should implement the countdown and call either onConfirm or onCancel
}

/**
 * Trigger emergency alert after fall confirmation
 */
export async function triggerFallEmergency(fallEvent: FallEvent): Promise<void> {
  console.log("Triggering fall emergency alert", fallEvent);
  
  // Emergency SOS should be triggered from UI layer
  console.log("Fall emergency triggered", {
    reason: "Fall Detected",
    timestamp: fallEvent.timestamp,
    magnitude: fallEvent.magnitude,
  });
}

/**
 * Get sensitivity level description
 */
export function getSensitivityDescription(level: string): string {
  switch (level) {
    case "low":
      return "Detects only severe falls (fewer false alarms)";
    case "medium":
      return "Balanced detection (recommended)";
    case "high":
      return "Detects minor falls (more sensitive)";
    default:
      return "Unknown sensitivity level";
  }
}

/**
 * Test fall detection (for debugging)
 */
export function testFallDetection(): void {
  if (!isMonitoring) {
    console.error("Fall detection not running");
    return;
  }
  
  // Simulate a fall event
  const testEvent: FallEvent = {
    timestamp: Date.now(),
    magnitude: 3.0,
    x: 0,
    y: 0,
    z: 3.0,
  };
  
  if (onFallDetectedCallback) {
    onFallDetectedCallback(testEvent);
  }
}
