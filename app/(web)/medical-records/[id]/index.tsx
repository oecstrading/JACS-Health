import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

// Patient data - in production, fetch based on ID
const PATIENT_DATA = {
  "janice-john": {
    id: "janice-john",
    name: "Janice John",
    dateOfBirth: "1956-09-09",
    age: 69,
    gender: "Female",
    medicalRecordNumber: "JJ-195609-001",
    relationship: "Self",
    emergencyContact: "Dr. Monique Edwards",
    primaryPhysician: "Dr. Monique Edwards",
    insurance: {
      company: "Medicare",
      memberId: "JJ-1956-09-09",
    },
    summary: {
      totalTests: 96,
      latestTestDate: "2026-02-04",
      abnormalFindings: 12,
      observationPeriod: "Sept 2021 - Feb 2026 (5 years)",
    },
    criticalFindings: [
      {
        title: "Chronic Anemia (5+ Years)",
        severity: "High",
        value: "Hemoglobin 10.5 G/DL",
        status: "Worsening",
      },
      {
        title: "Persistent Prediabetes",
        severity: "Medium",
        value: "HbA1c 6.0%",
        status: "Stable",
      },
      {
        title: "Hyperlipidemia",
        severity: "Medium",
        value: "LDL 123 mg/dL",
        status: "Improving",
      },
      {
        title: "Elevated Rheumatoid Factor",
        severity: "High",
        value: "RF 52 IU/ML",
        status: "New",
      },
    ],
  },
};

export default function PatientDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const patient = PATIENT_DATA[id as keyof typeof PATIENT_DATA];

  if (!patient) {
    return (
      <ScreenContainer className="bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl text-muted">Patient not found</Text>
          <Link href="/medical-records" asChild>
            <Pressable className="mt-4 bg-primary px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">← Back to Patients</Text>
            </Pressable>
          </Link>
        </View>
      </ScreenContainer>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "lab-results", label: "Lab Results", icon: "🧪" },
    { id: "charts", label: "Charts", icon: "📈" },
    { id: "reports", label: "Reports", icon: "📄" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "#F44336";
      case "Medium":
        return "#FF9800";
      case "Low":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href="/medical-records" asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Patients</Text>
            </Pressable>
          </Link>
          
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                {patient.name}
              </Text>
              <Text className="text-base text-white/90">
                {patient.gender} • Age {patient.age} • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </Text>
              <Text className="text-sm text-white/80 mt-1">
                MRN: {patient.medicalRecordNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white border-b border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <View className="flex-row py-2">
              {tabs.map((tab) => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 mr-2 rounded-lg ${
                    activeTab === tab.id ? "bg-primary" : "bg-surface"
                  }`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    className={`font-semibold ${
                      activeTab === tab.id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <View className="p-4">
            {/* Summary Cards */}
            <Text className="text-xl font-bold text-foreground mb-4">
              Summary
            </Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              <View className="w-[48%] bg-surface rounded-xl p-4 mb-4">
                <Text className="text-3xl font-bold text-primary mb-1">
                  {patient.summary.totalTests}
                </Text>
                <Text className="text-sm text-muted">Total Lab Tests</Text>
              </View>
              <View className="w-[48%] bg-surface rounded-xl p-4 mb-4">
                <Text className="text-3xl font-bold text-error mb-1">
                  {patient.summary.abnormalFindings}
                </Text>
                <Text className="text-sm text-muted">Abnormal Findings</Text>
              </View>
              <View className="w-full bg-surface rounded-xl p-4">
                <Text className="text-sm text-muted mb-1">Observation Period</Text>
                <Text className="text-base font-semibold text-foreground">
                  {patient.summary.observationPeriod}
                </Text>
              </View>
            </View>

            {/* Critical Findings */}
            <Text className="text-xl font-bold text-foreground mb-4">
              Critical Findings
            </Text>
            <View className="bg-error/10 border border-error rounded-xl p-4 mb-4">
              <Text className="text-error font-bold text-base mb-2">
                ⚠️ {patient.criticalFindings.length} Conditions Requiring Attention
              </Text>
              <Text className="text-sm text-muted">
                Review with physician immediately
              </Text>
            </View>

            {patient.criticalFindings.map((finding, index) => (
              <View
                key={index}
                className="bg-white border border-border rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-bold text-foreground flex-1">
                    {finding.title}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: getSeverityColor(finding.severity) + "20",
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getSeverityColor(finding.severity) }}
                    >
                      {finding.severity}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-foreground">{finding.value}</Text>
                  <Text className="text-xs text-muted">{finding.status}</Text>
                </View>
              </View>
            ))}

            {/* Quick Actions */}
            <Text className="text-xl font-bold text-foreground mb-4 mt-6">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <Link href={`/medical-records/${id}/health-score`} asChild>
                <Pressable
                  className="w-[48%] bg-success/10 border border-success rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">🎯</Text>
                  <Text className="text-success font-semibold">Health Score</Text>
                </Pressable>
              </Link>
              <Link href={`/medical-records/${id}/lab-results`} asChild>
                <Pressable
                  className="w-[48%] bg-primary/10 border border-primary rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">🧪</Text>
                  <Text className="text-primary font-semibold">View Lab Results</Text>
                </Pressable>
              </Link>
              
              <Link href={`/medical-records/${id}/charts`} asChild>
                <Pressable
                  className="w-[48%] bg-success/10 border border-success rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">📊</Text>
                  <Text className="text-success font-semibold">View Charts</Text>
                </Pressable>
              </Link>

              <Link href={`/medical-records/${id}/medications`} asChild>
                <Pressable
                  className="w-[48%] bg-warning/10 border border-warning rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">💊</Text>
                  <Text className="text-warning font-semibold">Medications</Text>
                </Pressable>
              </Link>

              <Link href={`/medical-records/${id}/reminders`} asChild>
                <Pressable
                  className="w-[48%] bg-error/10 border border-error rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">⏰</Text>
                  <Text className="text-error font-semibold">Test Reminders</Text>
                </Pressable>
              </Link>

              <Link href={`/medical-records/${id}/reports`} asChild>
                <Pressable
                  className="w-[48%] bg-warning/10 border border-warning rounded-xl p-4 mb-4"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-2xl mb-2">📄</Text>
                  <Text className="text-warning font-semibold">Medical Reports</Text>
                </Pressable>
              </Link>

              <Pressable
                className="w-[48%] bg-surface border border-border rounded-xl p-4 mb-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-2xl mb-2">📤</Text>
                <Text className="text-foreground font-semibold">Export PDF</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== "overview" && (
          <View className="p-6 items-center justify-center" style={{ minHeight: 400 }}>
            <Text className="text-xl text-muted mb-4">
              {tabs.find((t) => t.id === activeTab)?.label} View
            </Text>
            <Text className="text-sm text-muted text-center">
              This section will display detailed {activeTab} information
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
