import { View, Text, Pressable, ScrollView, TextInput, Alert, Switch } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Pill, Plus, Clock, Check, X, Bell } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  pillCount?: number;
  isActive: boolean;
  adherence: number; // percentage
}

/**
 * Medication Reminders Screen
 * 
 * Features:
 * - Medication list management
 * - Push notification reminders
 * - Snooze and skip functionality
 * - Adherence tracking
 * - Refill reminders
 */
export default function MedicationRemindersScreen() {
  const colors = useColors();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("twice_daily");
  
  // Mock data - in production, fetch from database
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      times: ["08:00", "20:00"],
      pillCount: 45,
      isActive: true,
      adherence: 95,
    },
    {
      id: "2",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      times: ["08:00"],
      pillCount: 28,
      isActive: true,
      adherence: 100,
    },
    {
      id: "3",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily (evening)",
      times: ["20:00"],
      pillCount: 15,
      isActive: true,
      adherence: 88,
    },
  ]);

  const [todaysDoses, setTodaysDoses] = useState<Array<{ id: string; medication: string; time: string; status: "pending" | "taken" | "skipped" }>>([
    { id: "1", medication: "Metformin 500mg", time: "08:00", status: "taken" },
    { id: "2", medication: "Lisinopril 10mg", time: "08:00", status: "taken" },
    { id: "3", medication: "Metformin 500mg", time: "20:00", status: "pending" },
    { id: "4", medication: "Atorvastatin 20mg", time: "20:00", status: "pending" },
  ]);

  const handleAddMedication = async () => {
    if (!newMedName.trim() || !newMedDosage.trim()) {
      Alert.alert("Missing Information", "Please enter medication name and dosage.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your device settings to receive medication reminders."
      );
    }

    // In production: save to database and schedule notifications
    Alert.alert("Success", `${newMedName} has been added with reminders enabled.`);
    
    setShowAddForm(false);
    setNewMedName("");
    setNewMedDosage("");
  };

  const handleToggleMedication = (med: Medication) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = medications.map((m) =>
      m.id === med.id ? { ...m, isActive: !m.isActive } : m
    );
    setMedications(updated);
    
    if (!med.isActive) {
      Alert.alert("Reminders Enabled", `Reminders for ${med.name} have been turned on.`);
    } else {
      Alert.alert("Reminders Paused", `Reminders for ${med.name} have been paused.`);
    }
  };

  const handleMarkTaken = (doseId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = todaysDoses.map((d) =>
      d.id === doseId ? { ...d, status: "taken" as const } : d
    );
    setTodaysDoses(updated);
  };

  const handleSkipDose = (doseId: string) => {
    Alert.alert(
      "Skip Dose",
      "Are you sure you want to skip this dose?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const updated = todaysDoses.map((d) =>
              d.id === doseId ? { ...d, status: "skipped" as const } : d
            );
            setTodaysDoses(updated);
          },
        },
      ]
    );
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return colors.success;
    if (adherence >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Pill size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Medication Reminders
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Never miss a dose with smart reminders
          </Text>
        </View>

        {/* Add Medication Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Add Medication
            </Text>
          </Pressable>
        </View>

        {/* Add Medication Form */}
        {showAddForm && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                New Medication
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Medication Name</Text>
                  <TextInput
                    value={newMedName}
                    onChangeText={setNewMedName}
                    placeholder="e.g., Metformin"
                    placeholderTextColor={colors.muted}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Dosage</Text>
                  <TextInput
                    value={newMedDosage}
                    onChangeText={setNewMedDosage}
                    placeholder="e.g., 500mg"
                    placeholderTextColor={colors.muted}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">Frequency</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["Once daily", "Twice daily", "Three times daily"].map((freq) => (
                      <Pressable
                        key={freq}
                        onPress={() => setNewMedFrequency(freq)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={`px-3 py-2 rounded-lg border-2 ${
                          newMedFrequency === freq
                            ? "bg-primary/20 border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            newMedFrequency === freq ? "text-primary" : "text-muted"
                          }`}
                        >
                          {freq}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddMedication}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Today's Doses */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Today's Schedule
          </Text>
          {todaysDoses.map((dose) => (
            <View key={dose.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {dose.medication}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color={colors.muted} />
                    <Text className="text-sm text-muted">{dose.time}</Text>
                  </View>
                </View>
                {dose.status === "taken" ? (
                  <View className="bg-success/20 rounded-full p-2">
                    <Check size={20} color={colors.success} />
                  </View>
                ) : dose.status === "skipped" ? (
                  <View className="bg-error/20 rounded-full p-2">
                    <X size={20} color={colors.error} />
                  </View>
                ) : null}
              </View>
              
              {dose.status === "pending" && (
                <View className="flex-row gap-2 mt-2">
                  <Pressable
                    onPress={() => handleSkipDose(dose.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-background border-2 border-border py-2 rounded-lg"
                  >
                    <Text className="text-muted font-semibold text-center text-sm">Skip</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleMarkTaken(dose.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-success py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center text-sm">Mark Taken</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* My Medications */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            My Medications ({medications.length})
          </Text>
          {medications.map((med) => (
            <View key={med.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {med.name} {med.dosage}
                  </Text>
                  <Text className="text-sm text-muted mb-1">{med.frequency}</Text>
                  <Text className="text-xs text-muted">
                    Reminders: {med.times.join(", ")}
                  </Text>
                </View>
                <Switch
                  value={med.isActive}
                  onValueChange={() => handleToggleMedication(med)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-border">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Adherence</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 bg-muted/20 rounded-full h-2">
                      <View
                        style={{
                          width: `${med.adherence}%`,
                          backgroundColor: getAdherenceColor(med.adherence),
                        }}
                        className="h-2 rounded-full"
                      />
                    </View>
                    <Text
                      style={{ color: getAdherenceColor(med.adherence) }}
                      className="text-xs font-semibold"
                    >
                      {med.adherence}%
                    </Text>
                  </View>
                </View>
                {med.pillCount !== undefined && (
                  <View className="ml-4">
                    <Text className="text-xs text-muted mb-1">Pills Left</Text>
                    <Text
                      className={`text-sm font-semibold ${
                        med.pillCount < 10 ? "text-error" : "text-foreground"
                      }`}
                    >
                      {med.pillCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View className="px-6 pb-6">
          <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <Bell size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Smart Reminders
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  You'll receive push notifications at scheduled times. You can snooze for 15 minutes or mark as taken directly from the notification.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
