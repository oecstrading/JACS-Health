import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { Target, TrendingUp } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TIRData {
  veryHigh: number; // >250 mg/dL
  high: number; // 181-250 mg/dL
  inRange: number; // 70-180 mg/dL
  low: number; // 54-69 mg/dL
  veryLow: number; // <54 mg/dL
}

/**
 * Time in Range (TIR) Chart
 * 
 * Displays a horizontal stacked bar chart showing glucose distribution:
 * - Very High (>250): Dark Red
 * - High (181-250): Orange
 * - In Range (70-180): Green
 * - Low (54-69): Amber
 * - Very Low (<54): Red
 * 
 * ADA Target: 70%+ in range
 */
export function TimeInRangeChart() {
  const colors = useColors();
  const [tirData, setTIRData] = useState<TIRData>({
    veryHigh: 5,
    high: 15,
    inRange: 68,
    low: 10,
    veryLow: 2,
  });

  useEffect(() => {
    loadTIRData();
  }, []);

  const loadTIRData = async () => {
    try {
      // Load CGM readings
      const cgmData = await AsyncStorage.getItem("virtual_cgm_data");
      if (cgmData) {
        const parsed = JSON.parse(cgmData);
        if (parsed.readings && parsed.readings.length > 0) {
          calculateTIR(parsed.readings);
        }
      }
    } catch (error) {
      console.error("Error loading TIR data:", error);
    }
  };

  const calculateTIR = (readings: Array<{ timestamp: number; value: number }>) => {
    // Use last 14 days of readings
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentReadings = readings.filter((r) => r.timestamp >= fourteenDaysAgo);

    if (recentReadings.length === 0) return;

    let veryHighCount = 0;
    let highCount = 0;
    let inRangeCount = 0;
    let lowCount = 0;
    let veryLowCount = 0;

    recentReadings.forEach((reading) => {
      const value = reading.value;
      if (value > 250) veryHighCount++;
      else if (value > 180) highCount++;
      else if (value >= 70) inRangeCount++;
      else if (value >= 54) lowCount++;
      else veryLowCount++;
    });

    const total = recentReadings.length;
    const newTIRData: TIRData = {
      veryHigh: Math.round((veryHighCount / total) * 100),
      high: Math.round((highCount / total) * 100),
      inRange: Math.round((inRangeCount / total) * 100),
      low: Math.round((lowCount / total) * 100),
      veryLow: Math.round((veryLowCount / total) * 100),
    };

    setTIRData(newTIRData);
    
    // Save for Today's Snapshot
    AsyncStorage.setItem(
      "time_in_range_data",
      JSON.stringify({ inRangePercent: newTIRData.inRange })
    );
  };

  const isAboveTarget = tirData.inRange >= 70;

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Target size={24} color={colors.primary} />
          <Text className="text-lg font-semibold text-foreground">
            Time in Range
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            isAboveTarget ? "bg-success/20" : "bg-warning/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isAboveTarget ? "text-success" : "text-warning"
            }`}
          >
            {isAboveTarget ? "✓ Target Met" : "Below Target"}
          </Text>
        </View>
      </View>

      {/* Main TIR Percentage */}
      <View className="mb-4">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-4xl font-bold text-success">
            {tirData.inRange}%
          </Text>
          <Text className="text-lg text-muted">in range</Text>
        </View>
        <Text className="text-sm text-muted mt-1">
          Last 14 days • ADA target: 70%+
        </Text>
      </View>

      {/* Stacked Bar Chart */}
      <View className="mb-4">
        <View className="h-12 flex-row rounded-xl overflow-hidden">
          {/* Very Low - Red */}
          {tirData.veryLow > 0 && (
            <View
              style={{ width: `${tirData.veryLow}%`, backgroundColor: "#DC2626" }}
              className="items-center justify-center"
            >
              {tirData.veryLow >= 5 && (
                <Text className="text-white text-xs font-semibold">
                  {tirData.veryLow}%
                </Text>
              )}
            </View>
          )}

          {/* Low - Amber */}
          {tirData.low > 0 && (
            <View
              style={{ width: `${tirData.low}%`, backgroundColor: "#F59E0B" }}
              className="items-center justify-center"
            >
              {tirData.low >= 5 && (
                <Text className="text-white text-xs font-semibold">
                  {tirData.low}%
                </Text>
              )}
            </View>
          )}

          {/* In Range - Green */}
          {tirData.inRange > 0 && (
            <View
              style={{ width: `${tirData.inRange}%`, backgroundColor: "#22C55E" }}
              className="items-center justify-center"
            >
              <Text className="text-white text-sm font-bold">
                {tirData.inRange}%
              </Text>
            </View>
          )}

          {/* High - Orange */}
          {tirData.high > 0 && (
            <View
              style={{ width: `${tirData.high}%`, backgroundColor: "#FB923C" }}
              className="items-center justify-center"
            >
              {tirData.high >= 5 && (
                <Text className="text-white text-xs font-semibold">
                  {tirData.high}%
                </Text>
              )}
            </View>
          )}

          {/* Very High - Dark Red */}
          {tirData.veryHigh > 0 && (
            <View
              style={{ width: `${tirData.veryHigh}%`, backgroundColor: "#991B1B" }}
              className="items-center justify-center"
            >
              {tirData.veryHigh >= 5 && (
                <Text className="text-white text-xs font-semibold">
                  {tirData.veryHigh}%
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Legend */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#991B1B]" />
            <Text className="text-xs text-foreground">Very High (&gt;250)</Text>
          </View>
          <Text className="text-xs font-semibold text-foreground">
            {tirData.veryHigh}%
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#FB923C]" />
            <Text className="text-xs text-foreground">High (181-250)</Text>
          </View>
          <Text className="text-xs font-semibold text-foreground">
            {tirData.high}%
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <Text className="text-xs text-foreground font-semibold">
              In Range (70-180)
            </Text>
          </View>
          <Text className="text-xs font-bold text-success">
            {tirData.inRange}%
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <Text className="text-xs text-foreground">Low (54-69)</Text>
          </View>
          <Text className="text-xs font-semibold text-foreground">
            {tirData.low}%
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#DC2626]" />
            <Text className="text-xs text-foreground">Very Low (&lt;54)</Text>
          </View>
          <Text className="text-xs font-semibold text-foreground">
            {tirData.veryLow}%
          </Text>
        </View>
      </View>

      {/* Insight */}
      {!isAboveTarget && (
        <View className="mt-4 bg-warning/10 border border-warning/30 rounded-lg p-3">
          <View className="flex-row items-start gap-2">
            <TrendingUp size={16} color={colors.warning} />
            <Text className="flex-1 text-xs text-foreground leading-relaxed">
              You're at {tirData.inRange}% time in range. Aim for 70%+ by working with your care team on medication adjustments and lifestyle changes.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
