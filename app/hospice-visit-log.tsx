import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const MOCK_VISITS = [
  {
    id: "1",
    patientName: "Margaret Thompson",
    visitType: "Skilled Nursing",
    clinician: "Sarah Johnson, RN",
    date: "2026-02-11",
    duration: "45 min",
    notes: "Pain assessment completed, medication review, family education provided",
  },
  {
    id: "2",
    patientName: "Robert Johnson",
    visitType: "Social Work",
    clinician: "Michael Chen, MSW",
    date: "2026-02-10",
    duration: "30 min",
    notes: "Advance care planning discussion, caregiver support assessment",
  },
  {
    id: "3",
    patientName: "Dorothy Williams",
    visitType: "Chaplain",
    clinician: "Rev. David Martinez",
    date: "2026-02-09",
    duration: "25 min",
    notes: "Spiritual support, prayer, discussion of end-of-life concerns",
  },
  {
    id: "4",
    patientName: "Margaret Thompson",
    visitType: "Skilled Nursing",
    clinician: "Sarah Johnson, RN",
    date: "2026-02-08",
    duration: "40 min",
    notes: "Wound care, vital signs monitoring, caregiver education",
  },
];

type VisitType = "All" | "Skilled Nursing" | "Social Work" | "Chaplain" | "Aide";

export default function HospiceVisitLogScreen() {
  const router = useRouter();
  const colors = useColors();
  const [visitFilter, setVisitFilter] = useState<VisitType>("All");

  const filteredVisits = MOCK_VISITS.filter((visit) => {
    if (visitFilter === "All") return true;
    return visit.visitType === visitFilter;
  });

  const getVisitIcon = (visitType: string) => {
    switch (visitType) {
      case "Skilled Nursing":
        return "heart.text.square.fill";
      case "Social Work":
        return "person.2.fill";
      case "Chaplain":
        return "book.fill";
      case "Aide":
        return "hand.raised.fill";
      default:
        return "doc.text.fill";
    }
  };

  const visitTypes: VisitType[] = ["All", "Skilled Nursing", "Social Work", "Chaplain", "Aide"];

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <Text className="text-2xl font-bold text-foreground ml-3">Visit Log</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Visit Type Filter */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Visit Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {visitTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setVisitFilter(type)}
                style={{
                  backgroundColor: visitFilter === type ? colors.primary : colors.surface,
                  opacity: visitFilter === type ? 1 : 0.7,
                }}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  style={{
                    color: visitFilter === type ? "#FFFFFF" : colors.foreground,
                  }}
                  className="text-sm font-medium"
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Visit List */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">
            {filteredVisits.length} Visit{filteredVisits.length !== 1 ? "s" : ""}
          </Text>
          {filteredVisits.map((visit) => (
            <View
              key={visit.id}
              className="bg-surface rounded-xl p-4 mb-3 border border-border"
            >
              {/* Visit Header */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">{visit.patientName}</Text>
                  <View className="flex-row items-center mt-2">
                    <IconSymbol name={getVisitIcon(visit.visitType) as any} size={16} color={colors.primary} />
                    <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
                      {visit.visitType}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-muted">{visit.date}</Text>
                  <Text className="text-sm font-semibold text-foreground mt-1">{visit.duration}</Text>
                </View>
              </View>

              {/* Clinician */}
              <View className="flex-row items-center mt-3">
                <IconSymbol name="person.fill" size={16} color={colors.muted} />
                <Text className="text-sm text-muted ml-2">
                  Clinician: <Text className="text-foreground font-medium">{visit.clinician}</Text>
                </Text>
              </View>

              {/* Visit Notes */}
              <View className="mt-3 pt-3 border-t border-border">
                <Text className="text-sm font-semibold text-foreground mb-2">Visit Notes</Text>
                <Text className="text-sm text-muted">{visit.notes}</Text>
              </View>
            </View>
          ))}

          {filteredVisits.length === 0 && (
            <View className="bg-surface rounded-xl p-8 items-center">
              <IconSymbol name="doc.text.fill" size={48} color={colors.muted} />
              <Text className="text-lg font-semibold text-foreground mt-4">No Visits Found</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                No visits match the selected filter
              </Text>
            </View>
          )}
        </View>

        {/* Add Visit Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={() => {}}
            style={{ backgroundColor: colors.primary }}
            className="py-4 rounded-xl items-center flex-row justify-center"
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">Log New Visit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
