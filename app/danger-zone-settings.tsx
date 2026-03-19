import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const THRESHOLDS_KEY = "jacs_alert_thresholds";

interface Thresholds {
  systolic_warn: number;
  systolic_critical: number;
  diastolic_warn: number;
  diastolic_critical: number;
  glucose_high_warn: number;
  glucose_high_critical: number;
  glucose_low_warn: number;
  glucose_low_critical: number;
  hr_high_warn: number;
  hr_high_critical: number;
  hr_low_warn: number;
  weight_gain_warn: number;
  o2_warn: number;
  o2_critical: number;
}

const DEFAULTS: Thresholds = {
  systolic_warn: 140, systolic_critical: 180,
  diastolic_warn: 90, diastolic_critical: 120,
  glucose_high_warn: 180, glucose_high_critical: 250,
  glucose_low_warn: 70, glucose_low_critical: 54,
  hr_high_warn: 100, hr_high_critical: 120,
  hr_low_warn: 50,
  weight_gain_warn: 2,
  o2_warn: 94, o2_critical: 90,
};

const THRESHOLD_GROUPS = [
  {
    title: "Blood Pressure (mmHg)",
    icon: "🩸",
    fields: [
      { key: "systolic_warn", label: "Systolic Warning", direction: "above" },
      { key: "systolic_critical", label: "Systolic Critical", direction: "above" },
      { key: "diastolic_warn", label: "Diastolic Warning", direction: "above" },
      { key: "diastolic_critical", label: "Diastolic Critical", direction: "above" },
    ],
  },
  {
    title: "Blood Glucose (mg/dL)",
    icon: "💉",
    fields: [
      { key: "glucose_high_warn", label: "High Warning", direction: "above" },
      { key: "glucose_high_critical", label: "High Critical", direction: "above" },
      { key: "glucose_low_warn", label: "Low Warning", direction: "below" },
      { key: "glucose_low_critical", label: "Low Critical", direction: "below" },
    ],
  },
  {
    title: "Heart Rate (bpm)",
    icon: "❤️",
    fields: [
      { key: "hr_high_warn", label: "High Warning", direction: "above" },
      { key: "hr_high_critical", label: "High Critical", direction: "above" },
      { key: "hr_low_warn", label: "Low Warning", direction: "below" },
    ],
  },
  {
    title: "Other Metrics",
    icon: "📊",
    fields: [
      { key: "weight_gain_warn", label: "Weight Gain Warning (lbs/day)", direction: "above" },
      { key: "o2_warn", label: "Oxygen Sat Warning (%)", direction: "below" },
      { key: "o2_critical", label: "Oxygen Sat Critical (%)", direction: "below" },
    ],
  },
];

export default function DangerZoneSettingsScreen() {
  const colors = useColors();
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULTS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THRESHOLDS_KEY).then((val) => {
      if (val) {
        try { setThresholds({ ...DEFAULTS, ...JSON.parse(val) }); } catch { /* ignore */ }
      }
    });
  }, []);

  const updateField = useCallback((key: keyof Thresholds, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setThresholds((prev) => ({ ...prev, [key]: num }));
      setHasChanges(true);
    }
  }, []);

  const saveThresholds = useCallback(async () => {
    await AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
    setHasChanges(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Alert thresholds updated successfully.");
  }, [thresholds]);

  const resetToDefaults = useCallback(() => {
    Alert.alert("Reset Thresholds", "Reset all thresholds to clinical defaults?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: async () => {
          setThresholds(DEFAULTS);
          await AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(DEFAULTS));
          setHasChanges(false);
        },
      },
    ]);
  }, []);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Alert Thresholds</Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
          <Text style={[styles.warningText, { color: colors.foreground }]}>
            ⚠️ These thresholds determine when the app sends health alerts. Consult your doctor before changing clinical values.
          </Text>
        </View>

        {THRESHOLD_GROUPS.map((group) => (
          <View key={group.title} style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <Text style={[styles.groupTitle, { color: colors.foreground }]}>{group.title}</Text>
            </View>
            {group.fields.map((field) => (
              <View key={field.key} style={[styles.fieldRow, { borderBottomColor: colors.border }]}>
                <View style={styles.fieldInfo}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
                  <Text style={[styles.fieldDirection, { color: colors.muted }]}>
                    Alert when {field.direction} this value
                  </Text>
                </View>
                <TextInput
                  style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  value={String(thresholds[field.key as keyof Thresholds])}
                  onChangeText={(v) => updateField(field.key as keyof Thresholds, v)}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.resetBtn, { borderColor: colors.border }]} onPress={resetToDefaults}>
            <Text style={[styles.resetBtnText, { color: colors.muted }]}>Reset Defaults</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: hasChanges ? colors.primary : colors.border }]}
            onPress={saveThresholds}
            disabled={!hasChanges}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  warningBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  warningText: { fontSize: 13, lineHeight: 20 },
  groupCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 2 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  groupIcon: { fontSize: 20 },
  groupTitle: { fontSize: 16, fontWeight: "700" },
  fieldRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, gap: 12 },
  fieldInfo: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  fieldDirection: { fontSize: 11 },
  fieldInput: { width: 72, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, fontWeight: "700", textAlign: "center" },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  resetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  resetBtnText: { fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
