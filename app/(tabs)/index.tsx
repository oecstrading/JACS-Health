import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { ComplianceDashboard } from '@/components/compliance-dashboard';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ActionCard } from '@/components/action-card';
import { RecentInsulinWidget } from '@/components/recent-insulin-widget';
import { RecentMealsWidget } from '@/components/recent-meals-widget';
import { GlucoseWidget, BloodPressureWidget, WeightWidget } from '@/components/dashboard-widgets';

/**
 * Home Screen - Health Dashboard
 *
 * Main dashboard for older adults showing health summary and quick actions.
 * Designed with large text, high contrast, and simple navigation.
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // TODO: Implement emergency contact functionality
    alert("Emergency contact feature coming soon");
  };

  return (
    <ScreenContainer>
      {/* Header with greeting and emergency button */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Hello! 👋
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            How are you feeling today?
          </Text>
        </View>
        <Pressable
          onPress={handleEmergency}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.8 : 1,
              backgroundColor: colors.error,
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
            } as ViewStyle,
          ]}
        >
          <IconSymbol name="phone.fill" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Today's Summary
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <Text className="text-lg text-foreground flex-1" style={{ lineHeight: 26 }}>
                2 medications taken
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="heart.fill" size={24} color={colors.primary} />
              </View>
              <Text className="text-lg text-foreground flex-1" style={{ lineHeight: 26 }}>
                Vitals logged this morning
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="figure.walk" size={24} color={colors.primary} />
              </View>
              <Text className="text-lg text-foreground flex-1" style={{ lineHeight: 26 }}>
                3,245 steps today
              </Text>
            </View>
          </View>
        </View>

        {/* Medicare Compliance Dashboard */}
        <ComplianceDashboard />

        {/* Dashboard Preview Widgets */}
        <Text className="text-2xl font-bold text-foreground mb-4 mt-6" style={{ lineHeight: 32 }}>
          Latest Readings
        </Text>
        <GlucoseWidget />
        <BloodPressureWidget />
        <WeightWidget />

        {/* Recent Insulin & Meals */}
        <RecentInsulinWidget />
        <RecentMealsWidget />

        {/* Master Dashboard Link */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/master-dashboard" as any);
          }}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text style={{ fontSize: 32 }}>📊</Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white mb-1" style={{ lineHeight: 32 }}>
                Master Dashboard
              </Text>
              <Text className="text-base text-white" style={{ opacity: 0.9, lineHeight: 22 }}>
                View all monitoring dashboards
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={28} color="#ffffff" />
          </View>
        </Pressable>

        {/* Quick Actions */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          Quick Actions
        </Text>
        <View className="gap-4 pb-8">
          <ActionCard
            title="Talk to AI Assistant"
            icon="mic.fill"
            color="primary"
            onPress={() => router.push("/symptom-checker" as any)}
          />
          <ActionCard
            title="Log Medication"
            icon="pills.fill"
            color="success"
            onPress={() => router.push("/medication-log" as any)}
          />
          <ActionCard
            title="Log Insulin"
            icon="syringe.fill"
            color="warning"
            onPress={() => router.push("/log-insulin" as any)}
          />
          <ActionCard
            title="Log Meal"
            icon="fork.knife"
            color="success"
            onPress={() => router.push("/log-meal" as any)}
          />
          <ActionCard
            title="Log Hip Pain"
            icon="bandage.fill"
            color="error"
            onPress={() => router.push("/hip-health-dashboard" as any)}
          />
          <ActionCard
            title="Telemedicine"
            icon="video.fill"
            color="primary"
            onPress={() => router.push("/telemedicine")}
          />
          <ActionCard
            title="Community"
            icon="person.3.fill"
            color="success"
            onPress={() => router.push("/social")}
          />
          <ActionCard
            title="Health Docs"
            icon="book.fill"
            color="primary"
            onPress={() => router.push("/health-docs")}
          />
          <ActionCard
            title="Caregiver Dashboard"
            icon="person.2.fill"
            color="success"
            onPress={() => router.push("/caregiver-dashboard")}
          />
          <ActionCard
            title="Scan Medication"
            icon="camera.fill"
            color="primary"
            onPress={() => router.push("/barcode-scanner")}
          />
          <ActionCard
            title="Health Goals"
            icon="flag.fill"
            color="success"
            onPress={() => router.push("/health-goals")}
          />
          <ActionCard
            title="BP Dashboard"
            icon="heart.fill"
            color="error"
            onPress={() => router.push("/bp-dashboard")}
          />
          <ActionCard
            title="Doctor Visit Prep"
            icon="doc.text.fill"
            color="primary"
            onPress={() => router.push("/doctor-visit-prep")}
          />
          <ActionCard
            title="Nutrition Tracker"
            icon="fork.knife"
            color="success"
            onPress={() => router.push("/nutrition")}
          />
          <ActionCard
            title="Exercise Library"
            icon="figure.walk"
            color="primary"
            onPress={() => router.push("/exercise")}
          />
          <ActionCard
            title="Symptom Diary"
            icon="note.text"
            color="warning"
            onPress={() => router.push("/symptom-diary")}
          />
          <ActionCard
            title="Pill Identifier"
            icon="camera.fill"
            color="primary"
            onPress={() => router.push("/pill-identifier")}
          />
          <ActionCard
            title="Medical Records"
            icon="doc.fill"
            color="primary"
            onPress={() => router.push("/medical-records" as any)}
          />
          <ActionCard
            title="Imaging Analysis"
            icon="brain.head.profile"
            color="success"
            onPress={() => router.push("/imaging-analysis" as any)}
          />
          <ActionCard
            title="Insurance Scanner"
            icon="creditcard.fill"
            color="success"
            onPress={() => router.push("/insurance-scanner")}
          />
          <ActionCard
            title="Wellness Score"
            icon="chart.bar.fill"
            color="primary"
            onPress={() => router.push("/wellness-dashboard")}
          />
          <ActionCard
            title="Medical Visit Mode"
            icon="waveform"
            color="primary"
            onPress={() => router.push("/medical-visit-mode")}
          />
          <ActionCard
            title="Stability Monitor"
            icon="figure.walk"
            color="warning"
            onPress={() => router.push("/stability-monitor")}
          />
          <ActionCard
            title="Brain Health Check"
            icon="brain"
            color="primary"
            onPress={() => router.push("/cognitive-check")}
          />
          <ActionCard
            title="Omron Devices"
            icon="antenna.radiowaves.left.and.right"
            color="primary"
            onPress={() => router.push("/omron-devices")}
          />
          <ActionCard
            title="Live Vitals Monitor"
            icon="waveform.path.ecg"
            color="error"
            onPress={() => router.push("/realtime-vitals")}
          />
          <ActionCard
            title="Milestones & Badges"
            icon="trophy.fill"
            color="warning"
            onPress={() => router.push("/milestones")}
          />
          <ActionCard
            title="CGM Monitor"
            icon="waveform.path.ecg"
            color="primary"
            onPress={() => router.push("/cgm-monitor")}
          />
          <ActionCard
            title="Food Scanner"
            icon="camera.fill"
            color="success"
            onPress={() => router.push("/food-scanner")}
          />
          <ActionCard
            title="Medication Cost Compare"
            icon="dollarsign.circle.fill"
            color="warning"
            onPress={() => router.push("/medication-cost")}
          />
          <ActionCard
            title="Book Specialist"
            icon="calendar"
            color="primary"
            onPress={() => router.push("/specialist-booking")}
          />
          <ActionCard
            title="Rheumatoid Arthritis"
            icon="hand.raised.fill"
            color="error"
            onPress={() => router.push("/rheumatoid-arthritis")}
          />
          <ActionCard
            title="Type 1 Diabetes"
            icon="drop.fill"
            color="warning"
            onPress={() => router.push("/type1-diabetes")}
          />
          <ActionCard
            title="Apple Watch"
            icon="applewatch"
            color="primary"
            onPress={() => router.push("/watch-complications")}
          />
          <ActionCard
            title="Auto-Refill"
            icon="arrow.clockwise.circle.fill"
            color="success"
            onPress={() => router.push("/pharmacy-auto-refill")}
          />
          <ActionCard
            title="AI Meal Planner"
            icon="fork.knife"
            color="primary"
            onPress={() => router.push("/ai-meal-planner")}
          />
          <ActionCard
            title="CGM Caregiver Sharing"
            icon="person.2.fill"
            color="primary"
            onPress={() => router.push("/cgm-caregiver-sharing")}
          />
          <ActionCard
            title="Voice Emergency"
            icon="exclamationmark.triangle.fill"
            color="error"
            onPress={() => router.push("/emergency" as any)}
          />
          <ActionCard
            title="Interaction Checker"
            icon="exclamationmark.shield.fill"
            color="warning"
            onPress={() => router.push("/interactions" as any)}
          />

          {/* Phase 16: Device Sync Management */}
          <ActionCard
            title="Device Sync"
            icon="arrow.triangle.2.circlepath"
            color="primary"
            onPress={() => router.push("/device-sync" as any)}
          />

          {/* Phase 17 & 25: Global Health Knowledge Engine + Categorized Library */}
          <ActionCard
            title="Medical Library"
            icon="book.fill"
            color="primary"
            onPress={() => router.push("/medical-library-categorized" as any)}
          />
          
          {/* Phase 26: Interactive Health Tools */}
          <ActionCard
            title="Symptom Checker"
            icon="heart.fill"
            color="error"
            onPress={() => router.push("/symptom-checker" as any)}
          />
          <ActionCard
            title="Family Health History"
            icon="person.3.fill"
            color="warning"
            onPress={() => router.push("/family-health-history" as any)}
          />
          
          <ActionCard
            title="Mood & Cognitive Tracker"
            icon="brain.fill"
            color="warning"
            onPress={() => router.push("/mood-cognitive-tracker" as any)}
          />
          <ActionCard
            title="My Health Center"
            icon="folder.fill"
            color="success"
            onPress={() => router.push("/my-health-center" as any)}
          />

          {/* Phase 18: Local Health Finder */}
          <ActionCard
            title="Find Care Near Me"
            icon="house.fill"
            color="success"
            onPress={() => router.push("/find-care" as any)}
          />
          <ActionCard
            title="Pharmacy Finder"
            icon="cross.case.fill"
            color="warning"
            onPress={() => router.push("/pharmacy-finder" as any)}
          />

          {/* Phase 19: Smart Voice Intake */}
          <ActionCard
            title="New Patient Forms"
            icon="doc.text.fill"
            color="primary"
            onPress={() => router.push("/intake-template-selection" as any)}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
