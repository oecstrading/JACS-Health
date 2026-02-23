import { View, Text, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { TrendingUp, Activity, Pill, Utensils, Moon, Heart, ChevronRight } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function HealthScoreScreen() {
  const colors = useColors();

  // Health Score Components (out of 100)
  const scoreComponents = {
    glucose: { score: 22, max: 25, label: "Glucose Control" },
    medication: { score: 18, max: 20, label: "Medication Adherence" },
    exercise: { score: 14, max: 20, label: "Physical Activity" },
    sleep: { score: 11, max: 15, label: "Sleep Quality" },
    nutrition: { score: 16, max: 20, label: "Nutrition" },
  };

  const totalScore = Object.values(scoreComponents).reduce((sum, comp) => sum + comp.score, 0);
  const maxScore = Object.values(scoreComponents).reduce((sum, comp) => sum + comp.max, 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const scoreColor = getScoreColor(totalScore);
  const scoreLabel = getScoreLabel(totalScore);

  const recommendations = [
    {
      icon: Activity,
      title: "Increase Daily Steps",
      description: "Aim for 8,000 steps per day. You're averaging 5,200.",
      impact: "+3 points",
    },
    {
      icon: Moon,
      title: "Improve Sleep Schedule",
      description: "Try to get 7-8 hours of sleep consistently.",
      impact: "+2 points",
    },
    {
      icon: Utensils,
      title: "Reduce Carb Intake",
      description: "Lower carbs at dinner to improve morning glucose.",
      impact: "+2 points",
    },
  ];

  const scoreHistory = [
    { date: "Feb 23", score: 81 },
    { date: "Feb 16", score: 78 },
    { date: "Feb 9", score: 75 },
    { date: "Feb 2", score: 73 },
    { date: "Jan 26", score: 70 },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <TrendingUp size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Health Score</Text>
          </View>
          <Text className="text-base text-muted">Your comprehensive health rating</Text>
        </View>

        {/* Overall Score */}
        <View className="px-6 pb-6">
          <View style={{ backgroundColor: `${scoreColor}10`, borderColor: scoreColor }} className="border-2 rounded-2xl p-8 items-center">
            <Text className="text-sm font-semibold text-muted mb-2">YOUR HEALTH SCORE</Text>
            <Text style={{ color: scoreColor }} className="text-7xl font-bold mb-2">
              {totalScore}
            </Text>
            <Text style={{ color: scoreColor }} className="text-2xl font-bold mb-4">
              {scoreLabel}
            </Text>
            <View className="flex-row items-center gap-2">
              <TrendingUp size={20} color={colors.success} />
              <Text className="text-base text-success font-semibold">+8 from last week</Text>
            </View>
          </View>
        </View>

        {/* Score Breakdown */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Score Breakdown</Text>
          {Object.entries(scoreComponents).map(([key, comp]) => {
            const percentage = (comp.score / comp.max) * 100;
            const compColor = getScoreColor(percentage);

            return (
              <View key={key} className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground">{comp.label}</Text>
                  <Text style={{ color: compColor }} className="text-base font-bold">
                    {comp.score}/{comp.max}
                  </Text>
                </View>
                <View className="h-3 bg-surface rounded-full overflow-hidden">
                  <View
                    style={{ width: `${percentage}%`, backgroundColor: compColor }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Recommendations */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Personalized Recommendations</Text>
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <Pressable
                key={i}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-surface border border-border rounded-xl p-4 mb-3 flex-row items-start gap-3"
              >
                <View className="bg-primary/10 p-2 rounded-lg">
                  <Icon size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-semibold text-foreground flex-1">{rec.title}</Text>
                    <Text className="text-sm font-bold text-primary ml-2">{rec.impact}</Text>
                  </View>
                  <Text className="text-sm text-muted leading-relaxed">{rec.description}</Text>
                </View>
                <ChevronRight size={20} color={colors.muted} />
              </Pressable>
            );
          })}
        </View>

        {/* Score History */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Score History</Text>
          <View className="bg-surface border border-border rounded-xl p-4">
            {scoreHistory.map((entry, i) => (
              <View key={i} className={`flex-row items-center justify-between ${i < scoreHistory.length - 1 ? 'mb-3 pb-3 border-b border-border' : ''}`}>
                <Text className="text-sm text-muted">{entry.date}</Text>
                <Text style={{ color: getScoreColor(entry.score) }} className="text-base font-bold">
                  {entry.score}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Score Components Detail */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">How It's Calculated</Text>
          <View className="bg-surface border border-border rounded-xl p-4 gap-2">
            <Text className="text-sm text-foreground">• <Text className="font-semibold">Glucose Control (25 pts)</Text> - Time in range, A1C estimate</Text>
            <Text className="text-sm text-foreground">• <Text className="font-semibold">Medication Adherence (20 pts)</Text> - Doses taken on time</Text>
            <Text className="text-sm text-foreground">• <Text className="font-semibold">Physical Activity (20 pts)</Text> - Steps, exercise minutes</Text>
            <Text className="text-sm text-foreground">• <Text className="font-semibold">Sleep Quality (15 pts)</Text> - Duration and consistency</Text>
            <Text className="text-sm text-foreground">• <Text className="font-semibold">Nutrition (20 pts)</Text> - Calorie goals, macro balance</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
