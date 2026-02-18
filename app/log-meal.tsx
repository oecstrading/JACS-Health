import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Log Meal Screen
 * 
 * Quick meal logging from main dashboard.
 * Supports meal type, carb counting, and food items.
 */

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface Meal {
  id: string;
  mealType: MealType;
  totalCarbs: number;
  foods: string[];
  timestamp: Date;
  notes?: string;
}

const COMMON_FOODS = [
  { name: "Bread (1 slice)", carbs: 15 },
  { name: "Rice (1/2 cup)", carbs: 22 },
  { name: "Pasta (1 cup)", carbs: 43 },
  { name: "Apple (medium)", carbs: 25 },
  { name: "Banana (medium)", carbs: 27 },
  { name: "Orange (medium)", carbs: 15 },
  { name: "Milk (1 cup)", carbs: 12 },
  { name: "Yogurt (6 oz)", carbs: 17 },
  { name: "Potato (medium)", carbs: 37 },
  { name: "Oatmeal (1 cup)", carbs: 27 },
];

export default function LogMealScreen() {
  const router = useRouter();
  const colors = useColors();

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [carbs, setCarbs] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCustomFood = () => {
    if (customFood.trim()) {
      setSelectedFoods([...selectedFoods, customFood.trim()]);
      setCustomFood("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    // Validate carbs
    const carbsNum = parseFloat(carbs);
    if (isNaN(carbsNum) || carbsNum < 0) {
      Alert.alert("Invalid Carbs", "Please enter a valid carbohydrate amount.");
      return;
    }

    if (carbsNum > 300) {
      Alert.alert("Carbs Too High", "Carbohydrate amount seems unusually high. Please verify.");
      return;
    }

    if (selectedFoods.length === 0) {
      Alert.alert("No Foods", "Please add at least one food item to your meal.");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create new meal entry
      const newMeal: Meal = {
        id: Date.now().toString(),
        mealType,
        totalCarbs: carbsNum,
        foods: selectedFoods,
        timestamp: new Date(),
        notes: notes.trim() || undefined,
      };

      // Load existing meals
      const existingData = await AsyncStorage.getItem("meals");
      const existingMeals: Meal[] = existingData ? JSON.parse(existingData) : [];

      // Add new meal
      existingMeals.unshift(newMeal);

      // Keep only last 100 meals
      const trimmedMeals = existingMeals.slice(0, 100);

      // Save to AsyncStorage
      await AsyncStorage.setItem("meals", JSON.stringify(trimmedMeals));

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Meal Logged",
        `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${carbsNum}g carbs logged successfully.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("[LogMeal] Error saving meal:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save meal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-border">
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 8,
          })}
        >
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
          Log Meal
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Meal Type Selection */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Meal Type
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            { value: "breakfast", label: "Breakfast", icon: "☀️" },
            { value: "lunch", label: "Lunch", icon: "🌤️" },
            { value: "dinner", label: "Dinner", icon: "🌙" },
            { value: "snack", label: "Snack", icon: "🍎" },
          ].map((type) => (
            <Pressable
              key={type.value}
              onPress={() => {
                setMealType(type.value as MealType);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: "45%",
                padding: 14,
                borderRadius: 12,
                backgroundColor: mealType === type.value ? colors.primary : colors.surface,
                borderWidth: 2,
                borderColor: mealType === type.value ? colors.primary : colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-center text-lg mb-1">{type.icon}</Text>
              <Text
                className="text-center font-semibold"
                style={{
                  color: mealType === type.value ? "#ffffff" : colors.foreground,
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Carbs Input */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Total Carbs (grams)
        </Text>
        <View className="flex-row items-center gap-3 mb-3">
          <TextInput
            className="flex-1 bg-surface border-2 border-border rounded-xl px-4 py-4 text-foreground text-lg"
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="decimal-pad"
            returnKeyType="done"
            style={{ fontSize: 18, lineHeight: 26 }}
          />
          <Text className="text-lg text-muted" style={{ lineHeight: 26 }}>
            grams
          </Text>
        </View>

        {/* Quick Carb Buttons */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[15, 30, 45, 60, 75, 90].map((quickCarbs) => (
            <Pressable
              key={quickCarbs}
              onPress={() => {
                setCarbs(quickCarbs.toString());
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-base font-medium text-foreground" style={{ lineHeight: 22 }}>
                {quickCarbs}g
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Common Foods */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Add Foods
        </Text>
        <View className="gap-2 mb-4">
          {COMMON_FOODS.map((food) => (
            <Pressable
              key={food.name}
              onPress={() => {
                setSelectedFoods([...selectedFoods, food.name]);
                // Auto-add carbs if empty
                if (!carbs) {
                  setCarbs(food.carbs.toString());
                } else {
                  const currentCarbs = parseFloat(carbs) || 0;
                  setCarbs((currentCarbs + food.carbs).toString());
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => ({
                padding: 12,
                borderRadius: 10,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              })}
            >
              <Text className="text-base text-foreground flex-1" style={{ lineHeight: 22 }}>
                {food.name}
              </Text>
              <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                {food.carbs}g
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom Food Input */}
        <View className="flex-row gap-3 mb-6">
          <TextInput
            className="flex-1 bg-surface border-2 border-border rounded-xl px-4 py-3 text-foreground"
            placeholder="Add custom food..."
            placeholderTextColor={colors.muted}
            value={customFood}
            onChangeText={setCustomFood}
            returnKeyType="done"
            onSubmitEditing={handleAddCustomFood}
            style={{ fontSize: 16, lineHeight: 24 }}
          />
          <Pressable
            onPress={handleAddCustomFood}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-white font-semibold" style={{ fontSize: 16, lineHeight: 24 }}>
              Add
            </Text>
          </Pressable>
        </View>

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <>
            <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
              Selected Foods ({selectedFoods.length})
            </Text>
            <View className="gap-2 mb-6">
              {selectedFoods.map((food, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 border border-border"
                >
                  <Text className="text-base text-foreground flex-1" style={{ lineHeight: 22 }}>
                    {food}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveFood(index)}
                    style={({ pressed }) => ({
                      padding: 4,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <IconSymbol name="trash" size={20} color={colors.error} />
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Notes Input */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Notes (Optional)
        </Text>
        <TextInput
          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-foreground text-base mb-8"
          placeholder="e.g., Ate at restaurant, larger portion than usual"
          placeholderTextColor={colors.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ fontSize: 16, lineHeight: 24, minHeight: 80 }}
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.success,
            padding: 18,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 32,
            opacity: pressed || isSaving ? 0.7 : 1,
          })}
        >
          <Text className="text-white text-lg font-bold" style={{ lineHeight: 26 }}>
            {isSaving ? "Saving..." : "Save Meal"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
