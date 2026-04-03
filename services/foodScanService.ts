import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NutritionalInfo {
  calories: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
  glycemicIndex: number; // 0-100
  glycemicLoad: number;
  servingSize: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition: NutritionalInfo;
  photoUri?: string;
  timestamp: Date;
}

export interface GlucoseImpactPrediction {
  estimatedPeakGlucose: number; // mg/dL
  timeToPeak: number; // minutes
  duration: number; // minutes
  recommendedInsulin: number; // units
  confidence: "low" | "medium" | "high";
}

class FoodScanService {
  private static instance: FoodScanService;
  private scannedFoods: FoodItem[] = [];
  private favoriteFoods: FoodItem[] = [];
  
  // User-specific diabetes parameters
  private insulinToCarbRatio: number = 10; // 1 unit per X grams of carbs
  private correctionFactor: number = 50; // 1 unit lowers glucose by X mg/dL
  private targetGlucose: number = 120; // mg/dL

  private constructor() {
    this.loadData();
  }

  static getInstance(): FoodScanService {
    if (!FoodScanService.instance) {
      FoodScanService.instance = new FoodScanService();
    }
    return FoodScanService.instance;
  }

  private async loadData() {
    try {
      const [foodsData, favoritesData, paramsData] = await Promise.all([
        AsyncStorage.getItem("scanned_foods"),
        AsyncStorage.getItem("favorite_foods"),
        AsyncStorage.getItem("diabetes_parameters"),
      ]);

      if (foodsData) {
        this.scannedFoods = JSON.parse(foodsData).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp),
        }));
      }

      if (favoritesData) {
        this.favoriteFoods = JSON.parse(favoritesData).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp),
        }));
      }

      if (paramsData) {
        const params = JSON.parse(paramsData);
        this.insulinToCarbRatio = params.insulinToCarbRatio;
        this.correctionFactor = params.correctionFactor;
        this.targetGlucose = params.targetGlucose;
      }
    } catch (error) {
      console.error("Error loading food scan data:", error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem("scanned_foods", JSON.stringify(this.scannedFoods)),
        AsyncStorage.setItem("favorite_foods", JSON.stringify(this.favoriteFoods)),
        AsyncStorage.setItem(
          "diabetes_parameters",
          JSON.stringify({
            insulinToCarbRatio: this.insulinToCarbRatio,
            correctionFactor: this.correctionFactor,
            targetGlucose: this.targetGlucose,
          })
        ),
      ]);
    } catch (error) {
      console.error("Error saving food scan data:", error);
    }
  }

  // Food Recognition (AI-powered)
  async recognizeFood(photoUri: string): Promise<FoodItem> {
    // In production, this would call an AI vision API (e.g., Clarifai, Google Vision, AWS Rekognition)
    // For now, we'll return mock data
    const mockFoods = [
      {
        name: "Apple",
        nutrition: {
          calories: 95,
          carbs: 25,
          protein: 0.5,
          fat: 0.3,
          fiber: 4,
          sugar: 19,
          sodium: 2,
          glycemicIndex: 36,
          glycemicLoad: 6,
          servingSize: "1 medium (182g)",
        },
      },
      {
        name: "Banana",
        nutrition: {
          calories: 105,
          carbs: 27,
          protein: 1.3,
          fat: 0.4,
          fiber: 3,
          sugar: 14,
          sodium: 1,
          glycemicIndex: 51,
          glycemicLoad: 13,
          servingSize: "1 medium (118g)",
        },
      },
      {
        name: "Whole Wheat Bread",
        nutrition: {
          calories: 80,
          carbs: 15,
          protein: 4,
          fat: 1,
          fiber: 2,
          sugar: 2,
          sodium: 150,
          glycemicIndex: 74,
          glycemicLoad: 9,
          servingSize: "1 slice (28g)",
        },
      },
    ];

    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    
    const foodItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: randomFood.name,
      nutrition: randomFood.nutrition,
      photoUri,
      timestamp: new Date(),
    };

    this.scannedFoods.push(foodItem);
    await this.saveData();
    
    return foodItem;
  }

  // Barcode Scanning
  async scanBarcode(barcode: string): Promise<FoodItem> {
    // In production, this would call a food database API (e.g., OpenFoodFacts, USDA)
    // For now, we'll return mock data
    const mockBarcodeData: { [key: string]: any } = {
      "012345678901": {
        name: "Cheerios",
        brand: "General Mills",
        nutrition: {
          calories: 100,
          carbs: 20,
          protein: 3,
          fat: 2,
          fiber: 3,
          sugar: 1,
          sodium: 140,
          glycemicIndex: 74,
          glycemicLoad: 15,
          servingSize: "1 cup (28g)",
        },
      },
    };

    const data = mockBarcodeData[barcode] || {
      name: "Unknown Product",
      brand: "Unknown",
      nutrition: {
        calories: 150,
        carbs: 30,
        protein: 5,
        fat: 3,
        fiber: 2,
        sugar: 10,
        sodium: 200,
        glycemicIndex: 60,
        glycemicLoad: 18,
        servingSize: "1 serving",
      },
    };

    const foodItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: data.name,
      brand: data.brand,
      barcode,
      nutrition: data.nutrition,
      timestamp: new Date(),
    };

    this.scannedFoods.push(foodItem);
    await this.saveData();
    
    return foodItem;
  }

  // Manual Food Entry
  async addManualFood(food: Omit<FoodItem, "id" | "timestamp">): Promise<FoodItem> {
    const foodItem: FoodItem = {
      ...food,
      id: `food_${Date.now()}`,
      timestamp: new Date(),
    };

    this.scannedFoods.push(foodItem);
    await this.saveData();
    
    return foodItem;
  }

  // Glucose Impact Prediction
  predictGlucoseImpact(
    food: FoodItem,
    currentGlucose: number,
    portionMultiplier: number = 1
  ): GlucoseImpactPrediction {
    const { carbs, fiber, glycemicIndex } = food.nutrition;
    
    // Net carbs (total carbs - fiber)
    const netCarbs = (carbs - fiber) * portionMultiplier;
    
    // Estimate glucose rise based on carbs and GI
    // Rule of thumb: 1g of carbs raises glucose by ~3-5 mg/dL (varies by person)
    const carbImpact = netCarbs * 4; // mg/dL
    
    // Adjust for glycemic index (lower GI = slower, lower peak)
    const giMultiplier = glycemicIndex / 70; // Normalize around medium GI
    const estimatedPeakGlucose = currentGlucose + carbImpact * giMultiplier;
    
    // Time to peak based on GI
    const timeToPeak = glycemicIndex < 55 ? 90 : glycemicIndex < 70 ? 60 : 45;
    
    // Duration of glucose elevation
    const duration = glycemicIndex < 55 ? 180 : glycemicIndex < 70 ? 120 : 90;
    
    // Calculate recommended insulin
    const recommendedInsulin = netCarbs / this.insulinToCarbRatio;
    
    // Confidence based on GI data availability
    const confidence: "low" | "medium" | "high" = 
      glycemicIndex > 0 ? "high" : "medium";
    
    return {
      estimatedPeakGlucose: Math.round(estimatedPeakGlucose),
      timeToPeak,
      duration,
      recommendedInsulin: Math.round(recommendedInsulin * 10) / 10,
      confidence,
    };
  }

  // Insulin Dosage Calculation
  calculateInsulinDose(
    carbsToEat: number,
    currentGlucose: number
  ): {
    carbCoverage: number;
    correction: number;
    total: number;
  } {
    // Carb coverage
    const carbCoverage = carbsToEat / this.insulinToCarbRatio;
    
    // Correction dose (if glucose is above target)
    const glucoseDifference = currentGlucose - this.targetGlucose;
    const correction = glucoseDifference > 0 
      ? glucoseDifference / this.correctionFactor 
      : 0;
    
    return {
      carbCoverage: Math.round(carbCoverage * 10) / 10,
      correction: Math.round(correction * 10) / 10,
      total: Math.round((carbCoverage + correction) * 10) / 10,
    };
  }

  // Diabetes Parameters
  async setDiabetesParameters(params: {
    insulinToCarbRatio?: number;
    correctionFactor?: number;
    targetGlucose?: number;
  }): Promise<void> {
    if (params.insulinToCarbRatio !== undefined) {
      this.insulinToCarbRatio = params.insulinToCarbRatio;
    }
    if (params.correctionFactor !== undefined) {
      this.correctionFactor = params.correctionFactor;
    }
    if (params.targetGlucose !== undefined) {
      this.targetGlucose = params.targetGlucose;
    }
    await this.saveData();
  }

  getDiabetesParameters(): {
    insulinToCarbRatio: number;
    correctionFactor: number;
    targetGlucose: number;
  } {
    return {
      insulinToCarbRatio: this.insulinToCarbRatio,
      correctionFactor: this.correctionFactor,
      targetGlucose: this.targetGlucose,
    };
  }

  // Favorites Management
  async addToFavorites(foodId: string): Promise<void> {
    const food = this.scannedFoods.find((f) => f.id === foodId);
    if (food && !this.favoriteFoods.some((f) => f.id === foodId)) {
      this.favoriteFoods.push(food);
      await this.saveData();
    }
  }

  async removeFromFavorites(foodId: string): Promise<void> {
    this.favoriteFoods = this.favoriteFoods.filter((f) => f.id !== foodId);
    await this.saveData();
  }

  getFavoriteFoods(): FoodItem[] {
    return this.favoriteFoods;
  }

  // History
  getScannedFoods(limit?: number): FoodItem[] {
    const sorted = [...this.scannedFoods].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async clearHistory(): Promise<void> {
    this.scannedFoods = [];
    await this.saveData();
  }

  // Search
  searchFoods(query: string): FoodItem[] {
    const lowerQuery = query.toLowerCase();
    return [...this.scannedFoods, ...this.favoriteFoods].filter(
      (food) =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.brand?.toLowerCase().includes(lowerQuery)
    );
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: FoodScanService | null = null;
const _lazy = new Proxy({} as FoodScanService, {
  get(_: FoodScanService, prop: string | symbol) {
    if (!_instance) _instance = FoodScanService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: FoodScanService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = FoodScanService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
