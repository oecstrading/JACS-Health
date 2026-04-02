import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  getMedications,
  saveMedications,
  getVitals,
  getActivities,
  type Medication,
  type Vital,
} from "@/lib/storage";
import {
  requestNotificationPermissions,
  scheduleMedicationReminder,
  rescheduleMedicationReminders,
} from "@/lib/notifications";

type HealthTab = "medications" | "vitals" | "activity";

/**
 * Health Screen - Comprehensive Health Tracking
 *
 * Track medications, vitals, and daily activities with persistent data storage.
 */
export default function HealthScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<HealthTab>("medications");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, vitalsData] = await Promise.all([
        getMedications(),
        getVitals(),
      ]);

      // Filter medications for today
      const today = new Date().toISOString().split("T")[0];
      const todayMeds = medsData.filter(m => m.date === today);

      // If no medications for today, create default ones
      if (todayMeds.length === 0 && medsData.length === 0) {
        const defaultMeds: Medication[] = [
          {
            id: "1",
            name: "Lisinopril",
            dosage: "10mg",
            time: "8:00 AM",
            taken: false,
            date: today,
          },
          {
            id: "2",
            name: "Metformin",
            dosage: "500mg",
            time: "8:00 AM",
            taken: false,
            date: today,
          },
          {
            id: "3",
            name: "Atorvastatin",
            dosage: "20mg",
            time: "8:00 PM",
            taken: false,
            date: today,
          },
        ];
        await saveMedications(defaultMeds);
        setMedications(defaultMeds);
      } else {
        setMedications(todayMeds);
      }

      // Get recent vitals (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentVitals = vitalsData.filter(
        v => new Date(v.date) >= sevenDaysAgo
      );

      // If no vitals, create sample data
      if (recentVitals.length === 0) {
        const defaultVitals: Vital[] = [
          {
            id: "1",
            type: "blood_pressure",
            value: "120/80",
            unit: "mmHg",
            status: "normal",
            date: today,
          },
          {
            id: "2",
            type: "heart_rate",
            value: "72",
            unit: "bpm",
            status: "normal",
            date: today,
          },
          {
            id: "3",
            type: "weight",
            value: "165",
            unit: "lbs",
            status: "normal",
            date: today,
          },
          {
            id: "4",
            type: "blood_glucose",
            value: "105",
            unit: "mg/dL",
            status: "normal",
            date: today,
          },
        ];
        setVitals(defaultVitals);
      } else {
        setVitals(recentVitals);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      // Reschedule medication reminders
      const meds = await getMedications();
      await rescheduleMedicationReminders(meds);
    }
  };

  const handleToggleMedication = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedMeds = medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    );
    setMedications(updatedMeds);

    // Save to AsyncStorage
    try {
      const allMeds = await getMedications();
      const otherMeds = allMeds.filter(m => m.id !== id);
      const updatedMed = updatedMeds.find(m => m.id === id);
      if (updatedMed) {
        await saveMedications([...otherMeds, updatedMed]);
      }
    } catch (error) {
      console.error("Error saving medication:", error);
    }
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

  const getVitalIcon = (type: Vital["type"]): React.ComponentProps<typeof IconSymbol>["name"] => {
    switch (type) {
      case "blood_pressure":
      case "heart_rate":
      case "blood_glucose":
        return "heart.fill";
      case "weight":
        return "figure.walk";
      case "temperature":
        return "thermometer";
      default:
        return "heart.fill";
    }
  };

  const getVitalLabel = (type: Vital["type"]): string => {
    switch (type) {
      case "blood_pressure":
        return "Blood Pressure";
      case "heart_rate":
        return "Heart Rate";
      case "weight":
        return "Weight";
      case "blood_glucose":
        return "Blood Glucose";
      case "temperature":
        return "Temperature";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
            Loading health data...
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
            {medications.length === 0 ? (
              <View className="bg-surface rounded-3xl p-8 border border-border items-center">
                <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
                  No medications scheduled for today
                </Text>
              </View>
            ) : (
              medications.map(med => (
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
              ))
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/blood-sugar-log' as any);
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
              Recent Vitals
            </Text>
            {vitals.length === 0 ? (
              <View className="bg-surface rounded-3xl p-8 border border-border items-center">
                <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
                  No vitals recorded yet
                </Text>
              </View>
            ) : (
              vitals.map(vital => (
                <View key={vital.id} className="bg-surface rounded-3xl p-6 border border-border">
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: `${getStatusColor(vital.status)}20` }}
                    >
                      <IconSymbol name={getVitalIcon(vital.type)} size={32} color={getStatusColor(vital.status)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
                        {getVitalLabel(vital.type)}
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
              ))
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/blood-sugar-log' as any);
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
                  style={{ flex: 0.65, backgroundColor: colors.primary }}
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
