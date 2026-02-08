import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  startStabilityMonitoring,
  stopStabilityMonitoring,
  getStabilityScore,
  getGaitTrend,
  getMonitoringStatus,
} from "@/lib/stability-monitor";

export default function StabilityMonitorScreen() {
  const colors = useColors();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(getStabilityScore());
  const [gaitTrend, setGaitTrend] = useState(getGaitTrend(7));

  useEffect(() => {
    const status = getMonitoringStatus();
    setIsMonitoring(status.isMonitoring);

    // Update data every 10 seconds when monitoring
    const interval = setInterval(() => {
      if (isMonitoring) {
        setStabilityScore(getStabilityScore());
        setGaitTrend(getGaitTrend(7));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  async function toggleMonitoring(value: boolean) {
    if (value) {
      await startStabilityMonitoring();
    } else {
      stopStabilityMonitoring();
    }
    setIsMonitoring(value);
  }

  function getScoreColor(score: number): string {
    if (score >= 75) return colors.success;
    if (score >= 50) return "#F59E0B";
    return colors.error;
  }

  function getRiskBadgeColor(risk: string): string {
    if (risk === "low") return colors.success;
    if (risk === "moderate") return "#F59E0B";
    return colors.error;
  }

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
          <Text className="text-2xl font-bold text-foreground">Stability Monitor</Text>
          <View className="w-12" />
        </View>

        {/* Monitoring Toggle */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-foreground mb-2">
                Background Monitoring
              </Text>
              <Text className="text-sm text-muted">
                Continuously analyze your walking patterns to detect stability changes
              </Text>
            </View>
            <Switch
              value={isMonitoring}
              onValueChange={toggleMonitoring}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isMonitoring ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Stability Score */}
        <View className="bg-surface p-8 rounded-2xl mb-6 items-center">
          <Text className="text-lg text-muted mb-2">Your Stability Score</Text>
          <Text
            className="text-7xl font-bold mb-3"
            style={{ color: getScoreColor(stabilityScore.score) }}
          >
            {Math.round(stabilityScore.score)}
          </Text>
          <View
            className="px-4 py-2 rounded-full mb-3"
            style={{
              backgroundColor: getRiskBadgeColor(stabilityScore.riskLevel) + "20",
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: getRiskBadgeColor(stabilityScore.riskLevel) }}
            >
              {stabilityScore.riskLevel.toUpperCase()} RISK
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base text-muted">Trend:</Text>
            <Text
              className="text-base font-semibold"
              style={{
                color:
                  stabilityScore.trend === "improving"
                    ? colors.success
                    : stabilityScore.trend === "declining"
                    ? colors.error
                    : colors.muted,
              }}
            >
              {stabilityScore.trend === "improving" && "↗️ Improving"}
              {stabilityScore.trend === "stable" && "→ Stable"}
              {stabilityScore.trend === "declining" && "↘️ Declining"}
            </Text>
          </View>
        </View>

        {/* Indicators */}
        {stabilityScore.indicators.length > 0 && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              🔍 Detected Indicators
            </Text>
            <View className="gap-3">
              {stabilityScore.indicators.map((indicator, idx) => (
                <View key={idx} className="flex-row gap-3">
                  <Text className="text-primary text-lg">•</Text>
                  <Text className="text-base text-foreground flex-1">{indicator}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gait Trend Chart */}
        {gaitTrend.dates.length > 0 && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              📊 Step Length Trend (7 Days)
            </Text>
            <LineChart
              data={{
                labels: gaitTrend.dates.map((d) =>
                  d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                ),
                datasets: [
                  {
                    data: gaitTrend.stepLengths.map((l) => l * 100), // Convert to cm
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
              yAxisSuffix=" cm"
            />
            <Text className="text-sm text-muted text-center mt-2">
              Normal step length: 60-80 cm
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {stabilityScore.riskLevel !== "low" && (
          <View className="bg-warning/20 border-2 border-warning p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-3">
              💡 Recommendations
            </Text>
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-warning text-lg">•</Text>
                <Text className="text-base text-foreground flex-1">
                  Schedule a balance assessment with your healthcare provider
                </Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-warning text-lg">•</Text>
                <Text className="text-base text-foreground flex-1">
                  Consider using assistive devices (cane, walker) when walking
                </Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-warning text-lg">•</Text>
                <Text className="text-base text-foreground flex-1">
                  Practice balance exercises from the Exercise Library
                </Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-warning text-lg">•</Text>
                <Text className="text-base text-foreground flex-1">
                  Remove fall hazards at home (loose rugs, clutter)
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/exercise")}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-warning px-6 py-3 rounded-xl items-center mt-4"
            >
              <Text className="text-white font-bold">View Balance Exercises</Text>
            </Pressable>
          </View>
        )}

        {/* How It Works */}
        <View className="bg-surface p-6 rounded-2xl mb-8">
          <Text className="text-xl font-bold text-foreground mb-3">
            ℹ️ How It Works
          </Text>
          <Text className="text-base text-muted leading-relaxed">
            The Stability Monitor uses your device's accelerometer (or connected
            wearable) to analyze your walking patterns over a 7-day window. It detects
            subtle changes like shuffling gait, reduced step length, and increased
            variability - all early indicators of fall risk. If concerning patterns are
            detected, you and your caregivers receive proactive alerts.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
