/**
 * emergency-mode.tsx — Emergency Mode Screen
 *
 * A high-contrast, large-text lock-screen-style screen that displays
 * critical health information for first responders and emergency contacts.
 *
 * Features:
 * - Current glucose + trend with color-coded urgency
 * - Emergency contacts with one-tap call
 * - Medical conditions, allergies, and current medications
 * - Blood type and insurance info
 * - Accessible without unlocking the app (via deep link)
 * - Keep-awake enabled so screen stays on in emergencies
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { offlineStorage, type GlucoseReading } from "@/services/offlineStorage";
import { GlucoseConverter } from "@/services/bolusAdvisor";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EmergencyProfile {
  name: string;
  dob: string;
  bloodType: string;
  conditions: string[];
  allergies: string[];
  medications: string[];
  contacts: Array<{ name: string; relation: string; phone: string }>;
  insuranceId: string;
  physicianName: string;
  physicianPhone: string;
}

const DEFAULT_PROFILE: EmergencyProfile = {
  name: "Patient",
  dob: "",
  bloodType: "Unknown",
  conditions: ["Type 1 Diabetes"],
  allergies: [],
  medications: [],
  contacts: [],
  insuranceId: "",
  physicianName: "",
  physicianPhone: "",
};

function getGlucoseColor(mgdl: number): string {
  if (mgdl < 54) return "#EF4444";   // Critical low
  if (mgdl < 70) return "#F97316";   // Low
  if (mgdl <= 180) return "#22C55E"; // In range
  if (mgdl <= 250) return "#F59E0B"; // High
  return "#EF4444";                  // Critical high
}

function getGlucoseStatus(mgdl: number): string {
  if (mgdl < 54) return "CRITICAL LOW — NEEDS GLUCAGON";
  if (mgdl < 70) return "LOW — GIVE 15g FAST CARBS";
  if (mgdl <= 180) return "In Range";
  if (mgdl <= 250) return "HIGH";
  return "CRITICAL HIGH — CALL 911";
}

function getTrendArrow(trend?: string): string {
  switch (trend) {
    case "DoubleUp": return "↑↑";
    case "SingleUp": return "↑";
    case "FortyFiveUp": return "↗";
    case "Flat": return "→";
    case "FortyFiveDown": return "↘";
    case "SingleDown": return "↓";
    case "DoubleDown": return "↓↓";
    default: return "";
  }
}

export default function EmergencyModeScreen() {
  useKeepAwake();

  const [profile, setProfile] = useState<EmergencyProfile>(DEFAULT_PROFILE);
  const [latestGlucose, setLatestGlucose] = useState<GlucoseReading | null>(null);
  const [glucoseAge, setGlucoseAge] = useState<string>("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [storedProfile, glucose] = await Promise.all([
        AsyncStorage.getItem("@emergency_profile"),
        offlineStorage.getLatestGlucose(),
      ]);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (glucose) {
        setLatestGlucose(glucose);
        const ageMs = Date.now() - new Date(glucose.timestamp).getTime();
        const ageMin = Math.round(ageMs / 60000);
        setGlucoseAge(ageMin < 60 ? `${ageMin}m ago` : `${Math.round(ageMin / 60)}h ago`);
      }
    } catch {}
  }

  async function callNumber(phone: string) {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Linking.openURL(`tel:${phone}`);
  }

  const bgColor = latestGlucose ? getGlucoseColor(latestGlucose.value) : "#687076";
  const bgStatus = latestGlucose ? getGlucoseStatus(latestGlucose.value) : "No reading";
  const trendArrow = latestGlucose ? getTrendArrow(latestGlucose.trend) : "";
  const isCritical = latestGlucose && (latestGlucose.value < 70 || latestGlucose.value > 250);

  return (
    <ScreenContainer containerClassName="bg-[#0a0a0a]" safeAreaClassName="bg-[#0a0a0a]">
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emergencyLabel}>🚨 EMERGENCY MEDICAL INFO</Text>
          <Text style={styles.patientName}>{profile.name}</Text>
          {profile.dob ? <Text style={styles.subText}>DOB: {profile.dob}</Text> : null}
          <Text style={styles.subText}>Blood Type: <Text style={styles.highlight}>{profile.bloodType}</Text></Text>
        </View>

        {/* Glucose Status */}
        {latestGlucose && (
          <View style={[styles.glucoseCard, { borderColor: bgColor }]}>
            {isCritical && (
              <Text style={[styles.criticalBanner, { backgroundColor: bgColor }]}>
                {bgStatus}
              </Text>
            )}
            <Text style={styles.glucoseLabel}>CURRENT GLUCOSE</Text>
            <View style={styles.glucoseRow}>
              <Text style={[styles.glucoseValue, { color: bgColor }]}>
                {GlucoseConverter.format(latestGlucose.value, "mg/dL")}
              </Text>
              <Text style={[styles.trendArrow, { color: bgColor }]}>{trendArrow}</Text>
            </View>
            <Text style={[styles.glucoseStatus, { color: bgColor }]}>{!isCritical ? bgStatus : ""}</Text>
            <Text style={styles.glucoseAge}>{glucoseAge}</Text>
          </View>
        )}

        {/* Medical Conditions */}
        {profile.conditions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONDITIONS</Text>
            {profile.conditions.map((c, i) => (
              <Text key={i} style={styles.listItem}>• {c}</Text>
            ))}
          </View>
        )}

        {/* Allergies */}
        {profile.allergies.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>⚠️ ALLERGIES</Text>
            {profile.allergies.map((a, i) => (
              <Text key={i} style={[styles.listItem, { color: "#EF4444" }]}>• {a}</Text>
            ))}
          </View>
        )}

        {/* Medications */}
        {profile.medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURRENT MEDICATIONS</Text>
            {profile.medications.map((m, i) => (
              <Text key={i} style={styles.listItem}>• {m}</Text>
            ))}
          </View>
        )}

        {/* Emergency Contacts */}
        {profile.contacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
            {profile.contacts.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.contactCard}
                onPress={() => callNumber(c.phone)}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactRelation}>{c.relation}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
                <View style={styles.callButton}>
                  <Text style={styles.callButtonText}>📞 CALL</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Physician */}
        {profile.physicianName ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PHYSICIAN</Text>
            <Text style={styles.listItem}>{profile.physicianName}</Text>
            {profile.physicianPhone ? (
              <TouchableOpacity
                style={[styles.contactCard, { marginTop: 8 }]}
                onPress={() => callNumber(profile.physicianPhone)}
              >
                <Text style={styles.contactPhone}>{profile.physicianPhone}</Text>
                <View style={styles.callButton}>
                  <Text style={styles.callButtonText}>📞 CALL</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Insurance */}
        {profile.insuranceId ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INSURANCE ID</Text>
            <Text style={styles.listItem}>{profile.insuranceId}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>JACS Medical Monitoring System</Text>
          <Text style={styles.footerText}>Data current as of app last opened</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24 },
  emergencyLabel: { fontSize: 13, color: "#EF4444", fontWeight: "700", letterSpacing: 2, marginBottom: 8 },
  patientName: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  subText: { fontSize: 14, color: "#9BA1A6", marginTop: 4 },
  highlight: { color: "#FFFFFF", fontWeight: "700" },
  glucoseCard: {
    borderWidth: 2, borderRadius: 16, padding: 20, marginBottom: 20,
    backgroundColor: "#1a1a1a", overflow: "hidden",
  },
  criticalBanner: {
    marginHorizontal: -20, marginTop: -20, marginBottom: 16,
    paddingVertical: 10, paddingHorizontal: 20,
    fontSize: 14, fontWeight: "800", color: "#FFFFFF", textAlign: "center", letterSpacing: 1,
  },
  glucoseLabel: { fontSize: 11, color: "#9BA1A6", letterSpacing: 2, marginBottom: 8 },
  glucoseRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  glucoseValue: { fontSize: 52, fontWeight: "800" },
  trendArrow: { fontSize: 32, fontWeight: "700" },
  glucoseStatus: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  glucoseAge: { fontSize: 12, color: "#687076", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, color: "#9BA1A6", letterSpacing: 2, fontWeight: "700",
    marginBottom: 10, textTransform: "uppercase",
  },
  listItem: { fontSize: 16, color: "#ECEDEE", marginBottom: 4, lineHeight: 24 },
  contactCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#1a1a1a", borderRadius: 12, padding: 14, marginBottom: 8,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  contactRelation: { fontSize: 13, color: "#9BA1A6", marginTop: 2 },
  contactPhone: { fontSize: 14, color: "#0a7ea4", marginTop: 2 },
  callButton: {
    backgroundColor: "#22C55E", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
  },
  callButtonText: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  footer: { marginTop: 32, alignItems: "center" },
  footerText: { fontSize: 11, color: "#334155", marginBottom: 2 },
});
