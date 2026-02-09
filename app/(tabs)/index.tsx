import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { ActionCard } from "@/components/action-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

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

        {/* Quick Actions */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          Quick Actions
        </Text>
        <View className="gap-4 pb-8">
          <ActionCard
            title="Talk to AI Assistant"
            icon="mic.fill"
            color="primary"
            onPress={() => router.push("/assistant")}
          />
          <ActionCard
            title="Log Medication"
            icon="pills.fill"
            color="success"
            onPress={() => {
              // TODO: Navigate to medication logging
              alert("Medication logging coming soon");
            }}
          />
          <ActionCard
            title="Record Vitals"
            icon="heart.fill"
            color="primary"
            onPress={() => router.push("/health")}
          />
          <ActionCard
            title="View Health Insights"
            icon="chart.bar.fill"
            color="primary"
            onPress={() => router.push("/insights")}
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
