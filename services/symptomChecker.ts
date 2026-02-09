/**
 * Interactive Symptom Checker Service
 * 
 * Guided questionnaire that helps users identify potential conditions
 * based on their symptoms using a decision tree algorithm.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Symptom {
  id: string;
  name: string;
  category: "pain" | "digestive" | "respiratory" | "neurological" | "skin" | "mental" | "general";
  severity: "mild" | "moderate" | "severe";
  isRedFlag: boolean; // Requires immediate medical attention
  description: string;
}

export interface SymptomSelection {
  symptomId: string;
  severity: "mild" | "moderate" | "severe";
  duration: "hours" | "days" | "weeks" | "months";
  notes?: string;
}

export interface ConditionMatch {
  conditionId: string;
  conditionName: string;
  probability: number; // 0-100
  matchingSymptoms: string[];
  urgencyLevel: "routine" | "soon" | "urgent" | "emergency";
  recommendedAction: string;
}

export interface SymptomCheckerResult {
  matches: ConditionMatch[];
  redFlags: Symptom[];
  whenToSeeDoctor: string;
  nextSteps: string[];
}

/**
 * Comprehensive Symptom Database
 */
const SYMPTOM_DATABASE: Symptom[] = [
  // Pain Symptoms
  {
    id: "chest_pain",
    name: "Chest Pain or Pressure",
    category: "pain",
    severity: "severe",
    isRedFlag: true,
    description: "Pain, tightness, or pressure in the chest that may spread to arms, neck, or jaw",
  },
  {
    id: "abdominal_pain",
    name: "Abdominal Pain",
    category: "pain",
    severity: "moderate",
    isRedFlag: false,
    description: "Pain or discomfort in the stomach area",
  },
  {
    id: "joint_pain",
    name: "Joint Pain or Stiffness",
    category: "pain",
    severity: "mild",
    isRedFlag: false,
    description: "Pain, swelling, or stiffness in joints",
  },
  {
    id: "headache_severe",
    name: "Severe Headache",
    category: "pain",
    severity: "severe",
    isRedFlag: true,
    description: "Sudden, severe headache (worst headache of your life)",
  },
  {
    id: "headache_recurring",
    name: "Recurring Headaches",
    category: "pain",
    severity: "moderate",
    isRedFlag: false,
    description: "Frequent headaches that interfere with daily activities",
  },

  // Digestive Symptoms
  {
    id: "nausea_vomiting",
    name: "Nausea or Vomiting",
    category: "digestive",
    severity: "moderate",
    isRedFlag: false,
    description: "Feeling sick to your stomach or throwing up",
  },
  {
    id: "diarrhea",
    name: "Diarrhea",
    category: "digestive",
    severity: "mild",
    isRedFlag: false,
    description: "Loose or watery stools",
  },
  {
    id: "constipation",
    name: "Constipation",
    category: "digestive",
    severity: "mild",
    isRedFlag: false,
    description: "Difficulty passing stools or infrequent bowel movements",
  },
  {
    id: "blood_in_stool",
    name: "Blood in Stool",
    category: "digestive",
    severity: "severe",
    isRedFlag: true,
    description: "Visible blood in bowel movements (red or black/tarry)",
  },

  // Respiratory Symptoms
  {
    id: "shortness_of_breath",
    name: "Shortness of Breath",
    category: "respiratory",
    severity: "severe",
    isRedFlag: true,
    description: "Difficulty breathing or feeling like you can't get enough air",
  },
  {
    id: "cough_persistent",
    name: "Persistent Cough",
    category: "respiratory",
    severity: "moderate",
    isRedFlag: false,
    description: "Cough lasting more than 3 weeks",
  },

  // Neurological Symptoms
  {
    id: "numbness_weakness",
    name: "Sudden Numbness or Weakness",
    category: "neurological",
    severity: "severe",
    isRedFlag: true,
    description: "Sudden numbness or weakness, especially on one side of the body",
  },
  {
    id: "confusion",
    name: "Confusion or Difficulty Speaking",
    category: "neurological",
    severity: "severe",
    isRedFlag: true,
    description: "Sudden confusion, trouble speaking, or difficulty understanding speech",
  },
  {
    id: "vision_changes",
    name: "Vision Changes",
    category: "neurological",
    severity: "moderate",
    isRedFlag: false,
    description: "Blurred vision, double vision, or loss of vision",
  },
  {
    id: "dizziness",
    name: "Dizziness or Loss of Balance",
    category: "neurological",
    severity: "moderate",
    isRedFlag: false,
    description: "Feeling dizzy, lightheaded, or unsteady",
  },

  // Skin Symptoms
  {
    id: "rash",
    name: "Skin Rash",
    category: "skin",
    severity: "mild",
    isRedFlag: false,
    description: "Red, itchy, or irritated skin",
  },
  {
    id: "butterfly_rash",
    name: "Butterfly-Shaped Rash on Face",
    category: "skin",
    severity: "moderate",
    isRedFlag: false,
    description: "Rash across cheeks and nose in butterfly pattern",
  },

  // Mental Health Symptoms
  {
    id: "mood_changes",
    name: "Mood Changes or Depression",
    category: "mental",
    severity: "moderate",
    isRedFlag: false,
    description: "Persistent sadness, loss of interest, or mood swings",
  },
  {
    id: "anxiety",
    name: "Anxiety or Panic Attacks",
    category: "mental",
    severity: "moderate",
    isRedFlag: false,
    description: "Excessive worry, fear, or sudden panic episodes",
  },
  {
    id: "memory_problems",
    name: "Memory Problems or Confusion",
    category: "mental",
    severity: "moderate",
    isRedFlag: false,
    description: "Difficulty remembering things or thinking clearly",
  },

  // General Symptoms
  {
    id: "fatigue",
    name: "Extreme Fatigue",
    category: "general",
    severity: "mild",
    isRedFlag: false,
    description: "Persistent tiredness that doesn't improve with rest",
  },
  {
    id: "fever",
    name: "Fever",
    category: "general",
    severity: "moderate",
    isRedFlag: false,
    description: "Body temperature above 100.4°F (38°C)",
  },
  {
    id: "weight_loss",
    name: "Unexplained Weight Loss",
    category: "general",
    severity: "moderate",
    isRedFlag: false,
    description: "Losing weight without trying",
  },
  {
    id: "dry_eyes_mouth",
    name: "Dry Eyes and Dry Mouth",
    category: "general",
    severity: "mild",
    isRedFlag: false,
    description: "Persistent dryness in eyes and mouth",
  },
];

/**
 * Condition-Symptom Mapping
 * Maps symptoms to conditions with weights for probability calculation
 */
const CONDITION_SYMPTOM_MAP: Record<string, { symptoms: { id: string; weight: number }[]; urgency: "routine" | "soon" | "urgent" | "emergency" }> = {
  colon_cancer: {
    symptoms: [
      { id: "blood_in_stool", weight: 0.4 },
      { id: "abdominal_pain", weight: 0.3 },
      { id: "constipation", weight: 0.2 },
      { id: "weight_loss", weight: 0.3 },
      { id: "fatigue", weight: 0.2 },
    ],
    urgency: "soon",
  },
  breast_cancer: {
    symptoms: [
      { id: "weight_loss", weight: 0.3 },
      { id: "fatigue", weight: 0.2 },
    ],
    urgency: "soon",
  },
  prostate_cancer: {
    symptoms: [
      { id: "weight_loss", weight: 0.3 },
      { id: "fatigue", weight: 0.2 },
    ],
    urgency: "soon",
  },
  sjogrens_syndrome: {
    symptoms: [
      { id: "dry_eyes_mouth", weight: 0.5 },
      { id: "joint_pain", weight: 0.3 },
      { id: "fatigue", weight: 0.3 },
    ],
    urgency: "routine",
  },
  lupus: {
    symptoms: [
      { id: "butterfly_rash", weight: 0.4 },
      { id: "joint_pain", weight: 0.4 },
      { id: "fatigue", weight: 0.3 },
      { id: "fever", weight: 0.2 },
    ],
    urgency: "soon",
  },
  multiple_sclerosis: {
    symptoms: [
      { id: "numbness_weakness", weight: 0.4 },
      { id: "vision_changes", weight: 0.3 },
      { id: "dizziness", weight: 0.3 },
      { id: "fatigue", weight: 0.2 },
    ],
    urgency: "soon",
  },
  food_allergies: {
    symptoms: [
      { id: "rash", weight: 0.3 },
      { id: "nausea_vomiting", weight: 0.3 },
      { id: "diarrhea", weight: 0.2 },
    ],
    urgency: "urgent",
  },
  heart_attack: {
    symptoms: [
      { id: "chest_pain", weight: 0.6 },
      { id: "shortness_of_breath", weight: 0.4 },
      { id: "nausea_vomiting", weight: 0.2 },
    ],
    urgency: "emergency",
  },
  stroke: {
    symptoms: [
      { id: "numbness_weakness", weight: 0.5 },
      { id: "confusion", weight: 0.5 },
      { id: "vision_changes", weight: 0.3 },
      { id: "headache_severe", weight: 0.4 },
      { id: "dizziness", weight: 0.3 },
    ],
    urgency: "emergency",
  },
  thyroid_disorders: {
    symptoms: [
      { id: "fatigue", weight: 0.3 },
      { id: "weight_loss", weight: 0.3 },
      { id: "mood_changes", weight: 0.3 },
      { id: "memory_problems", weight: 0.2 },
    ],
    urgency: "routine",
  },
  migraine: {
    symptoms: [
      { id: "headache_recurring", weight: 0.5 },
      { id: "vision_changes", weight: 0.3 },
      { id: "nausea_vomiting", weight: 0.3 },
    ],
    urgency: "routine",
  },
  multiple_psychosis: {
    symptoms: [
      { id: "mood_changes", weight: 0.4 },
      { id: "anxiety", weight: 0.3 },
      { id: "memory_problems", weight: 0.3 },
      { id: "confusion", weight: 0.3 },
    ],
    urgency: "soon",
  },
  diverticulosis: {
    symptoms: [
      { id: "abdominal_pain", weight: 0.4 },
      { id: "constipation", weight: 0.3 },
      { id: "blood_in_stool", weight: 0.3 },
    ],
    urgency: "soon",
  },
};

class SymptomCheckerService {
  private historyKey = "symptom_checker_history";

  /**
   * Get all available symptoms
   */
  getAllSymptoms(): Symptom[] {
    return SYMPTOM_DATABASE;
  }

  /**
   * Get symptoms by category
   */
  getSymptomsByCategory(category: Symptom["category"]): Symptom[] {
    return SYMPTOM_DATABASE.filter((s) => s.category === category);
  }

  /**
   * Check for red flag symptoms (require immediate attention)
   */
  checkRedFlags(selectedSymptoms: SymptomSelection[]): Symptom[] {
    const redFlags: Symptom[] = [];
    
    selectedSymptoms.forEach((selection) => {
      const symptom = SYMPTOM_DATABASE.find((s) => s.id === selection.symptomId);
      if (symptom && symptom.isRedFlag) {
        redFlags.push(symptom);
      }
    });
    
    return redFlags;
  }

  /**
   * Analyze symptoms and return potential condition matches
   */
  analyzeSymptoms(selectedSymptoms: SymptomSelection[]): SymptomCheckerResult {
    const matches: ConditionMatch[] = [];
    const redFlags = this.checkRedFlags(selectedSymptoms);
    
    // Calculate probability for each condition
    Object.entries(CONDITION_SYMPTOM_MAP).forEach(([conditionId, conditionData]) => {
      let totalWeight = 0;
      let matchedWeight = 0;
      const matchingSymptoms: string[] = [];
      
      conditionData.symptoms.forEach((symptomWeight) => {
        totalWeight += symptomWeight.weight;
        
        const userSelection = selectedSymptoms.find((s) => s.symptomId === symptomWeight.id);
        if (userSelection) {
          // Adjust weight based on severity and duration
          let adjustedWeight = symptomWeight.weight;
          
          if (userSelection.severity === "severe") {
            adjustedWeight *= 1.5;
          } else if (userSelection.severity === "mild") {
            adjustedWeight *= 0.7;
          }
          
          if (userSelection.duration === "months") {
            adjustedWeight *= 1.3;
          } else if (userSelection.duration === "hours") {
            adjustedWeight *= 0.8;
          }
          
          matchedWeight += adjustedWeight;
          
          const symptom = SYMPTOM_DATABASE.find((s) => s.id === symptomWeight.id);
          if (symptom) {
            matchingSymptoms.push(symptom.name);
          }
        }
      });
      
      if (matchingSymptoms.length > 0) {
        const probability = Math.min(100, Math.round((matchedWeight / totalWeight) * 100));
        
        matches.push({
          conditionId,
          conditionName: this.getConditionName(conditionId),
          probability,
          matchingSymptoms,
          urgencyLevel: conditionData.urgency,
          recommendedAction: this.getRecommendedAction(conditionData.urgency),
        });
      }
    });
    
    // Sort by probability
    matches.sort((a, b) => b.probability - a.probability);
    
    // Determine when to see doctor
    let whenToSeeDoctor = "Schedule a routine checkup with your doctor to discuss these symptoms.";
    
    if (redFlags.length > 0) {
      whenToSeeDoctor = "⚠️ SEEK IMMEDIATE MEDICAL ATTENTION - Call 911 or go to the emergency room right away.";
    } else if (matches.some((m) => m.urgencyLevel === "urgent")) {
      whenToSeeDoctor = "See a doctor within 24 hours. These symptoms may require prompt medical evaluation.";
    } else if (matches.some((m) => m.urgencyLevel === "soon")) {
      whenToSeeDoctor = "Schedule an appointment with your doctor within the next week to discuss these symptoms.";
    }
    
    // Generate next steps
    const nextSteps: string[] = [];
    
    if (redFlags.length > 0) {
      nextSteps.push("Call 911 immediately");
      nextSteps.push("Do not drive yourself to the hospital");
      nextSteps.push("Stay calm and wait for emergency services");
    } else {
      nextSteps.push("Keep track of your symptoms and when they occur");
      nextSteps.push("Note any factors that make symptoms better or worse");
      nextSteps.push("Prepare a list of questions for your doctor");
      nextSteps.push("Bring your medication list to your appointment");
      
      if (matches.length > 0) {
        nextSteps.push(`Learn more about ${matches[0].conditionName} in the Medical Library`);
        nextSteps.push("Use 'Find Care Near Me' to locate specialists");
      }
    }
    
    return {
      matches: matches.slice(0, 5), // Top 5 matches
      redFlags,
      whenToSeeDoctor,
      nextSteps,
    };
  }

  /**
   * Get human-readable condition name
   */
  private getConditionName(conditionId: string): string {
    const names: Record<string, string> = {
      colon_cancer: "Colon Cancer",
      breast_cancer: "Breast Cancer",
      prostate_cancer: "Prostate Cancer",
      sjogrens_syndrome: "Sjögren's Syndrome",
      lupus: "Lupus",
      multiple_sclerosis: "Multiple Sclerosis",
      food_allergies: "Food Allergies",
      heart_attack: "Heart Attack",
      stroke: "Stroke",
      thyroid_disorders: "Thyroid Disorders",
      migraine: "Migraine Headaches",
      multiple_psychosis: "Multiple Psychosis",
      diverticulosis: "Diverticulosis",
    };
    
    return names[conditionId] || conditionId;
  }

  /**
   * Get recommended action based on urgency
   */
  private getRecommendedAction(urgency: "routine" | "soon" | "urgent" | "emergency"): string {
    const actions: Record<typeof urgency, string> = {
      routine: "Schedule a routine appointment with your primary care doctor",
      soon: "Make an appointment with your doctor within the next week",
      urgent: "See a doctor within 24 hours or visit urgent care",
      emergency: "Call 911 or go to the emergency room immediately",
    };
    
    return actions[urgency];
  }

  /**
   * Save symptom check to history
   */
  async saveToHistory(selections: SymptomSelection[], result: SymptomCheckerResult): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift({
        timestamp: new Date().toISOString(),
        symptoms: selections,
        result,
      });
      
      // Keep last 10 checks
      const trimmedHistory = history.slice(0, 10);
      
      await AsyncStorage.setItem(this.historyKey, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("Error saving symptom check history:", error);
    }
  }

  /**
   * Get symptom check history
   */
  async getHistory(): Promise<Array<{ timestamp: string; symptoms: SymptomSelection[]; result: SymptomCheckerResult }>> {
    try {
      const history = await AsyncStorage.getItem(this.historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error("Error retrieving symptom check history:", error);
      return [];
    }
  }
}

export const symptomCheckerService = new SymptomCheckerService();
