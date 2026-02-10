import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Log Insulin Screen
 * 
 * Quick insulin logging from main dashboard.
 * Supports bolus/basal doses with type, amount, and timestamp.
 */

type InsulinType = "rapid-acting" | "short-acting" | "intermediate" | "long-acting";
type DoseType = "bolus" | "basal";

interface InsulinDose {
  id: string;
  doseType: DoseType;
  insulinType: InsulinType;
  amount: number;
  timestamp: Date;
  notes?: string;
}

export default function LogInsulinScreen() {
  const router = useRouter();
  const colors = useColors();

  const [doseType, setDoseType] = useState<DoseType>("bolus");
  const [insulinType, setInsulinType] = useState<InsulinType>("rapid-acting");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid insulin dose amount.");
      return;
    }

    if (amountNum > 100) {
      Alert.alert("Amount Too High", "Insulin dose seems unusually high. Please verify.");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create new dose entry
      const newDose: InsulinDose = {
        id: Date.now().toString(),
        doseType,
        insulinType,
        amount: amountNum,
        timestamp: new Date(),
        notes: notes.trim() || undefined,
      };

      // Load existing doses
      const existingData = await AsyncStorage.getItem("insulin_doses");
      const existingDoses: InsulinDose[] = existingData ? JSON.parse(existingData) : [];

      // Add new dose
      existingDoses.unshift(newDose);

      // Keep only last 100 doses
      const trimmedDoses = existingDoses.slice(0, 100);

      // Save to AsyncStorage
      await AsyncStorage.setItem("insulin_doses", JSON.stringify(trimmedDoses));

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Insulin Logged",
        `${amountNum} units of ${insulinType} ${doseType} logged successfully.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("[LogInsulin] Error saving dose:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save insulin dose. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-border">
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 8,
          })}
        >
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
          Log Insulin
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Dose Type Selection */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Dose Type
        </Text>
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => {
              setDoseType("bolus");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => ({
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: doseType === "bolus" ? colors.primary : colors.surface,
              borderWidth: 2,
              borderColor: doseType === "bolus" ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: doseType === "bolus" ? "#ffffff" : colors.foreground,
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              Bolus
            </Text>
            <Text
              className="text-center text-sm mt-1"
              style={{
                color: doseType === "bolus" ? "#ffffff" : colors.muted,
                lineHeight: 20,
              }}
            >
              Mealtime
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setDoseType("basal");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => ({
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: doseType === "basal" ? colors.primary : colors.surface,
              borderWidth: 2,
              borderColor: doseType === "basal" ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: doseType === "basal" ? "#ffffff" : colors.foreground,
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              Basal
            </Text>
            <Text
              className="text-center text-sm mt-1"
              style={{
                color: doseType === "basal" ? "#ffffff" : colors.muted,
                lineHeight: 20,
              }}
            >
              Background
            </Text>
          </Pressable>
        </View>

        {/* Insulin Type Selection */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Insulin Type
        </Text>
        <View className="gap-3 mb-6">
          {[
            { value: "rapid-acting", label: "Rapid-Acting", subtitle: "Humalog, NovoLog, Apidra" },
            { value: "short-acting", label: "Short-Acting", subtitle: "Regular (R)" },
            { value: "intermediate", label: "Intermediate", subtitle: "NPH (N)" },
            { value: "long-acting", label: "Long-Acting", subtitle: "Lantus, Levemir, Tresiba" },
          ].map((type) => (
            <Pressable
              key={type.value}
              onPress={() => {
                setInsulinType(type.value as InsulinType);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => ({
                padding: 16,
                borderRadius: 12,
                backgroundColor: insulinType === type.value ? `${colors.primary}20` : colors.surface,
                borderWidth: 2,
                borderColor: insulinType === type.value ? colors.primary : colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground" style={{ lineHeight: 24 }}>
                    {type.label}
                  </Text>
                  <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
                    {type.subtitle}
                  </Text>
                </View>
                {insulinType === type.value && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Amount Input */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Amount (units)
        </Text>
        <View className="flex-row items-center gap-3 mb-6">
          <TextInput
            className="flex-1 bg-surface border-2 border-border rounded-xl px-4 py-4 text-foreground text-lg"
            placeholder="0.0"
            placeholderTextColor={colors.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="done"
            style={{ fontSize: 18, lineHeight: 26 }}
          />
          <Text className="text-lg text-muted" style={{ lineHeight: 26 }}>
            units
          </Text>
        </View>

        {/* Quick Amount Buttons */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[1, 2, 5, 10, 15, 20].map((quickAmount) => (
            <Pressable
              key={quickAmount}
              onPress={() => {
                setAmount(quickAmount.toString());
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-base font-medium text-foreground" style={{ lineHeight: 22 }}>
                {quickAmount}U
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Notes Input */}
        <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
          Notes (Optional)
        </Text>
        <TextInput
          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-foreground text-base mb-8"
          placeholder="e.g., Before breakfast, correction dose"
          placeholderTextColor={colors.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ fontSize: 16, lineHeight: 24, minHeight: 80 }}
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 32,
            opacity: pressed || isSaving ? 0.7 : 1,
          })}
        >
          <Text className="text-white text-lg font-bold" style={{ lineHeight: 26 }}>
            {isSaving ? "Saving..." : "Save Insulin Dose"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
