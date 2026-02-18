import { View, Text, ScrollView, Pressable, TextInput, FlatList } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  purpose: string;
  sideEffects?: string;
  linkedLabResults?: string[];
  active: boolean;
}

// Sample medication data
const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Atorvastatin (Lipitor)",
    dosage: "20 mg",
    frequency: "Once daily at bedtime",
    startDate: "2025-03-01",
    purpose: "Lower LDL cholesterol",
    linkedLabResults: ["Total Cholesterol", "LDL Cholesterol", "HDL Cholesterol"],
    active: true,
  },
  {
    id: "2",
    name: "Metformin",
    dosage: "500 mg",
    frequency: "Twice daily with meals",
    startDate: "2025-06-15",
    purpose: "Prevent diabetes progression (prediabetes)",
    linkedLabResults: ["Glucose", "HbA1c"],
    active: true,
  },
  {
    id: "3",
    name: "Ferrous Sulfate (Iron)",
    dosage: "325 mg",
    frequency: "Once daily",
    startDate: "2026-01-10",
    purpose: "Treat iron deficiency anemia",
    sideEffects: "Constipation, dark stools",
    linkedLabResults: ["Hemoglobin", "Hematocrit", "Iron", "Ferritin"],
    active: true,
  },
  {
    id: "4",
    name: "Vitamin D3",
    dosage: "2000 IU",
    frequency: "Once daily",
    startDate: "2024-09-01",
    purpose: "Maintain bone health, prevent osteoporosis",
    linkedLabResults: ["Vitamin D", "Calcium"],
    active: true,
  },
];

export default function MedicationsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  
  const [medications, setMedications] = useState<Medication[]>(SAMPLE_MEDICATIONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active");

  const filteredMedications = medications.filter((med) => {
    if (filterActive === "active") return med.active;
    if (filterActive === "inactive") return !med.active;
    return true;
  });

  const renderMedication = ({ item }: { item: Medication }) => (
    <Pressable
      onPress={() => setSelectedMed(item)}
      className="bg-white border border-border rounded-xl p-5 mb-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-muted">
            {item.dosage} • {item.frequency}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: item.active ? "#4CAF50" + "20" : "#757575" + "20",
          }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: item.active ? "#4CAF50" : "#757575" }}
          >
            {item.active ? "Active" : "Discontinued"}
          </Text>
        </View>
      </View>

      <View className="bg-surface/50 rounded-lg p-3 mb-3">
        <Text className="text-xs font-semibold text-foreground mb-1">
          💊 Purpose
        </Text>
        <Text className="text-xs text-muted">{item.purpose}</Text>
      </View>

      {item.linkedLabResults && item.linkedLabResults.length > 0 && (
        <View className="mb-2">
          <Text className="text-xs font-semibold text-foreground mb-2">
            📊 Monitoring
          </Text>
          <View className="flex-row flex-wrap">
            {item.linkedLabResults.map((lab, index) => (
              <View
                key={index}
                className="bg-primary/10 px-2 py-1 rounded mr-2 mb-1"
              >
                <Text className="text-xs text-primary">{lab}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center pt-3 border-t border-border">
        <Text className="text-xs text-muted">
          Started: {new Date(item.startDate).toLocaleDateString()}
        </Text>
        <Text className="text-xs text-primary font-semibold">
          View Details →
        </Text>
      </View>
    </Pressable>
  );

  if (selectedMed) {
    return (
      <ScreenContainer className="bg-white">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="p-6 bg-primary">
            <Pressable onPress={() => setSelectedMed(null)} className="mb-4">
              <Text className="text-white text-base">← Back to Medications</Text>
            </Pressable>
            
            <Text className="text-3xl font-bold text-white mb-2">
              {selectedMed.name}
            </Text>
            <Text className="text-base text-white/90">
              {selectedMed.dosage} • {selectedMed.frequency}
            </Text>
          </View>

          {/* Medication Details */}
          <View className="p-4">
            {/* Status */}
            <View className="bg-white border border-border rounded-xl p-5 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-3">
                Status
              </Text>
              <View
                className="px-4 py-2 rounded-lg self-start"
                style={{
                  backgroundColor: selectedMed.active ? "#4CAF50" + "20" : "#757575" + "20",
                }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: selectedMed.active ? "#4CAF50" : "#757575" }}
                >
                  {selectedMed.active ? "✓ Currently Taking" : "✕ Discontinued"}
                </Text>
              </View>
            </View>

            {/* Purpose */}
            <View className="bg-white border border-border rounded-xl p-5 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                💊 Purpose
              </Text>
              <Text className="text-base text-muted">{selectedMed.purpose}</Text>
            </View>

            {/* Dosing Schedule */}
            <View className="bg-white border border-border rounded-xl p-5 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-3">
                📅 Dosing Schedule
              </Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-sm text-muted w-24">Dosage:</Text>
                <Text className="text-sm text-foreground font-semibold">
                  {selectedMed.dosage}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-sm text-muted w-24">Frequency:</Text>
                <Text className="text-sm text-foreground font-semibold">
                  {selectedMed.frequency}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-sm text-muted w-24">Start Date:</Text>
                <Text className="text-sm text-foreground font-semibold">
                  {new Date(selectedMed.startDate).toLocaleDateString()}
                </Text>
              </View>
              {selectedMed.endDate && (
                <View className="flex-row items-center">
                  <Text className="text-sm text-muted w-24">End Date:</Text>
                  <Text className="text-sm text-foreground font-semibold">
                    {new Date(selectedMed.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Side Effects */}
            {selectedMed.sideEffects && (
              <View className="bg-warning/10 border border-warning rounded-xl p-5 mb-4">
                <Text className="text-sm font-semibold text-warning mb-2">
                  ⚠️ Possible Side Effects
                </Text>
                <Text className="text-sm text-foreground">{selectedMed.sideEffects}</Text>
              </View>
            )}

            {/* Linked Lab Results */}
            {selectedMed.linkedLabResults && selectedMed.linkedLabResults.length > 0 && (
              <View className="bg-white border border-border rounded-xl p-5 mb-4">
                <Text className="text-sm font-semibold text-foreground mb-3">
                  📊 Lab Results to Monitor
                </Text>
                <Text className="text-xs text-muted mb-3">
                  These lab tests track the effectiveness of this medication:
                </Text>
                {selectedMed.linkedLabResults.map((lab, index) => (
                  <View
                    key={index}
                    className="bg-primary/10 rounded-lg p-3 mb-2"
                  >
                    <Text className="text-sm font-semibold text-primary">
                      {lab}
                    </Text>
                  </View>
                ))}
                <Link href={`/medical-records/${id}/lab-results`} asChild>
                  <Pressable className="mt-2">
                    <Text className="text-primary font-semibold text-center">
                      View Lab Results →
                    </Text>
                  </Pressable>
                </Link>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row">
              <Pressable
                className="flex-1 bg-primary py-4 rounded-lg mr-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-white font-bold text-center">
                  Edit Medication
                </Text>
              </Pressable>
              
              <Pressable
                className="flex-1 bg-white border border-error py-4 rounded-lg ml-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-error font-bold text-center">
                  {selectedMed.active ? "Discontinue" : "Reactivate"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Medications
          </Text>
          <Text className="text-base text-white/90">
            {filteredMedications.length} medications
          </Text>
        </View>

        {/* Filter Tabs */}
        <View className="bg-surface/50 border-b border-border p-4">
          <View className="flex-row">
            {(["all", "active", "inactive"] as const).map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setFilterActive(filter)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  filterActive === filter
                    ? "bg-primary"
                    : "bg-white border border-border"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-sm font-semibold capitalize ${
                    filterActive === filter ? "text-white" : "text-foreground"
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Medications List */}
        <FlatList
          data={filteredMedications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Pressable
              onPress={() => setShowAddForm(true)}
              className="bg-success/10 border-2 border-dashed border-success rounded-xl p-5 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-success font-bold text-center text-base">
                + Add New Medication
              </Text>
            </Pressable>
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-muted text-center">
                No medications found
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}
