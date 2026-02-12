import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

const FEATURES: Feature[] = [
  {
    id: "hospice-revenue",
    title: "Hospice Revenue Command",
    description: "Real-time APU monitoring, HIS/HOPE submission tracking, and iQIES export",
    icon: "house.fill",
    route: "/hospice-revenue-command",
  },
  {
    id: "nurse-leader",
    title: "Nurse Leader Dashboard",
    description: "Staff performance leaderboards and documentation excellence tracking",
    icon: "house.fill",
    route: "/nurse-leader-dashboard",
  },
  {
    id: "onboarding",
    title: "Onboarding Wizard",
    description: "30-minute setup wizard for census migration and compliance configuration",
    icon: "house.fill",
    route: "/onboarding-wizard",
  },
  {
    id: "medication-tracker",
    title: "Medication Tracker",
    description: "Track medications, set reminders, and monitor adherence",
    icon: "house.fill",
    route: "/medication-tracker",
  },
  {
    id: "vitals-tracker",
    title: "Vitals Tracker",
    description: "Log blood pressure, heart rate, weight, and blood glucose",
    icon: "house.fill",
    route: "/vitals-tracker",
  },
  {
    id: "ai-assistant",
    title: "AI Voice Assistant",
    description: "Natural language health assistant with voice and text support",
    icon: "house.fill",
    route: "/ai-assistant",
  },
  {
    id: "health-insights",
    title: "Health Insights Dashboard",
    description: "Predictive alerts, health score, and personalized recommendations",
    icon: "house.fill",
    route: "/health-insights",
  },
  {
    id: "caregiver-connection",
    title: "Caregiver Connection",
    description: "Share health data and communicate with family caregivers",
    icon: "house.fill",
    route: "/caregiver-connection",
  },
  {
    id: "appointments",
    title: "Appointment Scheduling",
    description: "Manage doctor appointments with reminders and calendar view",
    icon: "house.fill",
    route: "/appointments",
  },
  {
    id: "wearables",
    title: "Wearable Device Integration",
    description: "Sync data from Apple Health, Google Fit, and fitness trackers",
    icon: "house.fill",
    route: "/wearables",
  },
  {
    id: "emergency-sos",
    title: "Emergency SOS",
    description: "One-tap emergency calling with location sharing and caregiver alerts",
    icon: "house.fill",
    route: "/emergency-sos",
  },
  {
    id: "documentation-center",
    title: "Health Documentation Center",
    description: "Research health conditions, symptoms, treatments, and lifestyle tips",
    icon: "house.fill",
    route: "/documentation-center",
  },
  {
    id: "medication-interaction",
    title: "Medication Interaction Checker",
    description: "Check for drug interactions and view severity levels",
    icon: "house.fill",
    route: "/medication-interaction-checker",
  },
  {
    id: "fall-detection",
    title: "Fall Detection",
    description: "Automatic fall detection with emergency alerts",
    icon: "house.fill",
    route: "/fall-detection",
  },
  {
    id: "health-report",
    title: "Health Report PDF Export",
    description: "Generate comprehensive health reports for doctors",
    icon: "house.fill",
    route: "/health-report-export",
  },
  {
    id: "telemedicine",
    title: "Telemedicine Video Calling",
    description: "Video consultations with doctors and healthcare providers",
    icon: "house.fill",
    route: "/telemedicine",
  },
  {
    id: "medication-refill",
    title: "Medication Refill Reminders",
    description: "Track prescriptions and order refills from pharmacies",
    icon: "house.fill",
    route: "/medication-refill",
  },
  {
    id: "social-features",
    title: "Social Features",
    description: "Health challenges, achievements, community forum, and messaging",
    icon: "house.fill",
    route: "/social-features",
  },
  {
    id: "medication-barcode",
    title: "Medication Barcode Scanner",
    description: "Scan medication barcodes to auto-fill details",
    icon: "house.fill",
    route: "/medication-barcode-scanner",
  },
  {
    id: "health-goals",
    title: "Health Goals & Progress Tracking",
    description: "Set and track health goals with progress visualization",
    icon: "house.fill",
    route: "/health-goals",
  },
  {
    id: "bp-dashboard",
    title: "Blood Pressure Dashboard",
    description: "Dedicated BP tracking with trend analysis and alerts",
    icon: "house.fill",
    route: "/blood-pressure-dashboard",
  },
  {
    id: "doctor-visit-prep",
    title: "Doctor Visit Preparation Tool",
    description: "Generate visit summaries and suggested questions",
    icon: "house.fill",
    route: "/doctor-visit-preparation",
  },
  {
    id: "nutrition-tracking",
    title: "Nutrition Tracking",
    description: "Log meals, track calories, and monitor macronutrients",
    icon: "house.fill",
    route: "/nutrition-tracking",
  },
  {
    id: "exercise-library",
    title: "Exercise Library",
    description: "Senior-friendly workouts with video demonstrations",
    icon: "house.fill",
    route: "/exercise-library",
  },
  {
    id: "symptom-diary",
    title: "Symptom Diary",
    description: "Track symptoms, identify patterns, and generate reports",
    icon: "house.fill",
    route: "/symptom-diary",
  },
  {
    id: "medication-photo",
    title: "Medication Photo Recognition",
    description: "AI-powered pill identification from photos",
    icon: "house.fill",
    route: "/medication-photo-recognition",
  },
  {
    id: "insurance-scanner",
    title: "Health Insurance Card Scanner",
    description: "OCR extraction of insurance information from card photos",
    icon: "house.fill",
    route: "/insurance-card-scanner",
  },
  {
    id: "wellness-score",
    title: "Wellness Score Dashboard",
    description: "Comprehensive wellness score with category breakdown",
    icon: "house.fill",
    route: "/wellness-score-dashboard",
  },
  {
    id: "ai-appointment-coach",
    title: "AI Appointment Coach",
    description: "Real-time transcription and note-taking during doctor visits",
    icon: "house.fill",
    route: "/ai-appointment-coach",
  },
  {
    id: "fall-stability-alert",
    title: "Predictive Fall & Stability Alert",
    description: "7-day gait analysis with proactive fall risk alerts",
    icon: "house.fill",
    route: "/fall-stability-alert",
  },
  {
    id: "medication-cost",
    title: "Medication Cost Optimizer",
    description: "Compare prices and find cheaper alternatives",
    icon: "house.fill",
    route: "/medication-cost-optimizer",
  },
  {
    id: "cgm-integration",
    title: "Continuous Glucose Monitor Integration",
    description: "Real-time glucose monitoring with trend analysis",
    icon: "house.fill",
    route: "/cgm-integration",
  },
  {
    id: "food-scan",
    title: "Food Scan & Instant Nutrition Analysis",
    description: "AI-powered food recognition with nutritional information",
    icon: "house.fill",
    route: "/food-scan",
  },
  {
    id: "specialist-booking",
    title: "Specialist Booking & Referral Tracker",
    description: "Manage specialist appointments and referrals",
    icon: "house.fill",
    route: "/specialist-booking",
  },
];

export default function FeaturesScreen() {
  const colors = useColors();

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
          Explore all HealthMate features
        </Text>
      </View>

      <FlatList
        data={FEATURES}
        renderItem={renderFeatureItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScreenContainer>
  );
}
