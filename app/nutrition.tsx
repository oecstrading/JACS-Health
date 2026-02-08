import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: Date;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number; // in oz
}

export default function NutritionScreen() {
  const colors = useColors();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [water, setWater] = useState(0);

  const dailyGoals = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fats: 70,
    water: 64, // oz
  };

  useEffect(() => {
    loadTodaysMeals();
  }, []);

  async function loadTodaysMeals() {
    // Mock data - in production, load from AsyncStorage
    const mockMeals: Meal[] = [
      {
        id: "1",
        type: "breakfast",
        name: "Oatmeal with berries",
        calories: 350,
        protein: 10,
        carbs: 55,
        fats: 8,
        time: new Date(2026, 1, 8, 8, 0),
      },
      {
        id: "2",
        type: "lunch",
        name: "Grilled chicken salad",
        calories: 450,
        protein: 35,
        carbs: 30,
        fats: 15,
        time: new Date(2026, 1, 8, 12, 30),
      },
    ];

    setMeals(mockMeals);
    setWater(32); // Mock water intake
  }

  function getDailyTotals(): DailyNutrition {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
        water: water,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 }
    );
  }

  function addMeal() {
    const cal = parseInt(calories);
    if (!mealName || !cal || cal <= 0) {
      Alert.alert("Invalid Input", "Please enter meal name and calories");
      return;
    }

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      name: mealName,
      calories: cal,
      protein: Math.round(cal * 0.15 / 4), // Estimate
      carbs: Math.round(cal * 0.50 / 4), // Estimate
      fats: Math.round(cal * 0.35 / 9), // Estimate
      time: new Date(),
    };

    setMeals([...meals, newMeal]);
    setMealName("");
    setCalories("");
    setShowAddForm(false);
  }

  function addWater(amount: number) {
    setWater(water + amount);
  }

  const totals = getDailyTotals();
  const calorieProgress = (totals.calories / dailyGoals.calories) * 100;
  const waterProgress = (totals.water / dailyGoals.water) * 100;

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Nutrition</Text>
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-3xl">{showAddForm ? "×" : "+"}</Text>
          </Pressable>
        </View>

        {/* Add Meal Form */}
        {showAddForm && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Log Meal</Text>
            
            {/* Meal Type Selector */}
            <View className="flex-row gap-2 mb-4">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setMealType(type)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    mealType === type ? "bg-primary" : "bg-background border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      mealType === type ? "text-white" : "text-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Meal Name</Text>
              <TextInput
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g., Grilled chicken salad"
                placeholderTextColor={colors.muted}
                className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Calories</Text>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                placeholder="450"
                placeholderTextColor={colors.muted}
                className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
              />
            </View>

            <Pressable
              onPress={addMeal}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">Save Meal</Text>
            </Pressable>
          </View>
        )}

        {/* Daily Summary */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Today's Summary</Text>
          
          {/* Calories */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-muted">Calories</Text>
              <Text className="text-base font-semibold text-foreground">
                {totals.calories} / {dailyGoals.calories}
              </Text>
            </View>
            <View className="h-3 bg-background rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </View>
          </View>

          {/* Macros */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Protein</Text>
              <Text className="text-lg font-bold text-foreground">{totals.protein}g</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Carbs</Text>
              <Text className="text-lg font-bold text-foreground">{totals.carbs}g</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Fats</Text>
              <Text className="text-lg font-bold text-foreground">{totals.fats}g</Text>
            </View>
          </View>

          {/* Water */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-muted">Water</Text>
              <Text className="text-base font-semibold text-foreground">
                {totals.water} / {dailyGoals.water} oz
              </Text>
            </View>
            <View className="h-3 bg-background rounded-full overflow-hidden mb-3">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(waterProgress, 100)}%` }}
              />
            </View>
            <View className="flex-row gap-2">
              {[8, 16, 32].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => addWater(amount)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="flex-1 bg-primary py-2 rounded-lg items-center"
                >
                  <Text className="text-white text-sm font-semibold">+{amount} oz</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Meals List */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Today's Meals</Text>
          {meals.length === 0 ? (
            <Text className="text-base text-muted text-center py-4">
              No meals logged yet. Tap + to add a meal.
            </Text>
          ) : (
            <View className="gap-3">
              {meals.map((meal) => (
                <View key={meal.id} className="bg-background p-4 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm text-primary capitalize mb-1">
                        {meal.type}
                      </Text>
                      <Text className="text-lg font-semibold text-foreground">
                        {meal.name}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground">
                      {meal.calories}
                    </Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="text-sm text-muted">P: {meal.protein}g</Text>
                    <Text className="text-sm text-muted">C: {meal.carbs}g</Text>
                    <Text className="text-sm text-muted">F: {meal.fats}g</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Dietary Recommendations */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            💡 Recommendations
          </Text>
          <View className="gap-3">
            <View className="flex-row items-start">
              <Text className="text-success text-lg mr-2">✓</Text>
              <Text className="text-base text-foreground flex-1">
                Avoid grapefruit - interacts with your statin medication
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-success text-lg mr-2">✓</Text>
              <Text className="text-base text-foreground flex-1">
                Limit sodium to 1,500mg/day for blood pressure control
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-success text-lg mr-2">✓</Text>
              <Text className="text-base text-foreground flex-1">
                Increase fiber intake to 25-30g/day for digestive health
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-success text-lg mr-2">✓</Text>
              <Text className="text-base text-foreground flex-1">
                Eat small, frequent meals to maintain stable blood sugar
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
