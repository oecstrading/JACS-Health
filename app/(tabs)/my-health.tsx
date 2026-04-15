import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const PINNED_KEY = "@jacs_my_health_pins";
const MAX_PINS = 3;

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
      {
        label: "🌟 New Patient? Start Here",
        emoji: "🌟",
        route: "/setup-wizard",
        description: "Complete this first if you are a new patient",
      },
      { label: "Profile Settings", emoji: "⚙️", route: "/profile-settings", description: "Edit your personal & contact info" },
      { label: "Medical ID Card", emoji: "🪪", route: "/medical-id-card", description: "Emergency medical identification" },
      { label: "Setup Wizard", emoji: "🧙", route: "/setup-wizard", description: "Configure your health profile" },
      { label: "Onboarding", emoji: "🌟", route: "/onboarding", description: "App introduction & preferences" },
      { label: "Privacy Settings", emoji: "🔒", route: "/privacy-settings", description: "Manage your data & permissions" },
      { label: "Security Settings", emoji: "🛡️", route: "/security-settings", description: "Password, biometrics & 2FA" },
    ],
  },
  {
    id: "family_records",
    title: "Family Medical Records",
    emoji: "👨‍👩‍👧‍👦",
    color: "#F9A8D4",
    bgColor: "#3d1a2e",
    borderColor: "#EC4899",
    items: [
      { label: "Family Members", emoji: "👥", route: "/family-members", description: "Add & manage family member profiles" },
      { label: "Shared Records", emoji: "📂", route: "/family-shared-records", description: "View records shared by family members" },
      { label: "Hereditary Conditions", emoji: "🧬", route: "/hereditary-conditions", description: "Track genetic & hereditary health risks" },
      { label: "Child Health Profiles", emoji: "👶", route: "/child-health-profiles", description: "Manage your children's health records" },
      { label: "Elder Care Records", emoji: "👴", route: "/elder-care-records", description: "Manage records for elderly family members" },
      { label: "Family Vaccinations", emoji: "💉", route: "/family-vaccinations", description: "Track immunisation records for the family" },
      { label: "Family Appointments", emoji: "📅", route: "/family-appointments", description: "Shared family appointment calendar" },
      { label: "Emergency Contacts", emoji: "🆘", route: "/emergency-contacts", description: "Family emergency contact list" },
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
      { label: "JACS Professional Suite", emoji: "📋", route: "/jacs-professional-suite", description: "Hospice Edition — JACS Professional Suite PDF & overview" },
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

// Flat list of all items for search
const ALL_ITEMS: (SubItem & { sectionTitle: string; sectionEmoji: string })[] = SECTIONS.flatMap((s) =>
  s.items.map((item) => ({ ...item, sectionTitle: s.title, sectionEmoji: s.emoji }))
);

// ─── Quick Access Pin Button ──────────────────────────────────────────────────
function PinButton({
  item,
  isPinned,
  onToggle,
}: {
  item: SubItem;
  isPinned: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        position: "absolute",
        top: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: isPinned ? "#F59E0B33" : "#33415533",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 14 }}>{isPinned ? "📌" : "📍"}</Text>
    </Pressable>
  );
}

// ─── Quick Access Row ─────────────────────────────────────────────────────────
function QuickAccessRow({
  pins,
  onItemPress,
  onManage,
}: {
  pins: SubItem[];
  onItemPress: (route: string) => void;
  onManage: () => void;
}) {
  if (pins.length === 0) return null;
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: "#FBBF24", fontWeight: "800", fontSize: 13 }} allowFontScaling={false}>
          📌 Quick Access
        </Text>
        <Pressable onPress={onManage} style={{ marginLeft: "auto" }}>
          <Text style={{ color: "#687076", fontSize: 12 }} allowFontScaling={false}>Edit pins</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {pins.map((pin) => (
          <Pressable
            key={pin.route}
            onPress={() => onItemPress(pin.route)}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: "#1e2022",
              borderWidth: 1,
              borderColor: "#334155",
              borderRadius: 14,
              padding: 12,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontSize: 22, marginBottom: 4 }}>{pin.emoji}</Text>
            <Text
              style={{ color: "#ECEDEE", fontSize: 11, fontWeight: "700", textAlign: "center" }}
              allowFontScaling={false}
              numberOfLines={2}
            >
              {pin.label.replace(/^[^\w\s]*\s*/, "")}
            </Text>
          </Pressable>
        ))}
        {/* Placeholder slots */}
        {Array.from({ length: MAX_PINS - pins.length }).map((_, i) => (
          <Pressable
            key={`empty-${i}`}
            onPress={onManage}
            style={{
              flex: 1,
              backgroundColor: "#1e2022",
              borderWidth: 1,
              borderColor: "#334155",
              borderRadius: 14,
              padding: 12,
              alignItems: "center",
              justifyContent: "center",
              borderStyle: "dashed",
            }}
          >
            <Text style={{ color: "#687076", fontSize: 22 }}>＋</Text>
            <Text style={{ color: "#687076", fontSize: 11, marginTop: 4 }} allowFontScaling={false}>
              Pin a feature
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

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
        <Text style={{ color: section.color, fontWeight: "800", fontSize: 16, marginBottom: 2 }} allowFontScaling={false}>
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
function SubItemRow({
  item,
  onPress,
  isPinned,
  onTogglePin,
  isNewPatient,
}: {
  item: SubItem;
  onPress: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  isNewPatient?: boolean;
}) {
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
        backgroundColor: isNewPatient
          ? pressed ? "#1a3d2e" : "#162d22"
          : pressed ? "#1e2022" : "transparent",
      })}
    >
      <Text style={{ fontSize: 22, marginRight: 14, width: 32, textAlign: "center" }}>{item.emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{
              color: isNewPatient ? "#4ADE80" : "#ECEDEE",
              fontWeight: isNewPatient ? "800" : "600",
              fontSize: 15,
            }}
            allowFontScaling={false}
          >
            {item.label}
          </Text>
          {isNewPatient && (
            <View style={{ backgroundColor: "#22C55E", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }} allowFontScaling={false}>START HERE</Text>
            </View>
          )}
        </View>
        <Text style={{ color: "#9BA1A6", fontSize: 12, marginTop: 1 }} allowFontScaling={false}>
          {item.description}
        </Text>
      </View>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onTogglePin(); }}
        style={{ padding: 6, marginRight: 4 }}
        hitSlop={8}
      >
        <Text style={{ fontSize: 16 }}>{isPinned ? "📌" : "📍"}</Text>
      </Pressable>
      <Text style={{ color: "#687076", fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

// ─── Search Result Row ────────────────────────────────────────────────────────
function SearchResultRow({
  item,
  onPress,
}: {
  item: SubItem & { sectionTitle: string; sectionEmoji: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "#334155",
        backgroundColor: pressed ? "#1e2022" : "transparent",
      })}
    >
      <Text style={{ fontSize: 22, marginRight: 12, width: 32, textAlign: "center" }}>{item.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#ECEDEE", fontWeight: "600", fontSize: 15 }} allowFontScaling={false}>
          {item.label}
        </Text>
        <Text style={{ color: "#687076", fontSize: 11, marginTop: 1 }} allowFontScaling={false}>
          {item.sectionEmoji} {item.sectionTitle}
        </Text>
      </View>
      <Text style={{ color: "#687076", fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyHealthScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedRoutes, setPinnedRoutes] = useState<string[]>([]);
  const [managingPins, setManagingPins] = useState(false);

  // Load pins from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(PINNED_KEY).then((val) => {
      if (val) setPinnedRoutes(JSON.parse(val));
    });
  }, []);

  const savePins = useCallback(async (routes: string[]) => {
    setPinnedRoutes(routes);
    await AsyncStorage.setItem(PINNED_KEY, JSON.stringify(routes));
  }, []);

  const togglePin = useCallback(
    (route: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (pinnedRoutes.includes(route)) {
        savePins(pinnedRoutes.filter((r) => r !== route));
      } else if (pinnedRoutes.length >= MAX_PINS) {
        Alert.alert(
          "Quick Access Full",
          `You can pin up to ${MAX_PINS} features. Remove one to add another.`,
          [{ text: "OK" }]
        );
      } else {
        savePins([...pinnedRoutes, route]);
      }
    },
    [pinnedRoutes, savePins]
  );

  const fireHaptic = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSectionPress = (section: Section) => {
    fireHaptic();
    setActiveSection(section);
  };

  const handleItemPress = (route: string) => {
    fireHaptic();
    setActiveSection(null);
    setManagingPins(false);
    setTimeout(() => router.push(route as any), 150);
  };

  // Compute pinned SubItems in order
  const pinnedItems = useMemo(
    () =>
      pinnedRoutes
        .map((r) => ALL_ITEMS.find((i) => i.route === r))
        .filter(Boolean) as SubItem[],
    [pinnedRoutes]
  );

  // Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sectionTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <ScreenContainer>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "#334155",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: "#ECEDEE", fontWeight: "900", fontSize: 22 }} allowFontScaling={false}>
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

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1e2022",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: searchQuery ? "#3B82F6" : "#334155",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Search "lab", "pharmacy", "vitals"…'
            placeholderTextColor="#687076"
            style={{ flex: 1, color: "#ECEDEE", fontSize: 15 }}
            returnKeyType="search"
            clearButtonMode="while-editing"
            allowFontScaling={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Text style={{ color: "#687076", fontSize: 18, marginLeft: 8 }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Search Results ───────────────────────────────────────────────── */}
      {isSearching ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {searchResults.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>🔎</Text>
              <Text style={{ color: "#9BA1A6", fontSize: 16, marginTop: 12 }} allowFontScaling={false}>
                No results for "{searchQuery}"
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={{ color: "#687076", fontSize: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}
                allowFontScaling={false}
              >
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </Text>
              {searchResults.map((item) => (
                <SearchResultRow
                  key={item.route + item.sectionTitle}
                  item={item}
                  onPress={() => handleItemPress(item.route)}
                />
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* ── Quick Access Pins ──────────────────────────────────────── */}
          <View style={{ paddingTop: 8 }}>
            <QuickAccessRow
              pins={pinnedItems}
              onItemPress={handleItemPress}
              onManage={() => {
                setManagingPins(true);
                setActiveSection(null);
              }}
            />
          </View>

          {/* ── Info Banner ────────────────────────────────────────────── */}
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
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
            <Text style={{ fontSize: 18 }}>ℹ️</Text>
            <Text style={{ color: "#34D399", fontSize: 12, flex: 1, lineHeight: 17 }} allowFontScaling={false}>
              Tap any section to access all features. Tap 📍 on any item to pin it to Quick Access above.
            </Text>
          </View>

          {/* ── Section Cards ──────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: 16 }}>
            {SECTIONS.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onPress={() => handleSectionPress(section)}
              />
            ))}
          </View>
        </ScrollView>
      )}

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
                <Text style={{ color: activeSection.color, fontWeight: "900", fontSize: 18 }} allowFontScaling={false}>
                  {activeSection.title}
                </Text>
                <Text style={{ color: "#9BA1A6", fontSize: 12 }} allowFontScaling={false}>
                  Tap 📍 to pin to Quick Access
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
                <SubItemRow
                  item={item}
                  onPress={() => handleItemPress(item.route)}
                  isPinned={pinnedRoutes.includes(item.route)}
                  onTogglePin={() => togglePin(item.route)}
                  isNewPatient={
                    activeSection.id === "patient_info" &&
                    item.label.startsWith("🌟 New Patient")
                  }
                />
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </Modal>

      {/* ── Pin Manager Modal ───────────────────────────────────────────── */}
      <Modal
        visible={managingPins}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setManagingPins(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#151718" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              paddingTop: 20,
              borderBottomWidth: 0.5,
              borderBottomColor: "#334155",
              backgroundColor: "#3d2a00",
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>📌</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FBBF24", fontWeight: "900", fontSize: 18 }} allowFontScaling={false}>
                Manage Quick Access
              </Text>
              <Text style={{ color: "#9BA1A6", fontSize: 12 }} allowFontScaling={false}>
                {pinnedRoutes.length}/{MAX_PINS} pinned — tap 📌 to unpin
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setManagingPins(false)}
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
          <FlatList
            data={ALL_ITEMS}
            keyExtractor={(item) => item.route + item.sectionTitle}
            renderItem={({ item }) => {
              const pinned = pinnedRoutes.includes(item.route);
              return (
                <Pressable
                  onPress={() => togglePin(item.route)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#334155",
                    backgroundColor: pinned
                      ? pressed ? "#3d2e0a" : "#2a1f00"
                      : pressed ? "#1e2022" : "transparent",
                  })}
                >
                  <Text style={{ fontSize: 22, marginRight: 12, width: 32, textAlign: "center" }}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: pinned ? "#FBBF24" : "#ECEDEE", fontWeight: "600", fontSize: 15 }} allowFontScaling={false}>
                      {item.label}
                    </Text>
                    <Text style={{ color: "#687076", fontSize: 11 }} allowFontScaling={false}>
                      {item.sectionEmoji} {item.sectionTitle}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18 }}>{pinned ? "📌" : "📍"}</Text>
                </Pressable>
              );
            }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
