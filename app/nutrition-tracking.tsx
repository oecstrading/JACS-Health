import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Utensils, Camera, Barcode, Plus, TrendingUp } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function NutritionTrackingScreen() {
  const colors = useColors();
  
  const totals = { calories: 1130, protein: 60, carbs: 127, fat: 34 };
  const dailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Utensils size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Nutrition Tracking</Text>
          </View>
          <Text className="text-base text-muted">Log meals and track your daily nutrition</Text>
        </View>

        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
            <Text className="text-sm font-semibold text-primary mb-4">TODAY'S NUTRITION</Text>
            <View className="gap-3">
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-muted">Calories</Text>
                  <Text className="text-sm font-semibold text-success">
                    {totals.calories} / {dailyGoals.calories}
                  </Text>
                </View>
                <View className="bg-muted/20 rounded-full h-2">
                  <View style={{ width: "56%", backgroundColor: colors.success }} className="h-2 rounded-full" />
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Protein</Text>
                  <Text className="text-base font-semibold text-foreground">{totals.protein}g</Text>
                  <Text className="text-xs text-muted">of {dailyGoals.protein}g</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Carbs</Text>
                  <Text className="text-base font-semibold text-foreground">{totals.carbs}g</Text>
                  <Text className="text-xs text-muted">of {dailyGoals.carbs}g</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Fat</Text>
                  <Text className="text-base font-semibold text-foreground">{totals.fat}g</Text>
                  <Text className="text-xs text-muted">of {dailyGoals.fat}g</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Camera size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-sm">Photo</Text>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Barcode size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-sm">Scan</Text>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Plus size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-sm">Manual</Text>
            </Pressable>
          </View>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Today's Meals</Text>
          {[
            { type: "Breakfast", icon: "🍳", calories: 450, protein: 25, carbs: 55, fat: 12 },
            { type: "Lunch", icon: "🥗", calories: 680, protein: 35, carbs: 72, fat: 22 },
          ].map((meal, i) => (
            <View key={i} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">{meal.icon}</Text>
                <Text className="text-base font-semibold text-foreground">{meal.type}</Text>
              </View>
              <View className="flex-row gap-4">
                <View>
                  <Text className="text-xs text-muted">Calories</Text>
                  <Text className="text-sm font-semibold text-foreground">{meal.calories}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted">Protein</Text>
                  <Text className="text-sm font-semibold text-foreground">{meal.protein}g</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted">Carbs</Text>
                  <Text className="text-sm font-semibold text-foreground">{meal.carbs}g</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted">Fat</Text>
                  <Text className="text-sm font-semibold text-foreground">{meal.fat}g</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">Weekly Average</Text>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-muted mb-1">Calories/day</Text>
                <Text className="text-lg font-semibold text-foreground">1,850</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">Protein/day</Text>
                <Text className="text-lg font-semibold text-foreground">125g</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">Meals logged</Text>
                <Text className="text-lg font-semibold text-foreground">18</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
