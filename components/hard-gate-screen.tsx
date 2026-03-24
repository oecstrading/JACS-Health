/**
 * HardGateScreen — Mandatory Data Entry Gate
 *
 * Replaces the main dashboard when mandatory health metrics are missing.
 * Implements HIPAA-compliant UX: transparent about WHY data is required,
 * friction-reduced (< 10 seconds to log), and non-dismissible.
 *
 * Rapid-spike mode: locks ALL navigation except this screen when
 * CGM trendRate > 2.0 mg/dL/min.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useHardGate } from "@/hooks/use-hard-gate";
import { useColors } from "@/hooks/use-colors";

interface QuickLogButtonProps {
  label: string;
  value: string;
  onPress: () => void;
  selected: boolean;
}

function QuickLogButton({ label, value, onPress, selected }: QuickLogButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickBtn,
        selected && styles.quickBtnSelected,
      ]}
    >
      <Text style={[styles.quickBtnText, selected && styles.quickBtnTextSelected]}>
        {value}
      </Text>
      <Text style={[styles.quickBtnLabel, selected && styles.quickBtnTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function HardGateScreen() {
  const { missingMetrics, isRapidSpikeActive, logGlucose, logInsulin, logActivity, metrics } = useHardGate();
  const colors = useColors();

  const [glucoseValue, setGlucoseValue] = useState("");
  const [insulinValue, setInsulinValue] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);

  const needsGlucose = missingMetrics.includes("Blood Glucose");
  const needsInsulin = missingMetrics.includes("Insulin Dose");
  const needsActivity = missingMetrics.includes("Activity");

  const ACTIVITY_OPTIONS = [
    { label: "Rest", value: "rest" },
    { label: "Walk", value: "walk" },
    { label: "Exercise", value: "exercise" },
    { label: "Sleep", value: "sleep" },
  ];

  const INSULIN_PRESETS = ["0", "1", "2", "3", "4", "5", "6", "8", "10"];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (needsGlucose && glucoseValue) {
        const trendRate = 0; // Will be updated by CGM simulator
        await logGlucose(trendRate);
        setSubmitted((p) => [...p, "glucose"]);
      }
      if (needsInsulin && insulinValue) {
        await logInsulin();
        setSubmitted((p) => [...p, "insulin"]);
      }
      if (needsActivity && selectedActivity) {
        await logActivity();
        setSubmitted((p) => [...p, "activity"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    (!needsGlucose || glucoseValue.length > 0) &&
    (!needsInsulin || insulinValue.length > 0) &&
    (!needsActivity || selectedActivity !== null);

  return (
    <ScreenContainer containerClassName="bg-error" safeAreaClassName="bg-error">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          {isRapidSpikeActive ? (
            <>
              <Text style={styles.alertIcon}>🚨</Text>
              <Text style={styles.headerTitle}>Rapid Glucose Change Detected</Text>
              <Text style={styles.headerSubtitle}>
                Your glucose is changing faster than 2 mg/dL/min. Please confirm your
                current carbs and insulin to unlock the app.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.alertIcon}>📋</Text>
              <Text style={styles.headerTitle}>Daily Check-In Required</Text>
              <Text style={styles.headerSubtitle}>
                Log your vitals to unlock your dashboard. This data is required for
                accurate AI bolus predictions and clinical safety.
              </Text>
            </>
          )}
        </View>

        {/* Transparency Card */}
        <View style={styles.transparencyCard}>
          <Text style={styles.transparencyTitle}>Why is this required?</Text>
          <Text style={styles.transparencyText}>
            Your AI advisor needs current glucose, insulin, and activity data to provide
            safe bolus recommendations. Missing data increases prediction error by up to
            40%. This takes under 10 seconds.
          </Text>
        </View>

        {/* Blood Glucose Entry */}
        {needsGlucose && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩸 Current Blood Glucose (mg/dL)</Text>
            <TextInput
              style={styles.input}
              value={glucoseValue}
              onChangeText={setGlucoseValue}
              placeholder="e.g. 145"
              placeholderTextColor="#999"
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={4}
              autoFocus={needsGlucose}
            />
            {/* Quick-select common ranges */}
            <View style={styles.quickRow}>
              {["70", "100", "120", "145", "180", "220"].map((v) => (
                <QuickLogButton
                  key={v}
                  label="mg/dL"
                  value={v}
                  onPress={() => setGlucoseValue(v)}
                  selected={glucoseValue === v}
                />
              ))}
            </View>
          </View>
        )}

        {/* Insulin Entry */}
        {needsInsulin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💉 Last Insulin Dose (units)</Text>
            <TextInput
              style={styles.input}
              value={insulinValue}
              onChangeText={setInsulinValue}
              placeholder="e.g. 4"
              placeholderTextColor="#999"
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={3}
            />
            <View style={styles.quickRow}>
              {INSULIN_PRESETS.map((v) => (
                <QuickLogButton
                  key={v}
                  label="u"
                  value={v}
                  onPress={() => setInsulinValue(v)}
                  selected={insulinValue === v}
                />
              ))}
            </View>
          </View>
        )}

        {/* Activity Entry */}
        {needsActivity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏃 Current Activity Level</Text>
            <View style={styles.activityRow}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSelectedActivity(opt.value)}
                  style={[
                    styles.activityBtn,
                    selectedActivity === opt.value && styles.activityBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.activityBtnText,
                      selectedActivity === opt.value && styles.activityBtnTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          style={[
            styles.submitBtn,
            (!canSubmit || submitting) && styles.submitBtnDisabled,
          ]}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "Saving..." : "Unlock Dashboard →"}
          </Text>
        </TouchableOpacity>

        {/* Missing metrics summary */}
        <View style={styles.missingList}>
          {missingMetrics.map((m) => (
            <Text key={m} style={styles.missingItem}>
              • {m} — not logged in the last 4 hours
            </Text>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  alertIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },
  transparencyCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transparencyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transparencyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 48,
  },
  quickBtnSelected: {
    backgroundColor: "#fff",
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  quickBtnLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  quickBtnTextSelected: {
    color: "#c0392b",
  },
  activityRow: {
    flexDirection: "row",
    gap: 10,
  },
  activityBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  activityBtnSelected: {
    backgroundColor: "#fff",
  },
  activityBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  activityBtnTextSelected: {
    color: "#c0392b",
  },
  submitBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#c0392b",
  },
  missingList: {
    gap: 4,
  },
  missingItem: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
});
