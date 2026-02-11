import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// Mock patient data - in production, this would come from the database
const MOCK_PATIENTS = [
  {
    id: "1",
    name: "Margaret Thompson",
    mrn: "MRN-001234",
    admissionDate: "2026-01-15",
    levelOfCare: "Routine",
    lastAssessment: "2026-01-15",
    nextDue: "2026-02-14",
    daysRemaining: 3,
    status: "red" as const, // < 5 days
  },
  {
    id: "2",
    name: "Robert Johnson",
    mrn: "MRN-001235",
    admissionDate: "2026-01-20",
    levelOfCare: "Continuous",
    lastAssessment: "2026-01-20",
    nextDue: "2026-02-19",
    daysRemaining: 8,
    status: "yellow" as const, // 5-10 days
  },
  {
    id: "3",
    name: "Dorothy Williams",
    mrn: "MRN-001236",
    admissionDate: "2026-01-10",
    levelOfCare: "Routine",
    lastAssessment: "2026-01-10",
    nextDue: "2026-02-09",
    daysRemaining: -2,
    status: "red" as const, // Overdue
  },
  {
    id: "4",
    name: "James Brown",
    mrn: "MRN-001237",
    admissionDate: "2026-01-25",
    levelOfCare: "Respite",
    lastAssessment: "2026-01-25",
    nextDue: "2026-02-24",
    daysRemaining: 13,
    status: "green" as const, // > 10 days
  },
  {
    id: "5",
    name: "Patricia Davis",
    mrn: "MRN-001238",
    admissionDate: "2026-01-18",
    levelOfCare: "Routine",
    lastAssessment: "2026-01-18",
    nextDue: "2026-02-17",
    daysRemaining: 6,
    status: "yellow" as const,
  },
];

type LevelOfCare = "All" | "Routine" | "Continuous" | "Respite" | "Inpatient";
type SortBy = "urgency" | "name" | "admission";

export default function HospicePatientListScreen() {
  const router = useRouter();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelOfCare>("All");
  const [sortBy, setSortBy] = useState<SortBy>("urgency");

  // Filter and sort patients
  const filteredPatients = MOCK_PATIENTS
    .filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === "All" || patient.levelOfCare === levelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "urgency") {
        return a.daysRemaining - b.daysRemaining;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime();
      }
    });

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

  const levelOptions: LevelOfCare[] = ["All", "Routine", "Continuous", "Respite", "Inpatient"];

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <Text className="text-2xl font-bold text-foreground ml-3">Patient List</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Search Bar */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Search by name or MRN..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Level of Care Filter */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Level of Care</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {levelOptions.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setLevelFilter(level)}
                style={{
                  backgroundColor: levelFilter === level ? colors.primary : colors.surface,
                  opacity: levelFilter === level ? 1 : 0.7,
                }}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  style={{
                    color: levelFilter === level ? "#FFFFFF" : colors.foreground,
                  }}
                  className="text-sm font-medium"
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Sort By</Text>
          <View className="flex-row gap-2">
            {[
              { value: "urgency" as const, label: "Urgency" },
              { value: "name" as const, label: "Name" },
              { value: "admission" as const, label: "Admission Date" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSortBy(option.value)}
                style={{
                  backgroundColor: sortBy === option.value ? colors.primary : colors.surface,
                  opacity: sortBy === option.value ? 1 : 0.7,
                }}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  style={{
                    color: sortBy === option.value ? "#FFFFFF" : colors.foreground,
                  }}
                  className="text-sm font-medium"
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Patient List */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">
            {filteredPatients.length} Patient{filteredPatients.length !== 1 ? "s" : ""}
          </Text>
          {filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              onPress={() => router.push("/hospice-patient-detail" as any)}
              className="bg-surface rounded-xl p-4 mb-3 border border-border"
              style={{ opacity: 0.95 }}
            >
              {/* Status Indicator Bar */}
              <View
                style={{ backgroundColor: getStatusColor(patient.status) }}
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
              />

              {/* Patient Header */}
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">{patient.name}</Text>
                  <Text className="text-sm text-muted mt-1">{patient.mrn}</Text>
                </View>
                <View
                  style={{ backgroundColor: getStatusColor(patient.status) }}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <IconSymbol
                    name={patient.status === "red" ? "exclamationmark" : "checkmark"}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              {/* Patient Details */}
              <View className="mt-3 gap-2">
                <View className="flex-row items-center">
                  <IconSymbol name="bed.double.fill" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted ml-2">
                    Level of Care: <Text className="text-foreground font-medium">{patient.levelOfCare}</Text>
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="calendar" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted ml-2">
                    Admitted: <Text className="text-foreground font-medium">{patient.admissionDate}</Text>
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="clock.fill" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted ml-2">
                    Last Assessment: <Text className="text-foreground font-medium">{patient.lastAssessment}</Text>
                  </Text>
                </View>
              </View>

              {/* Compliance Status */}
              <View className="mt-3 pt-3 border-t border-border">
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ color: getStatusColor(patient.status) }}
                    className="text-sm font-bold"
                  >
                    {getStatusText(patient.daysRemaining)}
                  </Text>
                  <Text className="text-sm text-muted">
                    Due: <Text className="text-foreground font-medium">{patient.nextDue}</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredPatients.length === 0 && (
            <View className="bg-surface rounded-xl p-8 items-center">
              <IconSymbol name="person.3.fill" size={48} color={colors.muted} />
              <Text className="text-lg font-semibold text-foreground mt-4">No Patients Found</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                Try adjusting your search or filter criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
