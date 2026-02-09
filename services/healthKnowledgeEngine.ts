import AsyncStorage from "@react-native-async-storage/async-storage";
import { speak, stop } from "expo-speech";

export interface HealthSearchQuery {
  query: string;
  type: "text" | "voice" | "photo";
  timestamp: Date;
}

export interface HealthSource {
  name: string;
  url: string;
  level: 1 | 2 | 3; // 1: NIH/Mayo/CDC, 2: PubMed, 3: FDA
  credibility: "high" | "medium" | "verified";
  lastUpdated?: string;
  peerReviewed?: boolean;
}

export interface HealthSearchResult {
  id: string;
  title: string;
  summary: string;
  simplifiedSummary: string; // 6th-grade reading level
  sources: HealthSource[];
  images: HealthImage[];
  relatedTerms: string[];
  category: "medication" | "condition" | "symptom" | "procedure";
  lastVerified: Date;
}

export interface HealthImage {
  url: string;
  type: "diagram" | "pill" | "symptom" | "anatomy";
  caption: string;
  sourceVerified: boolean;
  source: string;
}

export interface SavedHealthContent {
  id: string;
  result: HealthSearchResult;
  notes: string;
  savedAt: Date;
  folder?: string;
}

class HealthKnowledgeEngineService {
  private readonly SEARCH_HISTORY_KEY = "health_search_history";
  private readonly SAVED_CONTENT_KEY = "saved_health_content";
  private readonly MAX_HISTORY = 50;

  // Tiered source hierarchy
  private readonly LEVEL_1_SOURCES = [
    { name: "National Institutes of Health (NIH)", baseUrl: "https://www.nih.gov", level: 1 as const },
    { name: "Mayo Clinic", baseUrl: "https://www.mayoclinic.org", level: 1 as const },
    { name: "Centers for Disease Control (CDC)", baseUrl: "https://www.cdc.gov", level: 1 as const },
  ];

  private readonly LEVEL_2_SOURCES = [
    { name: "PubMed", baseUrl: "https://pubmed.ncbi.nlm.nih.gov", level: 2 as const },
    { name: "The Lancet", baseUrl: "https://www.thelancet.com", level: 2 as const },
    { name: "JAMA Network", baseUrl: "https://jamanetwork.com", level: 2 as const },
  ];

  private readonly LEVEL_3_SOURCES = [
    { name: "FDA Drug Database", baseUrl: "https://www.fda.gov/drugs", level: 3 as const },
    { name: "MedlinePlus", baseUrl: "https://medlineplus.gov", level: 3 as const },
  ];

  /**
   * Perform multi-modal health search
   */
  async search(query: string, type: "text" | "voice" | "photo" = "text"): Promise<HealthSearchResult[]> {
    try {
      // Save to search history
      await this.addToSearchHistory({ query, type, timestamp: new Date() });

      // In production, this would call actual APIs
      // For now, return mock data with proper structure
      const mockResults = await this.getMockResults(query);

      return mockResults;
    } catch (error) {
      console.error("Error performing health search:", error);
      throw new Error("Failed to search health knowledge base");
    }
  }

  /**
   * Get mock results (in production, this would call real APIs)
   */
  private async getMockResults(query: string): Promise<HealthSearchResult[]> {
    const lowerQuery = query.toLowerCase();
    
    // Determine category
    let category: "medication" | "condition" | "symptom" | "procedure" = "condition";
    if (lowerQuery.includes("metformin") || lowerQuery.includes("insulin") || lowerQuery.includes("medication")) {
      category = "medication";
    } else if (lowerQuery.includes("pain") || lowerQuery.includes("fever") || lowerQuery.includes("symptom")) {
      category = "symptom";
    }

    const result: HealthSearchResult = {
      id: `result_${Date.now()}`,
      title: this.getTitleForQuery(query),
      summary: this.getTechnicalSummary(query),
      simplifiedSummary: this.getSimplifiedSummary(query),
      sources: [
        {
          name: "Mayo Clinic",
          url: `https://www.mayoclinic.org/search?q=${encodeURIComponent(query)}`,
          level: 1,
          credibility: "high",
          lastUpdated: "2026-01-15",
        },
        {
          name: "PubMed",
          url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`,
          level: 2,
          credibility: "verified",
          peerReviewed: true,
        },
      ],
      images: this.getMockImages(category),
      relatedTerms: this.getRelatedTerms(query),
      category,
      lastVerified: new Date(),
    };

    return [result];
  }

  private getTitleForQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("metformin")) return "Metformin (Diabetes Medication)";
    if (lowerQuery.includes("arthritis")) return "Rheumatoid Arthritis";
    if (lowerQuery.includes("diabetes")) return "Type 2 Diabetes Mellitus";
    return query.charAt(0).toUpperCase() + query.slice(1);
  }

  private getTechnicalSummary(query: string): string {
    return `${query} is a medical condition/medication that affects multiple physiological systems. Clinical studies have demonstrated efficacy in controlled trials with statistically significant outcomes (p<0.05). Mechanism of action involves complex biochemical pathways and cellular interactions.`;
  }

  private getSimplifiedSummary(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("metformin")) {
      return "Metformin is a pill that helps control blood sugar levels in people with diabetes. It works by helping your body use insulin better and reducing the amount of sugar your liver makes. Most people take it with meals to avoid stomach upset.";
    }
    if (lowerQuery.includes("arthritis")) {
      return "Arthritis is when your joints become swollen and painful. It happens when the cushioning between your bones wears down or your immune system attacks your joints by mistake. This makes it hard to move and can cause stiffness, especially in the morning.";
    }
    return `${query} is a health condition that doctors can help you manage. It's important to talk to your healthcare provider about your symptoms and treatment options.`;
  }

  private getMockImages(category: string): HealthImage[] {
    return [
      {
        url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Medical+Diagram",
        type: "diagram",
        caption: "How this condition affects your body",
        sourceVerified: true,
        source: "Mayo Clinic Medical Illustrations",
      },
      {
        url: "https://via.placeholder.com/300x300/50C878/FFFFFF?text=Pill+Image",
        type: "pill",
        caption: "What the medication looks like",
        sourceVerified: true,
        source: "FDA Drug Database",
      },
    ];
  }

  private getRelatedTerms(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("metformin")) {
      return ["Type 2 Diabetes", "Blood Sugar", "Insulin Resistance", "Glucose Control"];
    }
    if (lowerQuery.includes("arthritis")) {
      return ["Joint Pain", "Inflammation", "Rheumatoid", "Osteoarthritis", "Autoimmune"];
    }
    return ["Symptoms", "Treatment", "Prevention", "Diagnosis"];
  }

  /**
   * Simplify medical text to 6th-grade reading level
   */
  async simplifyMedicalText(technicalText: string): Promise<string> {
    // In production, this would use an AI API to simplify text
    // For now, return a simplified version
    return technicalText
      .replace(/utilize/g, "use")
      .replace(/administer/g, "give")
      .replace(/efficacy/g, "how well it works")
      .replace(/adverse effects/g, "side effects")
      .replace(/contraindications/g, "reasons not to use")
      .replace(/pharmaceutical/g, "medicine");
  }

  /**
   * Read content aloud using text-to-speech
   */
  async readAloud(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
    try {
      await speak(text, {
        language: "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.9, // Slightly slower for seniors
        voice: "com.apple.ttsbundle.Samantha-compact", // Natural, calm voice
      });
    } catch (error) {
      console.error("Error reading aloud:", error);
      throw new Error("Failed to read content aloud");
    }
  }

  /**
   * Stop current speech
   */
  async stopReading(): Promise<void> {
    try {
      await stop();
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  /**
   * Save content to personal health library
   */
  async saveToHealthCenter(result: HealthSearchResult, folder?: string, notes?: string): Promise<void> {
    try {
      const saved: SavedHealthContent = {
        id: `saved_${Date.now()}`,
        result,
        notes: notes || "",
        savedAt: new Date(),
        folder,
      };

      const existing = await this.getSavedContent();
      existing.push(saved);

      await AsyncStorage.setItem(this.SAVED_CONTENT_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error("Error saving to health center:", error);
      throw new Error("Failed to save content");
    }
  }

  /**
   * Get saved health content
   */
  async getSavedContent(folder?: string): Promise<SavedHealthContent[]> {
    try {
      const data = await AsyncStorage.getItem(this.SAVED_CONTENT_KEY);
      if (!data) return [];

      const allContent: SavedHealthContent[] = JSON.parse(data);
      
      if (folder) {
        return allContent.filter((item) => item.folder === folder);
      }

      return allContent;
    } catch (error) {
      console.error("Error getting saved content:", error);
      return [];
    }
  }

  /**
   * Add to search history
   */
  private async addToSearchHistory(query: HealthSearchQuery): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      history.unshift(query);

      // Keep only last MAX_HISTORY items
      const trimmed = history.slice(0, this.MAX_HISTORY);

      await AsyncStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<HealthSearchQuery[]> {
    try {
      const data = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }

  /**
   * Get definition for medical term
   */
  async getDefinition(term: string): Promise<string> {
    // In production, this would call a medical dictionary API
    const definitions: Record<string, string> = {
      hypertension: "High blood pressure - when the force of blood against your artery walls is too high",
      neuropathy: "Nerve damage that causes pain, numbness, or weakness, usually in hands and feet",
      glucose: "Sugar in your blood that gives you energy",
      insulin: "A hormone that helps sugar get from your blood into your cells for energy",
      inflammation: "Swelling and redness that happens when your body is fighting injury or infection",
    };

    return definitions[term.toLowerCase()] || `${term} is a medical term. Ask your doctor for more information.`;
  }
}

export default new HealthKnowledgeEngineService();
