import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { LineChart } from "react-native-chart-kit";
import * as Haptics from "expo-haptics";

type DateRange = "7d" | "30d" | "90d" | "all";

const DATE_RANGES = [
  { id: "7d" as DateRange, label: "7 Days" },
  { id: "30d" as DateRange, label: "30 Days" },
  { id: "90d" as DateRange, label: "90 Days" },
  { id: "all" as DateRange, label: "All Time" },
];

export default function DeviceDataDashboard() {
  const colors = useColors();
  const [selectedRange, setSelectedRange] = useState<DateRange>("30d");
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "bp" | "hr" | "glucose">("weight");

  // Fetch vitals data
  const { data: vitalsData, isLoading } = trpc.vitals.list.useQuery({
    limit: 1000,
  });

  const screenWidth = Dimensions.get("window").width;

  // Process data for charts
  const getChartData = () => {
    if (!vitalsData || vitalsData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    // Filter by date range
    const now = new Date();
    const rangeMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "all": Infinity,
    };

    const filteredData = vitalsData.filter((vital: any) => {
      const vitalDate = new Date(vital.recordedAt);
      return now.getTime() - vitalDate.getTime() <= rangeMs[selectedRange];
    });

    if (filteredData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    // Extract data based on selected metric
    let dataPoints: { date: Date; value: number }[] = [];

    switch (selectedMetric) {
      case "weight":
        dataPoints = filteredData
          .filter((v: any) => v.vitalType === "weight" && v.value)
          .map((v: any) => ({
            date: new Date(v.recordedAt),
            value: v.value,
          }));
        break;
      case "bp":
        dataPoints = filteredData
          .filter((v: any) => v.vitalType === "blood_pressure" && v.systolic)
          .map((v: any) => ({
            date: new Date(v.recordedAt),
            value: v.systolic,
          }));
        break;
      case "hr":
        dataPoints = filteredData
          .filter((v: any) => v.vitalType === "heart_rate" && v.value)
          .map((v: any) => ({
            date: new Date(v.recordedAt),
            value: v.value,
          }));
        break;
      case "glucose":
        dataPoints = filteredData
          .filter((v: any) => v.vitalType === "blood_glucose" && v.value)
          .map((v: any) => ({
            date: new Date(v.recordedAt),
            value: v.value,
          }));
        break;
    }

    if (dataPoints.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    // Sort by date
    dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Limit to 10 data points for readability
    const step = Math.ceil(dataPoints.length / 10);
    const sampledData = dataPoints.filter((_, i) => i % step === 0);

    return {
      labels: sampledData.map((d) => {
        const month = d.date.getMonth() + 1;
        const day = d.date.getDate();
        return `${month}/${day}`;
      }),
      datasets: [
        {
          data: sampledData.map((d) => d.value),
          color: () => colors.primary,
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = getChartData();

  const getMetricInfo = () => {
    switch (selectedMetric) {
      case "weight":
        return { label: "Weight", unit: "lbs", icon: "figure.stand", color: "#0a7ea4" };
      case "bp":
        return { label: "Blood Pressure", unit: "mmHg", icon: "heart.fill", color: "#EF4444" };
      case "hr":
        return { label: "Heart Rate", unit: "bpm", icon: "waveform.path.ecg", color: "#22C55E" };
      case "glucose":
        return { label: "Blood Glucose", unit: "mg/dL", icon: "drop.fill", color: "#8B5CF6" };
    }
  };

  const metricInfo = getMetricInfo();

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Export functionality would go here
    alert("Export feature coming soon!");
  };

  return (
    <ScreenContainer className="p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-3xl font-bold text-foreground">Device Data Dashboard</Text>
        <Text className="mb-6 text-base text-muted">
          Visualize your health trends from connected devices
        </Text>

        {/* Metric Selector */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Select Metric</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { id: "weight" as const, label: "Weight", icon: "figure.stand", color: "#0a7ea4" },
              { id: "bp" as const, label: "Blood Pressure", icon: "heart.fill", color: "#EF4444" },
              { id: "hr" as const, label: "Heart Rate", icon: "waveform.path.ecg", color: "#22C55E" },
              { id: "glucose" as const, label: "Glucose", icon: "drop.fill", color: "#8B5CF6" },
            ].map((metric) => (
              <TouchableOpacity
                key={metric.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMetric(metric.id);
                }}
                className="flex-row items-center rounded-full border px-4 py-2"
                style={{
                  backgroundColor: selectedMetric === metric.id ? metric.color + "20" : colors.surface,
                  borderColor: selectedMetric === metric.id ? metric.color : colors.border,
                  borderWidth: selectedMetric === metric.id ? 2 : 1,
                }}
              >
                <IconSymbol
                  name={metric.icon as any}
                  size={16}
                  color={selectedMetric === metric.id ? metric.color : colors.muted}
                />
                <Text
                  className="ml-2 text-sm font-medium"
                  style={{
                    color: selectedMetric === metric.id ? metric.color : colors.foreground,
                  }}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range Selector */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Time Range</Text>
          <View className="flex-row gap-2">
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedRange(range.id);
                }}
                className="flex-1 rounded-full border py-2"
                style={{
                  backgroundColor: selectedRange === range.id ? colors.primary + "20" : colors.surface,
                  borderColor: selectedRange === range.id ? colors.primary : colors.border,
                  borderWidth: selectedRange === range.id ? 2 : 1,
                }}
              >
                <Text
                  className="text-center text-sm font-medium"
                  style={{
                    color: selectedRange === range.id ? colors.primary : colors.foreground,
                  }}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: metricInfo.color + "20" }}
              >
                <IconSymbol name={metricInfo.icon as any} size={20} color={metricInfo.color} />
              </View>
              <View>
                <Text className="text-lg font-semibold text-foreground">{metricInfo.label}</Text>
                <Text className="text-sm text-muted">{selectedRange === "7d" ? "Last 7 days" : selectedRange === "30d" ? "Last 30 days" : selectedRange === "90d" ? "Last 90 days" : "All time"}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleExportData}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-semibold text-white">Export</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="h-64 items-center justify-center">
              <Text className="text-muted">Loading data...</Text>
            </View>
          ) : chartData.labels[0] === "No Data" ? (
            <View className="h-64 items-center justify-center">
              <Text className="text-center text-muted">
                No data available for this metric and time range.{"\n"}
                Connect devices and sync data to see trends.
              </Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={256}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: () => metricInfo.color,
                labelColor: () => colors.muted,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: metricInfo.color,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted">Average</Text>
              <Text className="text-lg font-semibold text-foreground">
                {chartData.labels[0] === "No Data"
                  ? "--"
                  : Math.round(
                      chartData.datasets[0].data.reduce((a, b) => a + b, 0) /
                        chartData.datasets[0].data.length
                    )}{" "}
                {metricInfo.unit}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-muted">Latest</Text>
              <Text className="text-lg font-semibold text-foreground">
                {chartData.labels[0] === "No Data"
                  ? "--"
                  : Math.round(chartData.datasets[0].data[chartData.datasets[0].data.length - 1])}{" "}
                {metricInfo.unit}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <Text className="mb-2 text-base font-semibold text-foreground">About This Data</Text>
          <Text className="text-sm leading-relaxed text-muted">
            This dashboard shows historical trends from your connected devices and health apps. Data is
            automatically synced from Apple Health or Google Fit. For best results, sync your devices
            regularly and maintain consistent measurement times.
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
