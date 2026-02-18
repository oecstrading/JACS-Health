import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Food and Carbohydrate Tracking Service
 * 
 * Tracks meals and their impact on glucose levels for diabetes management.
 * Helps users understand how different foods affect their blood sugar.
 */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  name: string;
  carbs: number; // grams
  calories?: number;
  protein?: number; // grams
  fat?: number; // grams
  servingSize?: string;
}

export interface MealLog {
  id: string;
  timestamp: Date;
  mealType: MealType;
  foods: FoodItem[];
  totalCarbs: number;
  totalCalories: number;
  notes?: string;
  photoUri?: string;
  glucoseBefore?: number; // mg/dL
  glucoseAfter?: number; // mg/dL (2 hours post-meal)
  insulinBolus?: number; // units
}

export interface MealImpactAnalysis {
  mealId: string;
  glucoseRise: number; // mg/dL
  peakGlucose: number; // mg/dL
  timeToPeak: number; // minutes
  carbRatio: number; // mg/dL per gram of carbs
}

// Common food database for quick logging
export const COMMON_FOODS: Record<string, FoodItem> = {
  // Breakfast
  "Oatmeal (1 cup)": { name: "Oatmeal (1 cup)", carbs: 27, calories: 150, protein: 5, fat: 3, servingSize: "1 cup" },
  "Whole wheat toast (1 slice)": { name: "Whole wheat toast (1 slice)", carbs: 12, calories: 70, protein: 3, fat: 1, servingSize: "1 slice" },
  "Egg (1 large)": { name: "Egg (1 large)", carbs: 0, calories: 70, protein: 6, fat: 5, servingSize: "1 large" },
  "Banana (medium)": { name: "Banana (medium)", carbs: 27, calories: 105, protein: 1, fat: 0, servingSize: "1 medium" },
  "Orange juice (8 oz)": { name: "Orange juice (8 oz)", carbs: 26, calories: 110, protein: 2, fat: 0, servingSize: "8 oz" },
  
  
  // Lunch and Dinner
  "Brown rice (1 cup)": { name: "Brown rice (1 cup)", carbs: 45, calories: 215, protein: 5, fat: 2, servingSize: "1 cup" },
  "Chicken breast (4 oz)": { name: "Chicken breast (4 oz)", carbs: 0, calories: 185, protein: 35, fat: 4, servingSize: "4 oz" },
  "Salmon (4 oz)": { name: "Salmon (4 oz)", carbs: 0, calories: 230, protein: 25, fat: 14, servingSize: "4 oz" },
  "Sweet potato (medium)": { name: "Sweet potato (medium)", carbs: 24, calories: 105, protein: 2, fat: 0, servingSize: "1 medium" },
  "Broccoli (1 cup)": { name: "Broccoli (1 cup)", carbs: 6, calories: 30, protein: 3, fat: 0, servingSize: "1 cup" },
  "Pasta (1 cup)": { name: "Pasta (1 cup)", carbs: 43, calories: 220, protein: 8, fat: 1, servingSize: "1 cup" },
  "Whole wheat bread (2 slices)": { name: "Whole wheat bread (2 slices)", carbs: 24, calories: 140, protein: 6, fat: 2, servingSize: "2 slices" },
  
  // Snacks
  "Apple (medium)": { name: "Apple (medium)", carbs: 25, calories: 95, protein: 0, fat: 0, servingSize: "1 medium" },
  "Greek yogurt (6 oz)": { name: "Greek yogurt (6 oz)", carbs: 9, calories: 100, protein: 17, fat: 0, servingSize: "6 oz" },
  "Almonds (1 oz)": { name: "Almonds (1 oz)", carbs: 6, calories: 160, protein: 6, fat: 14, servingSize: "1 oz" },
  "Crackers (6 crackers)": { name: "Crackers (6 crackers)", carbs: 15, calories: 80, protein: 2, fat: 3, servingSize: "6 crackers" },
  "Cheese (1 oz)": { name: "Cheese (1 oz)", carbs: 1, calories: 110, protein: 7, fat: 9, servingSize: "1 oz" },
};

class FoodTrackingService {
  private static instance: FoodTrackingService;
  private mealLogs: MealLog[] = [];
  private mealImpacts: MealImpactAnalysis[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): FoodTrackingService {
    if (!FoodTrackingService.instance) {
      FoodTrackingService.instance = new FoodTrackingService();
    }
    return FoodTrackingService.instance;
  }

  private async loadData() {
    try {
      const [logsData, impactsData] = await Promise.all([
        AsyncStorage.getItem("meal_logs"),
        AsyncStorage.getItem("meal_impacts"),
      ]);

      if (logsData) {
        this.mealLogs = JSON.parse(logsData).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }

      if (impactsData) {
        this.mealImpacts = JSON.parse(impactsData);
      }
    } catch (error) {
      console.error("Error loading food tracking data:", error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem("meal_logs", JSON.stringify(this.mealLogs)),
        AsyncStorage.setItem("meal_impacts", JSON.stringify(this.mealImpacts)),
      ]);
    } catch (error) {
      console.error("Error saving food tracking data:", error);
    }
  }

  // Log a meal
  async logMeal(meal: Omit<MealLog, "id" | "totalCarbs" | "totalCalories">): Promise<MealLog> {
    const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    const totalCalories = meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0);

    const newMeal: MealLog = {
      ...meal,
      id: `meal_${Date.now()}`,
      totalCarbs: Math.round(totalCarbs),
      totalCalories: Math.round(totalCalories),
    };

    this.mealLogs.push(newMeal);

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    this.mealLogs = this.mealLogs.filter((log) => log.timestamp >= ninetyDaysAgo);

    await this.saveData();
    return newMeal;
  }

  // Update meal with post-meal glucose
  async updateMealGlucose(mealId: string, glucoseAfter: number): Promise<void> {
    const meal = this.mealLogs.find((m) => m.id === mealId);
    if (meal) {
      meal.glucoseAfter = glucoseAfter;

      // Calculate meal impact if we have before and after glucose
      if (meal.glucoseBefore && meal.glucoseAfter) {
        const impact: MealImpactAnalysis = {
          mealId,
          glucoseRise: meal.glucoseAfter - meal.glucoseBefore,
          peakGlucose: meal.glucoseAfter,
          timeToPeak: 120, // Assume 2 hours for now
          carbRatio: meal.totalCarbs > 0 ? (meal.glucoseAfter - meal.glucoseBefore) / meal.totalCarbs : 0,
        };

        this.mealImpacts.push(impact);
      }

      await this.saveData();
    }
  }

  // Get meals by date range
  getMealsByDateRange(startDate: Date, endDate: Date): MealLog[] {
    return this.mealLogs.filter(
      (log) => log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  // Get meals for today
  getTodaysMeals(): MealLog[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getMealsByDateRange(today, tomorrow);
  }

  // Get meal by ID
  getMealById(mealId: string): MealLog | null {
    return this.mealLogs.find((m) => m.id === mealId) || null;
  }

  // Delete meal
  async deleteMeal(mealId: string): Promise<void> {
    this.mealLogs = this.mealLogs.filter((m) => m.id !== mealId);
    this.mealImpacts = this.mealImpacts.filter((i) => i.mealId !== mealId);
    await this.saveData();
  }

  // Get average carb ratio (for insulin dosing)
  getAverageCarbRatio(days: number = 14): number {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentImpacts = this.mealImpacts.filter((impact) => {
      const meal = this.getMealById(impact.mealId);
      return meal && meal.timestamp >= startDate;
    });

    if (recentImpacts.length === 0) return 0;

    const totalRatio = recentImpacts.reduce((sum, impact) => sum + impact.carbRatio, 0);
    return Math.round((totalRatio / recentImpacts.length) * 10) / 10;
  }

  // Get meals that caused high glucose spikes
  getProblematicMeals(threshold: number = 50): MealLog[] {
    const problematicMealIds = this.mealImpacts
      .filter((impact) => impact.glucoseRise > threshold)
      .map((impact) => impact.mealId);

    return this.mealLogs.filter((meal) => problematicMealIds.includes(meal.id));
  }

  // Get daily carb totals
  getDailyCarbs(date: Date): number {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = this.getMealsByDateRange(startOfDay, endOfDay);
    return meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  }

  // Search common foods
  searchCommonFoods(query: string): FoodItem[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(COMMON_FOODS).filter((food) =>
      food.name.toLowerCase().includes(lowerQuery)
    );
  }

  // Get all common foods by category
  getCommonFoodsByCategory(category: "breakfast" | "lunch" | "dinner" | "snack"): FoodItem[] {
    // Simple categorization based on food names
    const allFoods = Object.values(COMMON_FOODS);
    
    if (category === "breakfast") {
      return allFoods.filter((f) => 
        f.name.includes("Oatmeal") || 
        f.name.includes("toast") || 
        f.name.includes("Egg") || 
        f.name.includes("Banana") ||
        f.name.includes("juice")
      );
    } else if (category === "snack") {
      return allFoods.filter((f) => 
        f.name.includes("Apple") || 
        f.name.includes("yogurt") || 
        f.name.includes("Almonds") ||
        f.name.includes("Crackers") ||
        f.name.includes("Cheese")
      );
    } else {
      return allFoods.filter((f) => 
        f.name.includes("rice") || 
        f.name.includes("Chicken") || 
        f.name.includes("Salmon") ||
        f.name.includes("potato") ||
        f.name.includes("Broccoli") ||
        f.name.includes("Pasta") ||
        f.name.includes("bread")
      );
    }
  }
}

export default FoodTrackingService.getInstance();
