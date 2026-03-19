import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const HISTORY_KEY = "jacs_medical_history";

interface HistoryEntry {
  id: string;
  category: "surgery" | "hospitalization" | "allergy" | "vaccination" | "family_history" | "lab_result";
  title: string;
  date: string;
  details: string;
  provider?: string;
}

const CATEGORY_ICONS: Record<HistoryEntry["category"], string> = {
  surgery: "🔪",
  hospitalization: "🏥",
  allergy: "⚠️",
  vaccination: "💉",
  family_history: "👨‍👩‍👧‍👦",
  lab_result: "🧪",
};

const CATEGORY_COLORS: Record<HistoryEntry["category"], string> = {
  surgery: "#EF4444",
  hospitalization: "#F97316",
  allergy: "#F59E0B",
  vaccination: "#22C55E",
  family_history: "#6366F1",
  lab_result: "#0a7ea4",
};

export default function MedicalHistorySummaryScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<Partial<HistoryEntry>>({ category: "surgery" });
  const [filter, setFilter] = useState<HistoryEntry["category"] | "all">("all");

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((val) => {
      if (val) try { setEntries(JSON.parse(val)); } catch { /* ignore */ }
    });
  }, []);

  const saveEntry = useCallback(async () => {
    if (!editEntry.title?.trim()) {
      Alert.alert("Missing Info", "Please enter a title for this entry.");
      return;
    }
    const newEntry: HistoryEntry = {
      id: editEntry.id || `hist_${Date.now()}`,
      category: editEntry.category || "surgery",
      title: editEntry.title || "",
      date: editEntry.date || new Date().toISOString().split("T")[0],
      details: editEntry.details || "",
      provider: editEntry.provider || "",
    };
    const updated = editEntry.id
      ? entries.map((e) => (e.id === editEntry.id ? newEntry : e))
      : [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setShowForm(false);
    setEditEntry({ category: "surgery" });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editEntry, entries]);

  const deleteEntry = useCallback(async (entryId: string) => {
    const updated = entries.filter((e) => e.id !== entryId);
    setEntries(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [entries]);

  const filteredEntries = filter === "all" ? entries : entries.filter((e) => e.category === filter);
  const categories: (HistoryEntry["category"] | "all")[] = ["all", "surgery", "hospitalization", "allergy", "vaccination", "family_history", "lab_result"];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Medical History</Text>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, { backgroundColor: filter === cat ? colors.primary : colors.surface, borderColor: filter === cat ? colors.primary : colors.border }]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterChipText, { color: filter === cat ? "#fff" : colors.muted }]}>
                {cat === "all" ? "All" : cat.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Entries */}
        {filteredEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No medical history entries yet. Tap + to add one.</Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: CATEGORY_COLORS[entry.category], borderLeftWidth: 4 }]}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryIcon}>{CATEGORY_ICONS[entry.category]}</Text>
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryTitle, { color: colors.foreground }]}>{entry.title}</Text>
                  <Text style={[styles.entryDate, { color: colors.muted }]}>{entry.date}{entry.provider ? ` · ${entry.provider}` : ""}</Text>
                </View>
                <View style={styles.entryActions}>
                  <TouchableOpacity onPress={() => { setEditEntry(entry); setShowForm(true); }}>
                    <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                    <Text style={[styles.deleteText, { color: colors.error }]}>Del</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {entry.details ? <Text style={[styles.entryDetails, { color: colors.muted }]}>{entry.details}</Text> : null}
            </View>
          ))
        )}

        {/* Add Form */}
        {showForm ? (
          <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>{editEntry.id ? "Edit Entry" : "Add History Entry"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
              {(["surgery", "hospitalization", "allergy", "vaccination", "family_history", "lab_result"] as HistoryEntry["category"][]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, { backgroundColor: editEntry.category === cat ? CATEGORY_COLORS[cat] : colors.background, borderColor: CATEGORY_COLORS[cat] }]}
                  onPress={() => setEditEntry((p) => ({ ...p, category: cat }))}
                >
                  <Text style={[styles.catChipText, { color: editEntry.category === cat ? "#fff" : CATEGORY_COLORS[cat] }]}>{cat.replace("_", " ")}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {[
              { key: "title", label: "Title *", placeholder: "e.g. Appendectomy" },
              { key: "date", label: "Date", placeholder: "e.g. 2020-03-15" },
              { key: "provider", label: "Provider / Hospital", placeholder: "e.g. St. Mary's Hospital" },
              { key: "details", label: "Details / Notes", placeholder: "Additional notes..." },
            ].map((f) => (
              <View key={f.key}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  value={(editEntry as any)[f.key] || ""}
                  onChangeText={(v) => setEditEntry((p) => ({ ...p, [f.key]: v }))}
                  multiline={f.key === "details"}
                />
              </View>
            ))}
            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowForm(false); setEditEntry({ category: "surgery" }); }}>
                <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveEntry}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ Add History Entry</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  filterRow: { flexDirection: "row" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8 },
  filterChipText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  emptyCard: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  entryCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  entryHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  entryIcon: { fontSize: 20 },
  entryInfo: { flex: 1, gap: 2 },
  entryTitle: { fontSize: 15, fontWeight: "700" },
  entryDate: { fontSize: 12 },
  entryActions: { flexDirection: "row", gap: 10 },
  editText: { fontSize: 13, fontWeight: "600" },
  deleteText: { fontSize: 13, fontWeight: "600" },
  entryDetails: { fontSize: 13, lineHeight: 19 },
  form: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  formTitle: { fontSize: 17, fontWeight: "700" },
  catRow: { flexDirection: "row" },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, marginRight: 8 },
  catChipText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 2 },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelBtnText: { fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
