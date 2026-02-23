import { FlatList, Text, TouchableOpacity, View, TextInput } from "react-native";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: string;
}

type Category = "All" | "Hospice" | "Health Tracking" | "AI Tools" | "Social" | "Clinical" | "Pharmacy";

const FEATURES: Feature[] = [
  {
    id: "diabetes-portal",
    title: "Diabetes Management Portal",
    description: "Virtual CGM, OmniPod, Time in Range charts, AI food scanner, and comprehensive diabetes tracking",
    icon: "house.fill",
    route: "/diabetes-portal",
    category: "Health Tracking",
  },
  {
    id: "accessibility-settings",
    title: "Accessibility Settings",
    description: "Voice readback, high contrast mode, large text, and screen reader support (WCAG 2.1 AA)",
    icon: "house.fill",
    route: "/accessibility-settings",
    category: "Clinical",
  },
  {
    id: "device-settings",
    title: "Device Settings",
    description: "Connect real medical devices (Dexcom, Omron, Omnipod) or use free virtual devices",
    icon: "house.fill",
    route: "/device-settings",
    category: "Health Tracking",
  },
  {
    id: "family-sharing",
    title: "Family Sharing",
    description: "Share health data with family members and caregivers with permission-based access",
    icon: "house.fill",
    route: "/family-sharing",
    category: "Social",
  },
  {
    id: "cloud-sync",
    title: "Cloud Sync & Backup",
    description: "Automatic encrypted backup and cross-device synchronization of health data",
    icon: "house.fill",
    route: "/cloud-sync-settings",
    category: "Clinical",
  },
  {
    id: "medication-reminders",
    title: "Medication Reminders",
    description: "Never miss a dose with smart push notification reminders and adherence tracking",
    icon: "house.fill",
    route: "/medication-reminders",
    category: "Health Tracking",
  },
  {
    id: "doctor-appointments",
    title: "Doctor Appointments",
    description: "Manage appointments with calendar integration, preparation checklists, and visit notes",
    icon: "house.fill",
    route: "/doctor-appointments",
    category: "Clinical",
  },
  {
    id: "health-goals",
    title: "Health Goals & Challenges",
    description: "Set personalized goals, track progress, and compete in family challenges",
    icon: "house.fill",
    route: "/health-goals",
    category: "Health Tracking",
  },
  {
    id: "nutrition-tracking",
    title: "Nutrition Tracking",
    description: "Log meals with photos, scan barcodes, and track daily calories and macros",
    icon: "house.fill",
    route: "/nutrition-tracking",
    category: "Health Tracking",
  },
  {
    id: "lab-results",
    title: "Lab Results Manager",
    description: "Track test results, analyze trends, and receive alerts for abnormal values",
    icon: "house.fill",
    route: "/lab-results-manager",
    category: "Clinical",
  },
  {
    id: "symptom-diary",
    title: "Symptom Diary",
    description: "Log symptoms, identify triggers, and discover patterns with AI analysis",
    icon: "house.fill",
    route: "/symptom-diary",
    category: "Health Tracking",
  },
  {
    id: "hospice-revenue",
    title: "Hospice Revenue Command",
    description: "Real-time APU monitoring, HIS/HOPE submission tracking, and iQIES export",
    icon: "house.fill",
    route: "/hospice-revenue-command",
    category: "Hospice",
  },
  {
    id: "nurse-leader",
    title: "Nurse Leader Dashboard",
    description: "Staff performance leaderboards and documentation excellence tracking",
    icon: "house.fill",
    route: "/nurse-leader-dashboard",
    category: "Hospice",
  },
  {
    id: "onboarding",
    title: "Onboarding Wizard",
    description: "30-minute setup wizard for census migration and compliance configuration",
    icon: "house.fill",
    route: "/onboarding-wizard",
    category: "Hospice",
  },
  {
    id: "medication-tracker",
    title: "Medication Tracker",
    description: "Track medications, set reminders, and monitor adherence",
    icon: "house.fill",
    route: "/medication-tracker",
    category: "Pharmacy",
  },
  {
    id: "vitals-tracker",
    title: "Vitals Tracker",
    description: "Log blood pressure, heart rate, weight, and blood glucose",
    icon: "house.fill",
    route: "/vitals-tracker",
    category: "Health Tracking",
  },
  {
    id: "ai-assistant",
    title: "AI Voice Assistant",
    description: "Natural language health assistant with voice and text support",
    icon: "house.fill",
    route: "/ai-assistant",
    category: "AI Tools",
  },
  {
    id: "health-insights",
    title: "Health Insights Dashboard",
    description: "Predictive alerts, health score, and personalized recommendations",
    icon: "house.fill",
    route: "/health-insights",
    category: "Health Tracking",
  },
  {
    id: "caregiver-connection",
    title: "Caregiver Connection",
    description: "Share health data and communicate with family caregivers",
    icon: "house.fill",
    route: "/caregiver-connection",
    category: "Social",
  },
  {
    id: "appointments",
    title: "Appointment Scheduling",
    description: "Manage doctor appointments with reminders and calendar view",
    icon: "house.fill",
    route: "/appointments",
    category: "Clinical",
  },
  {
    id: "wearables",
    title: "Wearable Device Integration",
    description: "Sync data from Apple Health, Google Fit, and fitness trackers",
    icon: "house.fill",
    route: "/wearables",
    category: "Health Tracking",
  },
  {
    id: "emergency-sos",
    title: "Emergency SOS",
    description: "One-tap emergency calling with location sharing and caregiver alerts",
    icon: "house.fill",
    route: "/emergency-sos",
    category: "Clinical",
  },
  {
    id: "documentation-center",
    title: "Health Documentation Center",
    description: "Research health conditions, symptoms, treatments, and lifestyle tips",
    icon: "house.fill",
    route: "/documentation-center",
    category: "Clinical",
  },
  {
    id: "medication-interaction",
    title: "Medication Interaction Checker",
    description: "Check for drug interactions and view severity levels",
    icon: "house.fill",
    route: "/medication-interaction-checker",
    category: "Pharmacy",
  },
  {
    id: "fall-detection",
    title: "Fall Detection",
    description: "Automatic fall detection with emergency alerts",
    icon: "house.fill",
    route: "/fall-detection",
    category: "Clinical",
  },
  {
    id: "health-report",
    title: "Health Report PDF Export",
    description: "Generate comprehensive health reports for doctors",
    icon: "house.fill",
    route: "/health-report-export",
    category: "Clinical",
  },
  {
    id: "telemedicine",
    title: "Telemedicine Video Calling",
    description: "Video consultations with doctors and healthcare providers",
    icon: "house.fill",
    route: "/telemedicine",
    category: "Clinical",
  },
  {
    id: "medication-refill",
    title: "Medication Refill Reminders",
    description: "Track prescriptions and order refills from pharmacies",
    icon: "house.fill",
    route: "/medication-refill",
    category: "Pharmacy",
  },
  {
    id: "social-features",
    title: "Social Features",
    description: "Health challenges, achievements, community forum, and messaging",
    icon: "house.fill",
    route: "/social-features",
    category: "Social",
  },
  {
    id: "medication-barcode",
    title: "Medication Barcode Scanner",
    description: "Scan medication barcodes to auto-fill details",
    icon: "house.fill",
    route: "/medication-barcode-scanner",
    category: "Pharmacy",
  },
  {
    id: "health-goals",
    title: "Health Goals & Progress Tracking",
    description: "Set and track health goals with progress visualization",
    icon: "house.fill",
    route: "/health-goals",
    category: "Health Tracking",
  },
  {
    id: "bp-dashboard",
    title: "Blood Pressure Dashboard",
    description: "Dedicated BP tracking with trend analysis and alerts",
    icon: "house.fill",
    route: "/blood-pressure-dashboard",
    category: "Health Tracking",
  },
  {
    id: "doctor-visit-prep",
    title: "Doctor Visit Preparation Tool",
    description: "Generate visit summaries and suggested questions",
    icon: "house.fill",
    route: "/doctor-visit-preparation",
    category: "AI Tools",
  },
  {
    id: "nutrition-tracking",
    title: "Nutrition Tracking",
    description: "Log meals, track calories, and monitor macronutrients",
    icon: "house.fill",
    route: "/nutrition-tracking",
    category: "Health Tracking",
  },
  {
    id: "exercise-library",
    title: "Exercise Library",
    description: "Senior-friendly workouts with video demonstrations",
    icon: "house.fill",
    route: "/exercise-library",
    category: "Health Tracking",
  },
  {
    id: "symptom-diary",
    title: "Symptom Diary",
    description: "Track symptoms, identify patterns, and generate reports",
    icon: "house.fill",
    route: "/symptom-diary",
    category: "Health Tracking",
  },
  {
    id: "medication-photo",
    title: "Medication Photo Recognition",
    description: "AI-powered pill identification from photos",
    icon: "house.fill",
    route: "/medication-photo-recognition",
    category: "AI Tools",
  },
  {
    id: "insurance-scanner",
    title: "Health Insurance Card Scanner",
    description: "OCR extraction of insurance information from card photos",
    icon: "house.fill",
    route: "/insurance-card-scanner",
    category: "AI Tools",
  },
  {
    id: "wellness-score",
    title: "Wellness Score Dashboard",
    description: "Comprehensive wellness score with category breakdown",
    icon: "house.fill",
    route: "/wellness-score-dashboard",
    category: "Health Tracking",
  },
  {
    id: "ai-appointment-coach",
    title: "AI Appointment Coach",
    description: "Real-time transcription and note-taking during doctor visits",
    icon: "house.fill",
    route: "/ai-appointment-coach",
    category: "AI Tools",
  },
  {
    id: "fall-stability-alert",
    title: "Predictive Fall & Stability Alert",
    description: "7-day gait analysis with proactive fall risk alerts",
    icon: "house.fill",
    route: "/fall-stability-alert",
    category: "AI Tools",
  },
  {
    id: "medication-cost",
    title: "Medication Cost Optimizer",
    description: "Compare prices and find cheaper alternatives",
    icon: "house.fill",
    route: "/medication-cost-optimizer",
    category: "Pharmacy",
  },
  {
    id: "cgm-integration",
    title: "Continuous Glucose Monitor Integration",
    description: "Real-time glucose monitoring with trend analysis",
    icon: "house.fill",
    route: "/cgm-integration",
    category: "Health Tracking",
  },
  {
    id: "food-scan",
    title: "Food Scan & Instant Nutrition Analysis",
    description: "AI-powered food recognition with nutritional information",
    icon: "house.fill",
    route: "/food-scan",
    category: "AI Tools",
  },
  {
    id: "specialist-booking",
    title: "Specialist Booking & Referral Tracker",
    description: "Manage specialist appointments and referrals",
    icon: "house.fill",
    route: "/specialist-booking",
    category: "Clinical",
  },
];

const CATEGORIES: Category[] = ["All", "Hospice", "Health Tracking", "AI Tools", "Clinical", "Pharmacy", "Social"];

export default function FeaturesScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const filteredFeatures = useMemo(() => {
    return FEATURES.filter((feature) => {
      const matchesSearch =
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || feature.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const renderFeatureItem = ({ item }: { item: Feature }) => (
    <TouchableOpacity
      onPress={() => router.push(item.route as any)}
      className="mb-3 rounded-xl border border-border bg-surface p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <IconSymbol name="house.fill" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold text-foreground">
            {item.title}
          </Text>
          <Text className="text-sm text-muted" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="px-4 pt-4">
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Features</Text>
        <Text className="mt-1 text-base text-muted">
          Explore all JACS Medical Monitoring System features
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mb-4 flex-row items-center rounded-xl border border-border bg-surface px-4 py-3">
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={colors.muted} />
        <TextInput
          className="ml-3 flex-1 text-base text-foreground"
          placeholder="Search features..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter Chips */}
      <View className="mb-4">
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              className="mr-2 rounded-full px-4 py-2"
              style={{
                backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === item ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selectedCategory === item ? "#fff" : colors.foreground,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results Count */}
      <Text className="mb-3 text-sm text-muted">
        {filteredFeatures.length} {filteredFeatures.length === 1 ? "feature" : "features"} found
      </Text>

      {/* Features List */}
      <FlatList
        data={filteredFeatures}
        renderItem={renderFeatureItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-center text-base text-muted">
              No features found matching your search
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
