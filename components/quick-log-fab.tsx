/**
 * QuickLogFAB — Sticky Floating Action Button for Quick Blood Sugar Log
 *
 * A persistent red 🩸 button fixed to the bottom-right corner of every screen.
 * Tapping it opens a compact 3-field mini-form (glucose, meal context, notes)
 * that saves a reading in under 10 seconds without navigating away.
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TAGS = ["Fasting", "Before Meal", "After Meal", "Bedtime", "Night Check"];
const STORAGE_KEY = "@jacs_bg_readings";

export function QuickLogFAB() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [glucose, setGlucose] = useState("");
  const [unit, setUnit] = useState<"mg/dL" | "mmol/L">("mg/dL");
  const [tag, setTag] = useState("Before Meal");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleOpen = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setOpen(true);
    setSaved(false);
    setGlucose("");
    setNotes("");
  };

  const handleSave = async () => {
    const val = parseFloat(glucose);
    if (isNaN(val) || val <= 0) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const mgVal = unit === "mmol/L" ? Math.round(val * 18) : Math.round(val);
    const reading = {
      id: Date.now().toString(),
      glucose: mgVal,
      unit: "mg/dL",
      tag,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      existing.unshift(reading);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 500)));
    } catch (e) {
      console.error("QuickLogFAB save error:", e);
    }

    setSaved(true);
    setTimeout(() => setOpen(false), 1200);
  };

  // Glucose status color
  const getStatusColor = () => {
    const val = parseFloat(glucose);
    if (isNaN(val)) return "#9BA1A6";
    const mg = unit === "mmol/L" ? val * 18 : val;
    if (mg < 70) return "#EF4444";
    if (mg <= 180) return "#22C55E";
    return "#F59E0B";
  };

  const getStatusLabel = () => {
    const val = parseFloat(glucose);
    if (isNaN(val)) return "";
    const mg = unit === "mmol/L" ? val * 18 : val;
    if (mg < 54) return "⚠️ CRITICAL LOW";
    if (mg < 70) return "🔴 Low";
    if (mg <= 180) return "🟢 In Range";
    if (mg <= 250) return "🟡 High";
    return "🔴 Very High";
  };

  // Bottom offset: above tab bar (approx 60px) + safe area
  const bottomOffset = 68 + Math.max(insets.bottom, 8);

  return (
    <>
      {/* FAB Button */}
      <Animated.View
        style={[
          styles.fab,
          { bottom: bottomOffset, transform: [{ scale: scaleAnim }] },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleOpen}
          style={({ pressed }) => [
            styles.fabBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityLabel="Quick log blood sugar"
          accessibilityRole="button"
        >
          <Text style={styles.fabEmoji}>🩸</Text>
        </Pressable>
      </Animated.View>

      {/* Quick Log Modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {saved ? (
              <View style={styles.savedContainer}>
                <Text style={styles.savedEmoji}>✅</Text>
                <Text style={styles.savedText}>Reading Saved!</Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>🩸 Quick Log</Text>
                  <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Glucose Input Row */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.glucoseInput, { borderColor: getStatusColor() }]}
                    value={glucose}
                    onChangeText={setGlucose}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    maxLength={6}
                    autoFocus
                    returnKeyType="done"
                    allowFontScaling={false}
                  />
                  <TouchableOpacity
                    style={styles.unitToggle}
                    onPress={() => setUnit(u => u === "mg/dL" ? "mmol/L" : "mg/dL")}
                  >
                    <Text style={styles.unitText}>{unit}</Text>
                    <Text style={styles.unitSwitch}>⇄</Text>
                  </TouchableOpacity>
                </View>

                {/* Status label */}
                {glucose.length > 0 && (
                  <Text style={[styles.statusLabel, { color: getStatusColor() }]} allowFontScaling={false}>
                    {getStatusLabel()}
                  </Text>
                )}

                {/* Meal Tags */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tagScroll}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
                >
                  {MEAL_TAGS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tagBtn, tag === t && styles.tagBtnActive]}
                      onPress={() => setTag(t)}
                    >
                      <Text style={[styles.tagText, tag === t && styles.tagTextActive]} allowFontScaling={false}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Notes */}
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Notes (optional)"
                  placeholderTextColor="#4B5563"
                  maxLength={120}
                  returnKeyType="done"
                  allowFontScaling={false}
                />

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, !glucose && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={!glucose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText} allowFontScaling={false}>
                    Save Reading
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    zIndex: 999,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  fabBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#991B1B",
    borderWidth: 2.5,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
  },
  fabEmoji: {
    fontSize: 26,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1.5,
    borderColor: "#EF444440",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#9BA1A6",
    fontSize: 14,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  glucoseInput: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    borderWidth: 2,
    color: "#F8FAFC",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  unitToggle: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 90,
  },
  unitText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  unitSwitch: {
    color: "#0EA5E9",
    fontSize: 16,
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  tagScroll: {
    marginBottom: 12,
  },
  tagBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tagBtnActive: {
    backgroundColor: "#7F1D1D",
    borderColor: "#EF4444",
  },
  tagText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  tagTextActive: {
    color: "#FCA5A5",
  },
  notesInput: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F8FAFC",
    fontSize: 14,
    padding: 12,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#991B1B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: "#FEF2F2",
    fontSize: 17,
    fontWeight: "900",
  },
  savedContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  savedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  savedText: {
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "900",
  },
});
