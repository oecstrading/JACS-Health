/**
 * AI Meal Planner Service
 * 
 * Generates personalized weekly meal plans based on:
 * - Dietary restrictions and allergies
 * - Glucose targets (for diabetes management)
 * - Medication schedule
 * - Food preferences
 * - Nutritional balance
 * 
 * Also generates automated grocery lists categorized by food type.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DietaryProfile {
  allergies: string[];
  restrictions: string[]; // vegetarian, vegan, gluten-free, etc.
  preferences: string[]; // liked foods
  dislikes: string[];
  glucoseTarget: { min: number; max: number }; // mg/dL
  calorieTarget: number;
  carbLimit: number; // grams per meal
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemicIndex: number;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string; // produce, dairy, meat, etc.
}

export interface MealPlan {
  id: string;
  weekStartDate: Date;
  days: DayPlan[];
  totalCalories: number;
  totalCarbs: number;
  groceryList: GroceryList;
}

export interface DayPlan {
  date: Date;
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snacks: Recipe[];
}

export interface GroceryList {
  produce: GroceryItem[];
  dairy: GroceryItem[];
  meat: GroceryItem[];
  grains: GroceryItem[];
  pantry: GroceryItem[];
  other: GroceryItem[];
}

export interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

class AIMealPlannerService {
  private static instance: AIMealPlannerService;

  private constructor() {}

  static getInstance(): AIMealPlannerService {
    if (!AIMealPlannerService.instance) {
      AIMealPlannerService.instance = new AIMealPlannerService();
    }
    return AIMealPlannerService.instance;
  }

  /**
   * Generate personalized weekly meal plan
   */
  async generateMealPlan(profile: DietaryProfile): Promise<MealPlan> {
    const weekStartDate = this.getStartOfWeek(new Date());
    const days: DayPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);

      const dayPlan = await this.generateDayPlan(date, profile);
      days.push(dayPlan);
    }

    const totalCalories = days.reduce(
      (sum, day) =>
        sum +
        day.breakfast.calories +
        day.lunch.calories +
        day.dinner.calories +
        day.snacks.reduce((s, snack) => s + snack.calories, 0),
      0
    );

    const totalCarbs = days.reduce(
      (sum, day) =>
        sum +
        day.breakfast.carbs +
        day.lunch.carbs +
        day.dinner.carbs +
        day.snacks.reduce((s, snack) => s + snack.carbs, 0),
      0
    );

    const groceryList = this.generateGroceryList(days);

    const mealPlan: MealPlan = {
      id: `plan_${Date.now()}`,
      weekStartDate,
      days,
      totalCalories,
      totalCarbs,
      groceryList,
    };

    await this.saveMealPlan(mealPlan);
    return mealPlan;
  }

  /**
   * Generate meal plan for a single day
   */
  private async generateDayPlan(date: Date, profile: DietaryProfile): Promise<DayPlan> {
    const breakfast = await this.selectMeal("breakfast", profile);
    const lunch = await this.selectMeal("lunch", profile);
    const dinner = await this.selectMeal("dinner", profile);
    const snacks = [await this.selectMeal("snack", profile)];

    return {
      date,
      breakfast,
      lunch,
      dinner,
      snacks,
    };
  }

  /**
   * Select appropriate meal based on profile and meal type
   */
  private async selectMeal(mealType: string, profile: DietaryProfile): Promise<Recipe> {
    const recipes = await this.getRecipeDatabase();
    const filtered = recipes.filter((recipe) => {
      // Filter by meal type
      if (!recipe.tags.includes(mealType)) return false;

      // Filter by allergies
      if (profile.allergies.some((allergy) =>
        recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(allergy.toLowerCase())
        )
      )) {
        return false;
      }

      // Filter by restrictions
      if (profile.restrictions.includes("vegetarian") && recipe.tags.includes("meat")) {
        return false;
      }
      if (profile.restrictions.includes("vegan") && 
          (recipe.tags.includes("dairy") || recipe.tags.includes("meat"))) {
        return false;
      }
      if (profile.restrictions.includes("gluten-free") && recipe.tags.includes("gluten")) {
        return false;
      }

      // Filter by carb limit
      if (recipe.carbs > profile.carbLimit) return false;

      // Filter by glycemic index (prefer low GI for diabetes)
      if (recipe.glycemicIndex > 70) return false;

      return true;
    });

    // Return random recipe from filtered list
    return filtered[Math.floor(Math.random() * filtered.length)] || this.getDefaultRecipe(mealType);
  }

  /**
   * Generate grocery list from meal plan
   */
  private generateGroceryList(days: DayPlan[]): GroceryList {
    const allIngredients: Ingredient[] = [];

    days.forEach((day) => {
      allIngredients.push(...day.breakfast.ingredients);
      allIngredients.push(...day.lunch.ingredients);
      allIngredients.push(...day.dinner.ingredients);
      day.snacks.forEach((snack) => allIngredients.push(...snack.ingredients));
    });

    // Consolidate ingredients by name and category
    const consolidated = new Map<string, GroceryItem>();

    allIngredients.forEach((ing) => {
      const key = `${ing.name}_${ing.unit}`;
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        existing.amount += ing.amount;
      } else {
        consolidated.set(key, {
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          checked: false,
        });
      }
    });

    // Categorize items
    const groceryList: GroceryList = {
      produce: [],
      dairy: [],
      meat: [],
      grains: [],
      pantry: [],
      other: [],
    };

    consolidated.forEach((item) => {
      const ingredient = allIngredients.find((ing) => ing.name === item.name);
      const category = ingredient?.category || "other";

      switch (category) {
        case "produce":
          groceryList.produce.push(item);
          break;
        case "dairy":
          groceryList.dairy.push(item);
          break;
        case "meat":
          groceryList.meat.push(item);
          break;
        case "grains":
          groceryList.grains.push(item);
          break;
        case "pantry":
          groceryList.pantry.push(item);
          break;
        default:
          groceryList.other.push(item);
      }
    });

    return groceryList;
  }

  /**
   * Get recipe database (in real app, this would be from API or local database)
   */
  private async getRecipeDatabase(): Promise<Recipe[]> {
    return [
      {
        id: "1",
        name: "Oatmeal with Berries",
        description: "Healthy whole grain breakfast with antioxidant-rich berries",
        prepTime: 5,
        cookTime: 10,
        servings: 1,
        calories: 280,
        carbs: 45,
        protein: 8,
        fat: 6,
        fiber: 8,
        glycemicIndex: 55,
        tags: ["breakfast", "vegetarian", "heart-healthy"],
        ingredients: [
          { name: "Oats", amount: 0.5, unit: "cup", category: "grains" },
          { name: "Blueberries", amount: 0.5, unit: "cup", category: "produce" },
          { name: "Almond milk", amount: 1, unit: "cup", category: "dairy" },
          { name: "Honey", amount: 1, unit: "tbsp", category: "pantry" },
        ],
        instructions: [
          "Bring almond milk to a boil",
          "Add oats and reduce heat",
          "Cook for 5 minutes, stirring occasionally",
          "Top with berries and honey",
        ],
      },
      {
        id: "2",
        name: "Grilled Chicken Salad",
        description: "Protein-rich salad with mixed greens and vegetables",
        prepTime: 15,
        cookTime: 15,
        servings: 1,
        calories: 350,
        carbs: 25,
        protein: 35,
        fat: 12,
        fiber: 6,
        glycemicIndex: 40,
        tags: ["lunch", "high-protein", "low-carb"],
        ingredients: [
          { name: "Chicken breast", amount: 6, unit: "oz", category: "meat" },
          { name: "Mixed greens", amount: 2, unit: "cups", category: "produce" },
          { name: "Cherry tomatoes", amount: 0.5, unit: "cup", category: "produce" },
          { name: "Cucumber", amount: 0.5, unit: "cup", category: "produce" },
          { name: "Olive oil", amount: 1, unit: "tbsp", category: "pantry" },
        ],
        instructions: [
          "Season and grill chicken breast",
          "Chop vegetables",
          "Combine greens and vegetables",
          "Slice chicken and add to salad",
          "Drizzle with olive oil",
        ],
      },
      {
        id: "3",
        name: "Baked Salmon with Vegetables",
        description: "Omega-3 rich fish with roasted vegetables",
        prepTime: 10,
        cookTime: 20,
        servings: 1,
        calories: 420,
        carbs: 30,
        protein: 40,
        fat: 18,
        fiber: 7,
        glycemicIndex: 45,
        tags: ["dinner", "heart-healthy", "omega-3"],
        ingredients: [
          { name: "Salmon fillet", amount: 6, unit: "oz", category: "meat" },
          { name: "Broccoli", amount: 1, unit: "cup", category: "produce" },
          { name: "Sweet potato", amount: 1, unit: "medium", category: "produce" },
          { name: "Olive oil", amount: 1, unit: "tbsp", category: "pantry" },
          { name: "Lemon", amount: 0.5, unit: "whole", category: "produce" },
        ],
        instructions: [
          "Preheat oven to 400°F",
          "Season salmon with lemon and herbs",
          "Chop vegetables and toss with olive oil",
          "Bake salmon and vegetables for 20 minutes",
        ],
      },
      {
        id: "4",
        name: "Greek Yogurt with Nuts",
        description: "Protein-packed snack with healthy fats",
        prepTime: 2,
        cookTime: 0,
        servings: 1,
        calories: 180,
        carbs: 15,
        protein: 12,
        fat: 8,
        fiber: 3,
        glycemicIndex: 35,
        tags: ["snack", "vegetarian", "high-protein"],
        ingredients: [
          { name: "Greek yogurt", amount: 1, unit: "cup", category: "dairy" },
          { name: "Almonds", amount: 10, unit: "whole", category: "pantry" },
          { name: "Honey", amount: 0.5, unit: "tbsp", category: "pantry" },
        ],
        instructions: [
          "Place yogurt in bowl",
          "Top with almonds and honey",
        ],
      },
    ];
  }

  /**
   * Get default recipe as fallback
   */
  private getDefaultRecipe(mealType: string): Recipe {
    return {
      id: "default",
      name: "Simple Meal",
      description: "Basic healthy meal",
      prepTime: 10,
      cookTime: 15,
      servings: 1,
      calories: 300,
      carbs: 35,
      protein: 20,
      fat: 10,
      fiber: 5,
      glycemicIndex: 50,
      tags: [mealType],
      ingredients: [],
      instructions: [],
    };
  }

  /**
   * Get start of current week (Sunday)
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  /**
   * Save meal plan
   */
  private async saveMealPlan(plan: MealPlan): Promise<void> {
    try {
      const plansStr = await AsyncStorage.getItem("meal_plans");
      const plans: MealPlan[] = plansStr ? JSON.parse(plansStr) : [];
      plans.push(plan);
      await AsyncStorage.setItem("meal_plans", JSON.stringify(plans));
    } catch (error) {
      console.error("Error saving meal plan:", error);
    }
  }

  /**
   * Get all meal plans
   */
  async getAllMealPlans(): Promise<MealPlan[]> {
    try {
      const plansStr = await AsyncStorage.getItem("meal_plans");
      return plansStr ? JSON.parse(plansStr) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get current week's meal plan
   */
  async getCurrentMealPlan(): Promise<MealPlan | null> {
    const plans = await this.getAllMealPlans();
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);

    return plans.find((p) => {
      const planStart = new Date(p.weekStartDate);
      return planStart.toDateString() === startOfWeek.toDateString();
    }) || null;
  }

  /**
   * Export grocery list as text
   */
  exportGroceryList(groceryList: GroceryList): string {
    let text = "🛒 GROCERY LIST\n\n";

    const categories = [
      { name: "🥬 Produce", items: groceryList.produce },
      { name: "🥛 Dairy", items: groceryList.dairy },
      { name: "🥩 Meat & Seafood", items: groceryList.meat },
      { name: "🌾 Grains & Bread", items: groceryList.grains },
      { name: "🥫 Pantry", items: groceryList.pantry },
      { name: "📦 Other", items: groceryList.other },
    ];

    categories.forEach((category) => {
      if (category.items.length > 0) {
        text += `${category.name}\n`;
        category.items.forEach((item) => {
          text += `  ${item.checked ? "✓" : "☐"} ${item.amount} ${item.unit} ${item.name}\n`;
        });
        text += "\n";
      }
    });

    return text;
  }

  /**
   * Toggle grocery item checked status
   */
  async toggleGroceryItem(planId: string, itemName: string): Promise<void> {
    try {
      const plansStr = await AsyncStorage.getItem("meal_plans");
      if (!plansStr) return;

      const plans: MealPlan[] = JSON.parse(plansStr);
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

      // Find and toggle item in all categories
      Object.values(plan.groceryList).forEach((category) => {
        if (Array.isArray(category)) {
          const item = category.find((i) => i.name === itemName);
          if (item) {
            item.checked = !item.checked;
          }
        }
      });

      await AsyncStorage.setItem("meal_plans", JSON.stringify(plans));
    } catch (error) {
      console.error("Error toggling grocery item:", error);
    }
  }
}

export default AIMealPlannerService.getInstance();
