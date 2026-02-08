import { ScrollView, Text, View, Pressable, TextInput, type ViewStyle } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type HealthTab = "medications" | "vitals" | "activity";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

interface Vital {
  id: string;
  type: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  value: string;
  unit: string;
  status: "normal" | "warning" | "error";
}

/**
 * Health Screen - Comprehensive Health Tracking
 *
 * Track medications, vitals, and daily activities with large, easy-to-use interface.
 */
export default function HealthScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<HealthTab>("medications");

  // Sample data - in production, this would come from AsyncStorage or database
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Lisinopril", dosage: "10mg", time: "8:00 AM", taken: true },
    { id: "2", name: "Metformin", dosage: "500mg", time: "8:00 AM", taken: true },
    { id: "3", name: "Atorvastatin", dosage: "20mg", time: "8:00 PM", taken: false },
  ]);

  const [vitals] = useState<Vital[]>([
    { id: "1", type: "Blood Pressure", icon: "heart.fill", value: "120/80", unit: "mmHg", status: "normal" },
    { id: "2", type: "Heart Rate", icon: "heart.fill", value: "72", unit: "bpm", status: "normal" },
    { id: "3", type: "Weight", icon: "figure.walk", value: "165", unit: "lbs", status: "normal" },
    { id: "4", type: "Blood Glucose", icon: "heart.fill", value: "105", unit: "mg/dL", status: "normal" },
  ]);

  const handleToggleMedication = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMedications(meds =>
      meds.map(med => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  const handleTabChange = (tab: HealthTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Health Tracking
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Monitor your health daily
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="px-6 pb-4">
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => handleTabChange("medications")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.8 : 1,
                backgroundColor: activeTab === "medications" ? colors.primary : colors.surface,
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                alignItems: "center",
              } as ViewStyle,
            ]}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color: activeTab === "medications" ? "#ffffff" : colors.foreground,
                lineHeight: 22,
              }}
            >
              Medications
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("vitals")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.8 : 1,
                backgroundColor: activeTab === "vitals" ? colors.primary : colors.surface,
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                alignItems: "center",
              } as ViewStyle,
            ]}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color: activeTab === "vitals" ? "#ffffff" : colors.foreground,
                lineHeight: 22,
              }}
            >
              Vitals
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("activity")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.8 : 1,
                backgroundColor: activeTab === "activity" ? colors.primary : colors.surface,
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                alignItems: "center",
              } as ViewStyle,
            ]}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color: activeTab === "activity" ? "#ffffff" : colors.foreground,
                lineHeight: 22,
              }}
            >
              Activity
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Medications Tab */}
        {activeTab === "medications" && (
          <View className="gap-4 pb-8">
            <Text className="text-xl font-semibold text-foreground mb-2" style={{ lineHeight: 28 }}>
              Today's Medications
            </Text>
            {medications.map(med => (
              <Pressable
                key={med.id}
                onPress={() => handleToggleMedication(med.id)}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  } as ViewStyle,
                ]}
              >
                <View className="bg-surface rounded-3xl p-6 border border-border">
                  <View className="flex-row items-center gap-4">
                    <Pressable
                      onPress={() => handleToggleMedication(med.id)}
                      style={({ pressed }) => [
                        {
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          borderWidth: 3,
                          borderColor: med.taken ? colors.success : colors.border,
                          backgroundColor: med.taken ? colors.success : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        } as ViewStyle,
                      ]}
                    >
                      {med.taken && <IconSymbol name="checkmark.circle.fill" size={32} color="#ffffff" />}
                    </Pressable>
                    <View className="flex-1">
                      <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                        {med.name}
                      </Text>
                      <Text className="text-lg text-muted mt-1" style={{ lineHeight: 24 }}>
                        {med.dosage} • {med.time}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                alert("Add medication feature coming soon");
              }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                } as ViewStyle,
              ]}
            >
              <View className="bg-surface rounded-3xl p-6 border-2 border-dashed border-border">
                <View className="flex-row items-center justify-center gap-3">
                  <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
                  <Text className="text-xl font-semibold" style={{ color: colors.primary, lineHeight: 28 }}>
                    Add Medication
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Vitals Tab */}
        {activeTab === "vitals" && (
          <View className="gap-4 pb-8">
            <Text className="text-xl font-semibold text-foreground mb-2" style={{ lineHeight: 28 }}>
              Today's Vitals
            </Text>
            {vitals.map(vital => (
              <View key={vital.id} className="bg-surface rounded-3xl p-6 border border-border">
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${getStatusColor(vital.status)}20` }}
                  >
                    <IconSymbol name={vital.icon} size={32} color={getStatusColor(vital.status)} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
                      {vital.type}
                    </Text>
                    <Text className="text-2xl font-bold text-foreground mt-1" style={{ lineHeight: 32 }}>
                      {vital.value} <Text className="text-lg text-muted">{vital.unit}</Text>
                    </Text>
                  </View>
                  <View
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: `${getStatusColor(vital.status)}20` }}
                  >
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{ color: getStatusColor(vital.status), lineHeight: 18 }}
                    >
                      {vital.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                alert("Record vitals feature coming soon");
              }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                } as ViewStyle,
              ]}
            >
              <View className="bg-surface rounded-3xl p-6 border-2 border-dashed border-border">
                <View className="flex-row items-center justify-center gap-3">
                  <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
                  <Text className="text-xl font-semibold" style={{ color: colors.primary, lineHeight: 28 }}>
                    Record Vitals
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <View className="gap-4 pb-8">
            <Text className="text-xl font-semibold text-foreground mb-2" style={{ lineHeight: 28 }}>
              Today's Activity
            </Text>
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <View className="flex-row items-center gap-4 mb-4">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <IconSymbol name="figure.walk" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
                    Steps Today
                  </Text>
                  <Text className="text-3xl font-bold text-foreground mt-1" style={{ lineHeight: 40 }}>
                    3,245
                  </Text>
                </View>
              </View>
              <View className="h-3 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: "65%", backgroundColor: colors.primary }}
                />
              </View>
              <Text className="text-base text-muted mt-2 text-center" style={{ lineHeight: 22 }}>
                65% of 5,000 step goal
              </Text>
            </View>

            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
                Daily Checklist
              </Text>
              <View className="gap-3">
                {[
                  { label: "Morning Walk", done: true },
                  { label: "Breakfast", done: true },
                  { label: "Lunch", done: true },
                  { label: "Afternoon Walk", done: false },
                  { label: "Dinner", done: false },
                  { label: "8 Glasses of Water", done: false },
                ].map((item, index) => (
                  <View key={index} className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: item.done ? colors.success : colors.border,
                      }}
                    >
                      {item.done && <IconSymbol name="checkmark.circle.fill" size={20} color="#ffffff" />}
                    </View>
                    <Text
                      className="text-lg flex-1"
                      style={{
                        color: item.done ? colors.muted : colors.foreground,
                        textDecorationLine: item.done ? "line-through" : "none",
                        lineHeight: 24,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
