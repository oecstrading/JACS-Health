import { View, Text, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Heart, Plus, TrendingUp, Activity } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function SymptomDiaryScreen() {
  const colors = useColors();

  const symptoms = [
    {
      id: "1",
      name: "Headache",
      severity: 7,
      date: "2026-02-23 14:30",
      triggers: ["Stress", "Skipped meal"],
      glucoseLevel: 145,
    },
    {
      id: "2",
      name: "Fatigue",
      severity: 5,
      date: "2026-02-23 10:15",
      triggers: ["Poor sleep"],
      glucoseLevel: 98,
    },
  ];

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return colors.error;
    if (severity >= 5) return colors.warning;
    return colors.success;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Heart size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Symptom Diary</Text>
          </View>
          <Text className="text-base text-muted">Track symptoms and identify patterns</Text>
        </View>

        <View className="px-6 pb-6">
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">Log Symptom</Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
            <Text className="text-sm font-semibold text-primary mb-4">TODAY'S SUMMARY</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-muted mb-1">Symptoms logged</Text>
                <Text className="text-3xl font-bold text-foreground">2</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">Avg severity</Text>
                <Text className="text-3xl font-bold text-foreground">6</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">Triggers found</Text>
                <Text className="text-3xl font-bold text-foreground">3</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Recent Symptoms</Text>
          {symptoms.map((symptom) => (
            <View key={symptom.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {symptom.name}
                  </Text>
                  <Text className="text-xs text-muted">{symptom.date}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-muted mb-1">Severity</Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getSeverityColor(symptom.severity) }}
                  >
                    {symptom.severity}/10
                  </Text>
                </View>
              </View>

              <View className="mb-2">
                <Text className="text-xs text-muted mb-1">Triggers</Text>
                <View className="flex-row flex-wrap gap-2">
                  {symptom.triggers.map((trigger, i) => (
                    <View key={i} className="bg-warning/20 px-2 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-warning">{trigger}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row items-center gap-2 pt-2 border-t border-border">
                <Activity size={14} color={colors.muted} />
                <Text className="text-xs text-muted">
                  Glucose: {symptom.glucoseLevel} mg/dL
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">Pattern Analysis</Text>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Most common symptom</Text>
                <Text className="text-sm font-semibold text-primary">Headache (45%)</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Peak time</Text>
                <Text className="text-sm font-semibold text-primary">2-4 PM</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Top trigger</Text>
                <Text className="text-sm font-semibold text-primary">Stress</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Glucose correlation</Text>
                <Text className="text-sm font-semibold text-primary">High (0.78)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
