import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Medication Log Screen
 * 
 * Log when medications are taken with name, dosage, and time.
 */
export default function MedicationLogScreen() {
  const colors = useColors();
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

  const commonMedications = [
    "Lisinopril 10mg",
    "Metformin 500mg",
    "Atorvastatin 20mg",
    "Amlodipine 5mg",
    "Metoprolol 50mg",
    "Omeprazole 20mg",
  ];

  const handleSave = async () => {
    if (!medicationName.trim()) {
      Alert.alert("Error", "Please enter a medication name");
      return;
    }

    try {
      const entry = {
        id: Date.now().toString(),
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("medication_log");
      const log = existing ? JSON.parse(existing) : [];
      log.unshift(entry);
      
      // Keep last 200 entries
      if (log.length > 200) log.pop();
      
      await AsyncStorage.setItem("medication_log", JSON.stringify(log));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Medication logged successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save medication log");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              marginBottom: 16,
            })}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Log Medication
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            Record when you take your medications
          </Text>
        </View>

        {/* Common Medications */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 24 }}>
            Common Medications
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {commonMedications.map((med, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const [name, dose] = med.split(" ");
                  setMedicationName(name);
                  setDosage(dose);
                }}
                style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                  {med}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Medication Name */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Medication Name *
          </Text>
          <TextInput
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="e.g., Lisinopril"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Dosage */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Dosage
          </Text>
          <TextInput
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 10mg"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Taken with food"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
              textAlignVertical: "top",
              minHeight: 80,
            }}
          />
        </View>

        {/* Timestamp Info */}
        <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
            📅 Logged at: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 16,
            marginBottom: 32,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text className="text-xl font-bold text-center" style={{ color: "#fff", lineHeight: 28 }}>
            Save Medication Log
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
