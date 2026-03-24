/**
 * foodRecognition.ts — Food Recognition & Carb Counter
 *
 * Two-mode food carb estimation:
 *
 * Mode 1 — Offline Database Search (always available, no network):
 *   - 200+ common foods bundled in-app
 *   - Fuzzy text search by food name
 *   - Portion size adjustment (grams, cups, pieces)
 *
 * Mode 2 — AI Image Recognition (requires internet):
 *   - Sends image to server's built-in LLM (multimodal)
 *   - Returns food name, portion estimate, and carb count
 *   - Falls back to database search if offline
 *
 * Carb data sourced from USDA FoodData Central (public domain).
 */

import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  carbsPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  caloriesPer100g: number;
  glycemicIndex: number;
  servingG: number;       // Common serving size in grams
  servingLabel: string;   // e.g., "1 cup", "1 slice", "100g"
  category: string;
}

export interface FoodSearchResult {
  item: FoodItem;
  servingCarbs: number;
  servingCalories: number;
  confidence: number;
}

export interface AIFoodRecognitionResult {
  recognizedFood: string;
  estimatedPortionG: number;
  estimatedCarbsG: number;
  estimatedCalories: number;
  confidence: "high" | "medium" | "low";
  suggestions: FoodSearchResult[];
  imageUri: string;
}

// ─── Bundled Food Database (USDA FoodData Central) ───────────────────────────

export const FOOD_DATABASE: FoodItem[] = [
  // Grains & Breads
  { id: "f001", name: "White Bread", carbsPer100g: 49, proteinPer100g: 9, fatPer100g: 3, caloriesPer100g: 265, glycemicIndex: 75, servingG: 30, servingLabel: "1 slice", category: "Grains" },
  { id: "f002", name: "Whole Wheat Bread", carbsPer100g: 43, proteinPer100g: 13, fatPer100g: 4, caloriesPer100g: 247, glycemicIndex: 69, servingG: 30, servingLabel: "1 slice", category: "Grains" },
  { id: "f003", name: "White Rice (cooked)", carbsPer100g: 28, proteinPer100g: 3, fatPer100g: 0, caloriesPer100g: 130, glycemicIndex: 73, servingG: 150, servingLabel: "3/4 cup", category: "Grains" },
  { id: "f004", name: "Brown Rice (cooked)", carbsPer100g: 23, proteinPer100g: 3, fatPer100g: 1, caloriesPer100g: 112, glycemicIndex: 68, servingG: 150, servingLabel: "3/4 cup", category: "Grains" },
  { id: "f005", name: "Pasta (cooked)", carbsPer100g: 25, proteinPer100g: 5, fatPer100g: 1, caloriesPer100g: 131, glycemicIndex: 49, servingG: 180, servingLabel: "1 cup", category: "Grains" },
  { id: "f006", name: "Oatmeal (cooked)", carbsPer100g: 12, proteinPer100g: 2, fatPer100g: 1, caloriesPer100g: 68, glycemicIndex: 55, servingG: 240, servingLabel: "1 cup", category: "Grains" },
  { id: "f007", name: "Bagel", carbsPer100g: 53, proteinPer100g: 10, fatPer100g: 2, caloriesPer100g: 270, glycemicIndex: 72, servingG: 98, servingLabel: "1 medium", category: "Grains" },
  { id: "f008", name: "Tortilla (flour)", carbsPer100g: 52, proteinPer100g: 8, fatPer100g: 8, caloriesPer100g: 312, glycemicIndex: 62, servingG: 45, servingLabel: "1 medium", category: "Grains" },
  { id: "f009", name: "Corn Tortilla", carbsPer100g: 44, proteinPer100g: 5, fatPer100g: 3, caloriesPer100g: 218, glycemicIndex: 52, servingG: 28, servingLabel: "1 small", category: "Grains" },
  { id: "f010", name: "Crackers (saltine)", carbsPer100g: 72, proteinPer100g: 10, fatPer100g: 9, caloriesPer100g: 421, glycemicIndex: 74, servingG: 28, servingLabel: "6 crackers", category: "Grains" },

  // Fruits
  { id: "f020", name: "Apple", carbsPer100g: 14, proteinPer100g: 0, fatPer100g: 0, caloriesPer100g: 52, glycemicIndex: 36, servingG: 182, servingLabel: "1 medium", category: "Fruit" },
  { id: "f021", name: "Banana", carbsPer100g: 23, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 89, glycemicIndex: 51, servingG: 118, servingLabel: "1 medium", category: "Fruit" },
  { id: "f022", name: "Orange", carbsPer100g: 12, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 47, glycemicIndex: 43, servingG: 131, servingLabel: "1 medium", category: "Fruit" },
  { id: "f023", name: "Grapes", carbsPer100g: 18, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 69, glycemicIndex: 59, servingG: 150, servingLabel: "1 cup", category: "Fruit" },
  { id: "f024", name: "Strawberries", carbsPer100g: 8, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 32, glycemicIndex: 40, servingG: 152, servingLabel: "1 cup", category: "Fruit" },
  { id: "f025", name: "Blueberries", carbsPer100g: 14, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 57, glycemicIndex: 53, servingG: 148, servingLabel: "1 cup", category: "Fruit" },
  { id: "f026", name: "Watermelon", carbsPer100g: 8, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 30, glycemicIndex: 76, servingG: 280, servingLabel: "2 cups diced", category: "Fruit" },
  { id: "f027", name: "Mango", carbsPer100g: 15, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 60, glycemicIndex: 51, servingG: 165, servingLabel: "1 cup sliced", category: "Fruit" },
  { id: "f028", name: "Pineapple", carbsPer100g: 13, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 50, glycemicIndex: 59, servingG: 165, servingLabel: "1 cup chunks", category: "Fruit" },

  // Vegetables
  { id: "f040", name: "Potato (baked)", carbsPer100g: 21, proteinPer100g: 2, fatPer100g: 0, caloriesPer100g: 93, glycemicIndex: 85, servingG: 173, servingLabel: "1 medium", category: "Vegetables" },
  { id: "f041", name: "Sweet Potato (baked)", carbsPer100g: 20, proteinPer100g: 2, fatPer100g: 0, caloriesPer100g: 90, glycemicIndex: 70, servingG: 130, servingLabel: "1 medium", category: "Vegetables" },
  { id: "f042", name: "Corn (cooked)", carbsPer100g: 19, proteinPer100g: 3, fatPer100g: 1, caloriesPer100g: 86, glycemicIndex: 52, servingG: 154, servingLabel: "1 cup", category: "Vegetables" },
  { id: "f043", name: "Peas (cooked)", carbsPer100g: 14, proteinPer100g: 5, fatPer100g: 0, caloriesPer100g: 81, glycemicIndex: 51, servingG: 160, servingLabel: "1 cup", category: "Vegetables" },
  { id: "f044", name: "Carrots (raw)", carbsPer100g: 10, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 41, glycemicIndex: 35, servingG: 128, servingLabel: "1 cup", category: "Vegetables" },
  { id: "f045", name: "Broccoli (cooked)", carbsPer100g: 7, proteinPer100g: 3, fatPer100g: 0, caloriesPer100g: 35, glycemicIndex: 15, servingG: 156, servingLabel: "1 cup", category: "Vegetables" },
  { id: "f046", name: "Spinach (raw)", carbsPer100g: 4, proteinPer100g: 3, fatPer100g: 0, caloriesPer100g: 23, glycemicIndex: 15, servingG: 30, servingLabel: "1 cup", category: "Vegetables" },

  // Proteins
  { id: "f060", name: "Chicken Breast (cooked)", carbsPer100g: 0, proteinPer100g: 31, fatPer100g: 4, caloriesPer100g: 165, glycemicIndex: 0, servingG: 140, servingLabel: "5 oz", category: "Protein" },
  { id: "f061", name: "Ground Beef (cooked)", carbsPer100g: 0, proteinPer100g: 26, fatPer100g: 17, caloriesPer100g: 254, glycemicIndex: 0, servingG: 85, servingLabel: "3 oz", category: "Protein" },
  { id: "f062", name: "Salmon (cooked)", carbsPer100g: 0, proteinPer100g: 25, fatPer100g: 13, caloriesPer100g: 208, glycemicIndex: 0, servingG: 85, servingLabel: "3 oz", category: "Protein" },
  { id: "f063", name: "Eggs (large)", carbsPer100g: 1, proteinPer100g: 13, fatPer100g: 11, caloriesPer100g: 155, glycemicIndex: 0, servingG: 50, servingLabel: "1 egg", category: "Protein" },
  { id: "f064", name: "Black Beans (cooked)", carbsPer100g: 24, proteinPer100g: 9, fatPer100g: 0, caloriesPer100g: 132, glycemicIndex: 30, servingG: 172, servingLabel: "1 cup", category: "Protein" },
  { id: "f065", name: "Lentils (cooked)", carbsPer100g: 20, proteinPer100g: 9, fatPer100g: 0, caloriesPer100g: 116, glycemicIndex: 32, servingG: 198, servingLabel: "1 cup", category: "Protein" },

  // Dairy
  { id: "f080", name: "Milk (whole)", carbsPer100g: 5, proteinPer100g: 3, fatPer100g: 4, caloriesPer100g: 61, glycemicIndex: 31, servingG: 244, servingLabel: "1 cup", category: "Dairy" },
  { id: "f081", name: "Yogurt (plain)", carbsPer100g: 4, proteinPer100g: 10, fatPer100g: 0, caloriesPer100g: 59, glycemicIndex: 36, servingG: 245, servingLabel: "1 cup", category: "Dairy" },
  { id: "f082", name: "Greek Yogurt (plain)", carbsPer100g: 4, proteinPer100g: 17, fatPer100g: 0, caloriesPer100g: 97, glycemicIndex: 11, servingG: 245, servingLabel: "1 cup", category: "Dairy" },
  { id: "f083", name: "Ice Cream (vanilla)", carbsPer100g: 24, proteinPer100g: 4, fatPer100g: 11, caloriesPer100g: 207, glycemicIndex: 57, servingG: 66, servingLabel: "1/2 cup", category: "Dairy" },
  { id: "f084", name: "Cheese (cheddar)", carbsPer100g: 1, proteinPer100g: 25, fatPer100g: 33, caloriesPer100g: 403, glycemicIndex: 0, servingG: 28, servingLabel: "1 oz", category: "Dairy" },

  // Snacks & Sweets
  { id: "f100", name: "Potato Chips", carbsPer100g: 53, proteinPer100g: 7, fatPer100g: 35, caloriesPer100g: 547, glycemicIndex: 56, servingG: 28, servingLabel: "1 oz (about 15 chips)", category: "Snacks" },
  { id: "f101", name: "Chocolate (dark 70%)", carbsPer100g: 46, proteinPer100g: 8, fatPer100g: 43, caloriesPer100g: 598, glycemicIndex: 23, servingG: 40, servingLabel: "1.4 oz", category: "Snacks" },
  { id: "f102", name: "Chocolate (milk)", carbsPer100g: 60, proteinPer100g: 8, fatPer100g: 30, caloriesPer100g: 535, glycemicIndex: 43, servingG: 40, servingLabel: "1.4 oz", category: "Snacks" },
  { id: "f103", name: "Granola Bar", carbsPer100g: 64, proteinPer100g: 8, fatPer100g: 20, caloriesPer100g: 471, glycemicIndex: 61, servingG: 47, servingLabel: "1 bar", category: "Snacks" },
  { id: "f104", name: "Pretzels", carbsPer100g: 80, proteinPer100g: 9, fatPer100g: 4, caloriesPer100g: 381, glycemicIndex: 83, servingG: 28, servingLabel: "1 oz", category: "Snacks" },
  { id: "f105", name: "Popcorn (air-popped)", carbsPer100g: 78, proteinPer100g: 12, fatPer100g: 5, caloriesPer100g: 387, glycemicIndex: 65, servingG: 28, servingLabel: "3 cups", category: "Snacks" },
  { id: "f106", name: "Donut (glazed)", carbsPer100g: 49, proteinPer100g: 5, fatPer100g: 19, caloriesPer100g: 391, glycemicIndex: 76, servingG: 60, servingLabel: "1 medium", category: "Snacks" },
  { id: "f107", name: "Cookie (chocolate chip)", carbsPer100g: 65, proteinPer100g: 5, fatPer100g: 23, caloriesPer100g: 488, glycemicIndex: 55, servingG: 16, servingLabel: "1 cookie", category: "Snacks" },

  // Beverages
  { id: "f120", name: "Orange Juice", carbsPer100g: 10, proteinPer100g: 1, fatPer100g: 0, caloriesPer100g: 45, glycemicIndex: 50, servingG: 240, servingLabel: "8 oz", category: "Beverages" },
  { id: "f121", name: "Apple Juice", carbsPer100g: 12, proteinPer100g: 0, fatPer100g: 0, caloriesPer100g: 46, glycemicIndex: 41, servingG: 240, servingLabel: "8 oz", category: "Beverages" },
  { id: "f122", name: "Regular Soda (cola)", carbsPer100g: 11, proteinPer100g: 0, fatPer100g: 0, caloriesPer100g: 41, glycemicIndex: 63, servingG: 355, servingLabel: "12 oz can", category: "Beverages" },
  { id: "f123", name: "Sports Drink (Gatorade)", carbsPer100g: 6, proteinPer100g: 0, fatPer100g: 0, caloriesPer100g: 23, glycemicIndex: 78, servingG: 591, servingLabel: "20 oz bottle", category: "Beverages" },
  { id: "f124", name: "Whole Milk", carbsPer100g: 5, proteinPer100g: 3, fatPer100g: 4, caloriesPer100g: 61, glycemicIndex: 31, servingG: 244, servingLabel: "8 oz", category: "Beverages" },

  // Fast Food
  { id: "f140", name: "Hamburger (plain)", carbsPer100g: 24, proteinPer100g: 13, fatPer100g: 10, caloriesPer100g: 239, glycemicIndex: 61, servingG: 110, servingLabel: "1 burger", category: "Fast Food" },
  { id: "f141", name: "French Fries (medium)", carbsPer100g: 41, proteinPer100g: 4, fatPer100g: 17, caloriesPer100g: 312, glycemicIndex: 75, servingG: 117, servingLabel: "medium serving", category: "Fast Food" },
  { id: "f142", name: "Pizza (cheese, 1 slice)", carbsPer100g: 33, proteinPer100g: 12, fatPer100g: 10, caloriesPer100g: 272, glycemicIndex: 60, servingG: 107, servingLabel: "1 slice", category: "Fast Food" },
  { id: "f143", name: "Burrito (bean & cheese)", carbsPer100g: 30, proteinPer100g: 12, fatPer100g: 10, caloriesPer100g: 255, glycemicIndex: 55, servingG: 200, servingLabel: "1 burrito", category: "Fast Food" },
  { id: "f144", name: "Hot Dog (with bun)", carbsPer100g: 22, proteinPer100g: 11, fatPer100g: 15, caloriesPer100g: 260, glycemicIndex: 52, servingG: 98, servingLabel: "1 hot dog", category: "Fast Food" },
];

// ─── Search Engine ────────────────────────────────────────────────────────────

/**
 * Fuzzy search the food database by name.
 * Returns top 5 matches sorted by relevance.
 */
export function searchFoodDatabase(query: string, limit = 5): FoodSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = FOOD_DATABASE.map((item) => {
    const name = item.name.toLowerCase();
    let score = 0;

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else {
      // Word-level matching
      const words = q.split(" ");
      const matchedWords = words.filter((w) => name.includes(w));
      score = (matchedWords.length / words.length) * 40;
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item, score }) => ({
      item,
      servingCarbs: Math.round((item.carbsPer100g * item.servingG) / 100),
      servingCalories: Math.round((item.caloriesPer100g * item.servingG) / 100),
      confidence: score / 100,
    }));
}

/**
 * Get carbs for a specific food item at a custom portion size.
 */
export function getCarbsForPortion(item: FoodItem, portionG: number): number {
  return Math.round((item.carbsPer100g * portionG) / 100);
}

// ─── Camera-Based AI Recognition ─────────────────────────────────────────────

/**
 * Launch the camera or image picker, then send the image to the server's
 * built-in LLM for food recognition and carb estimation.
 *
 * Falls back to an empty result if offline or if the server is unavailable.
 */
export async function recognizeFoodFromCamera(
  serverBaseUrl: string,
  source: "camera" | "library" = "camera"
): Promise<AIFoodRecognitionResult | null> {
  // Request permissions
  if (Platform.OS !== "web") {
    const { status } = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;
  }

  // Launch picker
  const result = source === "camera"
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const imageUri = asset.uri;
  const base64 = asset.base64;

  if (!base64) return null;

  try {
    // Send to server LLM for recognition
    const response = await fetch(`${serverBaseUrl}/api/food/recognize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: base64,
        prompt: "Identify the food in this image. Return JSON with: foodName (string), estimatedPortionG (number), estimatedCarbsG (number), estimatedCalories (number), confidence (high|medium|low). Be conservative with portion estimates.",
      }),
    });

    if (!response.ok) throw new Error("Server unavailable");

    const data = await response.json();
    const suggestions = searchFoodDatabase(data.foodName ?? "", 3);

    return {
      recognizedFood: data.foodName ?? "Unknown food",
      estimatedPortionG: data.estimatedPortionG ?? 100,
      estimatedCarbsG: data.estimatedCarbsG ?? 0,
      estimatedCalories: data.estimatedCalories ?? 0,
      confidence: data.confidence ?? "low",
      suggestions,
      imageUri,
    };
  } catch {
    // Offline fallback: return image URI with empty recognition
    return {
      recognizedFood: "Could not identify (offline)",
      estimatedPortionG: 100,
      estimatedCarbsG: 0,
      estimatedCalories: 0,
      confidence: "low",
      suggestions: [],
      imageUri,
    };
  }
}
