import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// Mock compliance data - in production, this would come from the database
const MOCK_COMPLIANCE_DATA = [
  {
    id: "1",
    patientName: "Margaret Thompson",
    mrn: "MRN-001234",
    assessmentType: "Admission",
    admissionDate: "2026-01-15",
    dueDate: "2026-02-14",
    daysRemaining: 3,
    status: "red" as const,
    submittedDate: null,
    careProcesses: {
      painScreening: true,
      dyspneaTreatment: true,
      treatmentPreferences: false,
      spiritualConcerns: false,
      emotionalSupport: true,
      caregiverEducation: false,
      advanceDirectives: true,
    },
  },
  {
    id: "2",
    patientName: "Robert Johnson",
    mrn: "MRN-001235",
    assessmentType: "Admission",
    admissionDate: "2026-01-20",
    dueDate: "2026-02-19",
    daysRemaining: 8,
    status: "yellow" as const,
    submittedDate: null,
    careProcesses: {
      painScreening: true,
      dyspneaTreatment: true,
      treatmentPreferences: true,
      spiritualConcerns: true,
      emotionalSupport: true,
      caregiverEducation: true,
      advanceDirectives: false,
    },
  },
  {
    id: "3",
    patientName: "Dorothy Williams",
    mrn: "MRN-001236",
    assessmentType: "Admission",
    admissionDate: "2026-01-10",
    dueDate: "2026-02-09",
    daysRemaining: -2,
    status: "red" as const,
    submittedDate: null,
    careProcesses: {
      painScreening: true,
      dyspneaTreatment: false,
      treatmentPreferences: true,
      spiritualConcerns: false,
      emotionalSupport: false,
      caregiverEducation: true,
      advanceDirectives: true,
    },
  },
  {
    id: "4",
    patientName: "James Brown",
    mrn: "MRN-001237",
    assessmentType: "Admission",
    admissionDate: "2026-01-25",
    dueDate: "2026-02-24",
    daysRemaining: 13,
    status: "green" as const,
    submittedDate: null,
    careProcesses: {
      painScreening: true,
      dyspneaTreatment: true,
      treatmentPreferences: true,
      spiritualConcerns: true,
      emotionalSupport: true,
      caregiverEducation: true,
      advanceDirectives: true,
    },
  },
];

export default function HospiceComplianceTrackerScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "red" | "yellow" | "green">("all");

  const filteredData = MOCK_COMPLIANCE_DATA.filter((item) => {
    if (selectedStatus === "all") return true;
    return item.status === selectedStatus;
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  const getStatusColor = (status: "red" | "yellow" | "green") => {
    switch (status) {
      case "red":
        return "#EF4444";
      case "yellow":
        return "#F59E0B";
      case "green":
        return "#22C55E";
    }
  };

  const getStatusText = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return `Overdue by ${Math.abs(daysRemaining)} days`;
    } else if (daysRemaining === 0) {
      return "Due today";
    } else {
      return `${daysRemaining} days remaining`;
    }
  };

  const calculateCompletionPercentage = (careProcesses: Record<string, boolean>) => {
    const total = Object.keys(careProcesses).length;
    const completed = Object.values(careProcesses).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const countByStatus = (status: "red" | "yellow" | "green") => {
    return MOCK_COMPLIANCE_DATA.filter((item) => item.status === status).length;
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <Text className="text-2xl font-bold text-foreground ml-3">Compliance Tracker</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Summary Cards */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-3">Compliance Overview</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold" style={{ color: "#EF4444" }}>
                    {countByStatus("red")}
                  </Text>
                  <Text className="text-sm text-muted mt-1">Critical</Text>
                </View>
                <View style={{ backgroundColor: "#EF4444" }} className="w-10 h-10 rounded-full items-center justify-center">
                  <IconSymbol name="exclamationmark" size={20} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
                    {countByStatus("yellow")}
                  </Text>
                  <Text className="text-sm text-muted mt-1">Warning</Text>
                </View>
                <View style={{ backgroundColor: "#F59E0B" }} className="w-10 h-10 rounded-full items-center justify-center">
                  <IconSymbol name="clock.fill" size={20} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold" style={{ color: "#22C55E" }}>
                    {countByStatus("green")}
                  </Text>
                  <Text className="text-sm text-muted mt-1">On Track</Text>
                </View>
                <View style={{ backgroundColor: "#22C55E" }} className="w-10 h-10 rounded-full items-center justify-center">
                  <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Status Filter */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Filter by Status</Text>
          <View className="flex-row gap-2">
            {[
              { value: "all" as const, label: "All", count: MOCK_COMPLIANCE_DATA.length },
              { value: "red" as const, label: "Critical", count: countByStatus("red") },
              { value: "yellow" as const, label: "Warning", count: countByStatus("yellow") },
              { value: "green" as const, label: "On Track", count: countByStatus("green") },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedStatus(option.value)}
                style={{
                  backgroundColor: selectedStatus === option.value ? colors.primary : colors.surface,
                  opacity: selectedStatus === option.value ? 1 : 0.7,
                }}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  style={{
                    color: selectedStatus === option.value ? "#FFFFFF" : colors.foreground,
                  }}
                  className="text-sm font-medium"
                >
                  {option.label} ({option.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Compliance Timeline */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">
            {filteredData.length} Assessment{filteredData.length !== 1 ? "s" : ""}
          </Text>
          {filteredData.map((item) => {
            const completionPercentage = calculateCompletionPercentage(item.careProcesses);
            const completedCount = Object.values(item.careProcesses).filter(Boolean).length;
            const totalCount = Object.keys(item.careProcesses).length;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push("/hospice-hope-his-form" as any)}
                className="bg-surface rounded-xl p-4 mb-3 border border-border"
              >
                {/* Status Indicator Bar */}
                <View
                  style={{ backgroundColor: getStatusColor(item.status) }}
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                />

                {/* Patient Header */}
                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{item.patientName}</Text>
                    <Text className="text-sm text-muted mt-1">{item.mrn}</Text>
                  </View>
                  <View
                    style={{ backgroundColor: getStatusColor(item.status) }}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-xs font-bold text-white">
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Assessment Details */}
                <View className="mt-3 gap-2">
                  <View className="flex-row items-center">
                    <IconSymbol name="doc.text.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2">
                      Assessment Type: <Text className="text-foreground font-medium">{item.assessmentType}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <IconSymbol name="calendar" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2">
                      Admission: <Text className="text-foreground font-medium">{item.admissionDate}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <IconSymbol name="clock.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2">
                      Due Date: <Text className="text-foreground font-medium">{item.dueDate}</Text>
                    </Text>
                  </View>
                </View>

                {/* 30-Day Timeline Visualization */}
                <View className="mt-3">
                  <Text className="text-xs font-semibold text-muted mb-2">30-Day Submission Window</Text>
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View
                      style={{
                        width: `${Math.max(0, Math.min(100, ((30 - item.daysRemaining) / 30) * 100))}%`,
                        backgroundColor: getStatusColor(item.status),
                      }}
                      className="h-full"
                    />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-muted">Day 0</Text>
                    <Text
                      style={{ color: getStatusColor(item.status) }}
                      className="text-xs font-bold"
                    >
                      {getStatusText(item.daysRemaining)}
                    </Text>
                    <Text className="text-xs text-muted">Day 30</Text>
                  </View>
                </View>

                {/* Care Processes Completion */}
                <View className="mt-3 pt-3 border-t border-border">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-semibold text-foreground">
                      Care Processes: {completedCount}/{totalCount}
                    </Text>
                    <Text
                      style={{
                        color: completionPercentage === 100 ? "#22C55E" : completionPercentage >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                      className="text-sm font-bold"
                    >
                      {completionPercentage}%
                    </Text>
                  </View>
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: completionPercentage === 100 ? "#22C55E" : completionPercentage >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                      className="h-full"
                    />
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={() => router.push("/hospice-hope-his-form" as any)}
                  style={{ backgroundColor: colors.primary }}
                  className="mt-3 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">
                    {completionPercentage === 100 ? "Review & Submit" : "Complete Assessment"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {filteredData.length === 0 && (
            <View className="bg-surface rounded-xl p-8 items-center">
              <IconSymbol name="checkmark.circle.fill" size={48} color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground mt-4">All Caught Up!</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                No assessments match the selected filter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
