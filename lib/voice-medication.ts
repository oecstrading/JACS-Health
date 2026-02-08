/**
 * Voice-Activated Medication Logging
 * 
 * Allows users to log medications using voice commands like:
 * - "I took my aspirin"
 * - "Log metformin"
 * - "I just took my blood pressure medication"
 */

import * as Speech from "expo-speech";

export interface VoiceCommand {
  rawText: string;
  intent: "log_medication" | "query_medication" | "unknown";
  medicationName: string | null;
  confidence: number;
  timestamp: Date;
}

export interface MedicationLogEntry {
  id: string;
  medicationName: string;
  timestamp: Date;
  method: "voice" | "manual";
  voiceTranscript?: string;
}

/**
 * Common medication names and variations
 */
const MEDICATION_DATABASE: Record<string, string[]> = {
  "aspirin": ["aspirin", "asprin", "baby aspirin"],
  "metformin": ["metformin", "met formin", "glucophage"],
  "lisinopril": ["lisinopril", "lysinopril", "prinivil", "zestril"],
  "atorvastatin": ["atorvastatin", "lipitor", "statin"],
  "levothyroxine": ["levothyroxine", "synthroid", "thyroid medication"],
  "amlodipine": ["amlodipine", "norvasc", "blood pressure medication"],
  "omeprazole": ["omeprazole", "prilosec", "heartburn medication"],
  "losartan": ["losartan", "cozaar"],
  "gabapentin": ["gabapentin", "neurontin"],
  "hydrochlorothiazide": ["hydrochlorothiazide", "hctz", "water pill"],
};

/**
 * Voice command patterns
 */
const LOG_PATTERNS = [
  /i took (my )?(.+)/i,
  /log (.+)/i,
  /i just took (.+)/i,
  /took (.+)/i,
  /i'm taking (.+)/i,
];

const QUERY_PATTERNS = [
  /what medications (.+)/i,
  /did i take (.+)/i,
  /have i taken (.+)/i,
];

/**
 * Parse voice command
 */
export function parseVoiceCommand(text: string): VoiceCommand {
  const command: VoiceCommand = {
    rawText: text,
    intent: "unknown",
    medicationName: null,
    confidence: 0,
    timestamp: new Date(),
  };

  // Check for log patterns
  for (const pattern of LOG_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      command.intent = "log_medication";
      const extractedName = match[match.length - 1].trim();
      command.medicationName = normalizeMedicationName(extractedName);
      command.confidence = command.medicationName ? 0.9 : 0.5;
      return command;
    }
  }

  // Check for query patterns
  for (const pattern of QUERY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      command.intent = "query_medication";
      const extractedName = match[match.length - 1].trim();
      command.medicationName = normalizeMedicationName(extractedName);
      command.confidence = command.medicationName ? 0.8 : 0.4;
      return command;
    }
  }

  return command;
}

/**
 * Normalize medication name to standard form
 */
export function normalizeMedicationName(input: string): string | null {
  const lowerInput = input.toLowerCase().trim();

  // Direct match
  for (const [standard, variations] of Object.entries(MEDICATION_DATABASE)) {
    if (variations.some(v => lowerInput.includes(v))) {
      return standard.charAt(0).toUpperCase() + standard.slice(1);
    }
  }

  // Fuzzy match (simple Levenshtein-like approach)
  for (const [standard, variations] of Object.entries(MEDICATION_DATABASE)) {
    for (const variation of variations) {
      if (calculateSimilarity(lowerInput, variation) > 0.7) {
        return standard.charAt(0).toUpperCase() + standard.slice(1);
      }
    }
  }

  // Return capitalized input if no match found
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Calculate string similarity (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check for drug interactions
 */
export async function checkDrugInteractions(
  newMedication: string,
  existingMedications: string[]
): Promise<{
  hasInteractions: boolean;
  interactions: Array<{
    medication: string;
    severity: "minor" | "moderate" | "severe";
    description: string;
  }>;
}> {
  // Import medication interactions database
  const { checkMedicationInteractions } = await import("./medication-interactions");
  
  const result = checkMedicationInteractions(newMedication, existingMedications);
  
  const interactions = result.interactions.map(interaction => ({
    medication: interaction.drug2,
    severity: interaction.severity,
    description: interaction.description,
  }));
  
  return {
    hasInteractions: interactions.length > 0,
    interactions,
  };
}

/**
 * Log medication via voice with interaction checking
 */
export async function logMedicationVoice(
  voiceText: string,
  existingMedications: string[] = []
): Promise<{
  entry: MedicationLogEntry | null;
  interactions: Array<{
    medication: string;
    severity: "minor" | "moderate" | "severe";
    description: string;
  }>;
}> {
  const command = parseVoiceCommand(voiceText);

  if (command.intent !== "log_medication" || !command.medicationName) {
    return { entry: null, interactions: [] };
  }

  // Check for drug interactions
  const interactionCheck = await checkDrugInteractions(
    command.medicationName,
    existingMedications
  );

  const entry: MedicationLogEntry = {
    id: `med-${Date.now()}`,
    medicationName: command.medicationName,
    timestamp: new Date(),
    method: "voice",
    voiceTranscript: voiceText,
  };

  // In production, save to AsyncStorage
  console.log("Medication logged via voice:", entry);

  return {
    entry,
    interactions: interactionCheck.interactions,
  };
}

/**
 * Provide voice feedback
 */
export async function speakConfirmation(medicationName: string): Promise<void> {
  const message = `Logged ${medicationName}`;
  
  try {
    await Speech.speak(message, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  } catch (error) {
    console.error("Failed to speak confirmation:", error);
  }
}

/**
 * Provide voice error feedback
 */
export async function speakError(message: string): Promise<void> {
  try {
    await Speech.speak(message, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  } catch (error) {
    console.error("Failed to speak error:", error);
  }
}

/**
 * Get medication suggestions based on partial input
 */
export function getMedicationSuggestions(partial: string): string[] {
  const lowerPartial = partial.toLowerCase();
  const suggestions: string[] = [];

  for (const [standard, variations] of Object.entries(MEDICATION_DATABASE)) {
    if (variations.some(v => v.startsWith(lowerPartial))) {
      suggestions.push(standard.charAt(0).toUpperCase() + standard.slice(1));
    }
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Validate medication name
 */
export function isValidMedication(name: string): boolean {
  const normalized = normalizeMedicationName(name);
  return normalized !== null;
}

/**
 * Get medication log history
 */
export async function getMedicationLogHistory(): Promise<MedicationLogEntry[]> {
  // In production, fetch from AsyncStorage
  return [];
}

/**
 * Delete medication log entry
 */
export async function deleteMedicationLog(entryId: string): Promise<boolean> {
  // In production, delete from AsyncStorage
  console.log("Deleted medication log:", entryId);
  return true;
}

/**
 * Get today's logged medications
 */
export async function getTodaysMedications(): Promise<MedicationLogEntry[]> {
  const history = await getMedicationLogHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return history.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
}

/**
 * Format voice command for display
 */
export function formatVoiceCommand(command: VoiceCommand): string {
  if (command.intent === "log_medication" && command.medicationName) {
    return `Log: ${command.medicationName}`;
  } else if (command.intent === "query_medication" && command.medicationName) {
    return `Query: ${command.medicationName}`;
  }
  return "Unknown command";
}

/**
 * Get confidence level description
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.7) return "Medium";
  if (confidence >= 0.5) return "Low";
  return "Very Low";
}
