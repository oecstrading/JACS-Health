import { ScrollView, Text, View, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { LineChart, BarChart } from "react-native-chart-kit";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getVitals, getMedications, type Vital } from "@/lib/storage";

/**
 * Insights Screen - Data Visualization and Health Trends
 *
 * Displays charts and trends for vitals, medications, and activity data.
 */
export default function InsightsScreen() {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const [bloodPressureData, setBloodPressureData] = useState<number[]>([]);
  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [medicationAdherence, setMedicationAdherence] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [vitals, medications] = await Promise.all([
        getVitals(),
        getMedications(),
      ]);

      // Get last 7 days of blood pressure data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentBP = vitals
        .filter(v => v.type === "blood_pressure" && new Date(v.date) >= sevenDaysAgo)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7);

      const bpValues = recentBP.map(v => {
        const systolic = parseInt(v.value.split("/")[0]);
        return systolic;
      });
      setBloodPressureData(bpValues.length > 0 ? bpValues : [120, 118, 122, 119, 121, 120, 120]);

      // Get last 7 days of heart rate data
      const recentHR = vitals
        .filter(v => v.type === "heart_rate" && new Date(v.date) >= sevenDaysAgo)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7);

      const hrValues = recentHR.map(v => parseInt(v.value));
      setHeartRateData(hrValues.length > 0 ? hrValues : [72, 70, 74, 71, 73, 72, 72]);

      // Calculate medication adherence for last 7 days
      const adherenceByDay: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        const dayMeds = medications.filter(m => m.date === dateStr);
        const takenMeds = dayMeds.filter(m => m.taken).length;
        const adherence = dayMeds.length > 0 ? (takenMeds / dayMeds.length) * 100 : 0;
        adherenceByDay.push(Math.round(adherence));
      }
      setMedicationAdherence(adherenceByDay.length > 0 ? adherenceByDay : [100, 100, 100, 67, 100, 100, 100]);
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => colors.muted,
    style: {
      borderRadius: 24,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
            Loading insights...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Health Insights
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Your health trends over time
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Blood Pressure Trend */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="heart.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                Blood Pressure
              </Text>
              <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                Last 7 days (Systolic)
              </Text>
            </View>
          </View>
          <View className="bg-surface rounded-3xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.border }}>
            <LineChart
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{ data: bloodPressureData }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 24,
              }}
            />
          </View>
        </View>

        {/* Heart Rate Trend */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${colors.success}20` }}
            >
              <IconSymbol name="heart.fill" size={24} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                Heart Rate
              </Text>
              <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                Last 7 days (BPM)
              </Text>
            </View>
          </View>
          <View className="bg-surface rounded-3xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.border }}>
            <LineChart
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{ data: heartRateData }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 24,
              }}
            />
          </View>
        </View>

        {/* Medication Adherence */}
        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${colors.success}20` }}
            >
              <IconSymbol name="pills.fill" size={24} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                Medication Adherence
              </Text>
              <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                Last 7 days (%)
              </Text>
            </View>
          </View>
          <View className="bg-surface rounded-3xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.border }}>
            <BarChart
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{ data: medicationAdherence }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              }}
              style={{
                marginVertical: 8,
                borderRadius: 24,
              }}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
            />
          </View>
        </View>

        {/* Health Summary */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Weekly Summary
          </Text>
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
                  Average Blood Pressure
                </Text>
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  {Math.round(bloodPressureData.reduce((a, b) => a + b, 0) / bloodPressureData.length)}/80
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
                  Average Heart Rate
                </Text>
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  {Math.round(heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length)} BPM
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
                  Medication Adherence
                </Text>
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  {Math.round(medicationAdherence.reduce((a, b) => a + b, 0) / medicationAdherence.length)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
