/**
 * Medication Interaction Checker
 * 
 * Checks for drug interactions between medications and provides warnings.
 * Uses a simplified interaction database for demonstration.
 * In production, integrate with FDA API or commercial drug interaction databases.
 */

export type InteractionSeverity = "minor" | "moderate" | "severe";

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
}

export interface InteractionCheckResult {
  hasInteractions: boolean;
  interactions: DrugInteraction[];
  newMedication: string;
  existingMedications: string[];
}

/**
 * Simplified drug interaction database
 * In production, use FDA API or commercial databases like:
 * - FDA Drug Interaction API
 * - DrugBank API
 * - RxNorm API
 */
const INTERACTION_DATABASE: DrugInteraction[] = [
  // Blood thinners
  {
    drug1: "warfarin",
    drug2: "aspirin",
    severity: "severe",
    description: "Increased risk of bleeding when taken together",
    recommendation: "Consult your doctor before combining these medications. Close monitoring required.",
  },
  {
    drug1: "warfarin",
    drug2: "ibuprofen",
    severity: "severe",
    description: "NSAIDs can increase bleeding risk with warfarin",
    recommendation: "Avoid NSAIDs. Use acetaminophen for pain relief instead.",
  },
  
  // Blood pressure medications
  {
    drug1: "lisinopril",
    drug2: "potassium",
    severity: "moderate",
    description: "ACE inhibitors can increase potassium levels",
    recommendation: "Monitor potassium levels regularly. Avoid potassium supplements unless prescribed.",
  },
  {
    drug1: "amlodipine",
    drug2: "simvastatin",
    severity: "moderate",
    description: "Amlodipine can increase simvastatin levels, raising risk of muscle problems",
    recommendation: "Do not exceed 20mg of simvastatin daily. Report muscle pain immediately.",
  },
  
  // Diabetes medications
  {
    drug1: "metformin",
    drug2: "alcohol",
    severity: "moderate",
    description: "Alcohol can increase risk of lactic acidosis with metformin",
    recommendation: "Limit alcohol consumption. Avoid excessive drinking.",
  },
  {
    drug1: "insulin",
    drug2: "metoprolol",
    severity: "moderate",
    description: "Beta-blockers can mask symptoms of low blood sugar",
    recommendation: "Monitor blood sugar more frequently. Be aware of hypoglycemia symptoms.",
  },
  
  // Antibiotics
  {
    drug1: "ciprofloxacin",
    drug2: "calcium",
    severity: "moderate",
    description: "Calcium can reduce absorption of ciprofloxacin",
    recommendation: "Take ciprofloxacin 2 hours before or 6 hours after calcium supplements.",
  },
  
  // Statins
  {
    drug1: "atorvastatin",
    drug2: "grapefruit",
    severity: "moderate",
    description: "Grapefruit can increase statin levels, raising risk of side effects",
    recommendation: "Avoid grapefruit and grapefruit juice while taking statins.",
  },
  
  // Pain medications
  {
    drug1: "acetaminophen",
    drug2: "alcohol",
    severity: "severe",
    description: "Alcohol increases risk of liver damage with acetaminophen",
    recommendation: "Avoid alcohol while taking acetaminophen. Do not exceed 3000mg daily.",
  },
  {
    drug1: "tramadol",
    drug2: "sertraline",
    severity: "severe",
    description: "Increased risk of serotonin syndrome",
    recommendation: "Use together only under close medical supervision. Watch for confusion, agitation, rapid heart rate.",
  },
];

/**
 * Normalize medication name for matching
 */
function normalizeDrugName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "");
}

/**
 * Check if two drug names match (handles generic/brand names)
 */
function drugsMatch(drug1: string, drug2: string): boolean {
  const normalized1 = normalizeDrugName(drug1);
  const normalized2 = normalizeDrugName(drug2);
  
  // Exact match
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Partial match (one contains the other)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  return false;
}

/**
 * Check for interactions between a new medication and existing medications
 */
export function checkMedicationInteractions(
  newMedication: string,
  existingMedications: string[]
): InteractionCheckResult {
  const interactions: DrugInteraction[] = [];
  
  // Check each existing medication against the new one
  for (const existingMed of existingMedications) {
    // Skip if same medication
    if (drugsMatch(newMedication, existingMed)) {
      continue;
    }
    
    // Check database for interactions
    for (const interaction of INTERACTION_DATABASE) {
      const matchesNewAndExisting = 
        (drugsMatch(newMedication, interaction.drug1) && drugsMatch(existingMed, interaction.drug2)) ||
        (drugsMatch(newMedication, interaction.drug2) && drugsMatch(existingMed, interaction.drug1));
      
      if (matchesNewAndExisting) {
        interactions.push(interaction);
      }
    }
  }
  
  return {
    hasInteractions: interactions.length > 0,
    interactions,
    newMedication,
    existingMedications,
  };
}

/**
 * Get all interactions for a list of medications
 */
export function getAllInteractions(medications: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  
  // Check each pair of medications
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i];
      const med2 = medications[j];
      
      for (const interaction of INTERACTION_DATABASE) {
        const matches = 
          (drugsMatch(med1, interaction.drug1) && drugsMatch(med2, interaction.drug2)) ||
          (drugsMatch(med1, interaction.drug2) && drugsMatch(med2, interaction.drug1));
        
        if (matches) {
          interactions.push(interaction);
        }
      }
    }
  }
  
  return interactions;
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: InteractionSeverity): string {
  switch (severity) {
    case "severe":
      return "#EF4444"; // Red
    case "moderate":
      return "#F59E0B"; // Orange
    case "minor":
      return "#FCD34D"; // Yellow
    default:
      return "#9CA3AF"; // Gray
  }
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: InteractionSeverity): string {
  switch (severity) {
    case "severe":
      return "Severe";
    case "moderate":
      return "Moderate";
    case "minor":
      return "Minor";
    default:
      return "Unknown";
  }
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: InteractionSeverity): string {
  switch (severity) {
    case "severe":
      return "⛔";
    case "moderate":
      return "⚠️";
    case "minor":
      return "ℹ️";
    default:
      return "❓";
  }
}

/**
 * Format interaction summary for display
 */
export function formatInteractionSummary(interaction: DrugInteraction): string {
  return `${interaction.drug1} + ${interaction.drug2}: ${interaction.description}`;
}

/**
 * Get interaction count by severity
 */
export function getInteractionCountBySeverity(
  interactions: DrugInteraction[]
): Record<InteractionSeverity, number> {
  return {
    severe: interactions.filter(i => i.severity === "severe").length,
    moderate: interactions.filter(i => i.severity === "moderate").length,
    minor: interactions.filter(i => i.severity === "minor").length,
  };
}

/**
 * Check if medication list has any severe interactions
 */
export function hasSevereInteractions(medications: string[]): boolean {
  const interactions = getAllInteractions(medications);
  return interactions.some(i => i.severity === "severe");
}

/**
 * Get interaction warning message
 */
export function getInteractionWarningMessage(result: InteractionCheckResult): string {
  if (!result.hasInteractions) {
    return "No known interactions detected.";
  }
  
  const counts = getInteractionCountBySeverity(result.interactions);
  const parts: string[] = [];
  
  if (counts.severe > 0) {
    parts.push(`${counts.severe} severe interaction${counts.severe > 1 ? "s" : ""}`);
  }
  if (counts.moderate > 0) {
    parts.push(`${counts.moderate} moderate interaction${counts.moderate > 1 ? "s" : ""}`);
  }
  if (counts.minor > 0) {
    parts.push(`${counts.minor} minor interaction${counts.minor > 1 ? "s" : ""}`);
  }
  
  return `⚠️ ${parts.join(", ")} detected. Please review before taking.`;
}
