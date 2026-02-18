/**
 * Family Health History Builder Service
 * 
 * Visual family tree tool for mapping hereditary conditions
 * and calculating genetic risk factors.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FamilyMember {
  id: string;
  name: string;
  relationship: "self" | "mother" | "father" | "maternal_grandmother" | "maternal_grandfather" | "paternal_grandmother" | "paternal_grandfather" | "sibling" | "child";
  gender: "male" | "female" | "other";
  birthYear?: number;
  isDeceased: boolean;
  conditions: HereditaryCondition[];
}

export interface HereditaryCondition {
  conditionId: string;
  conditionName: string;
  ageOfDiagnosis?: number;
  notes?: string;
}

export interface RiskProfile {
  conditionId: string;
  conditionName: string;
  riskLevel: "low" | "moderate" | "high" | "very_high";
  riskPercentage: number;
  affectedRelatives: string[];
  lineage: "maternal" | "paternal" | "both" | "none";
  screeningRecommendations: string[];
  explanation: string;
}

export interface FamilyHealthTree {
  id: string;
  userId: string;
  members: FamilyMember[];
  lastUpdated: string;
}

/**
 * Hereditary Condition Database with risk factors
 */
const HEREDITARY_CONDITIONS = {
  breast_cancer: {
    name: "Breast Cancer",
    baselineRisk: 12, // 12% lifetime risk for general population
    firstDegreeMultiplier: 2.0, // Mother or sister
    secondDegreeMultiplier: 1.5, // Grandmother or aunt
    multipleRelativesMultiplier: 3.0,
    screeningAge: 40,
    earlyScreeningIfFamilyHistory: 10, // years before youngest diagnosis
  },
  colon_cancer: {
    name: "Colon Cancer",
    baselineRisk: 4.3,
    firstDegreeMultiplier: 2.2,
    secondDegreeMultiplier: 1.5,
    multipleRelativesMultiplier: 4.0,
    screeningAge: 45,
    earlyScreeningIfFamilyHistory: 10,
  },
  prostate_cancer: {
    name: "Prostate Cancer",
    baselineRisk: 11.6,
    firstDegreeMultiplier: 2.0,
    secondDegreeMultiplier: 1.5,
    multipleRelativesMultiplier: 5.0,
    screeningAge: 50,
    earlyScreeningIfFamilyHistory: 10,
  },
  heart_disease: {
    name: "Heart Disease",
    baselineRisk: 40,
    firstDegreeMultiplier: 1.7,
    secondDegreeMultiplier: 1.3,
    multipleRelativesMultiplier: 2.5,
    screeningAge: 20,
    earlyScreeningIfFamilyHistory: 5,
  },
  stroke: {
    name: "Stroke",
    baselineRisk: 20,
    firstDegreeMultiplier: 1.3,
    secondDegreeMultiplier: 1.2,
    multipleRelativesMultiplier: 2.0,
    screeningAge: 40,
    earlyScreeningIfFamilyHistory: 10,
  },
  type_2_diabetes: {
    name: "Type 2 Diabetes",
    baselineRisk: 40,
    firstDegreeMultiplier: 2.4,
    secondDegreeMultiplier: 1.5,
    multipleRelativesMultiplier: 3.5,
    screeningAge: 35,
    earlyScreeningIfFamilyHistory: 5,
  },
  lupus: {
    name: "Lupus",
    baselineRisk: 0.1,
    firstDegreeMultiplier: 20.0,
    secondDegreeMultiplier: 5.0,
    multipleRelativesMultiplier: 30.0,
    screeningAge: 18,
    earlyScreeningIfFamilyHistory: 0,
  },
  thyroid_disorders: {
    name: "Thyroid Disorders",
    baselineRisk: 12,
    firstDegreeMultiplier: 4.0,
    secondDegreeMultiplier: 2.0,
    multipleRelativesMultiplier: 6.0,
    screeningAge: 35,
    earlyScreeningIfFamilyHistory: 10,
  },
  multiple_sclerosis: {
    name: "Multiple Sclerosis",
    baselineRisk: 0.1,
    firstDegreeMultiplier: 20.0,
    secondDegreeMultiplier: 5.0,
    multipleRelativesMultiplier: 40.0,
    screeningAge: 20,
    earlyScreeningIfFamilyHistory: 0,
  },
};

class FamilyHealthHistoryService {
  private storageKey = "family_health_tree";

  /**
   * Get available hereditary conditions
   */
  getHereditaryConditions(): Array<{ id: string; name: string }> {
    return Object.entries(HEREDITARY_CONDITIONS).map(([id, data]) => ({
      id,
      name: data.name,
    }));
  }

  /**
   * Create a new family health tree
   */
  async createFamilyTree(userId: string): Promise<FamilyHealthTree> {
    const tree: FamilyHealthTree = {
      id: `tree_${Date.now()}`,
      userId,
      members: [
        {
          id: "self",
          name: "Me",
          relationship: "self",
          gender: "other",
          isDeceased: false,
          conditions: [],
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
    
    await this.saveFamilyTree(tree);
    return tree;
  }

  /**
   * Add family member to tree
   */
  async addFamilyMember(treeId: string, member: Omit<FamilyMember, "id">): Promise<FamilyMember> {
    const tree = await this.getFamilyTree(treeId);
    if (!tree) throw new Error("Family tree not found");
    
    const newMember: FamilyMember = {
      ...member,
      id: `member_${Date.now()}`,
    };
    
    tree.members.push(newMember);
    tree.lastUpdated = new Date().toISOString();
    
    await this.saveFamilyTree(tree);
    return newMember;
  }

  /**
   * Add condition to family member
   */
  async addConditionToMember(
    treeId: string,
    memberId: string,
    condition: HereditaryCondition
  ): Promise<void> {
    const tree = await this.getFamilyTree(treeId);
    if (!tree) throw new Error("Family tree not found");
    
    const member = tree.members.find((m) => m.id === memberId);
    if (!member) throw new Error("Family member not found");
    
    member.conditions.push(condition);
    tree.lastUpdated = new Date().toISOString();
    
    await this.saveFamilyTree(tree);
  }

  /**
   * Calculate risk profile for user based on family history
   */
  async calculateRiskProfile(treeId: string): Promise<RiskProfile[]> {
    const tree = await this.getFamilyTree(treeId);
    if (!tree) throw new Error("Family tree not found");
    
    const riskProfiles: RiskProfile[] = [];
    
    // Analyze each hereditary condition
    Object.entries(HEREDITARY_CONDITIONS).forEach(([conditionId, conditionData]) => {
      const affectedRelatives: string[] = [];
      let firstDegreeCount = 0;
      let secondDegreeCount = 0;
      let maternalCount = 0;
      let paternalCount = 0;
      let youngestDiagnosisAge: number | undefined;
      
      // Find affected family members
      tree.members.forEach((member) => {
        const hasCondition = member.conditions.find((c) => c.conditionId === conditionId);
        
        if (hasCondition && member.relationship !== "self") {
          affectedRelatives.push(member.name);
          
          // Track lineage
          if (["mother", "maternal_grandmother", "maternal_grandfather"].includes(member.relationship)) {
            maternalCount++;
          } else if (["father", "paternal_grandmother", "paternal_grandfather"].includes(member.relationship)) {
            paternalCount++;
          }
          
          // Track degree of relationship
          if (["mother", "father", "sibling"].includes(member.relationship)) {
            firstDegreeCount++;
          } else {
            secondDegreeCount++;
          }
          
          // Track youngest diagnosis age
          if (hasCondition.ageOfDiagnosis) {
            if (!youngestDiagnosisAge || hasCondition.ageOfDiagnosis < youngestDiagnosisAge) {
              youngestDiagnosisAge = hasCondition.ageOfDiagnosis;
            }
          }
        }
      });
      
      // Calculate risk if any relatives are affected
      if (affectedRelatives.length > 0) {
        let riskPercentage = conditionData.baselineRisk;
        
        // Apply multipliers
        if (firstDegreeCount > 0) {
          riskPercentage *= conditionData.firstDegreeMultiplier;
        }
        if (secondDegreeCount > 0) {
          riskPercentage *= conditionData.secondDegreeMultiplier;
        }
        if (affectedRelatives.length > 1) {
          riskPercentage *= conditionData.multipleRelativesMultiplier;
        }
        
        // Cap at 95%
        riskPercentage = Math.min(95, riskPercentage);
        
        // Determine risk level
        let riskLevel: RiskProfile["riskLevel"];
        if (riskPercentage < 15) {
          riskLevel = "low";
        } else if (riskPercentage < 30) {
          riskLevel = "moderate";
        } else if (riskPercentage < 50) {
          riskLevel = "high";
        } else {
          riskLevel = "very_high";
        }
        
        // Determine lineage
        let lineage: RiskProfile["lineage"];
        if (maternalCount > 0 && paternalCount > 0) {
          lineage = "both";
        } else if (maternalCount > 0) {
          lineage = "maternal";
        } else if (paternalCount > 0) {
          lineage = "paternal";
        } else {
          lineage = "none";
        }
        
        // Generate screening recommendations
        const screeningRecommendations: string[] = [];
        
        let recommendedScreeningAge = conditionData.screeningAge;
        if (youngestDiagnosisAge) {
          recommendedScreeningAge = Math.max(
            18,
            youngestDiagnosisAge - conditionData.earlyScreeningIfFamilyHistory
          );
        }
        
        screeningRecommendations.push(
          `Begin screening at age ${recommendedScreeningAge} (earlier than general population)`
        );
        
        if (firstDegreeCount > 1 || riskLevel === "very_high") {
          screeningRecommendations.push("Consider genetic counseling and testing");
        }
        
        screeningRecommendations.push("Discuss family history with your doctor");
        screeningRecommendations.push("Schedule regular screenings as recommended");
        
        // Generate explanation
        const explanation = this.generateRiskExplanation(
          conditionData.name,
          affectedRelatives.length,
          firstDegreeCount,
          secondDegreeCount,
          lineage
        );
        
        riskProfiles.push({
          conditionId,
          conditionName: conditionData.name,
          riskLevel,
          riskPercentage: Math.round(riskPercentage),
          affectedRelatives,
          lineage,
          screeningRecommendations,
          explanation,
        });
      }
    });
    
    // Sort by risk level (highest first)
    riskProfiles.sort((a, b) => b.riskPercentage - a.riskPercentage);
    
    return riskProfiles;
  }

  /**
   * Generate human-readable risk explanation
   */
  private generateRiskExplanation(
    conditionName: string,
    totalAffected: number,
    firstDegree: number,
    secondDegree: number,
    lineage: RiskProfile["lineage"]
  ): string {
    let explanation = `You have ${totalAffected} family member${totalAffected > 1 ? "s" : ""} with ${conditionName}. `;
    
    if (firstDegree > 0) {
      explanation += `This includes ${firstDegree} close relative${firstDegree > 1 ? "s" : ""} (parent or sibling), which significantly increases your risk. `;
    }
    
    if (lineage === "both") {
      explanation += "The condition appears on both sides of your family, further increasing your risk. ";
    } else if (lineage !== "none") {
      explanation += `The condition appears on your ${lineage} side. `;
    }
    
    explanation += "Early screening and preventive measures are recommended.";
    
    return explanation;
  }

  /**
   * Export family history as PDF for doctors
   */
  async exportFamilyHistoryPDF(treeId: string): Promise<string> {
    const tree = await this.getFamilyTree(treeId);
    if (!tree) throw new Error("Family tree not found");
    
    const riskProfile = await this.calculateRiskProfile(treeId);
    
    // Generate PDF content (simplified - would use actual PDF library)
    const pdfContent = {
      title: "Family Health History",
      date: new Date().toLocaleDateString(),
      members: tree.members,
      riskProfile,
    };
    
    // In production, use react-native-html-to-pdf or similar
    return JSON.stringify(pdfContent);
  }

  /**
   * Save family tree to storage
   */
  private async saveFamilyTree(tree: FamilyHealthTree): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(tree));
    } catch (error) {
      console.error("Error saving family tree:", error);
      throw error;
    }
  }

  /**
   * Get family tree from storage
   */
  async getFamilyTree(treeId: string): Promise<FamilyHealthTree | null> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const tree: FamilyHealthTree = JSON.parse(stored);
      return tree.id === treeId ? tree : null;
    } catch (error) {
      console.error("Error retrieving family tree:", error);
      return null;
    }
  }

  /**
   * Get user's family tree (assumes one tree per user)
   */
  async getUserFamilyTree(userId: string): Promise<FamilyHealthTree | null> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const tree: FamilyHealthTree = JSON.parse(stored);
      return tree.userId === userId ? tree : null;
    } catch (error) {
      console.error("Error retrieving user family tree:", error);
      return null;
    }
  }
}

export const familyHealthHistoryService = new FamilyHealthHistoryService();
