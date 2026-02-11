import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function NurseLeaderDashboardScreen() {
  // KPI Data (mock - to be replaced with tRPC queries)
  const [kpiData] = useState({
    documentationAccuracy: 98.5,
    avgSubmissionTime: 2.3,
    gapInCareAlerts: 0,
    telehealthRatio: 28,
  });

  // Staff Leaderboard Data
  const [staffLeaderboard] = useState([
    { id: 1, name: "Sarah Johnson, RN", accuracy: 99.8, visits: 142, rank: 1 },
    { id: 2, name: "Michael Chen, RN", accuracy: 99.2, visits: 138, rank: 2 },
    { id: 3, name: "Emily Rodriguez, LPN", accuracy: 98.7, visits: 156, rank: 3 },
    { id: 4, name: "David Thompson, RN", accuracy: 97.5, visits: 129, rank: 4 },
    { id: 5, name: "Lisa Martinez, LPN", accuracy: 96.8, visits: 145, rank: 5 },
  ]);

  // Gap in Care Heat Map Data
  const [gapInCarePatients] = useState([
    { id: 1, name: "Margaret Johnson", hoursSinceVisit: 96, status: "yellow" },
    { id: 2, name: "Robert Williams", hoursSinceVisit: 115, status: "red" },
  ]);

  // Ready for QA Records
  const [qaRecords] = useState([
    { id: 1, patientName: "Patricia Davis", recordType: "HIS Admission", submittedBy: "Sarah Johnson, RN", date: "2026-02-10" },
    { id: 2, patientName: "James Miller", recordType: "HOPE Discharge", submittedBy: "Michael Chen, RN", date: "2026-02-10" },
    { id: 3, patientName: "Linda Wilson", recordType: "HIS Admission", submittedBy: "Emily Rodriguez, LPN", date: "2026-02-11" },
  ]);

  const handleDrillDown = (alertType: string, patientName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      `${alertType} Alert`,
      `Opening detailed records for ${patientName}...`,
      [{ text: "OK" }]
    );
  };

  const handleBulkQAApproval = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Bulk QA Approval",
      `Approve ${qaRecords.length} records for iQIES submission?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve All",
          onPress: () => {
            Alert.alert("Success", `${qaRecords.length} records approved and queued for iQIES export.`);
          },
        },
      ]
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 98) return "#22C55E"; // Green
    if (accuracy >= 95) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const getGapStatusColor = (status: string) => {
    switch (status) {
      case "yellow": return "#F59E0B";
      case "red": return "#EF4444";
      default: return "#9CA3AF";
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1">
        <View className="p-6 pb-24">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <BackButton />
              <View className="ml-3 flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  Nurse Leader Dashboard
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Staff performance & compliance monitoring
                </Text>
              </View>
            </View>
          </View>

          {/* KPI Widgets Grid */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              Key Performance Indicators
            </Text>
            <View className="gap-3">
              {/* Widget 1: Documentation Accuracy Score */}
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">
                      Documentation Accuracy Score
                    </Text>
                    <Text className="text-4xl font-bold text-success">
                      {kpiData.documentationAccuracy}%
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <Text className="text-xs text-muted">Target: &gt;98%</Text>
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-success">
                      Above Target
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted mt-2">
                  Visits completed without compliance gap alerts
                </Text>
              </View>

              {/* Widget 2: HIS Submission Timeliness */}
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">
                      HIS Submission Timeliness
                    </Text>
                    <Text className="text-4xl font-bold text-primary">
                      {kpiData.avgSubmissionTime} Days
                    </Text>
                  </View>
                  <Ionicons name="time" size={48} color="#0a7ea4" />
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <Text className="text-xs text-muted">Target: &lt;3 Days</Text>
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-success">
                      On Track
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted mt-2">
                  Average days from admission/discharge to "Ready for QA"
                </Text>
              </View>

              {/* Widget 3: Visit Frequency Monitor */}
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">
                      Visit Frequency Monitor
                    </Text>
                    <Text className="text-4xl font-bold text-success">
                      {kpiData.gapInCareAlerts}
                    </Text>
                  </View>
                  <Ionicons name="shield-checkmark" size={48} color="#22C55E" />
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <Text className="text-xs text-muted">Target: 0 Red Flags</Text>
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-success">
                      Excellent
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted mt-2">
                  Patients with 7+ day gap in skilled nursing visits
                </Text>
              </View>

              {/* Widget 4: Telehealth vs In-Person Ratio */}
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">
                      Telehealth vs In-Person Ratio
                    </Text>
                    <Text className="text-4xl font-bold text-primary">
                      {kpiData.telehealthRatio}%
                    </Text>
                  </View>
                  <Ionicons name="videocam" size={48} color="#0a7ea4" />
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <Text className="text-xs text-muted">Telehealth visits this month</Text>
                  <Text className="text-xs text-foreground font-semibold">
                    72% In-Person
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-2">
                  Breakdown for Medicare Cost Report balancing
                </Text>
              </View>
            </View>
          </View>

          {/* Staff Leaderboard */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                Compliance Accuracy Leaderboard
              </Text>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              {staffLeaderboard.map((staff, index) => (
                <View key={staff.id}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert(
                        staff.name,
                        `Compliance Accuracy: ${staff.accuracy}%\nTotal Visits: ${staff.visits}\n\nView detailed performance report?`,
                        [{ text: "Close" }, { text: "View Report" }]
                      );
                    }}
                    className="py-3 active:opacity-70"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor:
                            staff.rank === 1
                              ? "#F59E0B20"
                              : staff.rank === 2
                              ? "#9CA3AF20"
                              : staff.rank === 3
                              ? "#CD7F3220"
                              : "#E5E7EB",
                        }}
                      >
                        <Text
                          className="text-sm font-bold"
                          style={{
                            color:
                              staff.rank === 1
                                ? "#F59E0B"
                                : staff.rank === 2
                                ? "#6B7280"
                                : staff.rank === 3
                                ? "#CD7F32"
                                : "#9CA3AF",
                          }}
                        >
                          {staff.rank}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {staff.name}
                        </Text>
                        <Text className="text-sm text-muted">
                          {staff.visits} visits completed
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text
                          className="text-xl font-bold"
                          style={{ color: getAccuracyColor(staff.accuracy) }}
                        >
                          {staff.accuracy}%
                        </Text>
                        <Text className="text-xs text-muted">Accuracy</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < staffLeaderboard.length - 1 && (
                    <View className="h-px bg-border my-1" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Gap in Care Heat Map */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                Gap in Care Heat Map
              </Text>
              <View className="bg-warning/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-warning">
                  {gapInCarePatients.length} Alerts
                </Text>
              </View>
            </View>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-sm text-muted mb-4">
                Patients without documented visit in last 120 hours (5 days)
              </Text>
              {gapInCarePatients.length > 0 ? (
                gapInCarePatients.map((patient, index) => (
                  <View key={patient.id}>
                    <TouchableOpacity
                      onPress={() => handleDrillDown("Gap in Care", patient.name)}
                      className="py-3 active:opacity-70"
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name="warning"
                          size={24}
                          color={getGapStatusColor(patient.status)}
                        />
                        <View className="flex-1 ml-3">
                          <Text className="text-base font-semibold text-foreground">
                            {patient.name}
                          </Text>
                          <Text className="text-sm text-muted">
                            {patient.hoursSinceVisit} hours since last visit
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                    {index < gapInCarePatients.length - 1 && (
                      <View className="h-px bg-border my-1" />
                    )}
                  </View>
                ))
              ) : (
                <View className="items-center py-6">
                  <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                  <Text className="text-base font-semibold text-success mt-3">
                    No Gap in Care Alerts
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    All patients have recent skilled nursing visits
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* QA Workflow */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                QA Approval Workflow
              </Text>
              <View className="bg-primary/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-primary">
                  {qaRecords.length} Ready
                </Text>
              </View>
            </View>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-sm text-muted mb-4">
                HIS/HOPE records ready for final review and iQIES submission
              </Text>
              {qaRecords.map((record, index) => (
                <View key={record.id}>
                  <View className="py-3">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {record.patientName}
                        </Text>
                        <Text className="text-sm text-muted mt-1">
                          {record.recordType}
                        </Text>
                      </View>
                      <View className="bg-success/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-success">
                          Validated
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted">
                      Submitted by {record.submittedBy} • {record.date}
                    </Text>
                  </View>
                  {index < qaRecords.length - 1 && (
                    <View className="h-px bg-border my-1" />
                  )}
                </View>
              ))}

              {/* Bulk Approve Button */}
              <TouchableOpacity
                onPress={handleBulkQAApproval}
                className="bg-primary px-6 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mt-4"
              >
                <Ionicons name="checkmark-done" size={20} color="white" />
                <Text className="text-white font-bold ml-2 text-base">
                  Approve All & Submit to iQIES
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
