import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AIMealPlannerService, {
  type MealPlan,
  type DietaryProfile,
  type GroceryItem,
} from "@/services/aiMealPlannerService";

export default function AIMealPlannerScreen() {
  const colors = useColors();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"meals" | "grocery">("meals");

  useEffect(() => {
    loadCurrentMealPlan();
  }, []);

  const loadCurrentMealPlan = async () => {
    try {
      const plan = await AIMealPlannerService.getCurrentMealPlan();
      setMealPlan(plan);
    } catch (error) {
      console.error("Error loading meal plan:", error);
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      // Example dietary profile (in real app, this would come from user settings)
      const profile: DietaryProfile = {
        allergies: [],
        restrictions: [],
        preferences: [],
        dislikes: [],
        glucoseTarget: { min: 80, max: 140 },
        calorieTarget: 2000,
        carbLimit: 45,
      };

      const newPlan = await AIMealPlannerService.generateMealPlan(profile);
      setMealPlan(newPlan);
      Alert.alert("Success", "New meal plan generated!");
    } catch (error) {
      Alert.alert("Error", "Failed to generate meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareGroceryList = async () => {
    if (!mealPlan) return;

    const text = AIMealPlannerService.exportGroceryList(mealPlan.groceryList);
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error("Error sharing grocery list:", error);
    }
  };

  const handleToggleItem = async (itemName: string) => {
    if (!mealPlan) return;

    await AIMealPlannerService.toggleGroceryItem(mealPlan.id, itemName);
    await loadCurrentMealPlan();
  };

  const renderGroceryCategory = (title: string, items: GroceryItem[]) => {
    if (items.length === 0) return null;

    return (
      <View className="mb-4">
        <Text className="text-lg font-bold text-foreground mb-2">{title}</Text>
        <View className="gap-2">
          {items.map((item, index) => (
            <TouchableOpacity
              key={`${item.name}-${index}`}
              onPress={() => handleToggleItem(item.name)}
              className="flex-row items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View
                className="w-6 h-6 rounded items-center justify-center"
                style={{
                  backgroundColor: item.checked ? colors.primary : colors.border,
                }}
              >
                {item.checked && <Text className="text-white font-bold">✓</Text>}
              </View>
              <Text
                className={`flex-1 text-base ${
                  item.checked ? "line-through text-muted" : "text-foreground"
                }`}
              >
                {item.amount} {item.unit} {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">AI Meal Planner</Text>
            <Text className="text-base text-muted mt-1">
              Personalized weekly meal plans & grocery lists
            </Text>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGeneratePlan}
            disabled={isLoading}
            className="rounded-full p-4 items-center"
            style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }}
          >
            <Text className="text-lg font-semibold text-white">
              {isLoading ? "Generating..." : mealPlan ? "Generate New Plan" : "Generate Meal Plan"}
            </Text>
          </TouchableOpacity>

          {mealPlan && (
            <>
              {/* Tabs */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setActiveTab("meals")}
                  className="flex-1 p-3 rounded-xl items-center"
                  style={{
                    backgroundColor: activeTab === "meals" ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: activeTab === "meals" ? "#fff" : colors.foreground }}
                  >
                    Meals
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("grocery")}
                  className="flex-1 p-3 rounded-xl items-center"
                  style={{
                    backgroundColor: activeTab === "grocery" ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: activeTab === "grocery" ? "#fff" : colors.foreground }}
                  >
                    Grocery List
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Meals Tab */}
              {activeTab === "meals" && (
                <View className="gap-4">
                  {mealPlan.days.map((day, index) => (
                    <View
                      key={index}
                      className="rounded-2xl p-5"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-xl font-bold text-foreground mb-3">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>

                      <View className="gap-3">
                        {/* Breakfast */}
                        <View>
                          <Text className="text-sm font-semibold text-muted mb-1">
                            Breakfast
                          </Text>
                          <Text className="text-base text-foreground">
                            {day.breakfast.name}
                          </Text>
                          <Text className="text-sm text-muted">
                            {day.breakfast.calories} cal • {day.breakfast.carbs}g carbs •{" "}
                            {day.breakfast.prepTime + day.breakfast.cookTime} min
                          </Text>
                        </View>

                        {/* Lunch */}
                        <View>
                          <Text className="text-sm font-semibold text-muted mb-1">Lunch</Text>
                          <Text className="text-base text-foreground">{day.lunch.name}</Text>
                          <Text className="text-sm text-muted">
                            {day.lunch.calories} cal • {day.lunch.carbs}g carbs •{" "}
                            {day.lunch.prepTime + day.lunch.cookTime} min
                          </Text>
                        </View>

                        {/* Dinner */}
                        <View>
                          <Text className="text-sm font-semibold text-muted mb-1">Dinner</Text>
                          <Text className="text-base text-foreground">{day.dinner.name}</Text>
                          <Text className="text-sm text-muted">
                            {day.dinner.calories} cal • {day.dinner.carbs}g carbs •{" "}
                            {day.dinner.prepTime + day.dinner.cookTime} min
                          </Text>
                        </View>

                        {/* Snacks */}
                        {day.snacks.length > 0 && (
                          <View>
                            <Text className="text-sm font-semibold text-muted mb-1">
                              Snacks
                            </Text>
                            {day.snacks.map((snack, i) => (
                              <View key={i}>
                                <Text className="text-base text-foreground">{snack.name}</Text>
                                <Text className="text-sm text-muted">
                                  {snack.calories} cal • {snack.carbs}g carbs
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}

                  {/* Weekly Summary */}
                  <View
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-xl font-bold text-foreground mb-3">
                      Weekly Summary
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Total Calories</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {mealPlan.totalCalories.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Total Carbs</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {mealPlan.totalCarbs}g
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Avg Calories/Day</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {Math.round(mealPlan.totalCalories / 7)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Grocery List Tab */}
              {activeTab === "grocery" && (
                <View className="gap-4">
                  <TouchableOpacity
                    onPress={handleShareGroceryList}
                    className="rounded-full p-4 items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-lg font-semibold text-white">
                      Share Grocery List
                    </Text>
                  </TouchableOpacity>

                  {renderGroceryCategory("🥬 Produce", mealPlan.groceryList.produce)}
                  {renderGroceryCategory("🥛 Dairy", mealPlan.groceryList.dairy)}
                  {renderGroceryCategory("🥩 Meat & Seafood", mealPlan.groceryList.meat)}
                  {renderGroceryCategory("🌾 Grains & Bread", mealPlan.groceryList.grains)}
                  {renderGroceryCategory("🥫 Pantry", mealPlan.groceryList.pantry)}
                  {renderGroceryCategory("📦 Other", mealPlan.groceryList.other)}
                </View>
              )}
            </>
          )}

          {!mealPlan && !isLoading && (
            <View
              className="rounded-2xl p-8 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-6xl mb-4">🍽️</Text>
              <Text className="text-xl font-bold text-foreground text-center mb-2">
                No Meal Plan Yet
              </Text>
              <Text className="text-base text-muted text-center">
                Generate a personalized weekly meal plan tailored to your dietary needs and
                glucose targets
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
