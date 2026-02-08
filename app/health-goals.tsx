import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal } from "react-native";
import { router } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface HealthGoal {
  id: string;
  type: "steps" | "weight" | "blood_pressure" | "medication_adherence";
  title: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
  color: string;
}

export default function HealthGoalsScreen() {
  const colors = useColors();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedGoal, setCompletedGoal] = useState<HealthGoal | null>(null);

  // Celebration animation values
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    // Mock data - in production, load from AsyncStorage
    const mockGoals: HealthGoal[] = [
      {
        id: "goal1",
        type: "steps",
        title: "Daily Steps",
        target: 10000,
        current: 7245,
        unit: "steps",
        icon: "🚶",
        color: colors.primary,
      },
      {
        id: "goal2",
        type: "weight",
        title: "Weight Goal",
        target: 180,
        current: 195,
        unit: "lbs",
        icon: "⚖️",
        color: "#F59E0B",
      },
      {
        id: "goal3",
        type: "blood_pressure",
        title: "Blood Pressure",
        target: 120,
        current: 128,
        unit: "mmHg",
        icon: "❤️",
        color: "#EF4444",
      },
      {
        id: "goal4",
        type: "medication_adherence",
        title: "Medication Adherence",
        target: 100,
        current: 95,
        unit: "%",
        icon: "💊",
        color: colors.success,
      },
    ];

    setGoals(mockGoals);
  }

  function getProgress(goal: HealthGoal): number {
    if (goal.type === "weight" || goal.type === "blood_pressure") {
      // For these, lower is better
      const diff = goal.current - goal.target;
      if (diff <= 0) return 100;
      const maxDiff = goal.target * 0.2; // 20% tolerance
      return Math.max(0, 100 - (diff / maxDiff) * 100);
    } else {
      // For steps and adherence, higher is better
      return Math.min(100, (goal.current / goal.target) * 100);
    }
  }

  function isGoalAchieved(goal: HealthGoal): boolean {
    return getProgress(goal) >= 100;
  }

  function triggerCelebration(goal: HealthGoal) {
    setCompletedGoal(goal);
    setShowCelebration(true);
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate celebration
    celebrationScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    celebrationOpacity.value = withTiming(1, { duration: 300 });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      celebrationOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        setShowCelebration(false);
        celebrationScale.value = 0;
      }, 300);
    }, 3000);
  }

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
  }));

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
          <Text className="text-2xl font-bold text-foreground">Health Goals</Text>
          <Pressable
            onPress={() => Alert.alert("Add Goal", "Add new goal feature coming soon!")}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-3xl">+</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-2">Your Progress</Text>
          <Text className="text-base text-muted">
            {goals.filter(isGoalAchieved).length} of {goals.length} goals achieved
          </Text>
        </View>

        {/* Goals List */}
        {goals.map(goal => {
          const progress = getProgress(goal);
          const achieved = isGoalAchieved(goal);

          return (
            <View key={goal.id} className="bg-surface p-6 rounded-2xl mb-4">
              {/* Goal Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <Text className="text-4xl mr-3">{goal.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{goal.title}</Text>
                    <Text className="text-sm text-muted">
                      Target: {goal.target} {goal.unit}
                    </Text>
                  </View>
                </View>
                {achieved && <Text className="text-3xl">✅</Text>}
              </View>

              {/* Progress Bar */}
              <View className="mb-3">
                <View className="h-3 bg-border rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: achieved ? colors.success : goal.color,
                    }}
                  />
                </View>
              </View>

              {/* Current vs Target */}
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-muted">
                  Current: {goal.current} {goal.unit}
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  {progress.toFixed(0)}%
                </Text>
              </View>

              {/* Action Button */}
              {achieved ? (
                <Pressable
                  onPress={() => triggerCelebration(goal)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    marginTop: 12,
                  })}
                  className="bg-success py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-base font-bold">🎉 Celebrate!</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => Alert.alert("Update Progress", "Progress update feature coming soon!")}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    marginTop: 12,
                  })}
                  className="border border-border py-3 rounded-xl items-center"
                >
                  <Text className="text-foreground text-base font-bold">Update Progress</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Celebration Modal */}
      {showCelebration && completedGoal && (
        <Modal transparent visible={showCelebration} animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View
              style={[
                {
                  backgroundColor: colors.surface,
                  padding: 32,
                  borderRadius: 24,
                  alignItems: "center",
                  maxWidth: 320,
                },
                celebrationStyle,
              ]}
            >
              <Text style={{ fontSize: 80, marginBottom: 16 }}>🎉</Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: colors.foreground,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Goal Achieved!
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  color: colors.muted,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {completedGoal.title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                You reached {completedGoal.target} {completedGoal.unit}!
              </Text>
              <Pressable
                onPress={() => {
                  celebrationOpacity.value = withTiming(0, { duration: 300 });
                  setTimeout(() => {
                    setShowCelebration(false);
                    celebrationScale.value = 0;
                  }, 300);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  marginTop: 24,
                })}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
                  Awesome!
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}
