import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type CareProcess = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
};

export default function HospiceHopeHisFormScreen() {
  const router = useRouter();
  const colors = useColors();

  const [patientInfo, setPatientInfo] = useState({
    name: "Margaret Thompson",
    mrn: "MRN-001234",
    assessmentType: "Admission",
    assessmentDate: "2026-02-11",
  });

  const [careProcesses, setCareProcesses] = useState<CareProcess[]>([
    {
      id: "pain",
      title: "Pain Screening",
      description: "Comprehensive pain assessment using 0-10 scale",
      completed: true,
      required: true,
    },
    {
      id: "dyspnea",
      title: "Dyspnea Treatment",
      description: "Shortness of breath screening and treatment plan",
      completed: true,
      required: true,
    },
    {
      id: "preferences",
      title: "Treatment Preferences",
      description: "Discussion of treatment goals and preferences",
      completed: false,
      required: true,
    },
    {
      id: "spiritual",
      title: "Spiritual Concerns",
      description: "Assessment of spiritual needs and support",
      completed: false,
      required: true,
    },
    {
      id: "emotional",
      title: "Emotional Support",
      description: "Emotional support provided to patient and family",
      completed: true,
      required: true,
    },
    {
      id: "caregiver",
      title: "Caregiver Education",
      description: "Education provided to family caregivers",
      completed: false,
      required: true,
    },
    {
      id: "directives",
      title: "Advance Directives",
      description: "Discussion and documentation of advance directives",
      completed: true,
      required: true,
    },
  ]);

  const [painScore, setPainScore] = useState("3");
  const [dyspneaScore, setDyspneaScore] = useState("2");
  const [notes, setNotes] = useState("");

  const toggleCareProcess = (id: string) => {
    setCareProcesses((prev) =>
      prev.map((process) =>
        process.id === id ? { ...process, completed: !process.completed } : process
      )
    );
  };

  const completedCount = careProcesses.filter((p) => p.completed).length;
  const totalCount = careProcesses.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const isReadyToSubmit = completedCount === totalCount;

  const handleSubmit = () => {
    if (!isReadyToSubmit) {
      alert("Please complete all required care processes before submitting.");
      return;
    }
    alert("Assessment submitted successfully to iQIES!");
    router.back();
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <View className="flex-1 ml-3">
          <Text className="text-2xl font-bold text-foreground">HOPE/HIS Assessment</Text>
          <Text className="text-sm text-muted mt-1">{patientInfo.name}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Patient Information */}
        <View className="px-4 pt-4">
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-3">Patient Information</Text>
            <View className="gap-2">
              <View className="flex-row">
                <Text className="text-sm text-muted w-32">MRN:</Text>
                <Text className="text-sm text-foreground font-medium">{patientInfo.mrn}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-muted w-32">Assessment Type:</Text>
                <Text className="text-sm text-foreground font-medium">{patientInfo.assessmentType}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-muted w-32">Assessment Date:</Text>
                <Text className="text-sm text-foreground font-medium">{patientInfo.assessmentDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Completion Progress */}
        <View className="px-4 pt-4">
          <View className="bg-surface rounded-xl p-4 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">
                Completion Progress: {completedCount}/{totalCount}
              </Text>
              <Text
                style={{
                  color: completionPercentage === 100 ? "#22C55E" : completionPercentage >= 50 ? "#F59E0B" : "#EF4444",
                }}
                className="text-lg font-bold"
              >
                {completionPercentage}%
              </Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage === 100 ? "#22C55E" : completionPercentage >= 50 ? "#F59E0B" : "#EF4444",
                }}
                className="h-full"
              />
            </View>
            {!isReadyToSubmit && (
              <View className="flex-row items-center mt-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#F59E0B" />
                <Text className="text-sm text-yellow-800 dark:text-yellow-200 ml-2 flex-1">
                  Complete all 7 care processes before submission
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Care Processes Checklist */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-3">Seven Care Processes (Required)</Text>
          {careProcesses.map((process, index) => (
            <View
              key={process.id}
              className="bg-surface rounded-xl p-4 mb-3 border border-border"
            >
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-bold text-foreground">{index + 1}. {process.title}</Text>
                    {process.required && (
                      <View className="ml-2 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                        <Text className="text-xs font-semibold text-red-600 dark:text-red-400">REQUIRED</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-muted mt-1">{process.description}</Text>

                  {/* Specific Fields for Pain and Dyspnea */}
                  {process.id === "pain" && process.completed && (
                    <View className="mt-3">
                      <Text className="text-sm font-semibold text-foreground mb-2">Pain Score (0-10)</Text>
                      <TextInput
                        className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                        placeholder="Enter pain score (0-10)"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                        value={painScore}
                        onChangeText={setPainScore}
                      />
                    </View>
                  )}

                  {process.id === "dyspnea" && process.completed && (
                    <View className="mt-3">
                      <Text className="text-sm font-semibold text-foreground mb-2">Dyspnea Score (0-10)</Text>
                      <TextInput
                        className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                        placeholder="Enter dyspnea score (0-10)"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                        value={dyspneaScore}
                        onChangeText={setDyspneaScore}
                      />
                    </View>
                  )}
                </View>

                <Switch
                  value={process.completed}
                  onValueChange={() => toggleCareProcess(process.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={process.completed ? "#FFFFFF" : "#F4F3F4"}
                />
              </View>

              {process.completed && (
                <View className="flex-row items-center mt-3 pt-3 border-t border-border">
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                  <Text className="text-sm font-medium text-green-600 dark:text-green-400 ml-2">
                    Completed
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Clinical Notes */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Clinical Notes (Optional)</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            placeholder="Enter additional clinical notes..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Validation Summary */}
        <View className="px-4 pt-4 pb-6">
          <View className="bg-surface rounded-xl p-4 border border-border">
            <View className="flex-row items-center mb-3">
              <IconSymbol
                name={isReadyToSubmit ? "checkmark.shield.fill" : "exclamationmark.shield.fill"}
                size={24}
                color={isReadyToSubmit ? "#22C55E" : "#F59E0B"}
              />
              <Text className="text-base font-bold text-foreground ml-3">
                {isReadyToSubmit ? "Ready for Submission" : "Validation Required"}
              </Text>
            </View>

            {isReadyToSubmit ? (
              <View>
                <Text className="text-sm text-muted mb-3">
                  All required care processes have been completed. This assessment is ready for submission to CMS iQIES.
                </Text>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{ backgroundColor: "#22C55E" }}
                  className="py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Submit to iQIES</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-sm text-muted mb-3">
                  The following care processes must be completed before submission:
                </Text>
                {careProcesses
                  .filter((p) => !p.completed)
                  .map((process, index) => (
                    <View key={process.id} className="flex-row items-center mb-2">
                      <IconSymbol name="circle.fill" size={6} color={colors.muted} />
                      <Text className="text-sm text-foreground ml-2">{process.title}</Text>
                    </View>
                  ))}
                <TouchableOpacity
                  onPress={() => {}}
                  style={{ backgroundColor: colors.border, opacity: 0.5 }}
                  className="mt-3 py-4 rounded-xl items-center"
                  disabled
                >
                  <Text className="text-muted font-bold text-base">Complete All Processes First</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
