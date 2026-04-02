import { ScrollView, Text, View, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Svg, { Circle, Text as SvgText, G } from "react-native-svg";

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

        {/* Time in Range — ADA Ring Chart */}
        <TIRRingChart timeInRange={timeInRange} />

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

// ─── TIR Ring Chart Component ─────────────────────────────────────────────────
// ADA 2024 Time-in-Range targets:
//   Very Low  (<54):   <1%
//   Low       (54-69): <4%
//   In Range  (70-180): >70%
//   High      (181-250): <25%
//   Very High (>250):  <5%

interface TIRData {
  veryLow: number;
  low: number;
  inRange: number;
  high: number;
  veryHigh: number;
}

const TIR_ZONES = [
  { key: "veryLow" as const,  label: "Very Low",  range: "<54",     color: "#DC2626", adaTarget: "<1%"  },
  { key: "low" as const,      label: "Low",        range: "54–69",   color: "#F97316", adaTarget: "<4%"  },
  { key: "inRange" as const,  label: "In Range",   range: "70–180",  color: "#22C55E", adaTarget: ">70%" },
  { key: "high" as const,     label: "High",       range: "181–250", color: "#F59E0B", adaTarget: "<25%" },
  { key: "veryHigh" as const, label: "Very High",  range: ">250",    color: "#EF4444", adaTarget: "<5%"  },
];

function TIRRingChart({ timeInRange }: { timeInRange: TIRData }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  // Build cumulative arc offsets
  const total = Object.values(timeInRange).reduce((s, v) => s + v, 0) || 100;
  let cumulative = 0;
  const arcs = TIR_ZONES.map((z) => {
    const pct = (timeInRange[z.key] / total) * 100;
    const dashArray = (pct / 100) * circumference;
    const dashOffset = circumference - cumulative * circumference / 100;
    cumulative += pct;
    return { ...z, pct, dashArray, dashOffset };
  });

  const inRangePct = timeInRange.inRange.toFixed(1);
  const adaMet = timeInRange.inRange >= 70;

  return (
    <View style={tirStyles.card}>
      <View style={tirStyles.headerRow}>
        <Text style={tirStyles.title}>⏱ Time in Range (24h)</Text>
        <View style={[tirStyles.adaBadge, { backgroundColor: adaMet ? "#22C55E20" : "#F59E0B20", borderColor: adaMet ? "#22C55E" : "#F59E0B" }]}>
          <Text style={[tirStyles.adaBadgeText, { color: adaMet ? "#22C55E" : "#F59E0B" }]}>
            {adaMet ? "✓ ADA Goal Met" : "ADA Goal: >70%"}
          </Text>
        </View>
      </View>

      <View style={tirStyles.chartRow}>
        {/* Ring */}
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            {/* Background ring */}
            <Circle
              cx={cx} cy={cy} r={radius}
              stroke="#1E3A5F" strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Colored arcs */}
            {arcs.map((arc) => (
              arc.pct > 0 ? (
                <Circle
                  key={arc.key}
                  cx={cx} cy={cy} r={radius}
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${arc.dashArray} ${circumference - arc.dashArray}`}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="butt"
                  rotation={-90}
                  origin={`${cx}, ${cy}`}
                />
              ) : null
            ))}
            {/* Center label */}
            <G>
              <SvgText
                x={cx} y={cy - 8}
                textAnchor="middle"
                fontSize="32"
                fontWeight="800"
                fill={adaMet ? "#22C55E" : "#F59E0B"}
              >
                {inRangePct}%
              </SvgText>
              <SvgText
                x={cx} y={cy + 14}
                textAnchor="middle"
                fontSize="11"
                fill="#9BA1A6"
              >
                In Range
              </SvgText>
            </G>
          </Svg>
        </View>

        {/* Legend */}
        <View style={tirStyles.legend}>
          {TIR_ZONES.map((z) => {
            const pct = timeInRange[z.key].toFixed(1);
            return (
              <View key={z.key} style={tirStyles.legendRow}>
                <View style={[tirStyles.legendDot, { backgroundColor: z.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={tirStyles.legendLabel}>{z.label}</Text>
                  <Text style={tirStyles.legendRange}>{z.range} mg/dL</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[tirStyles.legendPct, { color: z.color }]}>{pct}%</Text>
                  <Text style={tirStyles.legendTarget}>ADA {z.adaTarget}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* GMI / Estimated A1c */}
      <View style={tirStyles.gmiRow}>
        <Text style={tirStyles.gmiLabel}>Glucose Management Indicator (GMI)</Text>
        <Text style={[tirStyles.gmiValue, { color: adaMet ? "#22C55E" : "#F59E0B" }]}>
          {timeInRange.inRange >= 70
            ? `~${(3.31 + 0.02392 * (100 - timeInRange.inRange + 70)).toFixed(1)}%`
            : "Insufficient data"}
        </Text>
      </View>
      <Text style={tirStyles.adaNote}>
        Source: ADA 2024 Standards of Care — Sec. 6 (Glycemic Targets)
      </Text>
    </View>
  );
}

const tirStyles = StyleSheet.create({
  card: {
    backgroundColor: "#0C1B33",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#ECEDEE" },
  adaBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adaBadgeText: { fontSize: 11, fontWeight: "700" },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legend: { flex: 1, gap: 6 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontWeight: "600", color: "#ECEDEE" },
  legendRange: { fontSize: 10, color: "#9BA1A6" },
  legendPct: { fontSize: 13, fontWeight: "800" },
  legendTarget: { fontSize: 9, color: "#9BA1A6" },
  gmiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E3A5F",
  },
  gmiLabel: { fontSize: 12, color: "#9BA1A6", flex: 1 },
  gmiValue: { fontSize: 16, fontWeight: "800" },
  adaNote: { fontSize: 9, color: "#687076", marginTop: 6, textAlign: "right" },
});
