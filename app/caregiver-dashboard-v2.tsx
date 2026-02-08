import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type PeaceOfMindStatus = "excellent" | "good" | "caution" | "alert";

interface PatientStatus {
  id: string;
  name: string;
  lastActive: Date;
  peaceOfMindStatus: PeaceOfMindStatus;
  vitals: {
    bloodPressure: { systolic: number; diastolic: number; status: "normal" | "elevated" | "high" };
    heartRate: { value: number; status: "normal" | "elevated" };
    weight: { value: number; trend: "stable" | "increasing" | "decreasing" };
  };
  medications: {
    taken: number;
    total: number;
    adherence: number;
  };
  alerts: Array<{
    type: "fall_risk" | "cognitive" | "medication" | "vitals";
    severity: "critical" | "proactive" | "routine";
    message: string;
    timestamp: Date;
  }>;
  cognitiveScore: number;
  fallRiskScore: number;
}

export default function CaregiverDashboardV2Screen() {
  const colors = useColors();
  const [patients, setPatients] = useState<PatientStatus[]>([
    {
      id: "1",
      name: "Mom",
      lastActive: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      peaceOfMindStatus: "good",
      vitals: {
        bloodPressure: { systolic: 128, diastolic: 82, status: "elevated" },
        heartRate: { value: 72, status: "normal" },
        weight: { value: 165, trend: "stable" },
      },
      medications: {
        taken: 2,
        total: 3,
        adherence: 95,
      },
      alerts: [
        {
          type: "fall_risk",
          severity: "proactive",
          message: "Gait stability declined 12% this week",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
      cognitiveScore: 88,
      fallRiskScore: 15,
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<PatientStatus>(patients[0]);

  // Update last active timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prev) =>
        prev.map((p) => ({
          ...p,
          lastActive: p.lastActive, // In production, fetch from server
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  function getTimeSinceActive(date: Date): string {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function getPeaceOfMindColor(status: PeaceOfMindStatus): string {
    switch (status) {
      case "excellent":
        return colors.success;
      case "good":
        return "#10B981";
      case "caution":
        return "#F59E0B";
      case "alert":
        return colors.error;
    }
  }

  function getPeaceOfMindText(status: PeaceOfMindStatus): string {
    switch (status) {
      case "excellent":
        return "All vitals within baseline";
      case "good":
        return "Minor deviations, no action needed";
      case "caution":
        return "AI predicts potential risk";
      case "alert":
        return "Immediate attention recommended";
    }
  }

  function handleQuickConnect() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "📞 Quick Connect",
      `Call ${selectedPatient.name} now?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            // In production, initiate VoIP call
            Alert.alert("Calling...", `Connecting to ${selectedPatient.name}`);
          },
        },
      ]
    );
  }

  function handleSendNudge() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "💬 Send Nudge",
      "Choose a message:",
      [
        {
          text: "Just checking in, love you!",
          onPress: () => sendNudge("Just checking in, love you!"),
        },
        {
          text: "How are you feeling today?",
          onPress: () => sendNudge("How are you feeling today?"),
        },
        {
          text: "Don't forget your afternoon meds!",
          onPress: () => sendNudge("Don't forget your afternoon meds!"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  function sendNudge(message: string) {
    // In production, send voice message to senior's device
    Alert.alert("✓ Nudge Sent", `"${message}" will play on ${selectedPatient.name}'s device`);
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Care Dashboard</Text>
          <Pressable
            onPress={() => router.push("/alert-settings")}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">⚙️</Text>
          </Pressable>
        </View>

        {/* At-a-Glance Status Header */}
        <View className="bg-surface p-6 rounded-2xl mb-6 border-2" style={{ borderColor: getPeaceOfMindColor(selectedPatient.peaceOfMindStatus) }}>
          {/* Patient Name & Last Active */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-bold text-foreground">{selectedPatient.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.success }}
                />
                <Text className="text-base text-muted">
                  Active {getTimeSinceActive(selectedPatient.lastActive)}
                </Text>
              </View>
            </View>
            <Text className="text-5xl">👵</Text>
          </View>

          {/* Peace of Mind Status Bar */}
          <View
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: getPeaceOfMindColor(selectedPatient.peaceOfMindStatus) + "20" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-lg font-bold mb-1"
                  style={{ color: getPeaceOfMindColor(selectedPatient.peaceOfMindStatus) }}
                >
                  Peace of Mind: {selectedPatient.peaceOfMindStatus.toUpperCase()}
                </Text>
                <Text className="text-sm text-muted">
                  {getPeaceOfMindText(selectedPatient.peaceOfMindStatus)}
                </Text>
              </View>
              <Text className="text-4xl">
                {selectedPatient.peaceOfMindStatus === "excellent" ? "✅" : 
                 selectedPatient.peaceOfMindStatus === "good" ? "👍" :
                 selectedPatient.peaceOfMindStatus === "caution" ? "⚠️" : "🚨"}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleQuickConnect}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, flex: 1 })}
              className="bg-primary py-3 rounded-xl items-center"
            >
              <Text className="text-white text-base font-bold">📞 Quick Call</Text>
            </Pressable>
            <Pressable
              onPress={handleSendNudge}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, flex: 1 })}
              className="bg-success py-3 rounded-xl items-center"
            >
              <Text className="text-white text-base font-bold">💬 Send Nudge</Text>
            </Pressable>
          </View>
        </View>

        {/* AI Risk Trend Visualization */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">📊 AI Risk Trends</Text>
          
          {/* Vitals Trend Ribbon */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Blood Pressure</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedPatient.vitals.bloodPressure.status === "normal" ? colors.success : "#F59E0B" }}
                />
                <Text className="text-lg font-bold text-foreground">
                  {selectedPatient.vitals.bloodPressure.systolic}/{selectedPatient.vitals.bloodPressure.diastolic}
                </Text>
              </View>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: "70%",
                  backgroundColor: selectedPatient.vitals.bloodPressure.status === "normal" ? colors.success : "#F59E0B",
                }}
              />
            </View>
            <Text className="text-sm text-muted mt-1">
              {selectedPatient.vitals.bloodPressure.status === "normal" ? "Within healthy range" : "Slightly elevated, monitoring"}
            </Text>
          </View>

          {/* Fall Risk Trend */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Fall Risk</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedPatient.fallRiskScore < 20 ? colors.success : "#F59E0B" }}
                />
                <Text className="text-lg font-bold text-foreground">
                  {selectedPatient.fallRiskScore}%
                </Text>
              </View>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${selectedPatient.fallRiskScore}%`,
                  backgroundColor: selectedPatient.fallRiskScore < 20 ? colors.success : "#F59E0B",
                }}
              />
            </View>
            <Text className="text-sm text-muted mt-1">
              {selectedPatient.fallRiskScore < 20 ? "Low risk, stable gait" : "Moderate risk, gait declined this week"}
            </Text>
          </View>

          {/* Cognitive Health Trend */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Cognitive Health</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedPatient.cognitiveScore >= 80 ? colors.success : "#F59E0B" }}
                />
                <Text className="text-lg font-bold text-foreground">
                  {selectedPatient.cognitiveScore}/100
                </Text>
              </View>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${selectedPatient.cognitiveScore}%`,
                  backgroundColor: selectedPatient.cognitiveScore >= 80 ? colors.success : "#F59E0B",
                }}
              />
            </View>
            <Text className="text-sm text-muted mt-1">
              {selectedPatient.cognitiveScore >= 80 ? "Good, within baseline" : "Below baseline, monitoring"}
            </Text>
          </View>
        </View>

        {/* Recent Alerts */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">🔔 Recent Alerts</Text>
          {selectedPatient.alerts.length > 0 ? (
            <View className="gap-3">
              {selectedPatient.alerts.map((alert, idx) => (
                <View
                  key={idx}
                  className="p-4 rounded-xl border-2"
                  style={{
                    borderColor: alert.severity === "critical" ? colors.error : alert.severity === "proactive" ? "#F59E0B" : colors.border,
                    backgroundColor: (alert.severity === "critical" ? colors.error : alert.severity === "proactive" ? "#F59E0B" : colors.border) + "10",
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <Text className="text-2xl">
                      {alert.type === "fall_risk" ? "⚠️" :
                       alert.type === "cognitive" ? "🧠" :
                       alert.type === "medication" ? "💊" : "❤️"}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground mb-1">
                        {alert.message}
                      </Text>
                      <Text className="text-sm text-muted">
                        {getTimeSinceActive(alert.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-base text-muted text-center py-4">
              No recent alerts ✓
            </Text>
          )}
        </View>

        {/* Medication Adherence */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">💊 Medication Status</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base text-foreground">Today's Progress</Text>
            <Text className="text-2xl font-bold text-primary">
              {selectedPatient.medications.taken}/{selectedPatient.medications.total}
            </Text>
          </View>
          <View className="h-3 bg-border rounded-full overflow-hidden mb-3">
            <View
              className="h-full rounded-full bg-success"
              style={{ width: `${(selectedPatient.medications.taken / selectedPatient.medications.total) * 100}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">30-Day Adherence</Text>
            <Text className="text-lg font-bold text-success">
              {selectedPatient.medications.adherence}%
            </Text>
          </View>
        </View>

        {/* Quick Links */}
        <View className="gap-3">
          <Pressable
            onPress={() => router.push("/care-circle")}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-bold">👥 Care Circle Coordination</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/alert-settings")}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-surface border border-border py-4 rounded-xl items-center"
          >
            <Text className="text-foreground text-lg font-bold">⚙️ Alert Settings</Text>
          </Pressable>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
