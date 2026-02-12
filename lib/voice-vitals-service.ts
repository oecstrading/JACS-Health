import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import { Platform } from "react-native";

export interface VitalData {
  type: "blood_pressure" | "weight" | "heart_rate" | "glucose" | "temperature" | "unknown";
  value: any;
  unit?: string;
  confidence: number;
}

export const VoiceVitalsService = {
  /**
   * Check if speech recognition is available on this device
   */
  async isAvailable(): Promise<boolean> {
    // Speech recognition is available on iOS and Android, not on web
    return Platform.OS !== "web";
  },

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return result.granted;
    } catch (error) {
      console.error("[Voice Vitals] Permission request error:", error);
      return false;
    }
  },

  /**
   * Start listening for voice input
   */
  async startListening(onResult: (text: string) => void, onError?: (error: string) => void): Promise<() => void> {
    try {
      const options: ExpoSpeechRecognitionOptions = {
        lang: "en-US",
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
      };
      
      await ExpoSpeechRecognitionModule.start(options);
      
      // Return cleanup function
      return () => {};
    } catch (error) {
      console.error("[Voice Vitals] Start listening error:", error);
      onError?.("Failed to start voice recognition");
      return () => {};
    }
  },

  /**
   * Stop listening for voice input
   */
  async stopListening(): Promise<void> {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error("[Voice Vitals] Stop listening error:", error);
    }
  },

  /**
   * Parse voice input text to extract vital data
   */
  parseVoiceInput(text: string): VitalData {
    const lowerText = text.toLowerCase().trim();
    
    // Blood Pressure patterns
    const bpPatterns = [
      /(?:blood pressure|bp|pressure)?\s*(?:is|:)?\s*(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i,
      /(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i,
    ];
    
    for (const pattern of bpPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);
        if (systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
          return {
            type: "blood_pressure",
            value: { systolic, diastolic },
            unit: "mmHg",
            confidence: 0.9,
          };
        }
      }
    }

    // Weight patterns
    const weightPatterns = [
      /(?:i weigh|weight|my weight is|weigh)\s*(\d{2,3}(?:\.\d)?)\s*(?:pounds|lbs|lb)?/i,
      /(\d{2,3}(?:\.\d)?)\s*(?:pounds|lbs|lb)/i,
    ];
    
    for (const pattern of weightPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const weight = parseFloat(match[1]);
        if (weight >= 50 && weight <= 500) {
          return {
            type: "weight",
            value: weight,
            unit: "lbs",
            confidence: 0.9,
          };
        }
      }
    }

    // Heart Rate patterns
    const heartRatePatterns = [
      /(?:heart rate|pulse|hr)?\s*(?:is|:)?\s*(\d{2,3})\s*(?:bpm|beats|beats per minute)?/i,
      /(\d{2,3})\s*(?:bpm|beats per minute)/i,
    ];
    
    for (const pattern of heartRatePatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const heartRate = parseInt(match[1]);
        if (heartRate >= 30 && heartRate <= 220) {
          return {
            type: "heart_rate",
            value: heartRate,
            unit: "bpm",
            confidence: 0.85,
          };
        }
      }
    }

    // Glucose patterns
    const glucosePatterns = [
      /(?:blood sugar|glucose|sugar)?\s*(?:is|:)?\s*(\d{2,3})\s*(?:mg\/dl|milligrams)?/i,
      /(\d{2,3})\s*(?:mg\/dl|milligrams)/i,
    ];
    
    for (const pattern of glucosePatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const glucose = parseInt(match[1]);
        if (glucose >= 40 && glucose <= 600) {
          return {
            type: "glucose",
            value: glucose,
            unit: "mg/dL",
            confidence: 0.85,
          };
        }
      }
    }

    // Temperature patterns
    const tempPatterns = [
      /(?:temperature|temp)?\s*(?:is|:)?\s*(\d{2,3}(?:\.\d)?)\s*(?:degrees|°)?/i,
      /(\d{2,3}(?:\.\d)?)\s*(?:degrees|°)/i,
    ];
    
    for (const pattern of tempPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const temp = parseFloat(match[1]);
        if (temp >= 95 && temp <= 106) {
          return {
            type: "temperature",
            value: temp,
            unit: "°F",
            confidence: 0.85,
          };
        }
      }
    }

    return {
      type: "unknown",
      value: null,
      confidence: 0,
    };
  },

  /**
   * Get a human-readable confirmation message for the parsed data
   */
  getConfirmationMessage(data: VitalData): string {
    switch (data.type) {
      case "blood_pressure":
        return `Blood pressure: ${data.value.systolic}/${data.value.diastolic} ${data.unit}`;
      case "weight":
        return `Weight: ${data.value} ${data.unit}`;
      case "heart_rate":
        return `Heart rate: ${data.value} ${data.unit}`;
      case "glucose":
        return `Blood glucose: ${data.value} ${data.unit}`;
      case "temperature":
        return `Temperature: ${data.value} ${data.unit}`;
      default:
        return "I didn't understand that. Please try again.";
    }
  },
};
