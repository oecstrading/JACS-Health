import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const MOCK_CAREGIVERS = [
  {
    id: "1",
    name: "Susan Thompson",
    relationship: "Daughter",
    patientName: "Margaret Thompson",
    address: "123 Main St, Springfield, IL 62701",
    eligible: true,
    lastContact: "2026-02-10",
  },
  {
    id: "2",
    name: "Emily Johnson",
    relationship: "Spouse",
    patientName: "Robert Johnson",
    address: "456 Oak Ave, Springfield, IL 62702",
    eligible: true,
    lastContact: "2026-02-09",
  },
  {
    id: "3",
    name: "Michael Williams",
    relationship: "Son",
    patientName: "Dorothy Williams",
    address: "789 Elm St, Springfield, IL 62703",
    eligible: false,
    lastContact: "2026-02-08",
    ineligibilityReason: "Patient length of stay < 48 hours",
  },
  {
    id: "4",
    name: "Jennifer Brown",
    relationship: "Daughter",
    patientName: "James Brown",
    address: "321 Pine Rd, Springfield, IL 62704",
    eligible: true,
    lastContact: "2026-02-11",
  },
];

export default function HospiceCAHPSExportScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([]);
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);

  const filteredCaregivers = MOCK_CAREGIVERS.filter((caregiver) => {
    if (showOnlyEligible) return caregiver.eligible;
    return true;
  });

  const toggleCaregiver = (id: string) => {
    setSelectedCaregivers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCaregivers(filteredCaregivers.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedCaregivers([]);
  };

  const handleExport = () => {
    if (selectedCaregivers.length === 0) {
      alert("Please select at least one caregiver to export.");
      return;
    }
    alert(`Exporting ${selectedCaregivers.length} caregiver(s) to CMS CAHPS format...`);
  };

  const eligibleCount = MOCK_CAREGIVERS.filter((c) => c.eligible).length;

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <View className="flex-1 ml-3">
          <Text className="text-2xl font-bold text-foreground">CAHPS Export</Text>
          <Text className="text-sm text-muted mt-1">Consumer Assessment of Healthcare Providers</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Summary Card */}
        <View className="px-4 pt-4">
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-3">Export Summary</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Total Caregivers:</Text>
              <Text className="text-sm font-bold text-foreground">{MOCK_CAREGIVERS.length}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Eligible for CAHPS:</Text>
              <Text className="text-sm font-bold text-green-600 dark:text-green-400">{eligibleCount}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Selected for Export:</Text>
              <Text className="text-sm font-bold" style={{ color: colors.primary }}>{selectedCaregivers.length}</Text>
            </View>
          </View>
        </View>

        {/* Filter Toggle */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowOnlyEligible(true)}
              style={{
                backgroundColor: showOnlyEligible ? colors.primary : colors.surface,
                opacity: showOnlyEligible ? 1 : 0.7,
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-border"
            >
              <Text
                style={{
                  color: showOnlyEligible ? "#FFFFFF" : colors.foreground,
                }}
                className="text-sm font-medium text-center"
              >
                Eligible Only ({eligibleCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowOnlyEligible(false)}
              style={{
                backgroundColor: !showOnlyEligible ? colors.primary : colors.surface,
                opacity: !showOnlyEligible ? 1 : 0.7,
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-border"
            >
              <Text
                style={{
                  color: !showOnlyEligible ? "#FFFFFF" : colors.foreground,
                }}
                className="text-sm font-medium text-center"
              >
                All ({MOCK_CAREGIVERS.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selection Controls */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={selectAll}
              style={{ backgroundColor: colors.surface }}
              className="flex-1 px-4 py-2 rounded-lg border border-border"
            >
              <Text className="text-sm font-medium text-foreground text-center">Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deselectAll}
              style={{ backgroundColor: colors.surface }}
              className="flex-1 px-4 py-2 rounded-lg border border-border"
            >
              <Text className="text-sm font-medium text-foreground text-center">Deselect All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Caregiver List */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">
            {filteredCaregivers.length} Caregiver{filteredCaregivers.length !== 1 ? "s" : ""}
          </Text>
          {filteredCaregivers.map((caregiver) => {
            const isSelected = selectedCaregivers.includes(caregiver.id);
            return (
              <TouchableOpacity
                key={caregiver.id}
                onPress={() => toggleCaregiver(caregiver.id)}
                style={{
                  backgroundColor: isSelected ? `${colors.primary}15` : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
                className="rounded-xl p-4 mb-3 border-2"
              >
                {/* Selection Indicator */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-foreground">{caregiver.name}</Text>
                      {caregiver.eligible && (
                        <View className="ml-2 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          <Text className="text-xs font-semibold text-green-600 dark:text-green-400">ELIGIBLE</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted mt-1">{caregiver.relationship}</Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.border,
                      width: 24,
                      height: 24,
                    }}
                    className="rounded-full items-center justify-center"
                  >
                    {isSelected && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </View>

                {/* Patient Information */}
                <View className="mt-3 gap-2">
                  <View className="flex-row items-center">
                    <IconSymbol name="person.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2">
                      Patient: <Text className="text-foreground font-medium">{caregiver.patientName}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <IconSymbol name="house.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2 flex-1">{caregiver.address}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <IconSymbol name="calendar" size={16} color={colors.muted} />
                    <Text className="text-sm text-muted ml-2">
                      Last Contact: <Text className="text-foreground font-medium">{caregiver.lastContact}</Text>
                    </Text>
                  </View>
                </View>

                {/* Ineligibility Reason */}
                {!caregiver.eligible && caregiver.ineligibilityReason && (
                  <View className="mt-3 pt-3 border-t border-border">
                    <View className="flex-row items-start">
                      <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
                      <Text className="text-sm text-muted ml-2 flex-1">
                        <Text className="font-semibold">Ineligible: </Text>
                        {caregiver.ineligibilityReason}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {filteredCaregivers.length === 0 && (
            <View className="bg-surface rounded-xl p-8 items-center">
              <IconSymbol name="person.2.fill" size={48} color={colors.muted} />
              <Text className="text-lg font-semibold text-foreground mt-4">No Caregivers Found</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                No caregivers match the selected filter
              </Text>
            </View>
          )}
        </View>

        {/* Export Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={handleExport}
            style={{
              backgroundColor: selectedCaregivers.length > 0 ? colors.primary : colors.border,
              opacity: selectedCaregivers.length > 0 ? 1 : 0.5,
            }}
            className="py-4 rounded-xl items-center flex-row justify-center"
            disabled={selectedCaregivers.length === 0}
          >
            <IconSymbol name="arrow.down.doc.fill" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              Export to CMS CAHPS ({selectedCaregivers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
