import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";

interface BPReading {
  id: string;
  date: Date;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  notes?: string;
}

type BPCategory = "normal" | "elevated" | "high_stage1" | "high_stage2" | "crisis";

export default function BPDashboardScreen() {
  const colors = useColors();
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [showAddForm, setShowAddForm] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");

  useEffect(() => {
    loadReadings();
  }, []);

  async function loadReadings() {
    // Mock data - in production, load from AsyncStorage
    const mockReadings: BPReading[] = [
      { id: "1", date: new Date(2026, 1, 1), systolic: 128, diastolic: 82, heartRate: 72 },
      { id: "2", date: new Date(2026, 1, 2), systolic: 132, diastolic: 85, heartRate: 75 },
      { id: "3", date: new Date(2026, 1, 3), systolic: 125, diastolic: 80, heartRate: 70 },
      { id: "4", date: new Date(2026, 1, 4), systolic: 130, diastolic: 83, heartRate: 73 },
      { id: "5", date: new Date(2026, 1, 5), systolic: 127, diastolic: 81, heartRate: 71 },
      { id: "6", date: new Date(2026, 1, 6), systolic: 129, diastolic: 82, heartRate: 72 },
      { id: "7", date: new Date(2026, 1, 7), systolic: 126, diastolic: 80, heartRate: 70 },
    ];

    setReadings(mockReadings.sort((a, b) => a.date.getTime() - b.date.getTime()));
  }

  function getBPCategory(systolic: number, diastolic: number): BPCategory {
    if (systolic >= 180 || diastolic >= 120) return "crisis";
    if (systolic >= 140 || diastolic >= 90) return "high_stage2";
    if (systolic >= 130 || diastolic >= 80) return "high_stage1";
    if (systolic >= 120 && diastolic < 80) return "elevated";
    return "normal";
  }

  function getCategoryInfo(category: BPCategory) {
    const info = {
      normal: { label: "Normal", color: colors.success, icon: "✅" },
      elevated: { label: "Elevated", color: "#F59E0B", icon: "⚠️" },
      high_stage1: { label: "High (Stage 1)", color: "#F59E0B", icon: "⚠️" },
      high_stage2: { label: "High (Stage 2)", color: colors.error, icon: "🚨" },
      crisis: { label: "Hypertensive Crisis", color: colors.error, icon: "🚨" },
    };
    return info[category];
  }

  function getAverages() {
    if (readings.length === 0) return { systolic: 0, diastolic: 0, heartRate: 0 };

    const sum = readings.reduce(
      (acc, r) => ({
        systolic: acc.systolic + r.systolic,
        diastolic: acc.diastolic + r.diastolic,
        heartRate: acc.heartRate + (r.heartRate || 0),
      }),
      { systolic: 0, diastolic: 0, heartRate: 0 }
    );

    return {
      systolic: Math.round(sum.systolic / readings.length),
      diastolic: Math.round(sum.diastolic / readings.length),
      heartRate: Math.round(sum.heartRate / readings.length),
    };
  }

  function addReading() {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const hr = heartRate ? parseInt(heartRate) : undefined;

    if (!sys || !dia || sys < 70 || sys > 200 || dia < 40 || dia > 130) {
      Alert.alert("Invalid Input", "Please enter valid blood pressure values");
      return;
    }

    const newReading: BPReading = {
      id: Date.now().toString(),
      date: new Date(),
      systolic: sys,
      diastolic: dia,
      heartRate: hr,
    };

    setReadings([...readings, newReading]);
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setShowAddForm(false);

    const category = getBPCategory(sys, dia);
    if (category === "crisis" || category === "high_stage2") {
      Alert.alert(
        "High Blood Pressure Alert",
        `Your reading of ${sys}/${dia} is ${getCategoryInfo(category).label}. Please consult your doctor immediately.`,
        [{ text: "OK" }]
      );
    }
  }

  const averages = getAverages();
  const latestReading = readings[readings.length - 1];
  const latestCategory = latestReading
    ? getBPCategory(latestReading.systolic, latestReading.diastolic)
    : "normal";
  const categoryInfo = getCategoryInfo(latestCategory);

  // Prepare chart data
  const chartData = {
    labels: readings.slice(-7).map((r, i) => {
      const date = r.date;
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: readings.slice(-7).map(r => r.systolic),
        color: () => colors.error,
        strokeWidth: 3,
      },
      {
        data: readings.slice(-7).map(r => r.diastolic),
        color: () => colors.primary,
        strokeWidth: 3,
      },
    ],
    legend: ["Systolic", "Diastolic"],
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Blood Pressure</Text>
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-3xl">{showAddForm ? "×" : "+"}</Text>
          </Pressable>
        </View>

        {/* Add Reading Form */}
        {showAddForm && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Log Blood Pressure</Text>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm text-muted mb-2">Systolic</Text>
                <TextInput
                  value={systolic}
                  onChangeText={setSystolic}
                  keyboardType="number-pad"
                  placeholder="120"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted mb-2">Diastolic</Text>
                <TextInput
                  value={diastolic}
                  onChangeText={setDiastolic}
                  keyboardType="number-pad"
                  placeholder="80"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Heart Rate (optional)</Text>
              <TextInput
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="number-pad"
                placeholder="72"
                placeholderTextColor={colors.muted}
                className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
              />
            </View>

            <Pressable
              onPress={addReading}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">Save Reading</Text>
            </Pressable>
          </View>
        )}

        {/* Latest Reading */}
        {latestReading && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Latest Reading</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-4xl font-bold text-foreground">
                  {latestReading.systolic}/{latestReading.diastolic}
                </Text>
                <Text className="text-base text-muted mt-1">mmHg</Text>
              </View>
              <View className="items-end">
                <Text className="text-3xl mb-1">{categoryInfo.icon}</Text>
                <Text
                  className="text-base font-semibold"
                  style={{ color: categoryInfo.color }}
                >
                  {categoryInfo.label}
                </Text>
              </View>
            </View>
            {latestReading.heartRate && (
              <View className="mt-4 pt-4 border-t border-border">
                <Text className="text-sm text-muted">Heart Rate</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {latestReading.heartRate} bpm
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Averages */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">7-Day Average</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-muted mb-1">Systolic</Text>
              <Text className="text-2xl font-bold text-foreground">{averages.systolic}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted mb-1">Diastolic</Text>
              <Text className="text-2xl font-bold text-foreground">{averages.diastolic}</Text>
            </View>
            {averages.heartRate > 0 && (
              <View>
                <Text className="text-sm text-muted mb-1">Heart Rate</Text>
                <Text className="text-2xl font-bold text-foreground">{averages.heartRate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Trend Chart */}
        {readings.length > 0 && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">7-Day Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max(Dimensions.get("window").width - 80, 350)}
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
                    r: "5",
                    strokeWidth: "2",
                  },
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
            </ScrollView>
          </View>
        )}

        {/* BP Categories Reference */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">BP Categories</Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-base text-muted">Normal</Text>
              <Text className="text-base text-foreground">&lt; 120/80</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-muted">Elevated</Text>
              <Text className="text-base text-foreground">120-129/&lt;80</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-muted">High (Stage 1)</Text>
              <Text className="text-base text-foreground">130-139/80-89</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-muted">High (Stage 2)</Text>
              <Text className="text-base text-foreground">≥140/≥90</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-error font-semibold">Crisis</Text>
              <Text className="text-base text-error font-semibold">≥180/≥120</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
