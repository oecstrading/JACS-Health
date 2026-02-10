import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { generateVitalsReport, getDateRange, type VitalsReportData } from "@/lib/pdf-export";
import { analyzeHealthData, type HealthInsight } from "@/lib/health-insights-ai";
import * as Haptics from "expo-haptics";

type TimeRange = "7d" | "30d" | "90d";

interface VitalsData {
  bloodPressure: Array<{
    systolic: number;
    diastolic: number;
    pulse: number;
    timestamp: string;
  }>;
  heartRate: Array<{
    heartRate: number;
    timestamp: string;
  }>;
  weight: Array<{
    weight: number;
    bmi?: number;
    timestamp: string;
  }>;
}

export default function VitalsDashboardScreen() {
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [vitalsData, setVitalsData] = useState<VitalsData>({
    bloodPressure: [],
    heartRate: [],
    weight: [],
  });
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadVitalsData();
  }, [timeRange]);

  const handleExportPDF = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Get date range based on selected time range
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const dateRange = getDateRange(days);

      // Generate insights
      const insights = analyzeHealthData(vitalsData);

      // Prepare report data
      const reportData: VitalsReportData = {
        dateRange,
        bloodPressure: vitalsData.bloodPressure,
        heartRate: vitalsData.heartRate,
        weight: vitalsData.weight,
        insights: insights.map((i) => ({
          title: i.title,
          description: i.description,
          severity: i.severity,
        })),
      };

      await generateVitalsReport(reportData);
      alert("Report generated successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const loadVitalsData = async () => {
    setLoading(true);
    try {
      const [bpJson, hrJson, weightJson] = await Promise.all([
        AsyncStorage.getItem("vitals_blood_pressure"),
        AsyncStorage.getItem("vitals_heart_rate"),
        AsyncStorage.getItem("vitals_weight"),
      ]);

      const bp = bpJson ? JSON.parse(bpJson) : [];
      const hr = hrJson ? JSON.parse(hrJson) : [];
      const weight = weightJson ? JSON.parse(weightJson) : [];

      // Filter by time range
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const filteredBP = bp.filter(
        (reading: any) => new Date(reading.timestamp) >= cutoffDate
      );
      const filteredHR = hr.filter(
        (reading: any) => new Date(reading.timestamp) >= cutoffDate
      );
      const filteredWeight = weight.filter(
        (reading: any) => new Date(reading.timestamp) >= cutoffDate
      );

      setVitalsData({
        bloodPressure: filteredBP,
        heartRate: filteredHR,
        weight: filteredWeight,
      });
    } catch (error) {
      console.error("Error loading vitals data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestReading = (data: any[]) => {
    if (data.length === 0) return null;
    return data[data.length - 1];
  };

  const getAverage = (data: any[], key: string) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, reading) => acc + reading[key], 0);
    return Math.round(sum / data.length);
  };

  const getBPChartData = () => {
    if (vitalsData.bloodPressure.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          { data: [0], color: () => colors.error, strokeWidth: 2 },
          { data: [0], color: () => colors.primary, strokeWidth: 2 },
        ],
        legend: ["Systolic", "Diastolic"],
      };
    }

    const labels = vitalsData.bloodPressure.map((reading) => {
      const date = new Date(reading.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels: labels.length > 7 ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0) : labels,
      datasets: [
        {
          data: vitalsData.bloodPressure.map((r) => r.systolic),
          color: () => colors.error,
          strokeWidth: 2,
        },
        {
          data: vitalsData.bloodPressure.map((r) => r.diastolic),
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
      legend: ["Systolic", "Diastolic"],
    };
  };

  const getHRChartData = () => {
    if (vitalsData.heartRate.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    const labels = vitalsData.heartRate.map((reading) => {
      const date = new Date(reading.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels: labels.length > 7 ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0) : labels,
      datasets: [
        {
          data: vitalsData.heartRate.map((r) => r.heartRate),
          color: () => colors.error,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getWeightChartData = () => {
    if (vitalsData.weight.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    const labels = vitalsData.weight.map((reading) => {
      const date = new Date(reading.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels: labels.length > 7 ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0) : labels,
      datasets: [
        {
          data: vitalsData.weight.map((r) => r.weight),
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };
  };

  const latestBP = getLatestReading(vitalsData.bloodPressure);
  const latestHR = getLatestReading(vitalsData.heartRate);
  const latestWeight = getLatestReading(vitalsData.weight);

  const avgSystolic = getAverage(vitalsData.bloodPressure, "systolic");
  const avgDiastolic = getAverage(vitalsData.bloodPressure, "diastolic");
  const avgHR = getAverage(vitalsData.heartRate, "heartRate");
  const avgWeight = getAverage(vitalsData.weight, "weight");

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">
            Vitals Dashboard
          </Text>
          <Text className="text-base text-muted mt-1">
            Track your health metrics over time
          </Text>
          {/* Export PDF Button */}
          <TouchableOpacity
            onPress={handleExportPDF}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>📄 Export to PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View className="flex-row mb-6 gap-2">
          {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              style={{
                backgroundColor:
                  timeRange === range ? colors.primary : colors.surface,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: timeRange === range ? "white" : colors.foreground,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-lg text-muted">Loading vitals data...</Text>
          </View>
        ) : (
          <>
            {/* Blood Pressure Section */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-foreground mb-3">
                🩺 Blood Pressure
              </Text>
              
              {/* Summary Cards */}
              <View className="flex-row gap-3 mb-4">
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Latest</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {latestBP
                      ? `${latestBP.systolic}/${latestBP.diastolic}`
                      : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">mmHg</Text>
                </View>
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Average</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {avgSystolic > 0 ? `${avgSystolic}/${avgDiastolic}` : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">mmHg</Text>
                </View>
              </View>

              {/* Chart */}
              {vitalsData.bloodPressure.length > 0 ? (
                <LineChart
                  data={getBPChartData()}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
                    labelColor: () => colors.muted,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                    },
                  }}
                  bezier
                  style={{
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View
                  className="p-8 rounded-2xl items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-base text-muted text-center">
                    No blood pressure data for this period.{"\n"}
                    Sync your Omron 3550 to see trends.
                  </Text>
                </View>
              )}
            </View>

            {/* Heart Rate Section */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-foreground mb-3">
                ❤️ Heart Rate
              </Text>
              
              {/* Summary Cards */}
              <View className="flex-row gap-3 mb-4">
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Latest</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {latestHR ? latestHR.heartRate : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">bpm</Text>
                </View>
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Average</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {avgHR > 0 ? avgHR : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">bpm</Text>
                </View>
              </View>

              {/* Chart */}
              {vitalsData.heartRate.length > 0 ? (
                <LineChart
                  data={getHRChartData()}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                    labelColor: () => colors.muted,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                    },
                  }}
                  bezier
                  style={{
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View
                  className="p-8 rounded-2xl items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-base text-muted text-center">
                    No heart rate data for this period.{"\n"}
                    Sync your Samsung Watch 7 to see trends.
                  </Text>
                </View>
              )}
            </View>

            {/* Weight Section */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-foreground mb-3">
                ⚖️ Weight
              </Text>
              
              {/* Summary Cards */}
              <View className="flex-row gap-3 mb-4">
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Latest</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {latestWeight ? latestWeight.weight.toFixed(1) : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">lbs</Text>
                </View>
                <View
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm text-muted mb-1">Average</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {avgWeight > 0 ? avgWeight.toFixed(1) : "—"}
                  </Text>
                  <Text className="text-xs text-muted mt-1">lbs</Text>
                </View>
              </View>

              {/* Chart */}
              {vitalsData.weight.length > 0 ? (
                <LineChart
                  data={getWeightChartData()}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
                    labelColor: () => colors.muted,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                    },
                  }}
                  bezier
                  style={{
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View
                  className="p-8 rounded-2xl items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-base text-muted text-center">
                    No weight data for this period.{"\n"}
                    Sync your iHome scale to see trends.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
