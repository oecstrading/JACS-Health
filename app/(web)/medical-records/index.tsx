import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

// Sample patient data - in production, this would come from database
const PATIENTS = [
  {
    id: "janice-john",
    name: "Janice John",
    dateOfBirth: "1956-09-09",
    age: 69,
    relationship: "Self",
    medicalRecordNumber: "JJ-195609-001",
    latestTestDate: "2026-02-04",
    totalTests: 96,
    abnormalFindings: 12,
    healthStatus: "Needs Attention",
    statusColor: "#FF9800",
    photoUrl: null,
  },
  // More patients can be added here
];

export default function MedicalRecordsHome() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = PATIENTS.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Text className="text-3xl font-bold text-white mb-2">
            Family Medical Records
          </Text>
          <Text className="text-base text-white/90">
            Comprehensive health tracking for your family
          </Text>
        </View>

        {/* Search Bar */}
        <View className="p-4 bg-white border-b border-border">
          <TextInput
            className="bg-surface p-4 rounded-lg text-foreground text-base"
            placeholder="Search patients..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats Summary */}
        <View className="p-4 bg-surface/50">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">
                {PATIENTS.length}
              </Text>
              <Text className="text-sm text-muted">Patients</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">
                {PATIENTS.reduce((sum, p) => sum + p.totalTests, 0)}
              </Text>
              <Text className="text-sm text-muted">Total Tests</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-error">
                {PATIENTS.reduce((sum, p) => sum + p.abnormalFindings, 0)}
              </Text>
              <Text className="text-sm text-muted">Abnormal</Text>
            </View>
          </View>
        </View>

        {/* Patient Cards */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Patients ({filteredPatients.length})
          </Text>

          {filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/medical-records/${patient.id}`}
              asChild
            >
              <Pressable
                className="bg-white rounded-xl p-6 mb-4 border border-border"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                {/* Patient Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-foreground mb-1">
                      {patient.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {patient.relationship} • Age {calculateAge(patient.dateOfBirth)} • MRN: {patient.medicalRecordNumber}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: patient.statusColor + "20" }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: patient.statusColor }}
                    >
                      {patient.healthStatus}
                    </Text>
                  </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row justify-between pt-4 border-t border-border">
                  <View>
                    <Text className="text-xs text-muted mb-1">Latest Test</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {new Date(patient.latestTestDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted mb-1">Total Tests</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {patient.totalTests}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted mb-1">Abnormal</Text>
                    <Text className="text-sm font-semibold text-error">
                      {patient.abnormalFindings}
                    </Text>
                  </View>
                </View>

                {/* View Button */}
                <View className="mt-4">
                  <View className="bg-primary py-3 rounded-lg items-center">
                    <Text className="text-white font-semibold">
                      View Medical Records →
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}

          {filteredPatients.length === 0 && (
            <View className="py-12 items-center">
              <Text className="text-muted text-center">
                No patients found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* Family Comparison Button */}
        <View className="p-4">
          <Link href="/medical-records/family-comparison" asChild>
            <Pressable
              className="bg-primary/10 border-2 border-primary rounded-xl p-6 items-center mb-4"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-primary font-bold text-lg mb-1">
                🧠 Family Health Comparison
              </Text>
              <Text className="text-primary/70 text-sm text-center">
                Compare health metrics and identify hereditary patterns
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Add Patient Button */}
        <View className="p-4">
          <Link href="/medical-records/manage" asChild>
            <Pressable
              className="bg-success/10 border-2 border-dashed border-success rounded-xl p-6 items-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-success font-bold text-lg mb-1">
                + Add New Patient
              </Text>
              <Text className="text-success/70 text-sm">
                Track medical records for another family member
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer Info */}
        <View className="p-6 bg-surface/30 mt-4">
          <Text className="text-xs text-muted text-center mb-2">
            Family Medical Records Management System
          </Text>
          <Text className="text-xs text-muted text-center">
            Comprehensive health tracking with 5-year longitudinal analysis
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
