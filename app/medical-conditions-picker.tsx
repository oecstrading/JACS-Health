import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useActiveConditions, type ConditionId } from "@/hooks/use-health-platform";

const CONDITIONS_KEY = "jacs_selected_conditions";

interface ConditionOption {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  conditionId?: ConditionId;
}

const ALL_CONDITIONS: ConditionOption[] = [
  // Cardiovascular
  { id: "hypertension", label: "Hypertension", description: "High blood pressure (≥130/80 mmHg)", category: "Cardiovascular", icon: "🩸", conditionId: "hypertension" },
  { id: "chf", label: "Heart Failure (CHF)", description: "Congestive heart failure", category: "Cardiovascular", icon: "💓", conditionId: "chf" },
  { id: "afib", label: "Atrial Fibrillation", description: "Irregular heart rhythm", category: "Cardiovascular", icon: "❤️" },
  { id: "cad", label: "Coronary Artery Disease", description: "Narrowed heart arteries", category: "Cardiovascular", icon: "🫀" },
  // Metabolic
  { id: "diabetes_t1", label: "Type 1 Diabetes", description: "Insulin-dependent diabetes", category: "Metabolic", icon: "💉", conditionId: "diabetes" },
  { id: "diabetes_t2", label: "Type 2 Diabetes", description: "Non-insulin-dependent diabetes", category: "Metabolic", icon: "💉", conditionId: "diabetes" },
  { id: "prediabetes", label: "Prediabetes", description: "Blood sugar above normal range", category: "Metabolic", icon: "🩺" },
  { id: "obesity", label: "Obesity", description: "BMI ≥ 30", category: "Metabolic", icon: "⚖️" },
  { id: "thyroid", label: "Thyroid Disorder", description: "Hypo or hyperthyroidism", category: "Metabolic", icon: "🦋" },
  // Kidney
  { id: "ckd", label: "Chronic Kidney Disease", description: "Reduced kidney function", category: "Kidney", icon: "🫘", conditionId: "ckd" },
  { id: "kidney_stones", label: "Kidney Stones", description: "Recurrent nephrolithiasis", category: "Kidney", icon: "🪨" },
  // Respiratory
  { id: "asthma", label: "Asthma", description: "Chronic airway inflammation", category: "Respiratory", icon: "🫁" },
  { id: "copd", label: "COPD", description: "Chronic obstructive pulmonary disease", category: "Respiratory", icon: "💨" },
  { id: "sleep_apnea", label: "Sleep Apnea", description: "Interrupted breathing during sleep", category: "Respiratory", icon: "😴" },
  // Neurological
  { id: "stroke", label: "Stroke / TIA", description: "History of stroke or mini-stroke", category: "Neurological", icon: "🧠" },
  { id: "epilepsy", label: "Epilepsy", description: "Seizure disorder", category: "Neurological", icon: "⚡" },
  { id: "parkinsons", label: "Parkinson's Disease", description: "Progressive nervous system disorder", category: "Neurological", icon: "🤲" },
  // Musculoskeletal
  { id: "arthritis", label: "Arthritis", description: "Joint inflammation and pain", category: "Musculoskeletal", icon: "🦴" },
  { id: "osteoporosis", label: "Osteoporosis", description: "Reduced bone density", category: "Musculoskeletal", icon: "🦷" },
  // Mental Health
  { id: "depression", label: "Depression", description: "Major depressive disorder", category: "Mental Health", icon: "🌧️" },
  { id: "anxiety", label: "Anxiety Disorder", description: "Generalized anxiety disorder", category: "Mental Health", icon: "😰" },
  { id: "dementia", label: "Dementia / Alzheimer's", description: "Progressive cognitive decline", category: "Mental Health", icon: "🧩" },
  // Other
  { id: "cancer", label: "Cancer (Active/History)", description: "Current or past cancer diagnosis", category: "Other", icon: "🎗️" },
  { id: "hiv", label: "HIV/AIDS", description: "Human immunodeficiency virus", category: "Other", icon: "🔴" },
  { id: "lupus", label: "Lupus", description: "Systemic lupus erythematosus", category: "Other", icon: "🦋" },
];

const CATEGORIES = [...new Set(ALL_CONDITIONS.map((c) => c.category))];

export default function MedicalConditionsPickerScreen() {
  const colors = useColors();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { setActiveConditions } = useActiveConditions();

  useEffect(() => {
    AsyncStorage.getItem(CONDITIONS_KEY).then((val) => {
      if (val) try { setSelected(new Set(JSON.parse(val))); } catch { /* ignore */ }
    });
  }, []);

  const toggleCondition = useCallback(async (conditionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(conditionId)) next.delete(conditionId);
      else next.add(conditionId);
      return next;
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const saveAndExit = useCallback(async () => {
    const selectedArray = [...selected];
    await AsyncStorage.setItem(CONDITIONS_KEY, JSON.stringify(selectedArray));

    // Map to ConditionId for the active conditions hook
    const conditionIds = new Set<ConditionId>(["standard"]);
    ALL_CONDITIONS.filter((c) => selected.has(c.id) && c.conditionId).forEach((c) => {
      if (c.conditionId) conditionIds.add(c.conditionId);
    });
    await setActiveConditions([...conditionIds]);

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [selected, setActiveConditions]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Medical Conditions</Text>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveAndExit}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Select all conditions that apply. This personalizes your care plan and alert thresholds.
        </Text>

        <View style={[styles.selectedBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
          <Text style={[styles.selectedText, { color: colors.primary }]}>
            {selected.size} condition{selected.size !== 1 ? "s" : ""} selected
          </Text>
        </View>

        {CATEGORIES.map((category) => {
          const catConditions = ALL_CONDITIONS.filter((c) => c.category === category);
          return (
            <View key={category}>
              <Text style={[styles.categoryTitle, { color: colors.foreground }]}>{category}</Text>
              {catConditions.map((condition) => {
                const isSelected = selected.has(condition.id);
                return (
                  <TouchableOpacity
                    key={condition.id}
                    style={[
                      styles.conditionRow,
                      {
                        backgroundColor: isSelected ? colors.primary + "10" : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleCondition(condition.id)}
                  >
                    <Text style={styles.conditionIcon}>{condition.icon}</Text>
                    <View style={styles.conditionInfo}>
                      <Text style={[styles.conditionLabel, { color: colors.foreground }]}>{condition.label}</Text>
                      <Text style={[styles.conditionDesc, { color: colors.muted }]}>{condition.description}</Text>
                    </View>
                    <View style={[styles.checkbox, { backgroundColor: isSelected ? colors.primary : "transparent", borderColor: isSelected ? colors.primary : colors.border }]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  selectedBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: "flex-start" },
  selectedText: { fontSize: 14, fontWeight: "700" },
  categoryTitle: { fontSize: 15, fontWeight: "800", marginTop: 12, marginBottom: 6 },
  conditionRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6, gap: 12 },
  conditionIcon: { fontSize: 22 },
  conditionInfo: { flex: 1, gap: 2 },
  conditionLabel: { fontSize: 15, fontWeight: "600" },
  conditionDesc: { fontSize: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
