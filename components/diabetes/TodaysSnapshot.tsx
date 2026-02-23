import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { Droplet, Target, Activity, Syringe, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SnapshotMetric {
  label: string;
  value: string;
  unit: string;
  subtitle: string;
  icon: any;
  trend: "up" | "down" | "stable";
  trendValue: string;
  colorClass: string;
}

/**
 * Today's Snapshot Dashboard
 * 
 * Displays 4 key diabetes metrics:
 * 1. Current Glucose (mg/dL)
 * 2. Time in Range (%)
 * 3. Estimated A1C (%)
 * 4. Insulin on Board (U)
 */
export function TodaysSnapshot() {
  const colors = useColors();
  const [metrics, setMetrics] = useState<SnapshotMetric[]>([
    {
      label: "Current Glucose",
      value: "142",
      unit: "mg/dL",
      subtitle: "5 min ago via CGM",
      icon: Droplet,
      trend: "up",
      trendValue: "↑ 8",
      colorClass: "text-blue-500",
    },
    {
      label: "Time in Range",
      value: "68",
      unit: "%",
      subtitle: "Last 24 hours",
      icon: Target,
      trend: "up",
      trendValue: "▲ 3%",
      colorClass: "text-emerald-500",
    },
    {
      label: "Est. A1C",
      value: "6.8",
      unit: "%",
      subtitle: "Based on 90-day avg",
      icon: Activity,
      trend: "down",
      trendValue: "↓",
      colorClass: "text-rose-500",
    },
    {
      label: "IOB",
      value: "2.4",
      unit: "U",
      subtitle: "Active insulin on board",
      icon: Syringe,
      trend: "down",
      trendValue: "↓",
      colorClass: "text-purple-500",
    },
  ]);

  useEffect(() => {
    loadSnapshotData();
  }, []);

  const loadSnapshotData = async () => {
    try {
      // Load latest glucose reading
      const glucoseData = await AsyncStorage.getItem("virtual_cgm_data");
      if (glucoseData) {
        const parsed = JSON.parse(glucoseData);
        if (parsed.latestGlucose) {
          setMetrics((prev) =>
            prev.map((m) =>
              m.label === "Current Glucose"
                ? { ...m, value: parsed.latestGlucose.toString() }
                : m
            )
          );
        }
      }

      // Load TIR data
      const tirData = await AsyncStorage.getItem("time_in_range_data");
      if (tirData) {
        const parsed = JSON.parse(tirData);
        if (parsed.inRangePercent) {
          setMetrics((prev) =>
            prev.map((m) =>
              m.label === "Time in Range"
                ? { ...m, value: parsed.inRangePercent.toString() }
                : m
            )
          );
        }
      }

      // Load IOB data
      const iobData = await AsyncStorage.getItem("insulin_on_board");
      if (iobData) {
        const parsed = JSON.parse(iobData);
        if (parsed.currentIOB !== undefined) {
          setMetrics((prev) =>
            prev.map((m) =>
              m.label === "IOB"
                ? { ...m, value: parsed.currentIOB.toFixed(1) }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Error loading snapshot data:", error);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  return (
    <View className="gap-3">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const TrendIcon = getTrendIcon(metric.trend);
        
        return (
          <View
            key={index}
            className="bg-surface border border-border rounded-xl p-4 flex-row items-center"
          >
            {/* Icon */}
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
              <IconComponent size={24} color={colors.primary} />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">{metric.label}</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">
                  {metric.value}
                </Text>
                <Text className="text-sm text-muted">{metric.unit}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">{metric.subtitle}</Text>
            </View>

            {/* Trend Indicator */}
            <View className="items-end">
              <View className="flex-row items-center gap-1">
                <TrendIcon
                  size={16}
                  color={
                    metric.trend === "up"
                      ? colors.success
                      : metric.trend === "down"
                      ? colors.error
                      : colors.muted
                  }
                />
                <Text
                  className={`text-sm font-semibold ${
                    metric.trend === "up"
                      ? "text-success"
                      : metric.trend === "down"
                      ? "text-error"
                      : "text-muted"
                  }`}
                >
                  {metric.trendValue}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
