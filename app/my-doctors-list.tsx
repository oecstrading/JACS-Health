import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const DOCTORS_KEY = "jacs_my_doctors";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  practice: string;
  phone: string;
  fax?: string;
  address?: string;
  npi?: string;
  isPrimary: boolean;
  nextVisit?: string;
  notes?: string;
}

const SPECIALTIES = [
  "Primary Care", "Cardiologist", "Endocrinologist", "Nephrologist",
  "Neurologist", "Pulmonologist", "Rheumatologist", "Oncologist",
  "Psychiatrist", "Ophthalmologist", "Orthopedist", "Urologist",
  "Dermatologist", "Gastroenterologist", "Other",
];

export default function MyDoctorsListScreen() {
  const colors = useColors();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Partial<Doctor>>({ specialty: "Primary Care", isPrimary: false });

  useEffect(() => {
    AsyncStorage.getItem(DOCTORS_KEY).then((val) => {
      if (val) try { setDoctors(JSON.parse(val)); } catch { /* ignore */ }
    });
  }, []);

  const saveDoctor = useCallback(async () => {
    if (!editDoctor.name?.trim() || !editDoctor.phone?.trim()) {
      Alert.alert("Missing Info", "Doctor name and phone number are required.");
      return;
    }
    const newDoctor: Doctor = {
      id: editDoctor.id || `doc_${Date.now()}`,
      name: editDoctor.name || "",
      specialty: editDoctor.specialty || "Primary Care",
      practice: editDoctor.practice || "",
      phone: editDoctor.phone || "",
      fax: editDoctor.fax || "",
      address: editDoctor.address || "",
      npi: editDoctor.npi || "",
      isPrimary: editDoctor.isPrimary || false,
      nextVisit: editDoctor.nextVisit || "",
      notes: editDoctor.notes || "",
    };
    const updated = editDoctor.id
      ? doctors.map((d) => (d.id === editDoctor.id ? newDoctor : d))
      : [...doctors, newDoctor];
    setDoctors(updated);
    await AsyncStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
    setShowForm(false);
    setEditDoctor({ specialty: "Primary Care", isPrimary: false });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editDoctor, doctors]);

  const deleteDoctor = useCallback(async (docId: string, name: string) => {
    Alert.alert("Remove Doctor", `Remove Dr. ${name} from your list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const updated = doctors.filter((d) => d.id !== docId);
          setDoctors(updated);
          await AsyncStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
        },
      },
    ]);
  }, [doctors]);

  const callDoctor = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const primaryDoctor = doctors.find((d) => d.isPrimary);
  const specialists = doctors.filter((d) => !d.isPrimary);

  const renderDoctor = (doctor: Doctor) => (
    <View key={doctor.id} style={[styles.doctorCard, { backgroundColor: colors.surface, borderColor: doctor.isPrimary ? colors.primary : colors.border }]}>
      {doctor.isPrimary && (
        <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.primaryBadgeText}>Primary Care</Text>
        </View>
      )}
      <View style={styles.doctorHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {doctor.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.foreground }]}>{doctor.name}</Text>
          <Text style={[styles.doctorSpecialty, { color: colors.primary }]}>{doctor.specialty}</Text>
          {doctor.practice ? <Text style={[styles.doctorPractice, { color: colors.muted }]}>{doctor.practice}</Text> : null}
        </View>
        <View style={styles.doctorActions}>
          <TouchableOpacity onPress={() => { setEditDoctor(doctor); setShowForm(true); }}>
            <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteDoctor(doctor.id, doctor.name)}>
            <Text style={[styles.deleteText, { color: colors.error }]}>Del</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.doctorContact}>
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success + "15", borderColor: colors.success }]} onPress={() => callDoctor(doctor.phone)}>
          <Text style={[styles.callBtnText, { color: colors.success }]}>📞 {doctor.phone}</Text>
        </TouchableOpacity>
        {doctor.nextVisit ? (
          <View style={[styles.nextVisitBox, { backgroundColor: colors.primary + "10" }]}>
            <Text style={[styles.nextVisitText, { color: colors.primary }]}>Next: {doctor.nextVisit}</Text>
          </View>
        ) : null}
      </View>
      {doctor.notes ? <Text style={[styles.doctorNotes, { color: colors.muted }]}>{doctor.notes}</Text> : null}
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>My Doctors</Text>
        </View>

        {primaryDoctor && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Primary Care Physician</Text>
            {renderDoctor(primaryDoctor)}
          </>
        )}

        {specialists.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Specialists ({specialists.length})</Text>
            {specialists.map(renderDoctor)}
          </>
        )}

        {doctors.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No doctors added yet. Add your care team below.</Text>
          </View>
        )}

        {/* Add Form */}
        {showForm ? (
          <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>{editDoctor.id ? "Edit Doctor" : "Add Doctor"}</Text>
            {[
              { key: "name", label: "Doctor Name *", placeholder: "e.g. Dr. Sarah Johnson" },
              { key: "practice", label: "Practice / Hospital", placeholder: "e.g. JACS Medical Center" },
              { key: "phone", label: "Phone Number *", placeholder: "e.g. 555-123-4567" },
              { key: "fax", label: "Fax Number", placeholder: "e.g. 555-123-4568" },
              { key: "address", label: "Address", placeholder: "e.g. 123 Medical Dr, Suite 100" },
              { key: "npi", label: "NPI Number", placeholder: "e.g. 1234567890" },
              { key: "nextVisit", label: "Next Visit Date", placeholder: "e.g. 2026-04-15" },
              { key: "notes", label: "Notes", placeholder: "Any special notes..." },
            ].map((f) => (
              <View key={f.key}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  value={(editDoctor as any)[f.key] || ""}
                  onChangeText={(v) => setEditDoctor((p) => ({ ...p, [f.key]: v }))}
                />
              </View>
            ))}
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Specialty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyRow}>
              {SPECIALTIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.specialtyChip, { backgroundColor: editDoctor.specialty === s ? colors.primary : colors.background, borderColor: editDoctor.specialty === s ? colors.primary : colors.border }]}
                  onPress={() => setEditDoctor((p) => ({ ...p, specialty: s }))}
                >
                  <Text style={[styles.specialtyChipText, { color: editDoctor.specialty === s ? "#fff" : colors.muted }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.primaryToggle, { backgroundColor: editDoctor.isPrimary ? colors.primary + "15" : colors.background, borderColor: editDoctor.isPrimary ? colors.primary : colors.border }]}
              onPress={() => setEditDoctor((p) => ({ ...p, isPrimary: !p.isPrimary }))}
            >
              <Text style={[styles.primaryToggleText, { color: editDoctor.isPrimary ? colors.primary : colors.muted }]}>
                {editDoctor.isPrimary ? "✓ Primary Care Physician" : "Mark as Primary Care Physician"}
              </Text>
            </TouchableOpacity>
            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowForm(false); setEditDoctor({ specialty: "Primary Care", isPrimary: false }); }}>
                <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveDoctor}>
                <Text style={styles.saveBtnText}>Save Doctor</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ Add Doctor</Text>
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
  sectionTitle: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  doctorCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  primaryBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  primaryBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  doctorHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "800" },
  doctorInfo: { flex: 1, gap: 2 },
  doctorName: { fontSize: 16, fontWeight: "700" },
  doctorSpecialty: { fontSize: 13, fontWeight: "600" },
  doctorPractice: { fontSize: 12 },
  doctorActions: { gap: 4, alignItems: "flex-end" },
  editText: { fontSize: 13, fontWeight: "600" },
  deleteText: { fontSize: 13, fontWeight: "600" },
  doctorContact: { flexDirection: "row", alignItems: "center", gap: 8 },
  callBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  callBtnText: { fontSize: 13, fontWeight: "600" },
  nextVisitBox: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  nextVisitText: { fontSize: 12, fontWeight: "600" },
  doctorNotes: { fontSize: 12, lineHeight: 18 },
  emptyCard: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  form: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  formTitle: { fontSize: 17, fontWeight: "700" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 2 },
  specialtyRow: { flexDirection: "row" },
  specialtyChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8 },
  specialtyChipText: { fontSize: 12, fontWeight: "600" },
  primaryToggle: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  primaryToggleText: { fontSize: 14, fontWeight: "600" },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelBtnText: { fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
