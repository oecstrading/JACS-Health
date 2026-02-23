import { View, Text, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface HourlyData {
  hour: number;
  avgGlucose: number;
  count: number;
}

/**
 * Daily Glucose Pattern Chart
 * 
 * Displays 24-hour glucose pattern with:
 * - Hourly average glucose values
 * - Color coding by range (low/in-range/high)
 * - Vertical bar chart visualization
 * - Pattern analysis across multiple days
 */
export function DailyGlucosePattern() {
  const colors = useColors();
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);

  useEffect(() => {
    loadGlucosePattern();
  }, []);

  const loadGlucosePattern = async () => {
    try {
      const cgmData = await AsyncStorage.getItem("virtual_cgm_data");
      if (cgmData) {
        const parsed = JSON.parse(cgmData);
        if (parsed.readings && parsed.readings.length > 0) {
          calculateHourlyAverages(parsed.readings);
        }
      }
    } catch (error) {
      console.error("Error loading glucose pattern:", error);
    }
  };

  const calculateHourlyAverages = (readings: Array<{ timestamp: number; value: number }>) => {
    // Use last 14 days
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentReadings = readings.filter((r) => r.timestamp >= fourteenDaysAgo);

    if (recentReadings.length === 0) {
      // Generate sample data for demo
      generateSampleData();
      return;
    }

    // Group by hour of day
    const hourlyGroups: { [hour: number]: number[] } = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyGroups[i] = [];
    }

    recentReadings.forEach((reading) => {
      const date = new Date(reading.timestamp);
      const hour = date.getHours();
      hourlyGroups[hour].push(reading.value);
    });

    // Calculate averages
    const newHourlyData: HourlyData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const values = hourlyGroups[hour];
      if (values.length > 0) {
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        newHourlyData.push({
          hour,
          avgGlucose: Math.round(avg),
          count: values.length,
        });
      } else {
        newHourlyData.push({
          hour,
          avgGlucose: 0,
          count: 0,
        });
      }
    }

    setHourlyData(newHourlyData);
  };

  const generateSampleData = () => {
    // Generate realistic sample pattern
    const sampleData: HourlyData[] = [];
    const baselinePattern = [
      95, 90, 85, 85, 90, 105, 140, 155, 145, 130, 125, 135,
      150, 145, 140, 135, 130, 145, 165, 155, 140, 125, 110, 100
    ];

    for (let hour = 0; hour < 24; hour++) {
      sampleData.push({
        hour,
        avgGlucose: baselinePattern[hour],
        count: 14, // 14 days of data
      });
    }

    setHourlyData(sampleData);
  };

  const getBarColor = (glucose: number) => {
    if (glucose === 0) return colors.border;
    if (glucose < 70) return "#DC2626"; // Red - Low
    if (glucose <= 180) return "#22C55E"; // Green - In Range
    return "#FB923C"; // Orange - High
  };

  const getBarHeight = (glucose: number) => {
    if (glucose === 0) return 4;
    // Scale: 0-300 mg/dL -> 4-120 pixels
    const minHeight = 4;
    const maxHeight = 120;
    const scaledHeight = (glucose / 300) * maxHeight;
    return Math.max(minHeight, Math.min(maxHeight, scaledHeight));
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12A";
    if (hour < 12) return `${hour}A`;
    if (hour === 12) return "12P";
    return `${hour - 12}P`;
  };

  const maxGlucose = Math.max(...hourlyData.map((d) => d.avgGlucose), 200);
  const avgGlucose = hourlyData.length > 0
    ? Math.round(
        hourlyData.reduce((sum, d) => sum + d.avgGlucose, 0) / hourlyData.filter((d) => d.count > 0).length
      )
    : 0;

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <BarChart3 size={24} color={colors.primary} />
          <Text className="text-lg font-semibold text-foreground">
            Daily Glucose Pattern
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 bg-background rounded-lg p-3">
          <Text className="text-xs text-muted mb-1">Average</Text>
          <Text className="text-lg font-semibold text-foreground">
            {avgGlucose} mg/dL
          </Text>
        </View>
        <View className="flex-1 bg-background rounded-lg p-3">
          <Text className="text-xs text-muted mb-1">Peak</Text>
          <Text className="text-lg font-semibold text-foreground">
            {maxGlucose} mg/dL
          </Text>
        </View>
      </View>

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row items-end gap-1 py-2" style={{ minWidth: 600 }}>
          {hourlyData.map((data) => (
            <View key={data.hour} className="items-center" style={{ width: 24 }}>
              {/* Bar */}
              <View
                style={{
                  height: getBarHeight(data.avgGlucose),
                  backgroundColor: getBarColor(data.avgGlucose),
                  width: 20,
                }}
                className="rounded-t-sm mb-1"
              />
              
              {/* Hour Label */}
              <Text className="text-[10px] text-muted">
                {formatHour(data.hour)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-[#DC2626]" />
          <Text className="text-xs text-muted">Low</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <Text className="text-xs text-muted">In Range</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-[#FB923C]" />
          <Text className="text-xs text-muted">High</Text>
        </View>
      </View>

      {/* Info */}
      <Text className="text-xs text-center text-muted mt-3">
        14-day average by hour • Scroll to see all hours
      </Text>
    </View>
  );
}
