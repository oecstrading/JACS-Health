import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

interface Meal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  totalCarbs: number;
  foods: string[];
  timestamp: string;
  notes?: string;
}

export function RecentMealsWidget() {
  const router = useRouter();
  const colors = useColors();
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);

  useEffect(() => {
    loadRecentMeals();
  }, []);

  const loadRecentMeals = async () => {
    try {
      const data = await AsyncStorage.getItem("meals");
      if (data) {
        const meals: Meal[] = JSON.parse(data);
        setRecentMeals(meals.slice(0, 3));
      }
    } catch (error) {
      console.error("[RecentMealsWidget] Error loading meals:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "☀️";
      case "lunch":
        return "🌤️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  if (recentMeals.length === 0) {
    return null;
  }

  return (
    <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
          Recent Meals
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/diabetes-dashboard" as any);
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text className="text-sm font-medium" style={{ color: colors.primary, lineHeight: 20 }}>
            View All
          </Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {recentMeals.map((meal) => (
          <View
            key={meal.id}
            className="flex-row items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.success}30` }}
            >
              <Text style={{ fontSize: 20 }}>{getMealIcon(meal.mealType)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground" style={{ lineHeight: 22 }}>
                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} • {meal.totalCarbs}g carbs
              </Text>
              <Text className="text-sm text-muted" style={{ lineHeight: 20 }} numberOfLines={1}>
                {meal.foods.slice(0, 2).join(", ")}
                {meal.foods.length > 2 && ` +${meal.foods.length - 2} more`} • {getTimeAgo(meal.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
