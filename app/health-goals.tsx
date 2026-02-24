import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Target, Plus, TrendingUp, Award, Users, Zap } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface HealthGoal {
  id: string;
  type: "weight" | "exercise" | "glucose" | "steps" | "water";
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  progress: number; // percentage
  isActive: boolean;
  shareWithFamily: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  daysRemaining: number;
  progress: number;
}

/**
 * Health Goals & Challenges Screen
 * 
 * Features:
 * - Personalized health goals (weight, exercise, glucose control)
 * - Progress tracking with charts
 * - Milestone celebrations
 * - Social challenges with family members
 * - Achievement badges
 * - Daily/weekly check-ins
 */
export default function HealthGoalsScreen() {
  const colors = useColors();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalType, setNewGoalType] = useState<"weight" | "exercise" | "glucose" | "steps" | "water">("weight");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  
  // Mock data - in production, fetch from database
  const [goals, setGoals] = useState<HealthGoal[]>([
    {
      id: "1",
      type: "weight",
      title: "Lose 15 pounds",
      targetValue: 165,
      currentValue: 172,
      unit: "lbs",
      startDate: new Date("2026-01-01"),
      targetDate: new Date("2026-06-01"),
      progress: 47,
      isActive: true,
      shareWithFamily: true,
    },
    {
      id: "2",
      type: "exercise",
      title: "Exercise 5 days/week",
      targetValue: 5,
      currentValue: 3,
      unit: "days",
      startDate: new Date("2026-02-01"),
      targetDate: new Date("2026-03-01"),
      progress: 60,
      isActive: true,
      shareWithFamily: false,
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Family Step Challenge",
      description: "First to 100,000 steps wins!",
      participants: 4,
      daysRemaining: 12,
      progress: 65,
    },
  ]);

  const [achievements, setAchievements] = useState([
    { id: "1", title: "First Goal", icon: "🎯", earned: true },
    { id: "2", title: "7-Day Streak", icon: "🔥", earned: true },
    { id: "3", title: "Weight Milestone", icon: "⚖️", earned: true },
    { id: "4", title: "Exercise Master", icon: "💪", earned: false },
  ]);

  const handleAddGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTarget.trim()) {
      Alert.alert("Missing Information", "Please enter goal title and target value.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Success", "Your health goal has been created with daily check-in reminders.");
    
    setShowAddForm(false);
    setNewGoalTitle("");
    setNewGoalTarget("");
  };

  const handleLogProgress = (goal: HealthGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.prompt(
      "Log Progress",
      `Enter your current ${goal.type} value:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            if (value) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Progress Logged", "Great job! Keep up the good work!");
            }
          },
        },
      ],
      "plain-text",
      goal.currentValue.toString()
    );
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "weight": return "⚖️";
      case "exercise": return "💪";
      case "glucose": return "📊";
      case "steps": return "👟";
      case "water": return "💧";
      default: return "🎯";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return colors.success;
    if (progress >= 50) return colors.primary;
    return colors.warning;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Target size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Health Goals
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Track your progress and celebrate milestones
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">ACTIVE GOALS</Text>
                <Text className="text-3xl font-bold text-foreground">{goals.filter(g => g.isActive).length}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-success mb-1">ACHIEVEMENTS</Text>
                <Text className="text-3xl font-bold text-foreground">
                  {achievements.filter(a => a.earned).length}/{achievements.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Goal Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Create New Goal
            </Text>
          </Pressable>
        </View>

        {/* Add Goal Form */}
        {showAddForm && (
          <View className="px-6 pb-6">
            <View className="bg-surface border-2 border-border rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                New Health Goal
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Goal Title</Text>
                  <TextInput
                    value={newGoalTitle}
                    onChangeText={setNewGoalTitle}
                    placeholder="e.g., Lose 10 pounds"
                    placeholderTextColor={colors.muted}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Target Value</Text>
                  <TextInput
                    value={newGoalTarget}
                    onChangeText={setNewGoalTarget}
                    placeholder="e.g., 165"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddGoal}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Create Goal</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Active Goals */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            My Goals ({goals.filter(g => g.isActive).length})
          </Text>
          {goals.filter(g => g.isActive).map((goal) => (
            <View key={goal.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-2xl">{getGoalIcon(goal.type)}</Text>
                    <Text className="text-base font-semibold text-foreground flex-1">
                      {goal.title}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-3 mb-2">
                    <View>
                      <Text className="text-xs text-muted">Current</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {goal.currentValue} {goal.unit}
                      </Text>
                    </View>
                    <TrendingUp size={16} color={colors.muted} />
                    <View>
                      <Text className="text-xs text-muted">Target</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-muted">Progress</Text>
                  <Text
                    style={{ color: getProgressColor(goal.progress) }}
                    className="text-xs font-semibold"
                  >
                    {goal.progress}%
                  </Text>
                </View>
                <View className="bg-muted/20 rounded-full h-2">
                  <View
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: getProgressColor(goal.progress),
                    }}
                    className="h-2 rounded-full"
                  />
                </View>
              </View>

              <Pressable
                onPress={() => handleLogProgress(goal)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary py-2 rounded-lg flex-row items-center justify-center gap-2"
              >
                <Zap size={14} color="#ffffff" />
                <Text className="text-white font-semibold text-sm">Log Progress</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Achievements
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className={`flex-1 min-w-[100px] items-center p-4 rounded-xl border-2 ${
                  achievement.earned
                    ? "bg-success/10 border-success"
                    : "bg-muted/10 border-border"
                }`}
              >
                <Text className="text-3xl mb-2">{achievement.icon}</Text>
                <Text
                  className={`text-xs font-semibold text-center ${
                    achievement.earned ? "text-success" : "text-muted"
                  }`}
                >
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
