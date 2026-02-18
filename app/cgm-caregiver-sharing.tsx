import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import CGMCaregiverSharingService, {
  type AlertThreshold,
  type CaregiverAlert,
  type WeeklySummary,
} from "@/services/cgmCaregiverSharingService";

export default function CGMCaregiverSharingScreen() {
  const colors = useColors();
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>([]);
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [activeTab, setActiveTab] = useState<"thresholds" | "alerts" | "summaries">("thresholds");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [thresholdsData, alertsData, summariesData] = await Promise.all([
      CGMCaregiverSharingService.getAllThresholds(),
      CGMCaregiverSharingService.getAllAlerts(),
      CGMCaregiverSharingService.getAllWeeklySummaries(),
    ]);

    setThresholds(thresholdsData);
    setAlerts(alertsData);
    setSummaries(summariesData);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await CGMCaregiverSharingService.acknowledgeAlert(alertId);
    await loadData();
  };

  const renderAlertType = (type: string) => {
    const colors_map = {
      critical_high: "#EF4444",
      high: "#F59E0B",
      low: "#F59E0B",
      critical_low: "#EF4444",
    };

    const labels = {
      critical_high: "CRITICAL HIGH",
      high: "High",
      low: "Low",
      critical_low: "CRITICAL LOW",
    };

    return (
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: colors_map[type as keyof typeof colors_map] || colors.muted }}
      >
        <Text className="text-xs font-bold text-white">
          {labels[type as keyof typeof labels] || type}
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">CGM Caregiver Sharing</Text>
            <Text className="text-base text-muted mt-1">
              Share glucose data with family & caregivers
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("thresholds")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "thresholds" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "thresholds" ? "#fff" : colors.foreground }}
              >
                Thresholds
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("alerts")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "alerts" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "alerts" ? "#fff" : colors.foreground }}
              >
                Alerts ({alerts.filter((a) => !a.acknowledged).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("summaries")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "summaries" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "summaries" ? "#fff" : colors.foreground }}
              >
                Summaries
              </Text>
            </TouchableOpacity>
          </View>

          {/* Thresholds Tab */}
          {activeTab === "thresholds" && (
            <View className="gap-4">
              {thresholds.length === 0 ? (
                <View
                  className="rounded-2xl p-8 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-6xl mb-4">👥</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Caregivers Added
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Add caregivers to share your glucose data and set custom alert thresholds
                  </Text>
                </View>
              ) : (
                thresholds.map((threshold, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-xl font-bold text-foreground mb-4">
                      Caregiver {index + 1}
                    </Text>

                    <View className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">High Alert</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {threshold.highThreshold} mg/dL
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Low Alert</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {threshold.lowThreshold} mg/dL
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Critical High</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.error }}>
                          {threshold.criticalHighThreshold} mg/dL
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Critical Low</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.error }}>
                          {threshold.criticalLowThreshold} mg/dL
                        </Text>
                      </View>

                      <View className="h-px my-2" style={{ backgroundColor: colors.border }} />

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-foreground">Email Alerts</Text>
                        <Switch value={threshold.emailEnabled} disabled />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-foreground">SMS Alerts</Text>
                        <Switch value={threshold.smsEnabled} disabled />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-foreground">Push Notifications</Text>
                        <Switch value={threshold.pushEnabled} disabled />
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <View className="gap-4">
              {alerts.length === 0 ? (
                <View
                  className="rounded-2xl p-8 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-6xl mb-4">✅</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Alerts
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Your glucose levels are within normal range
                  </Text>
                </View>
              ) : (
                alerts.map((alert) => (
                  <View
                    key={alert.id}
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: alert.acknowledged ? colors.surface : colors.surface,
                      opacity: alert.acknowledged ? 0.6 : 1,
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground mb-1">
                          Glucose: {alert.glucoseValue} mg/dL
                        </Text>
                        <Text className="text-sm text-muted">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Text>
                      </View>
                      {renderAlertType(alert.alertType)}
                    </View>

                    {!alert.acknowledged && (
                      <TouchableOpacity
                        onPress={() => handleAcknowledgeAlert(alert.id)}
                        className="rounded-full p-3 items-center mt-2"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-base font-semibold text-white">Acknowledge</Text>
                      </TouchableOpacity>
                    )}

                    {alert.acknowledged && (
                      <View className="mt-2">
                        <Text className="text-sm text-muted">
                          Acknowledged at {new Date(alert.acknowledgedAt!).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {/* Summaries Tab */}
          {activeTab === "summaries" && (
            <View className="gap-4">
              {summaries.length === 0 ? (
                <View
                  className="rounded-2xl p-8 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-6xl mb-4">📊</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Summaries Yet
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Weekly summaries will appear here automatically
                  </Text>
                </View>
              ) : (
                summaries.map((summary, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-xl font-bold text-foreground mb-1">
                      Weekly Summary
                    </Text>
                    <Text className="text-sm text-muted mb-4">
                      {new Date(summary.weekStart).toLocaleDateString()} -{" "}
                      {new Date(summary.weekEnd).toLocaleDateString()}
                    </Text>

                    <View className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Average Glucose</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {summary.averageGlucose} mg/dL
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Time in Range</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.success }}>
                          {summary.timeInRange}%
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Time Above Range</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.warning }}>
                          {summary.timeAboveRange}%
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Time Below Range</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.error }}>
                          {summary.timeBelowRange}%
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Total Readings</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {summary.totalReadings}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-muted">Glucose Variability</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {summary.glucoseVariability}%
                        </Text>
                      </View>

                      {summary.trends.length > 0 && (
                        <>
                          <View className="h-px my-2" style={{ backgroundColor: colors.border }} />
                          <Text className="text-base font-semibold text-foreground mb-2">
                            Trends
                          </Text>
                          {summary.trends.map((trend, i) => (
                            <View key={i} className="flex-row items-start gap-2">
                              <Text className="text-base text-foreground">•</Text>
                              <Text className="flex-1 text-base text-foreground">{trend}</Text>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
