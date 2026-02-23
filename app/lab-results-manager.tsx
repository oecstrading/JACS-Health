import { View, Text, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { FileText, Plus, TrendingUp, AlertCircle } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function LabResultsManagerScreen() {
  const colors = useColors();

  const labResults = [
    {
      id: "1",
      testName: "Hemoglobin A1C",
      value: "6.8",
      unit: "%",
      date: "2026-02-15",
      status: "high",
      normalRange: "< 5.7",
    },
    {
      id: "2",
      testName: "Fasting Glucose",
      value: "118",
      unit: "mg/dL",
      date: "2026-02-15",
      status: "high",
      normalRange: "70-100",
    },
    {
      id: "3",
      testName: "Total Cholesterol",
      value: "195",
      unit: "mg/dL",
      date: "2026-01-20",
      status: "normal",
      normalRange: "< 200",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high": return colors.error;
      case "low": return colors.warning;
      case "critical": return colors.error;
      default: return colors.success;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "normal") return "✓";
    return "⚠️";
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <FileText size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Lab Results</Text>
          </View>
          <Text className="text-base text-muted">Track and analyze your test results</Text>
        </View>

        <View className="px-6 pb-6">
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">Add Lab Result</Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          <View className="bg-error/10 border-2 border-error rounded-xl p-4 flex-row items-start gap-3">
            <AlertCircle size={24} color={colors.error} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-error mb-1">2 Abnormal Results</Text>
              <Text className="text-sm text-muted">
                Some values are outside normal range. Consult your doctor.
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Recent Results</Text>
          {labResults.map((result) => (
            <View key={result.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {result.testName}
                  </Text>
                  <Text className="text-xs text-muted">{result.date}</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${getStatusColor(result.status)}20` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-muted mb-1">Result</Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.value} {result.unit}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted mb-1">Normal Range</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {result.normalRange} {result.unit}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">A1C Trend</Text>
            </View>
            <View className="flex-row items-end justify-between h-32">
              {[7.2, 7.0, 6.9, 6.8].map((value, i) => (
                <View key={i} className="flex-1 items-center">
                  <View
                    style={{
                      height: `${(value / 10) * 100}%`,
                      backgroundColor: value > 7 ? colors.error : colors.success,
                    }}
                    className="w-12 rounded-t-lg"
                  />
                  <Text className="text-xs text-muted mt-2">{value}%</Text>
                </View>
              ))}
            </View>
            <Text className="text-xs text-muted text-center mt-3">
              Last 4 tests showing improvement ✓
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
