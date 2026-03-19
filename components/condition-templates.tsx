/**
 * Condition Template Components
 * Migration-aligned: MultiConditionSwitcher, MergedConditionTemplate, BPAlertCard, DoctorVisitTracker
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useActiveConditions, type ConditionId } from "@/hooks/use-health-platform";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BPReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp?: string;
}

export interface DoctorVisit {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  notes: string;
  nextVisit?: string;
}

// ─── BP Classification ────────────────────────────────────────────────────────

function classifyBP(systolic: number, diastolic: number): {
  label: string;
  color: string;
  action: string;
} {
  // AHA/ACC 2017 Guidelines
  if (systolic < 120 && diastolic < 80) {
    return { label: "Normal", color: "#22C55E", action: "Maintain healthy lifestyle." };
  } else if (systolic < 130 && diastolic < 80) {
    return { label: "Elevated", color: "#F59E0B", action: "Lifestyle changes recommended." };
  } else if (systolic < 140 || diastolic < 90) {
    return { label: "Stage 1 HTN", color: "#F97316", action: "Consult your doctor." };
  } else if (systolic < 180 || diastolic < 120) {
    return { label: "Stage 2 HTN", color: "#EF4444", action: "Medical treatment required." };
  } else {
    return { label: "Crisis", color: "#991B1B", action: "Seek emergency care NOW." };
  }
}

// ─── BPAlertCard ──────────────────────────────────────────────────────────────

export function BPAlertCard({ reading }: { reading: BPReading }) {
  const colors = useColors();
  const classification = classifyBP(reading.systolic, reading.diastolic);
  const isUrgent = reading.systolic >= 180 || reading.diastolic >= 120;

  return (
    <View
      style={[
        styles.bpCard,
        {
          backgroundColor: classification.color + "15",
          borderColor: classification.color,
          borderWidth: isUrgent ? 2 : 1,
        },
      ]}
    >
      {/* Reading Row */}
      <View style={styles.bpReadingRow}>
        <View style={styles.bpValues}>
          <Text style={[styles.bpNumbers, { color: classification.color }]}>
            {reading.systolic}/{reading.diastolic}
          </Text>
          <Text style={[styles.bpUnit, { color: colors.muted }]}>mmHg</Text>
        </View>
        {reading.pulse !== undefined && (
          <View style={[styles.pulseBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pulseValue, { color: colors.foreground }]}>{reading.pulse}</Text>
            <Text style={[styles.pulseLabel, { color: colors.muted }]}>bpm</Text>
          </View>
        )}
        <View style={[styles.classificationBadge, { backgroundColor: classification.color }]}>
          <Text style={styles.classificationText}>{classification.label}</Text>
        </View>
      </View>

      {/* Action */}
      <Text style={[styles.bpAction, { color: isUrgent ? classification.color : colors.muted }]}>
        {isUrgent ? "⚠️ " : "ℹ️ "}{classification.action}
      </Text>

      {/* JNC/AHA reference */}
      <Text style={[styles.bpReference, { color: colors.muted }]}>
        AHA/ACC 2017 Classification
      </Text>
    </View>
  );
}

// ─── MultiConditionSwitcher ───────────────────────────────────────────────────

const CONDITION_LABELS: Record<ConditionId, { label: string; icon: string; color: string }> = {
  standard: { label: "Standard", icon: "❤️", color: "#6366F1" },
  hypertension: { label: "Hypertension", icon: "🩸", color: "#EF4444" },
  diabetes: { label: "Diabetes", icon: "💉", color: "#F59E0B" },
  ckd: { label: "CKD", icon: "🫘", color: "#8B5CF6" },
  chf: { label: "Heart Failure", icon: "💓", color: "#EC4899" },
};

export function MultiConditionSwitcher() {
  const colors = useColors();
  const { activeConditions, toggleCondition, isMultiCondition } = useActiveConditions();

  const handleToggle = useCallback(
    async (cid: ConditionId) => {
      await toggleCondition(cid);
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [toggleCondition],
  );

  return (
    <View style={[styles.switcherContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.switcherHeader}>
        <Text style={[styles.switcherTitle, { color: colors.foreground }]}>Active Conditions</Text>
        {isMultiCondition && (
          <View style={[styles.multiTag, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.multiTagText, { color: colors.primary }]}>Multi-Condition</Text>
          </View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherScroll}>
        {(Object.entries(CONDITION_LABELS) as [ConditionId, typeof CONDITION_LABELS[ConditionId]][]).map(
          ([cid, info]) => {
            const isActive = activeConditions.includes(cid);
            return (
              <TouchableOpacity
                key={cid}
                style={[
                  styles.conditionChip,
                  {
                    backgroundColor: isActive ? info.color + "20" : colors.background,
                    borderColor: isActive ? info.color : colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
                onPress={() => handleToggle(cid)}
              >
                <Text style={styles.conditionIcon}>{info.icon}</Text>
                <Text style={[styles.conditionChipText, { color: isActive ? info.color : colors.muted }]}>
                  {info.label}
                </Text>
                {isActive && (
                  <View style={[styles.activeCheck, { backgroundColor: info.color }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          },
        )}
      </ScrollView>
    </View>
  );
}

// ─── MergedConditionTemplate ──────────────────────────────────────────────────

export function MergedConditionTemplate() {
  const colors = useColors();
  const { activeConditions, mergedMetrics, mergedTasks, isMultiCondition } = useActiveConditions();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const completedCount = completedTasks.size;
  const totalCount = mergedTasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={[styles.mergedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.mergedHeader}>
        <Text style={[styles.mergedTitle, { color: colors.foreground }]}>
          {isMultiCondition ? "Combined Care Plan" : "Daily Care Plan"}
        </Text>
        <Text style={[styles.mergedSubtitle, { color: colors.muted }]}>
          {activeConditions.map((c) => CONDITION_LABELS[c].label).join(" + ")}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.muted }]}>Today's Progress</Text>
          <Text style={[styles.progressCount, { color: colors.primary }]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: progress === 1 ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Metrics */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>Tracked Metrics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
        {mergedMetrics.map((metric) => (
          <View key={metric.key} style={[styles.metricChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.metricIcon}>{metric.icon}</Text>
            <Text style={[styles.metricLabel, { color: colors.foreground }]}>{metric.label}</Text>
            <Text style={[styles.metricUnit, { color: colors.muted }]}>{metric.unit}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tasks */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>Today's Tasks</Text>
      {mergedTasks.map((task) => {
        const done = completedTasks.has(task.id);
        return (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskRow, { borderBottomColor: colors.border }]}
            onPress={() => toggleTask(task.id)}
          >
            <View
              style={[
                styles.taskCheckbox,
                {
                  backgroundColor: done ? colors.success : "transparent",
                  borderColor: done ? colors.success : colors.border,
                },
              ]}
            >
              {done && <Text style={styles.taskCheckmark}>✓</Text>}
            </View>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskLabel, { color: done ? colors.muted : colors.foreground, textDecorationLine: done ? "line-through" : "none" }]}>
                {task.label}
              </Text>
              <Text style={[styles.taskTime, { color: colors.muted }]}>{task.time}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── DoctorVisitTracker ───────────────────────────────────────────────────────

export function DoctorVisitTracker({ visits }: { visits: DoctorVisit[] }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState<string | null>(null);

  const upcoming = visits.filter((v) => new Date(v.date) >= new Date()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const past = visits.filter((v) => new Date(v.date) < new Date()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const daysUntil = (iso: string) => {
    const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  const renderVisit = (visit: DoctorVisit, isUpcoming: boolean) => (
    <TouchableOpacity
      key={visit.id}
      style={[styles.visitCard, { backgroundColor: colors.surface, borderColor: isUpcoming ? colors.primary : colors.border }]}
      onPress={() => setExpanded(expanded === visit.id ? null : visit.id)}
    >
      <View style={styles.visitHeader}>
        <View style={styles.visitInfo}>
          <Text style={[styles.visitDoctor, { color: colors.foreground }]}>{visit.doctorName}</Text>
          <Text style={[styles.visitSpecialty, { color: colors.muted }]}>{visit.specialty}</Text>
        </View>
        <View style={styles.visitDateBox}>
          <Text style={[styles.visitDate, { color: isUpcoming ? colors.primary : colors.muted }]}>
            {formatDate(visit.date)}
          </Text>
          {isUpcoming && (
            <Text style={[styles.visitCountdown, { color: colors.primary }]}>{daysUntil(visit.date)}</Text>
          )}
        </View>
      </View>
      {expanded === visit.id && visit.notes && (
        <Text style={[styles.visitNotes, { color: colors.muted, borderTopColor: colors.border }]}>
          {visit.notes}
        </Text>
      )}
      {expanded === visit.id && visit.nextVisit && (
        <Text style={[styles.visitNext, { color: colors.success }]}>
          Next visit: {formatDate(visit.nextVisit)}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.doctorContainer}>
      {upcoming.length > 0 && (
        <>
          <Text style={[styles.visitSectionTitle, { color: colors.foreground }]}>Upcoming Visits</Text>
          {upcoming.map((v) => renderVisit(v, true))}
        </>
      )}
      {past.length > 0 && (
        <>
          <Text style={[styles.visitSectionTitle, { color: colors.foreground }]}>Past Visits</Text>
          {past.slice(0, 5).map((v) => renderVisit(v, false))}
        </>
      )}
      {visits.length === 0 && (
        <View style={[styles.emptyVisits, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyVisitsText, { color: colors.muted }]}>No doctor visits recorded yet.</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // BPAlertCard
  bpCard: { padding: 16, borderRadius: 14, marginBottom: 8, gap: 8 },
  bpReadingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  bpValues: { flex: 1, flexDirection: "row", alignItems: "baseline", gap: 4 },
  bpNumbers: { fontSize: 32, fontWeight: "800" },
  bpUnit: { fontSize: 14 },
  pulseBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: "center" },
  pulseValue: { fontSize: 18, fontWeight: "700" },
  pulseLabel: { fontSize: 11 },
  classificationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  classificationText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  bpAction: { fontSize: 13, fontWeight: "600" },
  bpReference: { fontSize: 11 },

  // MultiConditionSwitcher
  switcherContainer: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  switcherHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  switcherTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  multiTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  multiTagText: { fontSize: 11, fontWeight: "700" },
  switcherScroll: { flexDirection: "row" },
  conditionChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, gap: 6 },
  conditionIcon: { fontSize: 16 },
  conditionChipText: { fontSize: 13, fontWeight: "600" },
  activeCheck: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  checkMark: { color: "#fff", fontSize: 10, fontWeight: "800" },

  // MergedConditionTemplate
  mergedContainer: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  mergedHeader: { gap: 2 },
  mergedTitle: { fontSize: 18, fontWeight: "800" },
  mergedSubtitle: { fontSize: 13 },
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13 },
  progressCount: { fontSize: 13, fontWeight: "700" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  metricsScroll: { flexDirection: "row" },
  metricChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 8, gap: 6 },
  metricIcon: { fontSize: 14 },
  metricLabel: { fontSize: 13, fontWeight: "600" },
  metricUnit: { fontSize: 11 },
  taskRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, gap: 12 },
  taskCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  taskCheckmark: { color: "#fff", fontSize: 12, fontWeight: "800" },
  taskInfo: { flex: 1, gap: 2 },
  taskLabel: { fontSize: 15 },
  taskTime: { fontSize: 12 },

  // DoctorVisitTracker
  doctorContainer: { gap: 8 },
  visitSectionTitle: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  visitCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  visitHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  visitInfo: { flex: 1, gap: 2 },
  visitDoctor: { fontSize: 16, fontWeight: "700" },
  visitSpecialty: { fontSize: 13 },
  visitDateBox: { alignItems: "flex-end", gap: 2 },
  visitDate: { fontSize: 13, fontWeight: "600" },
  visitCountdown: { fontSize: 12, fontWeight: "700" },
  visitNotes: { fontSize: 13, lineHeight: 19, paddingTop: 8, borderTopWidth: 0.5 },
  visitNext: { fontSize: 13, fontWeight: "600" },
  emptyVisits: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  emptyVisitsText: { fontSize: 14 },
});
