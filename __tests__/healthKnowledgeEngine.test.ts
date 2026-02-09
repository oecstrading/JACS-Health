import { describe, it, expect, beforeEach } from "vitest";
import HealthKnowledgeEngineService from "../services/healthKnowledgeEngine.js";

describe("HealthKnowledgeEngineService", () => {
  beforeEach(async () => {
    // Clear storage before each test
    await HealthKnowledgeEngineService.clearSearchHistory();
  });

  describe("search", () => {
    it("should return search results for a query", async () => {
      const results = await HealthKnowledgeEngineService.search("diabetes", "text");
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      const firstResult = results[0];
      expect(firstResult).toHaveProperty("id");
      expect(firstResult).toHaveProperty("title");
      expect(firstResult).toHaveProperty("simplifiedSummary");
      expect(firstResult).toHaveProperty("sources");
      expect(firstResult).toHaveProperty("images");
    });

    it("should save search query to history", async () => {
      await HealthKnowledgeEngineService.search("hypertension", "text");
      
      const history = await HealthKnowledgeEngineService.getSearchHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].query).toBe("hypertension");
      expect(history[0].type).toBe("text");
    });

    it("should return results with tiered sources", async () => {
      const results = await HealthKnowledgeEngineService.search("arthritis", "text");
      
      const firstResult = results[0];
      expect(firstResult.sources.length).toBeGreaterThan(0);
      
      // Check for tiered sources (Level 1, 2, 3)
      const hasLevel1 = firstResult.sources.some(s => s.level === 1);
      expect(hasLevel1).toBe(true);
    });

    it("should return results with images", async () => {
      const results = await HealthKnowledgeEngineService.search("medication", "text");
      
      const firstResult = results[0];
      expect(firstResult.images).toBeDefined();
      expect(Array.isArray(firstResult.images)).toBe(true);
      
      if (firstResult.images.length > 0) {
        const firstImage = firstResult.images[0];
        expect(firstImage).toHaveProperty("url");
        expect(firstImage).toHaveProperty("caption");
        expect(firstImage).toHaveProperty("source");
        expect(firstImage).toHaveProperty("sourceVerified");
      }
    });

    it("should return simplified summary in plain English", async () => {
      const results = await HealthKnowledgeEngineService.search("metformin", "text");
      
      const firstResult = results[0];
      expect(firstResult.simplifiedSummary).toBeDefined();
      expect(typeof firstResult.simplifiedSummary).toBe("string");
      expect(firstResult.simplifiedSummary.length).toBeGreaterThan(0);
      
      // Should be different from technical summary
      expect(firstResult.simplifiedSummary).not.toBe(firstResult.summary);
    });
  });

  describe("saveToHealthCenter", () => {
    it("should save search result to health center", async () => {
      const results = await HealthKnowledgeEngineService.search("diabetes", "text");
      const firstResult = results[0];
      
      await HealthKnowledgeEngineService.saveToHealthCenter(firstResult, "My Conditions", "Important info");
      
      const savedItems = await HealthKnowledgeEngineService.getSavedContent();
      expect(savedItems.length).toBeGreaterThan(0);
      expect(savedItems[0].result.id).toBe(firstResult.id);
      expect(savedItems[0].folder).toBe("My Conditions");
      expect(savedItems[0].notes).toBe("Important info");
    });

    it("should retrieve saved items by folder", async () => {
      const results = await HealthKnowledgeEngineService.search("insulin", "text");
      const firstResult = results[0];
      
      await HealthKnowledgeEngineService.saveToHealthCenter(firstResult, "My Medications");
      
      const medicationItems = await HealthKnowledgeEngineService.getSavedContent("My Medications");
      expect(medicationItems.length).toBeGreaterThan(0);
      expect(medicationItems[0].folder).toBe("My Medications");
      
      const conditionItems = await HealthKnowledgeEngineService.getSavedContent("My Conditions");
      expect(conditionItems.length).toBe(0);
    });
  });

  describe("searchHistory", () => {
    it("should maintain search history", async () => {
      await HealthKnowledgeEngineService.search("diabetes", "text");
      await HealthKnowledgeEngineService.search("hypertension", "text");
      await HealthKnowledgeEngineService.search("arthritis", "voice");
      
      const history = await HealthKnowledgeEngineService.getSearchHistory();
      expect(history.length).toBe(3);
      
      // Most recent first
      expect(history[0].query).toBe("arthritis");
      expect(history[0].type).toBe("voice");
      expect(history[1].query).toBe("hypertension");
      expect(history[2].query).toBe("diabetes");
    });

    it("should clear search history", async () => {
      await HealthKnowledgeEngineService.search("test query", "text");
      
      let history = await HealthKnowledgeEngineService.getSearchHistory();
      expect(history.length).toBeGreaterThan(0);
      
      await HealthKnowledgeEngineService.clearSearchHistory();
      
      history = await HealthKnowledgeEngineService.getSearchHistory();
      expect(history.length).toBe(0);
    });
  });

  describe("simplifyMedicalText", () => {
    it("should simplify medical terminology", async () => {
      const technicalText = "Utilize pharmaceutical agents to administer treatment with demonstrated efficacy.";
      const simplified = await HealthKnowledgeEngineService.simplifyMedicalText(technicalText);
      
      expect(simplified).toBeDefined();
      expect(typeof simplified).toBe("string");
      expect(simplified).not.toContain("utilize");
      expect(simplified).not.toContain("pharmaceutical");
      expect(simplified).not.toContain("administer");
      expect(simplified).not.toContain("efficacy");
    });
  });

  describe("getDefinition", () => {
    it("should return definition for medical term", async () => {
      const definition = await HealthKnowledgeEngineService.getDefinition("hypertension");
      
      expect(definition).toBeDefined();
      expect(typeof definition).toBe("string");
      expect(definition.length).toBeGreaterThan(0);
      expect(definition.toLowerCase()).toContain("blood pressure");
    });

    it("should return fallback for unknown terms", async () => {
      const definition = await HealthKnowledgeEngineService.getDefinition("unknownmedicalterm123");
      
      expect(definition).toBeDefined();
      expect(typeof definition).toBe("string");
      expect(definition).toContain("medical term");
    });
  });
});
