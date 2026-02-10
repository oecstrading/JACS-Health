import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CGMService, { type CGMReading } from "@/services/cgmService";

/**
 * Diabetes Dashboard
 * 
 * Comprehensive diabetes management dashboard with:
 * - Real-time glucose monitoring with trend arrows
 * - 24-hour glucose trend chart
 * - Time-in-range metrics
 * - Insulin-on-board (IOB) display
 * - Daily insulin totals (basal + bolus)
 * - Omnipod status (reservoir level, pod expiration)
 */
export default function DiabetesDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [latestReading, setLatestReading] = useState<CGMReading | null>(null);
  const [glucoseData, setGlucoseData] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [timeInRange, setTimeInRange] = useState({ veryLow: 0, low: 0, inRange: 0, high: 0, veryHigh: 0 });
  const [omnipodStatus, setOmnipodStatus] = useState<any>(null);
  const [dailyInsulin, setDailyInsulin] = useState({ basal: 0, bolus: 0, total: 0 });

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = CGMService.subscribe((reading) => {
      setLatestReading(reading);
      loadData();
    });
    
    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get latest glucose reading
      const latest = CGMService.getLatestReading();
      setLatestReading(latest);
      
      // Get 24-hour glucose data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
      
      const readings = CGMService.getReadingsByDateRange(startDate, endDate);
      
      // Prepare chart data (sample every 15 minutes for readability)
      const sampledReadings = readings.filter((_, index) => index % 3 === 0);
      setGlucoseData(sampledReadings.map((r) => r.glucose));
      setTimeLabels(
        sampledReadings.map((r) => {
          const hours = r.timestamp.getHours();
          const minutes = r.timestamp.getMinutes();
          return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        })
      );
      
      // Calculate time in range
      const tir = CGMService.calculateTimeInRange(startDate, endDate);
      setTimeInRange(tir);
      
      // Get Omnipod status
      const status = CGMService.getOmnipodStatus();
      setOmnipodStatus(status);
      
      // Get daily insulin totals
      const totals = CGMService.getDailyInsulinTotals(new Date());
      setDailyInsulin(totals);
    } catch (error) {
      console.error("Error loading diabetes data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendArrow = (trend: CGMReading["trend"]): string => {
    const arrows = {
      rising_fast: "↑↑",
      rising: "↗",
      stable: "→",
      falling: "↘",
      falling_fast: "↓↓",
    };
    return arrows[trend] || "→";
  };

  const getGlucoseColor = (glucose: number): string => {
    if (glucose < 54) return colors.error; // Very low
    if (glucose < 70) return colors.warning; // Low
    if (glucose <= 180) return colors.success; // In range
    if (glucose <= 250) return colors.warning; // High
    return colors.error; // Very high
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-lg text-muted mt-4">Loading diabetes data...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground flex-1 ml-4" style={{ lineHeight: 32 }}>
          Diabetes Dashboard
        </Text>
        <Pressable
          onPress={handleSync}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="arrow.clockwise" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Current Glucose Reading */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border items-center">
          <Text className="text-lg text-muted mb-2" style={{ lineHeight: 26 }}>
            Current Glucose
          </Text>
          {latestReading ? (
            <>
              <View className="flex-row items-center gap-3">
                <Text
                  className="text-6xl font-bold"
                  style={{ color: getGlucoseColor(latestReading.glucose), lineHeight: 72 }}
                >
                  {latestReading.glucose}
                </Text>
                <View>
                  <Text className="text-4xl font-bold" style={{ color: getGlucoseColor(latestReading.glucose) }}>
                    {getTrendArrow(latestReading.trend)}
                  </Text>
                  <Text className="text-sm text-muted mt-1">mg/dL</Text>
                </View>
              </View>
              <Text className="text-sm text-muted mt-2">
                {latestReading.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </>
          ) : (
            <Text className="text-lg text-muted">No recent reading</Text>
          )}
        </View>

        {/* 24-Hour Glucose Trend */}
        {glucoseData.length > 0 && (
          <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
            <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
              24-Hour Glucose Trend
            </Text>
            <LineChart
              data={{
                labels: timeLabels.filter((_, i) => i % 4 === 0), // Show every 4th label
                datasets: [
                  {
                    data: glucoseData,
                    color: (opacity = 1) => colors.primary,
                    strokeWidth: 3,
                  },
                  {
                    data: [180], // High threshold
                    color: () => colors.warning,
                    strokeWidth: 1,
                    withDots: false,
                  },
                  {
                    data: [70], // Low threshold
                    color: () => colors.error,
                    strokeWidth: 1,
                    withDots: false,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 80}
              height={220}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.foreground,
                labelColor: (opacity = 1) => colors.muted,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "2",
                  strokeWidth: "1",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.error }} />
                <Text className="text-sm text-muted">Low (70)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.success }} />
                <Text className="text-sm text-muted">Target (70-180)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.warning }} />
                <Text className="text-sm text-muted">High (180)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Time in Range */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Time in Range (24h)
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Very Low (&lt;54)</Text>
              <Text className="text-base font-semibold" style={{ color: colors.error }}>
                {timeInRange.veryLow.toFixed(1)}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Low (54-69)</Text>
              <Text className="text-base font-semibold" style={{ color: colors.warning }}>
                {timeInRange.low.toFixed(1)}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground font-semibold">In Range (70-180)</Text>
              <Text className="text-base font-bold" style={{ color: colors.success }}>
                {timeInRange.inRange.toFixed(1)}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">High (181-250)</Text>
              <Text className="text-base font-semibold" style={{ color: colors.warning }}>
                {timeInRange.high.toFixed(1)}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Very High (&gt;250)</Text>
              <Text className="text-base font-semibold" style={{ color: colors.error }}>
                {timeInRange.veryHigh.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Omnipod Status */}
        {omnipodStatus && (
          <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
            <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
              Omnipod Status
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Insulin on Board</Text>
                <Text className="text-base font-semibold text-foreground">
                  {omnipodStatus.insulinOnBoard.toFixed(2)} U
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Reservoir Level</Text>
                <Text className="text-base font-semibold text-foreground">
                  {omnipodStatus.reservoirLevel.toFixed(1)} U
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Basal Rate</Text>
                <Text className="text-base font-semibold text-foreground">
                  {omnipodStatus.basalRate.toFixed(2)} U/hr
                </Text>
              </View>
              {omnipodStatus.podExpiration && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-foreground">Pod Expires</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {omnipodStatus.podExpiration.toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Daily Insulin Totals */}
        <View className="bg-surface rounded-3xl p-6 mb-8 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Today's Insulin
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Basal</Text>
              <Text className="text-base font-semibold text-foreground">{dailyInsulin.basal} U</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Bolus</Text>
              <Text className="text-base font-semibold text-foreground">{dailyInsulin.bolus} U</Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Total</Text>
              <Text className="text-lg font-bold text-foreground">{dailyInsulin.total} U</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
