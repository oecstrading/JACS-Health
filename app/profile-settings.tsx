/**
 * Profile Settings Hub Screen
 * Links to: DangerZoneSettings, InsuranceCardSection, MedicalConditionsPicker,
 *           MedicalHistorySummary, MyDoctorsList
 */
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const PROFILE_SECTIONS = [
  {
    id: "medical-conditions",
    title: "Medical Conditions",
    subtitle: "Manage your active health conditions",
    icon: "🏥",
    route: "/medical-conditions-picker",
  },
  {
    id: "medical-history",
    title: "Medical History",
    subtitle: "View your complete health timeline",
    icon: "📋",
    route: "/medical-history-summary",
  },
  {
    id: "my-doctors",
    title: "My Doctors",
    subtitle: "Manage your care team",
    icon: "👨‍⚕️",
    route: "/my-doctors-list",
  },
  {
    id: "insurance",
    title: "Insurance Cards",
    subtitle: "Store and access insurance information",
    icon: "💳",
    route: "/insurance-card-section",
  },
  {
    id: "danger-zone",
    title: "Alert Thresholds",
    subtitle: "Configure critical health alert levels",
    icon: "⚠️",
    route: "/danger-zone-settings",
  },
];

export default function ProfileSettingsScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile & Health</Text>
        </View>

        {PROFILE_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(section.route as any)}
          >
            <Text style={styles.sectionIcon}>{section.icon}</Text>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{section.subtitle}</Text>
            </View>
            <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 24, fontWeight: "800" },
  sectionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: 1, gap: 14 },
  sectionIcon: { fontSize: 28 },
  sectionInfo: { flex: 1, gap: 3 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionSubtitle: { fontSize: 13 },
  chevron: { fontSize: 22, fontWeight: "300" },
});
