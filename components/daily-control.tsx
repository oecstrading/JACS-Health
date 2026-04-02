/**
 * Daily Control Components
 * Migration-aligned: DailyProgressBar, EveningReflection, MealPlannerCard,
 *                    MidDayVitalCheck, MorningResetCard
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

// ─── DailyProgressBar ─────────────────────────────────────────────────────────

export interface DailyTask {
  id: string;
  label: string;
  category: "medication" | "vitals" | "exercise" | "diet" | "hydration" | "sleep";
  completed: boolean;
  time?: string;
}

const CATEGORY_COLORS: Record<DailyTask["category"], string> = {
  medication: "#EF4444",
  vitals: "#0a7ea4",
  exercise: "#22C55E",
  diet: "#F59E0B",
  hydration: "#6366F1",
  sleep: "#8B5CF6",
};

export function DailyProgressBar({ tasks, onToggle }: { tasks: DailyTask[]; onToggle: (id: string) => void }) {
  const colors = useColors();
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? completed / total : 0;
  const pct = Math.round(progress * 100);

  const progressColor =
    pct === 100 ? colors.success : pct >= 60 ? colors.primary : pct >= 30 ? colors.warning : colors.error;

  return (
    <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: colors.foreground }]}>Today's Progress</Text>
        <Text style={[styles.progressPct, { color: progressColor }]}>{pct}%</Text>
      </View>

      {/* Bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: progressColor }]} />
      </View>
      <Text style={[styles.progressCount, { color: colors.muted }]}>
        {completed} of {total} tasks completed
      </Text>

      {/* Category breakdown */}
      <View style={styles.categoryRow}>
        {(Object.keys(CATEGORY_COLORS) as DailyTask["category"][]).map((cat) => {
          const catTasks = tasks.filter((t) => t.category === cat);
          if (catTasks.length === 0) return null;
          const catDone = catTasks.filter((t) => t.completed).length;
          return (
            <View key={cat} style={styles.categoryItem}>
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
              <Text style={[styles.categoryLabel, { color: colors.muted }]}>
                {catDone}/{catTasks.length}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Task list */}
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskRow, { borderBottomColor: colors.border }]}
          onPress={() => {
            onToggle(task.id);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <View
            style={[
              styles.taskCheck,
              {
                backgroundColor: task.completed ? CATEGORY_COLORS[task.category] : "transparent",
                borderColor: task.completed ? CATEGORY_COLORS[task.category] : colors.border,
              },
            ]}
          >
            {task.completed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text
            style={[
              styles.taskLabel,
              {
                color: task.completed ? colors.muted : colors.foreground,
                textDecorationLine: task.completed ? "line-through" : "none",
              },
            ]}
          >
            {task.label}
          </Text>
          {task.time && (
            <Text style={[styles.taskTime, { color: colors.muted }]}>{task.time}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── MorningResetCard ─────────────────────────────────────────────────────────

export interface MorningData {
  weight?: number;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  mood: 1 | 2 | 3 | 4 | 5;
  sleepHours?: number;
  notes?: string;
}

const MOOD_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const MOOD_COLORS = ["", "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#0a7ea4"];
const MOOD_EMOJIS = ["", "😞", "😕", "😐", "😊", "😄"];

export function MorningResetCard({
  onSave,
}: {
  onSave: (data: MorningData) => void;
}) {
  const colors = useColors();
  const [data, setData] = useState<MorningData>({ mood: 3 });
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    onSave(data);
    setSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [data, onSave]);

  if (saved) {
    return (
      <View style={[styles.savedCard, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
        <Text style={styles.savedEmoji}>🌅</Text>
        <Text style={[styles.savedTitle, { color: colors.success }]}>Morning Check-In Complete!</Text>
        <Text style={[styles.savedSubtitle, { color: colors.muted }]}>Great start to your day.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.morningCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.morningHeader}>
        <Text style={styles.morningEmoji}>🌅</Text>
        <View>
          <Text style={[styles.morningTitle, { color: colors.foreground }]}>Morning Check-In</Text>
          <Text style={[styles.morningSubtitle, { color: colors.muted }]}>
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>
      </View>

      {/* Mood selector */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {([1, 2, 3, 4, 5] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.moodBtn,
              {
                backgroundColor: data.mood === m ? MOOD_COLORS[m] + "20" : colors.background,
                borderColor: data.mood === m ? MOOD_COLORS[m] : colors.border,
                borderWidth: data.mood === m ? 2 : 1,
              },
            ]}
            onPress={() => setData((p) => ({ ...p, mood: m }))}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
            <Text style={[styles.moodLabel, { color: data.mood === m ? MOOD_COLORS[m] : colors.muted }]}>
              {MOOD_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vitals row */}
      <View style={styles.vitalsGrid}>
        {[
          { key: "weight", label: "Weight (lbs)", placeholder: "e.g. 165" },
          { key: "systolic", label: "Systolic (mmHg)", placeholder: "e.g. 120" },
          { key: "diastolic", label: "Diastolic (mmHg)", placeholder: "e.g. 80" },
          { key: "glucose", label: "Glucose (mg/dL)", placeholder: "e.g. 95" },
          { key: "sleepHours", label: "Sleep (hours)", placeholder: "e.g. 7.5" },
        ].map((f) => (
          <View key={f.key} style={styles.vitalField}>
            <Text style={[styles.vitalLabel, { color: colors.muted }]}>{f.label}</Text>
            <TextInput
              style={[styles.vitalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={f.placeholder}
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              returnKeyType="done"
              value={(data as any)[f.key] ? String((data as any)[f.key]) : ""}
              onChangeText={(v) => {
                const n = parseFloat(v);
                setData((p) => ({ ...p, [f.key]: isNaN(n) ? undefined : n }));
              }}
            />
          </View>
        ))}
      </View>

      {/* Notes */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>Morning notes (optional)</Text>
      <TextInput
        style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        placeholder="How did you sleep? Any symptoms?"
        placeholderTextColor={colors.muted}
        multiline
        value={data.notes || ""}
        onChangeText={(v) => setData((p) => ({ ...p, notes: v }))}
      />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Morning Check-In</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MidDayVitalCheck ─────────────────────────────────────────────────────────

export function MidDayVitalCheck({ onSave }: { onSave: (data: Record<string, number>) => void }) {
  const colors = useColors();
  const [vitals, setVitals] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const MIDDAY_VITALS = [
    { key: "systolic", label: "Systolic BP", unit: "mmHg", icon: "🩸" },
    { key: "diastolic", label: "Diastolic BP", unit: "mmHg", icon: "🩸" },
    { key: "glucose", label: "Blood Glucose", unit: "mg/dL", icon: "💉" },
    { key: "hr", label: "Heart Rate", unit: "bpm", icon: "❤️" },
    { key: "o2", label: "Oxygen Sat", unit: "%", icon: "🫁" },
  ];

  const handleSave = useCallback(() => {
    const parsed: Record<string, number> = {};
    Object.entries(vitals).forEach(([k, v]) => {
      const n = parseFloat(v);
      if (!isNaN(n)) parsed[k] = n;
    });
    onSave(parsed);
    setSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [vitals, onSave]);

  if (saved) {
    return (
      <View style={[styles.savedCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary }]}>
        <Text style={styles.savedEmoji}>☀️</Text>
        <Text style={[styles.savedTitle, { color: colors.primary }]}>Mid-Day Vitals Logged!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.midDayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.morningHeader}>
        <Text style={styles.morningEmoji}>☀️</Text>
        <View>
          <Text style={[styles.morningTitle, { color: colors.foreground }]}>Mid-Day Vital Check</Text>
          <Text style={[styles.morningSubtitle, { color: colors.muted }]}>
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
      <View style={styles.vitalsGrid}>
        {MIDDAY_VITALS.map((v) => (
          <View key={v.key} style={styles.vitalField}>
            <Text style={[styles.vitalLabel, { color: colors.muted }]}>{v.icon} {v.label}</Text>
            <TextInput
              style={[styles.vitalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={v.unit}
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              returnKeyType="done"
              value={vitals[v.key] || ""}
              onChangeText={(val) => setVitals((p) => ({ ...p, [v.key]: val }))}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Log Mid-Day Vitals</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── EveningReflection ────────────────────────────────────────────────────────

export interface EveningData {
  overallDay: 1 | 2 | 3 | 4 | 5;
  symptoms: string[];
  notes: string;
  tomorrowGoal: string;
}

const COMMON_SYMPTOMS = [
  "Headache", "Fatigue", "Dizziness", "Chest Pain", "Shortness of Breath",
  "Nausea", "Swelling", "Blurred Vision", "Palpitations", "Pain",
];

export function EveningReflection({ onSave }: { onSave: (data: EveningData) => void }) {
  const colors = useColors();
  const [data, setData] = useState<EveningData>({ overallDay: 3, symptoms: [], notes: "", tomorrowGoal: "" });
  const [saved, setSaved] = useState(false);

  const toggleSymptom = useCallback((s: string) => {
    setData((p) => ({
      ...p,
      symptoms: p.symptoms.includes(s) ? p.symptoms.filter((x) => x !== s) : [...p.symptoms, s],
    }));
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSave = useCallback(() => {
    onSave(data);
    setSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [data, onSave]);

  if (saved) {
    return (
      <View style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.savedEmoji}>🌙</Text>
        <Text style={[styles.savedTitle, { color: colors.foreground }]}>Evening Reflection Saved!</Text>
        <Text style={[styles.savedSubtitle, { color: colors.muted }]}>Rest well tonight.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.eveningCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.morningHeader}>
        <Text style={styles.morningEmoji}>🌙</Text>
        <View>
          <Text style={[styles.morningTitle, { color: colors.foreground }]}>Evening Reflection</Text>
          <Text style={[styles.morningSubtitle, { color: colors.muted }]}>End-of-day health summary</Text>
        </View>
      </View>

      {/* Day rating */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>How was your health today?</Text>
      <View style={styles.moodRow}>
        {([1, 2, 3, 4, 5] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.moodBtn,
              {
                backgroundColor: data.overallDay === m ? MOOD_COLORS[m] + "20" : colors.background,
                borderColor: data.overallDay === m ? MOOD_COLORS[m] : colors.border,
                borderWidth: data.overallDay === m ? 2 : 1,
              },
            ]}
            onPress={() => setData((p) => ({ ...p, overallDay: m }))}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
            <Text style={[styles.moodLabel, { color: data.overallDay === m ? MOOD_COLORS[m] : colors.muted }]}>
              {MOOD_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Symptoms */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>Any symptoms today? (select all that apply)</Text>
      <View style={styles.symptomsGrid}>
        {COMMON_SYMPTOMS.map((s) => {
          const isSelected = data.symptoms.includes(s);
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.symptomChip,
                {
                  backgroundColor: isSelected ? colors.error + "15" : colors.background,
                  borderColor: isSelected ? colors.error : colors.border,
                },
              ]}
              onPress={() => toggleSymptom(s)}
            >
              <Text style={[styles.symptomText, { color: isSelected ? colors.error : colors.muted }]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notes for your doctor</Text>
      <TextInput
        style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        placeholder="Any observations, concerns, or questions for your next visit..."
        placeholderTextColor={colors.muted}
        multiline
        value={data.notes}
        onChangeText={(v) => setData((p) => ({ ...p, notes: v }))}
      />

      {/* Tomorrow's goal */}
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>Tomorrow's health goal</Text>
      <TextInput
        style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        placeholder="e.g. Take all medications on time, walk 20 minutes"
        placeholderTextColor={colors.muted}
        value={data.tomorrowGoal}
        onChangeText={(v) => setData((p) => ({ ...p, tomorrowGoal: v }))}
      />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#6366F1" }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Evening Reflection</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MealPlannerCard ──────────────────────────────────────────────────────────

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  logged: boolean;
}

const MEAL_ICONS: Record<Meal["type"], string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

export function MealPlannerCard({ meals, onToggle, onAdd }: {
  meals: Meal[];
  onToggle: (id: string) => void;
  onAdd?: (meal: Omit<Meal, "id" | "logged">) => void;
}) {
  const colors = useColors();
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({ type: "breakfast" });

  const totalCalories = meals.filter((m) => m.logged).reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalCarbs = meals.filter((m) => m.logged).reduce((sum, m) => sum + (m.carbs || 0), 0);

  const handleAdd = useCallback(() => {
    if (!newMeal.name?.trim()) return;
    onAdd?.({
      type: newMeal.type || "breakfast",
      name: newMeal.name,
      calories: newMeal.calories,
      carbs: newMeal.carbs,
      protein: newMeal.protein,
      fat: newMeal.fat,
    });
    setNewMeal({ type: "breakfast" });
    setShowAdd(false);
  }, [newMeal, onAdd]);

  const mealTypes: Meal["type"][] = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.mealHeader}>
        <Text style={[styles.morningTitle, { color: colors.foreground }]}>🍽️ Meal Planner</Text>
        <View style={styles.mealTotals}>
          <Text style={[styles.mealTotalText, { color: colors.primary }]}>{totalCalories} kcal</Text>
          <Text style={[styles.mealTotalText, { color: colors.warning }]}>{totalCarbs}g carbs</Text>
        </View>
      </View>

      {mealTypes.map((mType) => {
        const typeMeals = meals.filter((m) => m.type === mType);
        return (
          <View key={mType} style={[styles.mealSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.mealTypeLabel, { color: colors.foreground }]}>
              {MEAL_ICONS[mType]} {mType.charAt(0).toUpperCase() + mType.slice(1)}
            </Text>
            {typeMeals.length === 0 ? (
              <Text style={[styles.mealEmpty, { color: colors.muted }]}>Not planned</Text>
            ) : (
              typeMeals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={[styles.mealRow, { borderBottomColor: colors.border }]}
                  onPress={() => onToggle(meal.id)}
                >
                  <View
                    style={[
                      styles.mealCheck,
                      {
                        backgroundColor: meal.logged ? colors.success : "transparent",
                        borderColor: meal.logged ? colors.success : colors.border,
                      },
                    ]}
                  >
                    {meal.logged && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.mealName, { color: meal.logged ? colors.muted : colors.foreground, textDecorationLine: meal.logged ? "line-through" : "none" }]}>
                    {meal.name}
                  </Text>
                  {meal.calories ? (
                    <Text style={[styles.mealCalories, { color: colors.muted }]}>{meal.calories} kcal</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </View>
        );
      })}

      {showAdd ? (
        <View style={[styles.addMealForm, { borderTopColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealTypeRow}>
            {mealTypes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.mealTypeChip, { backgroundColor: newMeal.type === t ? colors.primary : colors.background, borderColor: newMeal.type === t ? colors.primary : colors.border }]}
                onPress={() => setNewMeal((p) => ({ ...p, type: t }))}
              >
                <Text style={[styles.mealTypeChipText, { color: newMeal.type === t ? "#fff" : colors.muted }]}>{MEAL_ICONS[t]} {t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={[styles.mealNameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Meal name (e.g. Oatmeal with berries)"
            placeholderTextColor={colors.muted}
            value={newMeal.name || ""}
            onChangeText={(v) => setNewMeal((p) => ({ ...p, name: v }))}
          />
          <View style={styles.mealNutritionRow}>
            {[
              { key: "calories", placeholder: "Calories" },
              { key: "carbs", placeholder: "Carbs (g)" },
              { key: "protein", placeholder: "Protein (g)" },
              { key: "fat", placeholder: "Fat (g)" },
            ].map((f) => (
              <TextInput
                key={f.key}
                style={[styles.mealNutritionInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder={f.placeholder}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                returnKeyType="done"
                value={(newMeal as any)[f.key] ? String((newMeal as any)[f.key]) : ""}
                onChangeText={(v) => {
                  const n = parseFloat(v);
                  setNewMeal((p) => ({ ...p, [f.key]: isNaN(n) ? undefined : n }));
                }}
              />
            ))}
          </View>
          <View style={styles.addMealButtons}>
            <TouchableOpacity style={[styles.cancelMealBtn, { borderColor: colors.border }]} onPress={() => setShowAdd(false)}>
              <Text style={[styles.cancelMealText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addMealBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.addMealBtnText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={[styles.addMealTrigger, { borderColor: colors.primary }]} onPress={() => setShowAdd(true)}>
          <Text style={[styles.addMealTriggerText, { color: colors.primary }]}>+ Add Meal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // DailyProgressBar
  progressCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 17, fontWeight: "700" },
  progressPct: { fontSize: 22, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressCount: { fontSize: 12 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { fontSize: 11 },
  taskRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, gap: 10 },
  taskCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "800" },
  taskLabel: { flex: 1, fontSize: 15 },
  taskTime: { fontSize: 12 },

  // Shared morning/evening
  savedCard: { padding: 20, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  savedEmoji: { fontSize: 36 },
  savedTitle: { fontSize: 18, fontWeight: "700" },
  savedSubtitle: { fontSize: 14 },
  morningCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  midDayCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  eveningCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  morningHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  morningEmoji: { fontSize: 32 },
  morningTitle: { fontSize: 18, fontWeight: "700" },
  morningSubtitle: { fontSize: 13 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  moodRow: { flexDirection: "row", gap: 6 },
  moodBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 4 },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 10, fontWeight: "600" },
  vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  vitalField: { width: "48%" as any, gap: 4 },
  vitalLabel: { fontSize: 11, fontWeight: "600" },
  vitalInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, fontWeight: "700" },
  notesInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, minHeight: 72 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  symptomsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  symptomChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  symptomText: { fontSize: 13, fontWeight: "600" },

  // MealPlannerCard
  mealCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealTotals: { flexDirection: "row", gap: 10 },
  mealTotalText: { fontSize: 13, fontWeight: "700" },
  mealSection: { paddingTop: 10, borderTopWidth: 0.5, gap: 4 },
  mealTypeLabel: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  mealEmpty: { fontSize: 13, fontStyle: "italic" },
  mealRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 0.5, gap: 10 },
  mealCheck: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  mealName: { flex: 1, fontSize: 14 },
  mealCalories: { fontSize: 12 },
  addMealForm: { paddingTop: 12, borderTopWidth: 0.5, gap: 8 },
  mealTypeRow: { flexDirection: "row" },
  mealTypeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, marginRight: 8 },
  mealTypeChipText: { fontSize: 12, fontWeight: "600" },
  mealNameInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  mealNutritionRow: { flexDirection: "row", gap: 6 },
  mealNutritionInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, textAlign: "center" },
  addMealButtons: { flexDirection: "row", gap: 10 },
  cancelMealBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelMealText: { fontSize: 14, fontWeight: "600" },
  addMealBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  addMealBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  addMealTrigger: { paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", borderStyle: "dashed" },
  addMealTriggerText: { fontSize: 14, fontWeight: "600" },
});
