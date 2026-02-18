import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface WellnessScore {
  total: number;
  medication: number;
  vitals: number;
  activity: number;
  nutrition: number;
  sleep: number;
}

interface ScoreHistory {
  date: Date;
  score: number;
}

export default function WellnessDashboardScreen() {
  const colors = useColors();
  const [currentScore, setCurrentScore] = useState<WellnessScore>({
    total: 82,
    medication: 90,
    vitals: 85,
    activity: 75,
    nutrition: 80,
    sleep: 80,
  });
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    loadScoreHistory();
  }, [timeRange]);

  function loadScoreHistory() {
    // Mock data - in production, calculate from actual health data
    const mockHistory: ScoreHistory[] = [];
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockHistory.push({
        date,
        score: 75 + Math.random() * 15,
      });
    }

    setScoreHistory(mockHistory);
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return colors.success;
    if (score >= 60) return "#F59E0B";
    return colors.error;
  }

  function getScoreLabel(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Attention";
  }

  const categories = [
    { key: "medication", label: "Medication", icon: "💊", description: "Taking meds on time" },
    { key: "vitals", label: "Vitals", icon: "❤️", description: "BP, heart rate in range" },
    { key: "activity", label: "Activity", icon: "🚶", description: "Steps and exercise" },
    { key: "nutrition", label: "Nutrition", icon: "🥗", description: "Healthy eating habits" },
    { key: "sleep", label: "Sleep", icon: "😴", description: "Quality rest" },
  ];

  const improvements = [
    {
      category: "Activity",
      tip: "Try to walk 500 more steps today to reach your goal",
      impact: "+3 points",
    },
    {
      category: "Nutrition",
      tip: "Drink 2 more glasses of water to stay hydrated",
      impact: "+2 points",
    },
    {
      category: "Sleep",
      tip: "Go to bed 30 minutes earlier for better rest",
      impact: "+4 points",
    },
  ];

  const screenWidth = Dimensions.get("window").width;

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
          <Text className="text-2xl font-bold text-foreground">Wellness Score</Text>
          <View className="w-12" />
        </View>

        {/* Current Score */}
        <View className="bg-surface p-8 rounded-2xl mb-6 items-center">
          <Text className="text-lg text-muted mb-2">Your Wellness Score</Text>
          <Text
            className="text-7xl font-bold mb-2"
            style={{ color: getScoreColor(currentScore.total) }}
          >
            {Math.round(currentScore.total)}
          </Text>
          <View
            className="px-4 py-2 rounded-full mb-3"
            style={{ backgroundColor: getScoreColor(currentScore.total) + "20" }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: getScoreColor(currentScore.total) }}
            >
              {getScoreLabel(currentScore.total)}
            </Text>
          </View>
          <Text className="text-sm text-muted text-center">
            Based on your medication, vitals, activity, nutrition, and sleep
          </Text>
        </View>

        {/* Score Breakdown */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Score Breakdown</Text>
          <View className="gap-4">
            {categories.map((cat) => {
              const score = currentScore[cat.key as keyof WellnessScore];
              return (
                <View key={cat.key}>
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">{cat.icon}</Text>
                      <View>
                        <Text className="text-base font-semibold text-foreground">
                          {cat.label}
                        </Text>
                        <Text className="text-sm text-muted">{cat.description}</Text>
                      </View>
                    </View>
                    <Text
                      className="text-xl font-bold"
                      style={{ color: getScoreColor(score) }}
                    >
                      {Math.round(score)}
                    </Text>
                  </View>
                  <View className="h-2 bg-background rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score),
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Score Trend */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">Score Trend</Text>
            <View className="flex-row gap-2">
              {(["week", "month", "year"] as const).map((range) => (
                <Pressable
                  key={range}
                  onPress={() => setTimeRange(range)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className={`px-3 py-1 rounded-full ${
                    timeRange === range
                      ? "bg-primary"
                      : "bg-background border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      timeRange === range ? "text-white" : "text-foreground"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {scoreHistory.length > 0 && (
            <LineChart
              data={{
                labels: scoreHistory
                  .filter((_, i) => i % Math.ceil(scoreHistory.length / 6) === 0)
                  .map((h) => h.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })),
                datasets: [
                  {
                    data: scoreHistory.map((h) => h.score),
                  },
                ],
              }}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.primary,
                labelColor: (opacity = 1) => colors.muted,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: colors.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}
        </View>

        {/* Improvement Tips */}
        <View className="bg-surface p-6 rounded-2xl mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            💡 Personalized Tips
          </Text>
          <View className="gap-3">
            {improvements.map((tip, index) => (
              <View key={index} className="bg-background p-4 rounded-xl">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {tip.category}
                  </Text>
                  <View className="bg-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-sm font-bold text-primary">{tip.impact}</Text>
                  </View>
                </View>
                <Text className="text-sm text-muted">{tip.tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
