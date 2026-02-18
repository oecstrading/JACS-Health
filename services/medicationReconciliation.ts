/**
 * Medication Reconciliation Service
 * 
 * Enhances medication lists with drug class, common indications,
 * and clinical context for healthcare providers.
 */

import type { Medication } from "./patientIntake";

export interface DrugClassInfo {
  class: string;
  category: string; // e.g., "Cardiovascular", "Endocrine", "Gastrointestinal"
  commonIndications: string[];
  mechanismOfAction: string;
  typicalDosageRange: string;
  commonSideEffects: string[];
}

export interface MedicationReconciliationEntry extends Medication {
  drugClass?: DrugClassInfo;
  prescribingDoctor?: string;
  startDate?: string;
  duration?: string;
  adherenceStatus?: "taking" | "not_taking" | "sometimes" | "unknown";
  discontinued?: boolean;
  discontinuedDate?: string;
  discontinuedReason?: string;
  interactions?: string[];
  clinicalNotes?: string;
}

class MedicationReconciliationService {
  /**
   * Drug class database
   * In production, this would integrate with RxNorm, FDA Drug Database, or similar
   */
  private drugClassDatabase: Record<string, DrugClassInfo> = {
    // Cardiovascular
    metformin: {
      class: "Biguanide",
      category: "Endocrine/Diabetes",
      commonIndications: ["Type 2 Diabetes Mellitus", "Prediabetes", "PCOS"],
      mechanismOfAction: "Decreases hepatic glucose production and increases insulin sensitivity",
      typicalDosageRange: "500mg - 2000mg daily",
      commonSideEffects: ["Nausea", "Diarrhea", "Abdominal discomfort", "Vitamin B12 deficiency"],
    },
    lisinopril: {
      class: "ACE Inhibitor",
      category: "Cardiovascular",
      commonIndications: ["Hypertension", "Heart Failure", "Post-MI", "Diabetic Nephropathy"],
      mechanismOfAction: "Inhibits angiotensin-converting enzyme, reducing vasoconstriction",
      typicalDosageRange: "5mg - 40mg daily",
      commonSideEffects: ["Dry cough", "Dizziness", "Hyperkalemia", "Angioedema (rare)"],
    },
    atorvastatin: {
      class: "Statin (HMG-CoA Reductase Inhibitor)",
      category: "Cardiovascular",
      commonIndications: ["Hyperlipidemia", "Atherosclerosis", "CVD Prevention"],
      mechanismOfAction: "Inhibits cholesterol synthesis in the liver",
      typicalDosageRange: "10mg - 80mg daily",
      commonSideEffects: ["Muscle pain", "Elevated liver enzymes", "Headache"],
    },
    amlodipine: {
      class: "Calcium Channel Blocker",
      category: "Cardiovascular",
      commonIndications: ["Hypertension", "Angina", "Coronary Artery Disease"],
      mechanismOfAction: "Blocks calcium channels in vascular smooth muscle, causing vasodilation",
      typicalDosageRange: "2.5mg - 10mg daily",
      commonSideEffects: ["Peripheral edema", "Flushing", "Headache", "Dizziness"],
    },
    losartan: {
      class: "Angiotensin II Receptor Blocker (ARB)",
      category: "Cardiovascular",
      commonIndications: ["Hypertension", "Diabetic Nephropathy", "Heart Failure"],
      mechanismOfAction: "Blocks angiotensin II receptors, reducing vasoconstriction",
      typicalDosageRange: "25mg - 100mg daily",
      commonSideEffects: ["Dizziness", "Hyperkalemia", "Fatigue"],
    },
    aspirin: {
      class: "Antiplatelet Agent (NSAID)",
      category: "Cardiovascular",
      commonIndications: ["CVD Prevention", "Post-MI", "Stroke Prevention", "Pain/Fever"],
      mechanismOfAction: "Irreversibly inhibits COX-1, preventing platelet aggregation",
      typicalDosageRange: "81mg - 325mg daily (cardioprotective)",
      commonSideEffects: ["GI upset", "Bleeding risk", "Tinnitus (high doses)"],
    },
    
    // Endocrine
    levothyroxine: {
      class: "Thyroid Hormone Replacement",
      category: "Endocrine",
      commonIndications: ["Hypothyroidism", "Thyroid Cancer (suppression)"],
      mechanismOfAction: "Replaces deficient thyroid hormone (T4)",
      typicalDosageRange: "25mcg - 200mcg daily",
      commonSideEffects: ["Palpitations", "Weight loss", "Insomnia", "Tremor"],
    },
    insulin: {
      class: "Hormone (Insulin)",
      category: "Endocrine/Diabetes",
      commonIndications: ["Type 1 Diabetes", "Type 2 Diabetes", "Gestational Diabetes"],
      mechanismOfAction: "Facilitates glucose uptake into cells",
      typicalDosageRange: "Varies by type and patient needs",
      commonSideEffects: ["Hypoglycemia", "Weight gain", "Injection site reactions"],
    },
    
    // Gastrointestinal
    omeprazole: {
      class: "Proton Pump Inhibitor (PPI)",
      category: "Gastrointestinal",
      commonIndications: ["GERD", "Peptic Ulcer Disease", "Zollinger-Ellison Syndrome"],
      mechanismOfAction: "Inhibits gastric acid secretion by blocking H+/K+ ATPase",
      typicalDosageRange: "20mg - 40mg daily",
      commonSideEffects: ["Headache", "Nausea", "Diarrhea", "Increased fracture risk (long-term)"],
    },
    
    // Respiratory
    albuterol: {
      class: "Short-Acting Beta-2 Agonist (SABA)",
      category: "Respiratory",
      commonIndications: ["Asthma", "COPD", "Exercise-Induced Bronchospasm"],
      mechanismOfAction: "Relaxes bronchial smooth muscle via beta-2 receptor stimulation",
      typicalDosageRange: "2 puffs every 4-6 hours as needed",
      commonSideEffects: ["Tremor", "Tachycardia", "Nervousness", "Headache"],
    },
    
    // Psychiatric
    sertraline: {
      class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
      category: "Psychiatric",
      commonIndications: ["Depression", "Anxiety Disorders", "PTSD", "OCD"],
      mechanismOfAction: "Inhibits serotonin reuptake, increasing synaptic serotonin",
      typicalDosageRange: "50mg - 200mg daily",
      commonSideEffects: ["Nausea", "Sexual dysfunction", "Insomnia", "Weight changes"],
    },
    
    // Pain Management
    gabapentin: {
      class: "Anticonvulsant (GABA Analog)",
      category: "Neurologic/Pain",
      commonIndications: ["Neuropathic Pain", "Seizures", "Restless Leg Syndrome"],
      mechanismOfAction: "Modulates calcium channels, reducing neurotransmitter release",
      typicalDosageRange: "300mg - 3600mg daily (divided doses)",
      commonSideEffects: ["Dizziness", "Somnolence", "Peripheral edema", "Ataxia"],
    },
  };

  /**
   * Enhance medication with reconciliation data
   */
  async reconcileMedication(
    medication: Medication
  ): Promise<MedicationReconciliationEntry> {
    const drugClass = this.lookupDrugClass(medication.name);
    const interactions = await this.checkInteractions(medication.name);

    return {
      ...medication,
      drugClass,
      interactions,
      adherenceStatus: "taking", // Would be updated from user input
    };
  }

  /**
   * Reconcile multiple medications
   */
  async reconcileMedications(
    medications: Medication[]
  ): Promise<MedicationReconciliationEntry[]> {
    const reconciled = await Promise.all(
      medications.map((med) => this.reconcileMedication(med))
    );

    // Check for drug-drug interactions
    const withInteractions = this.checkMultiDrugInteractions(reconciled);

    return withInteractions;
  }

  /**
   * Look up drug class information
   */
  private lookupDrugClass(medicationName: string): DrugClassInfo | undefined {
    // Normalize medication name (lowercase, remove brand names)
    const normalized = medicationName.toLowerCase().trim();

    // Direct lookup
    if (this.drugClassDatabase[normalized]) {
      return this.drugClassDatabase[normalized];
    }

    // Fuzzy matching for common variations
    const keys = Object.keys(this.drugClassDatabase);
    for (const key of keys) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return this.drugClassDatabase[key];
      }
    }

    // Not found - would query external API in production
    return undefined;
  }

  /**
   * Check for drug interactions
   */
  private async checkInteractions(medicationName: string): Promise<string[]> {
    // In production, integrate with interaction databases
    // For now, return known common interactions
    const interactions: Record<string, string[]> = {
      metformin: ["Alcohol (increased lactic acidosis risk)", "Contrast dye (hold before procedures)"],
      lisinopril: ["NSAIDs (reduced efficacy)", "Potassium supplements (hyperkalemia risk)"],
      atorvastatin: ["Grapefruit juice (increased drug levels)", "Gemfibrozil (myopathy risk)"],
      warfarin: ["Aspirin (bleeding risk)", "NSAIDs (bleeding risk)", "Antibiotics (INR changes)"],
    };

    const normalized = medicationName.toLowerCase().trim();
    return interactions[normalized] || [];
  }

  /**
   * Check for multi-drug interactions
   */
  private checkMultiDrugInteractions(
    medications: MedicationReconciliationEntry[]
  ): MedicationReconciliationEntry[] {
    // Check for known dangerous combinations
    const medNames = medications.map((m) => m.name.toLowerCase());

    // ACE Inhibitor + ARB (not recommended together)
    const hasACEI = medications.some((m) => m.drugClass?.class.includes("ACE Inhibitor"));
    const hasARB = medications.some((m) => m.drugClass?.class.includes("ARB"));
    if (hasACEI && hasARB) {
      medications.forEach((m) => {
        if (m.drugClass?.class.includes("ACE") || m.drugClass?.class.includes("ARB")) {
          m.interactions = [
            ...(m.interactions || []),
            "⚠️ ACE Inhibitor + ARB combination: Increased risk of hyperkalemia and renal dysfunction",
          ];
        }
      });
    }

    // Multiple NSAIDs
    const nsaids = medications.filter((m) =>
      m.drugClass?.class.includes("NSAID") || m.name.toLowerCase().includes("ibuprofen")
    );
    if (nsaids.length > 1) {
      nsaids.forEach((m) => {
        m.interactions = [
          ...(m.interactions || []),
          "⚠️ Multiple NSAIDs: Increased GI bleeding and renal toxicity risk",
        ];
      });
    }

    return medications;
  }

  /**
   * Group medications by drug class
   */
  groupByClass(
    medications: MedicationReconciliationEntry[]
  ): Record<string, MedicationReconciliationEntry[]> {
    const grouped: Record<string, MedicationReconciliationEntry[]> = {};

    medications.forEach((med) => {
      const category = med.drugClass?.category || "Other/Unknown";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(med);
    });

    return grouped;
  }

  /**
   * Generate clinical summary for providers
   */
  generateClinicalSummary(medications: MedicationReconciliationEntry[]): string {
    const grouped = this.groupByClass(medications);
    const categories = Object.keys(grouped);

    let summary = `Patient is currently taking ${medications.length} medication(s) across ${categories.length} therapeutic categories:\n\n`;

    categories.forEach((category) => {
      const meds = grouped[category];
      summary += `${category} (${meds.length}):\n`;
      meds.forEach((med) => {
        summary += `  • ${med.name} ${med.dosage} ${med.frequency}`;
        if (med.drugClass) {
          summary += ` [${med.drugClass.class}]`;
        }
        summary += `\n`;
      });
      summary += `\n`;
    });

    // Highlight interactions
    const withInteractions = medications.filter(
      (m) => m.interactions && m.interactions.length > 0
    );
    if (withInteractions.length > 0) {
      summary += `\n⚠️ POTENTIAL INTERACTIONS (${withInteractions.length}):\n`;
      withInteractions.forEach((med) => {
        summary += `  ${med.name}:\n`;
        med.interactions?.forEach((interaction) => {
          summary += `    - ${interaction}\n`;
        });
      });
    }

    return summary;
  }
}

export default new MedicationReconciliationService();
