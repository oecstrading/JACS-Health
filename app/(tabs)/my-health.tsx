import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubItem {
  label: string;
  emoji: string;
  route: string;
  description: string;
}

interface Section {
  id: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: SubItem[];
}

// ─── Section Data ─────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: "patient_info",
    title: "Patient Information",
    emoji: "👤",
    color: "#60A5FA",
    bgColor: "#1e3a5f",
    borderColor: "#3B82F6",
    items: [
      { label: "Profile Settings", emoji: "⚙️", route: "/profile-settings", description: "Edit your personal & contact info" },
      { label: "Medical ID Card", emoji: "🪪", route: "/medical-id-card", description: "Emergency medical identification" },
      { label: "Setup Wizard", emoji: "🧙", route: "/setup-wizard", description: "Configure your health profile" },
      { label: "Onboarding", emoji: "🌟", route: "/onboarding", description: "App introduction & preferences" },
      { label: "Privacy Settings", emoji: "🔒", route: "/privacy-settings", description: "Manage your data & permissions" },
      { label: "Security Settings", emoji: "🛡️", route: "/security-settings", description: "Password, biometrics & 2FA" },
    ],
  },
  {
    id: "intake_forms",
    title: "Intake & Forms",
    emoji: "📋",
    color: "#A78BFA",
    bgColor: "#2d1f5e",
    borderColor: "#7C3AED",
    items: [
      { label: "Voice Intake", emoji: "🎙️", route: "/voice-intake", description: "Speak your intake information" },
      { label: "Intake Review", emoji: "📝", route: "/intake-review", description: "Review completed intake forms" },
      { label: "Intake Templates", emoji: "📄", route: "/intake-template-selection", description: "Choose an intake form template" },
      { label: "NPP Review", emoji: "📃", route: "/npp-review", description: "Notice of Privacy Practices" },
      { label: "Voice Consent", emoji: "🔊", route: "/voice-consent", description: "Record verbal consent" },
      { label: "Doctor Visit Prep", emoji: "🏥", route: "/doctor-visit-preparation", description: "Prepare for your next appointment" },
    ],
  },
  {
    id: "medical_history",
    title: "Medical History",
    emoji: "📂",
    color: "#34D399",
    bgColor: "#1a3d2e",
    borderColor: "#10B981",
    items: [
      { label: "History Summary", emoji: "📊", route: "/medical-history-summary", description: "Complete medical history overview" },
      { label: "Medical Records", emoji: "🗂️", route: "/medical-records", description: "View & manage your records" },
      { label: "Lab Results", emoji: "🧪", route: "/lab-results-manager", description: "Track lab & blood test results" },
      { label: "Imaging Analysis", emoji: "🩻", route: "/imaging-analysis", description: "X-ray, MRI & scan analysis" },
      { label: "Conditions Picker", emoji: "🏷️", route: "/medical-conditions-picker", description: "Select & manage your conditions" },
      { label: "My Doctors", emoji: "👨‍⚕️", route: "/my-doctors-list", description: "Your care team directory" },
    ],
  },
  {
    id: "wellness",
    title: "Wellness & Monitoring",
    emoji: "💚",
    color: "#4ADE80",
    bgColor: "#1a3a1a",
    borderColor: "#22C55E",
    items: [
      { label: "Vitals Tracker", emoji: "❤️", route: "/vitals-tracker", description: "BP, HR, weight & temperature" },
      { label: "Wellness Dashboard", emoji: "🌿", route: "/wellness-dashboard", description: "Overall wellness score & trends" },
      { label: "Wellness Score", emoji: "🏆", route: "/wellness-score-dashboard", description: "Your personalised health score" },
      { label: "Mood & Cognition", emoji: "🧠", route: "/mood-cognitive-tracker", description: "Track mood, memory & focus" },
      { label: "Symptom Checker", emoji: "🔍", route: "/symptom-checker", description: "AI-powered symptom analysis" },
      { label: "Symptom Diary", emoji: "📓", route: "/symptom-diary", description: "Log & track your symptoms" },
      { label: "Overnight Monitor", emoji: "🌙", route: "/overnight-dashboard", description: "Overnight health monitoring" },
      { label: "Real-time Vitals", emoji: "📡", route: "/realtime-vitals", description: "Live vital signs monitoring" },
      { label: "Omron Devices", emoji: "⌚", route: "/omron-devices", description: "Connect Omron BP monitors" },
      { label: "Wearable Devices", emoji: "📲", route: "/wearable-devices", description: "Smartwatch & fitness tracker sync" },
    ],
  },
  {
    id: "medications",
    title: "General Medications",
    emoji: "💊",
    color: "#F472B6",
    bgColor: "#3d1a2e",
    borderColor: "#EC4899",
    items: [
      { label: "Medication Tracker", emoji: "💊", route: "/medication-tracker", description: "Daily medication management" },
      { label: "Med Reminders", emoji: "⏰", route: "/medication-reminders", description: "Scheduled medication alerts" },
      { label: "Medication Log", emoji: "📋", route: "/medication-log", description: "History of medications taken" },
      { label: "Pill Identifier", emoji: "🔎", route: "/pill-identifier", description: "Identify pills by photo or code" },
      { label: "Barcode Scanner", emoji: "📷", route: "/medication-barcode-scanner", description: "Scan medication barcodes" },
      { label: "Interaction Checker", emoji: "⚠️", route: "/medication-interaction-checker", description: "Check drug interactions" },
      { label: "Pharmacy Finder", emoji: "🏪", route: "/pharmacy-finder", description: "Find nearby pharmacies" },
      { label: "Auto Refill", emoji: "🔄", route: "/pharmacy-auto-refill", description: "Automatic prescription refills" },
      { label: "Med Refill", emoji: "📦", route: "/medication-refill", description: "Track & request refills" },
      { label: "Cost Optimizer", emoji: "💰", route: "/medication-cost-optimizer", description: "Find lower-cost alternatives" },
    ],
  },
  {
    id: "insurance",
    title: "Insurance & Finance",
    emoji: "🏦",
    color: "#FBBF24",
    bgColor: "#3d2e0a",
    borderColor: "#F59E0B",
    items: [
      { label: "Insurance Scanner", emoji: "📸", route: "/insurance-card-scanner", description: "Scan & store insurance cards" },
      { label: "Insurance Claims", emoji: "📑", route: "/insurance-claims", description: "Track & submit claims" },
      { label: "Medicare Compliance", emoji: "🏛️", route: "/medicare-compliance", description: "Medicare documentation & compliance" },
      { label: "Medication Cost", emoji: "💵", route: "/medication-cost", description: "Track medication expenses" },
      { label: "Insulin Resources", emoji: "💉", route: "/insulin-resources", description: "Free & low-cost insulin programs" },
    ],
  },
  {
    id: "hospice_specialty",
    title: "Hospice & Specialty Care",
    emoji: "🏥",
    color: "#FCD34D",
    bgColor: "#3d2a00",
    borderColor: "#F59E0B",
    items: [
      { label: "Hospice Command", emoji: "🏥", route: "/(tabs)/hospice-revenue-command", description: "Hospice revenue & compliance hub" },
      { label: "Physical Therapy", emoji: "🦵", route: "/physical-therapy", description: "PT exercises & progress tracking" },
      { label: "Rheumatoid Arthritis", emoji: "🦴", route: "/rheumatoid-arthritis", description: "RA management & monitoring" },
      { label: "Surgeon Comms", emoji: "🩺", route: "/surgeon-communication", description: "Communicate with your surgeon" },
      { label: "Specialist Booking", emoji: "📅", route: "/specialist-booking", description: "Book specialist appointments" },
      { label: "School Nurse Portal", emoji: "🏫", route: "/school-nurse-portal", description: "School health management" },
      { label: "Nurse Dashboard", emoji: "👩‍⚕️", route: "/nurse-leader-dashboard", description: "Clinical leadership tools" },
    ],
  },
  {
    id: "tools_resources",
    title: "Tools & Resources",
    emoji: "🛠️",
    color: "#67E8F9",
    bgColor: "#0a2d3d",
    borderColor: "#06B6D4",
    items: [
      { label: "Telemedicine", emoji: "📹", route: "/telemedicine", description: "Video consultations with doctors" },
      { label: "Learning Hub", emoji: "📚", route: "/learning-hub", description: "Health education & courses" },
      { label: "Medical Library", emoji: "🏛️", route: "/medical-library-categorized", description: "Browse medical conditions A–Z" },
      { label: "Voice Assistant", emoji: "🎙️", route: "/voice-assistant", description: "AI health assistant" },
      { label: "Social Features", emoji: "👥", route: "/social-features", description: "Connect with health community" },
      { label: "Milestones", emoji: "🏅", route: "/milestones", description: "Track your health achievements" },
      { label: "Share JACS", emoji: "📲", route: "/share-app", description: "Share the app with others" },
      { label: "JACS Brand Hub", emoji: "🌟", route: "/(tabs)/jacs-brand-hub", description: "About JACS & our mission" },
      { label: "Marketing", emoji: "📣", route: "/marketing", description: "JACS promotional materials" },
    ],
  },
];

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ section, onPress }: { section: Section; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: section.bgColor,
        borderWidth: 1.5,
        borderColor: section.borderColor,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: section.borderColor + "33",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 26 }}>{section.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: section.color, fontWeight: "800", fontSize: 16, marginBottom: 2 }}
          allowFontScaling={false}
        >
          {section.title}
        </Text>
        <Text style={{ color: "#9BA1A6", fontSize: 12 }} allowFontScaling={false}>
          {section.items.length} features
        </Text>
      </View>
      <Text style={{ color: section.color, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}

// ─── Sub-Item Row ─────────────────────────────────────────────────────────────
function SubItemRow({ item, onPress }: { item: SubItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "#334155",
        backgroundColor: pressed ? "#1e2022" : "transparent",
      })}
    >
      <Text style={{ fontSize: 22, marginRight: 14, width: 32, textAlign: "center" }}>{item.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#ECEDEE", fontWeight: "600", fontSize: 15 }} allowFontScaling={false}>
          {item.label}
        </Text>
        <Text style={{ color: "#9BA1A6", fontSize: 12, marginTop: 1 }} allowFontScaling={false}>
          {item.description}
        </Text>
      </View>
      <Text style={{ color: "#687076", fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyHealthScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const fireHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSectionPress = (section: Section) => {
    fireHaptic();
    setActiveSection(section);
  };

  const handleItemPress = (route: string) => {
    fireHaptic();
    setActiveSection(null);
    // Small delay so modal closes before navigation
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <ScreenContainer>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#334155",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{ color: "#ECEDEE", fontWeight: "900", fontSize: 22 }}
            allowFontScaling={false}
          >
            My Health
          </Text>
          <Text style={{ color: "#9BA1A6", fontSize: 12, marginTop: 2 }} allowFontScaling={false}>
            Your complete health command centre
          </Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#1e3a5f",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#3B82F6",
          }}
        >
          <Text style={{ fontSize: 22 }}>💚</Text>
        </View>
      </View>

      {/* ── Subtitle Banner ─────────────────────────────────────────────── */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          marginBottom: 6,
          backgroundColor: "#1a3d2e",
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: "#10B981",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 20 }}>ℹ️</Text>
        <Text style={{ color: "#34D399", fontSize: 13, flex: 1, lineHeight: 18 }} allowFontScaling={false}>
          Tap any section below to access all features — for both diabetic and non-diabetic patients.
        </Text>
      </View>

      {/* ── Section Cards ───────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onPress={() => handleSectionPress(section)}
          />
        ))}
      </ScrollView>

      {/* ── Sub-Items Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={activeSection !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveSection(null)}
      >
        {activeSection && (
          <View style={{ flex: 1, backgroundColor: "#151718" }}>
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                paddingTop: 20,
                borderBottomWidth: 0.5,
                borderBottomColor: "#334155",
                backgroundColor: activeSection.bgColor,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>{activeSection.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: activeSection.color, fontWeight: "900", fontSize: 18 }}
                  allowFontScaling={false}
                >
                  {activeSection.title}
                </Text>
                <Text style={{ color: "#9BA1A6", fontSize: 12 }} allowFontScaling={false}>
                  {activeSection.items.length} features available
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveSection(null)}
                style={{
                  backgroundColor: "#334155",
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#ECEDEE", fontSize: 18, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Items List */}
            <FlatList
              data={activeSection.items}
              keyExtractor={(item) => item.route}
              renderItem={({ item }) => (
                <SubItemRow item={item} onPress={() => handleItemPress(item.route)} />
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}
