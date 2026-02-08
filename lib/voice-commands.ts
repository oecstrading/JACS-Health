import { addVital, addMedication, getMedications, type Vital, type Medication } from "./storage";
import { getStepCount } from "./wearables";

/**
 * Voice Command System
 * 
 * Parses natural language voice commands and executes corresponding actions.
 */

export interface VoiceCommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

export type VoiceCommandType =
  | "log_blood_pressure"
  | "log_weight"
  | "log_medication"
  | "check_medications"
  | "check_steps"
  | "emergency"
  | "unknown";

/**
 * Parse voice command and determine intent
 */
export function parseVoiceCommand(text: string): VoiceCommandType {
  const lowerText = text.toLowerCase().trim();

  // Emergency commands
  if (
    lowerText.includes("help") ||
    lowerText.includes("emergency") ||
    lowerText.includes("call") && lowerText.includes("emergency")
  ) {
    return "emergency";
  }

  // Blood pressure logging
  if (
    (lowerText.includes("log") || lowerText.includes("record")) &&
    (lowerText.includes("blood pressure") || lowerText.includes("bp"))
  ) {
    return "log_blood_pressure";
  }

  // Weight logging
  if (
    (lowerText.includes("log") || lowerText.includes("record")) &&
    lowerText.includes("weight")
  ) {
    return "log_weight";
  }

  // Medication logging
  if (
    (lowerText.includes("log") || lowerText.includes("take") || lowerText.includes("took")) &&
    lowerText.includes("medication")
  ) {
    return "log_medication";
  }

  // Check medications
  if (
    (lowerText.includes("what") || lowerText.includes("which") || lowerText.includes("show")) &&
    (lowerText.includes("medication") || lowerText.includes("medicine") || lowerText.includes("pills"))
  ) {
    return "check_medications";
  }

  // Check steps
  if (
    (lowerText.includes("how many") || lowerText.includes("what") || lowerText.includes("show")) &&
    (lowerText.includes("steps") || lowerText.includes("walked"))
  ) {
    return "check_steps";
  }

  return "unknown";
}

/**
 * Extract blood pressure values from text
 */
function extractBloodPressure(text: string): { systolic: number; diastolic: number } | null {
  // Match patterns like "120 over 80", "120/80", "120 80"
  const patterns = [
    /(\d{2,3})\s*over\s*(\d{2,3})/i,
    /(\d{2,3})\s*\/\s*(\d{2,3})/,
    /(\d{2,3})\s+(\d{2,3})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      if (systolic >= 70 && systolic <= 200 && diastolic >= 40 && diastolic <= 130) {
        return { systolic, diastolic };
      }
    }
  }

  return null;
}

/**
 * Extract weight value from text
 */
function extractWeight(text: string): number | null {
  // Match patterns like "165 pounds", "165 lbs", "165"
  const patterns = [
    /(\d{2,3})\s*(pounds|lbs|lb)/i,
    /(\d{2,3})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const weight = parseInt(match[1]);
      if (weight >= 50 && weight <= 500) {
        return weight;
      }
    }
  }

  return null;
}

/**
 * Execute voice command
 */
export async function executeVoiceCommand(text: string): Promise<VoiceCommandResult> {
  const commandType = parseVoiceCommand(text);
  const today = new Date().toISOString().split("T")[0];

  try {
    switch (commandType) {
      case "log_blood_pressure": {
        const bp = extractBloodPressure(text);
        if (!bp) {
          return {
            success: false,
            message: "I couldn't understand the blood pressure values. Please say something like 'Log my blood pressure 120 over 80'",
            action: "log_blood_pressure",
          };
        }

        const bpValue = `${bp.systolic}/${bp.diastolic}`;
        let status: "normal" | "warning" | "error" = "normal";
        
        if (bp.systolic >= 140 || bp.diastolic >= 90) {
          status = "error";
        } else if (bp.systolic >= 130 || bp.diastolic >= 80) {
          status = "warning";
        }

        const vital: Vital = {
          id: `bp_${Date.now()}`,
          type: "blood_pressure",
          value: bpValue,
          unit: "mmHg",
          status,
          date: today,
          notes: "Logged via voice command",
        };

        await addVital(vital);

        return {
          success: true,
          message: `Blood pressure ${bpValue} logged successfully. ${
            status === "error"
              ? "This reading is high. Please consult your doctor."
              : status === "warning"
              ? "This reading is slightly elevated."
              : "This reading is normal."
          }`,
          action: "log_blood_pressure",
          data: vital,
        };
      }

      case "log_weight": {
        const weight = extractWeight(text);
        if (!weight) {
          return {
            success: false,
            message: "I couldn't understand the weight value. Please say something like 'Log my weight 165 pounds'",
            action: "log_weight",
          };
        }

        const vital: Vital = {
          id: `weight_${Date.now()}`,
          type: "weight",
          value: weight.toString(),
          unit: "lbs",
          status: "normal",
          date: today,
          notes: "Logged via voice command",
        };

        await addVital(vital);

        return {
          success: true,
          message: `Weight ${weight} pounds logged successfully.`,
          action: "log_weight",
          data: vital,
        };
      }

      case "check_medications": {
        const medications = await getMedications();
        const todayMeds = medications.filter(m => m.date === today);

        if (todayMeds.length === 0) {
          return {
            success: true,
            message: "You have no medications scheduled for today.",
            action: "check_medications",
            data: [],
          };
        }

        const takenCount = todayMeds.filter(m => m.taken).length;
        const medList = todayMeds.map(m => `${m.name} ${m.dosage} at ${m.time}`).join(", ");

        return {
          success: true,
          message: `You have ${todayMeds.length} medications today: ${medList}. You've taken ${takenCount} of them.`,
          action: "check_medications",
          data: todayMeds,
        };
      }

      case "check_steps": {
        const steps = await getStepCount();
        if (!steps) {
          return {
            success: true,
            message: "I couldn't retrieve your step count. Make sure your wearable device is connected.",
            action: "check_steps",
          };
        }

        const goal = 5000;
        const percentage = Math.round((steps / goal) * 100);

        return {
          success: true,
          message: `You've walked ${steps.toLocaleString()} steps today. That's ${percentage}% of your ${goal.toLocaleString()} step goal. ${
            steps >= goal ? "Great job!" : "Keep going!"
          }`,
          action: "check_steps",
          data: { steps, goal, percentage },
        };
      }

      case "emergency": {
        return {
          success: true,
          message: "Activating emergency mode. Calling your emergency contact now.",
          action: "emergency",
        };
      }

      case "unknown":
      default: {
        return {
          success: false,
          message: "I didn't understand that command. Try saying things like 'Log my blood pressure', 'What medications do I take today?', or 'How many steps today?'",
          action: "unknown",
        };
      }
    }
  } catch (error) {
    console.error("Error executing voice command:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error processing your command. Please try again.",
      action: commandType,
    };
  }
}

/**
 * Get suggested voice commands for user guidance
 */
export function getSuggestedCommands(): string[] {
  return [
    "Log my blood pressure 120 over 80",
    "Record my weight 165 pounds",
    "What medications do I take today?",
    "How many steps have I walked today?",
    "Log my medication",
    "Help! Emergency!",
  ];
}

/**
 * Format command result for speech output
 */
export function formatCommandForSpeech(result: VoiceCommandResult): string {
  return result.message;
}
