import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
}

export interface Interaction {
  id: string;
  medication1: string;
  medication2: string;
  severity: "minor" | "moderate" | "major" | "contraindicated";
  description: string;
  effects: string[];
  recommendations: string[];
}

export interface SaferAlternative {
  medicationName: string;
  genericName: string;
  reason: string;
  effectiveness: string;
}

export interface InteractionCheckResult {
  hasInteractions: boolean;
  interactions: Interaction[];
  saferAlternatives: SaferAlternative[];
  pharmacistConsultationRecommended: boolean;
}

class MedicationInteractionService {
  private static STORAGE_KEY_MEDICATIONS = "current_medications";
  private static STORAGE_KEY_INTERACTION_HISTORY = "interaction_check_history";

  // Simulated interaction database
  private interactionDatabase: Map<string, Interaction[]> = new Map([
    [
      "warfarin+aspirin",
      [
        {
          id: "int_001",
          medication1: "Warfarin",
          medication2: "Aspirin",
          severity: "major",
          description: "Increased risk of bleeding when warfarin is combined with aspirin",
          effects: [
            "Increased bleeding risk",
            "Prolonged bleeding time",
            "Risk of hemorrhage",
          ],
          recommendations: [
            "Monitor INR levels closely",
            "Watch for signs of bleeding",
            "Consult healthcare provider before combining",
          ],
        },
      ],
    ],
    [
      "metformin+contrast dye",
      [
        {
          id: "int_002",
          medication1: "Metformin",
          medication2: "Iodinated Contrast Dye",
          severity: "contraindicated",
          description: "Risk of lactic acidosis when metformin is used with contrast dye",
          effects: ["Lactic acidosis", "Kidney damage", "Metabolic complications"],
          recommendations: [
            "Stop metformin 48 hours before imaging",
            "Resume only after kidney function is verified",
            "Inform radiologist about metformin use",
          ],
        },
      ],
    ],
    [
      "lisinopril+potassium",
      [
        {
          id: "int_003",
          medication1: "Lisinopril",
          medication2: "Potassium Supplements",
          severity: "moderate",
          description: "ACE inhibitors can increase potassium levels",
          effects: ["Hyperkalemia", "Irregular heartbeat", "Muscle weakness"],
          recommendations: [
            "Monitor potassium levels regularly",
            "Limit high-potassium foods",
            "Report symptoms of hyperkalemia",
          ],
        },
      ],
    ],
  ]);

  /**
   * Check for interactions between new medication and current medications
   */
  async checkInteractions(newMedication: Medication): Promise<InteractionCheckResult> {
    try {
      const currentMedications = await this.getCurrentMedications();
      const interactions: Interaction[] = [];

      // Check against each current medication
      for (const currentMed of currentMedications) {
        const foundInteractions = this.findInteractions(newMedication.name, currentMed.name);
        interactions.push(...foundInteractions);
      }

      // Determine if pharmacist consultation is recommended
      const pharmacistConsultationRecommended = interactions.some(
        (i) => i.severity === "major" || i.severity === "contraindicated"
      );

      // Find safer alternatives if major interactions exist
      const saferAlternatives =
        pharmacistConsultationRecommended
          ? await this.findSaferAlternatives(newMedication)
          : [];

      const result: InteractionCheckResult = {
        hasInteractions: interactions.length > 0,
        interactions,
        saferAlternatives,
        pharmacistConsultationRecommended,
      };

      // Save to history
      await this.saveInteractionCheck(newMedication, result);

      return result;
    } catch (error) {
      console.error("Error checking interactions:", error);
      throw error;
    }
  }

  /**
   * Find interactions between two medications
   */
  private findInteractions(med1: string, med2: string): Interaction[] {
    const key1 = `${med1.toLowerCase()}+${med2.toLowerCase()}`;
    const key2 = `${med2.toLowerCase()}+${med1.toLowerCase()}`;

    const interactions1 = this.interactionDatabase.get(key1) || [];
    const interactions2 = this.interactionDatabase.get(key2) || [];

    return [...interactions1, ...interactions2];
  }

  /**
   * Find safer alternatives to a medication
   */
  private async findSaferAlternatives(medication: Medication): Promise<SaferAlternative[]> {
    // In production, this would query a pharmacy database
    // For now, return simulated alternatives
    const alternatives: SaferAlternative[] = [];

    if (medication.name.toLowerCase().includes("aspirin")) {
      alternatives.push({
        medicationName: "Acetaminophen",
        genericName: "Paracetamol",
        reason: "Lower bleeding risk compared to aspirin",
        effectiveness: "Effective for pain relief without anticoagulant effects",
      });
    }

    if (medication.name.toLowerCase().includes("ibuprofen")) {
      alternatives.push({
        medicationName: "Celecoxib",
        genericName: "Celebrex",
        reason: "Selective COX-2 inhibitor with lower GI bleeding risk",
        effectiveness: "Effective anti-inflammatory with better safety profile",
      });
    }

    return alternatives;
  }

  /**
   * Get current medications
   */
  async getCurrentMedications(): Promise<Medication[]> {
    try {
      const medicationsJson = await AsyncStorage.getItem(
        MedicationInteractionService.STORAGE_KEY_MEDICATIONS
      );
      return medicationsJson ? JSON.parse(medicationsJson) : [];
    } catch (error) {
      console.error("Error getting current medications:", error);
      return [];
    }
  }

  /**
   * Add medication to current list
   */
  async addMedication(medication: Medication): Promise<void> {
    try {
      const medications = await this.getCurrentMedications();
      medications.push(medication);

      await AsyncStorage.setItem(
        MedicationInteractionService.STORAGE_KEY_MEDICATIONS,
        JSON.stringify(medications)
      );
    } catch (error) {
      console.error("Error adding medication:", error);
      throw error;
    }
  }

  /**
   * Remove medication from current list
   */
  async removeMedication(medicationId: string): Promise<void> {
    try {
      const medications = await this.getCurrentMedications();
      const filtered = medications.filter((m) => m.id !== medicationId);

      await AsyncStorage.setItem(
        MedicationInteractionService.STORAGE_KEY_MEDICATIONS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Error removing medication:", error);
      throw error;
    }
  }

  /**
   * Save interaction check to history
   */
  private async saveInteractionCheck(
    medication: Medication,
    result: InteractionCheckResult
  ): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(
        MedicationInteractionService.STORAGE_KEY_INTERACTION_HISTORY
      );
      const history: Array<{
        medication: Medication;
        result: InteractionCheckResult;
        timestamp: Date;
      }> = historyJson ? JSON.parse(historyJson) : [];

      history.unshift({
        medication,
        result,
        timestamp: new Date(),
      });

      // Keep only last 50 checks
      if (history.length > 50) {
        history.splice(50);
      }

      await AsyncStorage.setItem(
        MedicationInteractionService.STORAGE_KEY_INTERACTION_HISTORY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error("Error saving interaction check:", error);
    }
  }

  /**
   * Get interaction check history
   */
  async getInteractionHistory(): Promise<
    Array<{
      medication: Medication;
      result: InteractionCheckResult;
      timestamp: Date;
    }>
  > {
    try {
      const historyJson = await AsyncStorage.getItem(
        MedicationInteractionService.STORAGE_KEY_INTERACTION_HISTORY
      );
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("Error getting interaction history:", error);
      return [];
    }
  }

  /**
   * Book pharmacist consultation
   */
  async bookPharmacistConsultation(
    medication: Medication,
    interactions: Interaction[]
  ): Promise<{ consultationId: string; scheduledTime: Date }> {
    // In production, this would integrate with pharmacy scheduling system
    const consultationId = `consult_${Date.now()}`;
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    console.log("Booking pharmacist consultation:", {
      consultationId,
      medication,
      interactions,
      scheduledTime,
    });

    return { consultationId, scheduledTime };
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case "contraindicated":
        return "#DC2626"; // Red
      case "major":
        return "#EF4444"; // Light red
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
  getSeverityLabel(severity: string): string {
    switch (severity) {
      case "contraindicated":
        return "CONTRAINDICATED";
      case "major":
        return "Major";
      case "moderate":
        return "Moderate";
      case "minor":
        return "Minor";
      default:
        return severity;
    }
  }
}

export default new MedicationInteractionService();
