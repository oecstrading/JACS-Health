import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";

export default function HospiceRevenueCommandScreen() {
  // APU Status Calculation (mock data - would come from database)
  const [apuStatus, setApuStatus] = useState(96);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState(8);
  const [pendingAlerts, setPendingAlerts] = useState(12);

  // Calculate days until end of reporting period
  useEffect(() => {
    const calculateDeadline = () => {
      const today = new Date();
      const endOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
      const daysLeft = Math.ceil((endOfQuarter.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setDaysUntilDeadline(daysLeft);
    };
    calculateDeadline();
  }, []);

  const handleResolveAlerts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hospice-compliance-tracker");
  };

  const handleExportPatient = (patientName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "iQIES Export",
      `Exporting ${patientName} data to CMS iQIES system...`,
      [{ text: "OK" }]
    );
  };

  const handleGenerateCAHPS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "CAHPS Export Generated",
      "Monthly CAHPS CSV file has been generated and is ready for vendor upload.",
      [{ text: "OK" }]
    );
  };

  const handleSmartFolder = (folderName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      folderName,
      `Viewing detailed breakdown for ${folderName}...`,
      [{ text: "OK" }]
    );
  };

  // Mock patient data with submission status
  const submissionQueue = [
    { id: 1, name: "Margaret Johnson", event: "Admission", daysAgo: 8, status: "green" },
    { id: 2, name: "Robert Williams", event: "Discharge", daysAgo: 12, status: "green" },
    { id: 3, name: "Patricia Davis", event: "Admission", daysAgo: 17, status: "yellow" },
    { id: 4, name: "James Miller", event: "Discharge", daysAgo: 19, status: "yellow" },
    { id: 5, name: "Linda Wilson", event: "Admission", daysAgo: 23, status: "red" },
    { id: 6, name: "Michael Moore", event: "Discharge", daysAgo: 26, status: "red" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "#22C55E";
      case "yellow": return "#F59E0B";
      case "red": return "#EF4444";
      default: return "#9CA3AF";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "green": return "On Track";
      case "yellow": return "Manual Intervention";
      case "red": return "URGENT";
      default: return "Unknown";
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
                  Revenue Command
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Hospice Compliance & Revenue Protection
                </Text>
              </View>
            </View>
          </View>

          {/* At-Risk Revenue Header (Top Ribbon) */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: apuStatus >= 90 ? "#22C55E" : "#EF4444",
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">
                  Current APU Status: {apuStatus}%
                </Text>
                <Text className="text-white text-sm opacity-90">
                  {apuStatus >= 90
                    ? "✓ Above 90% threshold - No penalty risk"
                    : `⚠️ ${(90 - apuStatus).toFixed(1)}% penalty pending ($180K at risk)`}
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={40} color="white" />
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-white/30">
              <View>
                <Text className="text-white text-xs opacity-75 mb-1">
                  Reporting Period Ends In
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {daysUntilDeadline} Days
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleResolveAlerts}
                className="bg-white px-5 py-3 rounded-xl active:opacity-80"
              >
                <Text className="font-semibold" style={{ color: apuStatus >= 90 ? "#22C55E" : "#EF4444" }}>
                  Resolve {pendingAlerts} Alerts
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Three-Column Layout */}
          <View className="gap-6">
            {/* Module A: HIS/HOPE Submission Queue (Left Column) */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center mb-4">
                <Ionicons name="list" size={24} color="#0a7ea4" />
                <Text className="text-lg font-bold text-foreground ml-3">
                  HIS/HOPE Submission Queue
                </Text>
              </View>

              <Text className="text-sm text-muted mb-4">
                Patients organized by days since admission/discharge event
              </Text>

              {submissionQueue.map((patient) => (
                <View
                  key={patient.id}
                  className="mb-3 p-4 rounded-xl border"
                  style={{ borderColor: getStatusColor(patient.status) }}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {patient.name}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        {patient.event} • {patient.daysAgo} days ago
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: getStatusColor(patient.status) + "20" }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getStatusColor(patient.status) }}
                      >
                        {getStatusLabel(patient.status)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleExportPatient(patient.name)}
                    className="bg-primary px-4 py-2 rounded-lg active:opacity-80 flex-row items-center justify-center mt-2"
                  >
                    <Ionicons name="cloud-upload-outline" size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      iQIES Export
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Module B: CAHPS Caregiver Tracker (Center Column) */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center mb-4">
                <Ionicons name="calendar" size={24} color="#0a7ea4" />
                <Text className="text-lg font-bold text-foreground ml-3">
                  CAHPS Caregiver Tracker
                </Text>
              </View>

              <Text className="text-sm text-muted mb-4">
                Monthly decedent count and survey vendor synchronization
              </Text>

              {/* Eligibility Counter */}
              <View className="bg-primary/10 rounded-xl p-4 mb-4">
                <Text className="text-sm text-muted mb-2">Current Month</Text>
                <Text className="text-3xl font-bold text-primary mb-1">
                  62 Eligible Decedents
                </Text>
                <Text className="text-xs text-muted">
                  Survey Required (18+, 48+ hours in care, primary caregiver)
                </Text>
              </View>

              {/* Vendor Sync Status */}
              <View className="bg-surface rounded-xl p-4 border border-border mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Vendor Sync Status
                  </Text>
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-success">
                      Active
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted">
                  Last Data Push: 48 Hours Ago
                </Text>
              </View>

              {/* Generate CAHPS File Button */}
              <TouchableOpacity
                onPress={handleGenerateCAHPS}
                className="bg-primary px-5 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
              >
                <Ionicons name="document-text-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Generate Monthly CAHPS File
                </Text>
              </TouchableOpacity>
            </View>

            {/* Module C: Cost Report Smart-Folders (Right Column) */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center mb-4">
                <Ionicons name="folder-open" size={24} color="#0a7ea4" />
                <Text className="text-lg font-bold text-foreground ml-3">
                  Cost Report Smart-Folders
                </Text>
              </View>

              <Text className="text-sm text-muted mb-4">
                CMS Worksheet automation for Medicare Cost Report
              </Text>

              {/* Compliance Gap Alert */}
              <View className="bg-warning/10 rounded-xl p-4 mb-4 border border-warning">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      Compliance Gap Alert
                    </Text>
                    <Text className="text-xs text-muted">
                      3 patients have gone 7+ days without skilled nursing visit (audit risk)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Smart-Folder Tiles */}
              <View className="gap-3">
                {/* Tile 1: Labor Costs */}
                <TouchableOpacity
                  onPress={() => handleSmartFolder("Labor Costs")}
                  className="bg-primary/10 rounded-xl p-4 border border-primary/30 active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-foreground">
                      Labor Costs
                    </Text>
                    <Ionicons name="people" size={20} color="#0a7ea4" />
                  </View>
                  <Text className="text-xs text-muted mb-2">
                    Nursing, Therapy, Social Work salaries tagged by visit logs
                  </Text>
                  <Text className="text-2xl font-bold text-primary">
                    $1.2M
                  </Text>
                </TouchableOpacity>

                {/* Tile 2: Telehealth Expenses */}
                <TouchableOpacity
                  onPress={() => handleSmartFolder("Telehealth Expenses")}
                  className="bg-success/10 rounded-xl p-4 border border-success/30 active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-foreground">
                      Telehealth Expenses
                    </Text>
                    <Ionicons name="videocam" size={20} color="#22C55E" />
                  </View>
                  <Text className="text-xs text-muted mb-2">
                    Aggregated from telemedicine minutes
                  </Text>
                  <Text className="text-2xl font-bold text-success">
                    $48K
                  </Text>
                </TouchableOpacity>

                {/* Tile 3: Administrative & General */}
                <TouchableOpacity
                  onPress={() => handleSmartFolder("Administrative & General")}
                  className="bg-warning/10 rounded-xl p-4 border border-warning/30 active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-foreground">
                      Administrative & General
                    </Text>
                    <Ionicons name="business" size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-xs text-muted mb-2">
                    Overhead and office costs
                  </Text>
                  <Text className="text-2xl font-bold text-warning">
                    $320K
                  </Text>
                </TouchableOpacity>

                {/* Tile 4: Level of Care Revenue */}
                <TouchableOpacity
                  onPress={() => handleSmartFolder("Level of Care Revenue")}
                  className="bg-error/10 rounded-xl p-4 border border-error/30 active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-foreground">
                      Level of Care Revenue
                    </Text>
                    <Ionicons name="medical" size={20} color="#EF4444" />
                  </View>
                  <Text className="text-xs text-muted mb-2">
                    RHC, CHC, GIP, Respite days
                  </Text>
                  <Text className="text-2xl font-bold text-error">
                    $2.8M
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
