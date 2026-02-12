import { ScrollView, Text, TouchableOpacity, View, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

type VitalType = "blood_pressure" | "heart_rate" | "blood_glucose" | "weight" | "temperature" | "oxygen_saturation";

const VITAL_TYPES = [
  { id: "blood_pressure", name: "Blood Pressure", unit: "mmHg", icon: "❤️" },
  { id: "heart_rate", name: "Heart Rate", unit: "bpm", icon: "💓" },
  { id: "blood_glucose", name: "Blood Glucose", unit: "mg/dL", icon: "🩸" },
  { id: "weight", name: "Weight", unit: "lbs", icon: "⚖️" },
  { id: "temperature", name: "Temperature", unit: "°F", icon: "🌡️" },
  { id: "oxygen_saturation", name: "Oxygen Saturation", unit: "%", icon: "🫁" },
];

export default function VitalsTrackerScreen() {
  const colors = useColors();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState<VitalType | null>(null);
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    value: "",
    notes: "",
  });

  const { data: vitals = [], refetch } = trpc.vitals.list.useQuery({ limit: 50 });
  const createMutation = trpc.vitals.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      setSelectedVitalType(null);
      resetForm();
      Alert.alert("Success", "Vital reading added successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      systolic: "",
      diastolic: "",
      value: "",
      notes: "",
    });
  };

  const handleSelectVitalType = (vitalType: VitalType) => {
    setSelectedVitalType(vitalType);
    setShowAddModal(true);
    resetForm();
  };

  const handleAddVital = () => {
    if (!selectedVitalType) return;

    const vitalInfo = VITAL_TYPES.find((v) => v.id === selectedVitalType);
    if (!vitalInfo) return;

    if (selectedVitalType === "blood_pressure") {
      if (!formData.systolic || !formData.diastolic) {
        Alert.alert("Error", "Please enter both systolic and diastolic values");
        return;
      }
      createMutation.mutate({
        vitalType: selectedVitalType,
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        unit: vitalInfo.unit,
        notes: formData.notes || undefined,
        recordedAt: new Date(),
      });
    } else {
      if (!formData.value) {
        Alert.alert("Error", "Please enter a value");
        return;
      }
      createMutation.mutate({
        vitalType: selectedVitalType,
        value: parseFloat(formData.value),
        unit: vitalInfo.unit,
        notes: formData.notes || undefined,
        recordedAt: new Date(),
      });
    }
  };

  const formatVitalValue = (vital: any) => {
    if (vital.vitalType === "blood_pressure") {
      return `${vital.systolic}/${vital.diastolic} ${vital.unit}`;
    }
    return `${vital.value} ${vital.unit}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ScreenContainer className="px-4 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Vitals Tracker</Text>
          <Text className="mt-1 text-base text-muted">Monitor your health vitals</Text>
        </View>

        {/* Vital Type Selection Grid */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Log New Reading</Text>
          <View className="flex-row flex-wrap gap-3">
            {VITAL_TYPES.map((vitalType) => (
              <TouchableOpacity
                key={vitalType.id}
                onPress={() => handleSelectVitalType(vitalType.id as VitalType)}
                className="flex-1 min-w-[45%] items-center rounded-xl border border-border bg-surface p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text className="mb-2 text-3xl">{vitalType.icon}</Text>
                <Text className="text-center text-sm font-semibold text-foreground">{vitalType.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Readings */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Recent Readings</Text>
          {vitals.length > 0 ? (
            vitals.map((vital) => {
              const vitalInfo = VITAL_TYPES.find((v) => v.id === vital.vitalType);
              return (
                <View
                  key={vital.id}
                  className="mb-3 flex-row items-center rounded-xl border border-border bg-surface p-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Text className="mr-3 text-2xl">{vitalInfo?.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{vitalInfo?.name}</Text>
                    <Text className="mt-1 text-lg font-bold text-primary">{formatVitalValue(vital)}</Text>
                    <Text className="mt-1 text-xs text-muted">{formatDate(vital.recordedAt)}</Text>
                    {vital.notes && (
                      <Text className="mt-1 text-xs text-muted">Note: {vital.notes}</Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 py-12">
              <Text className="text-center text-base text-muted">No vitals recorded yet</Text>
              <Text className="mt-1 text-center text-sm text-muted">Tap a vital type above to log your first reading</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Vital Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="rounded-t-3xl bg-background p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">
                {selectedVitalType && VITAL_TYPES.find((v) => v.id === selectedVitalType)?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                {selectedVitalType === "blood_pressure" ? (
                  <>
                    <View>
                      <Text className="mb-2 text-sm font-medium text-foreground">
                        Systolic (Top Number) <Text className="text-error">*</Text>
                      </Text>
                      <TextInput
                        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                        placeholder="e.g., 120"
                        placeholderTextColor={colors.muted}
                        value={formData.systolic}
                        onChangeText={(text) => setFormData({ ...formData, systolic: text })}
                        keyboardType="numeric"
                      />
                    </View>

                    <View>
                      <Text className="mb-2 text-sm font-medium text-foreground">
                        Diastolic (Bottom Number) <Text className="text-error">*</Text>
                      </Text>
                      <TextInput
                        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                        placeholder="e.g., 80"
                        placeholderTextColor={colors.muted}
                        value={formData.diastolic}
                        onChangeText={(text) => setFormData({ ...formData, diastolic: text })}
                        keyboardType="numeric"
                      />
                    </View>
                  </>
                ) : (
                  <View>
                    <Text className="mb-2 text-sm font-medium text-foreground">
                      Value ({selectedVitalType && VITAL_TYPES.find((v) => v.id === selectedVitalType)?.unit}){" "}
                      <Text className="text-error">*</Text>
                    </Text>
                    <TextInput
                      className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                      placeholder="Enter value"
                      placeholderTextColor={colors.muted}
                      value={formData.value}
                      onChangeText={(text) => setFormData({ ...formData, value: text })}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Notes (Optional)</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="Any additional notes"
                    placeholderTextColor={colors.muted}
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleAddVital}
                  className="mt-4 items-center rounded-xl py-4"
                  style={{ backgroundColor: colors.primary }}
                  disabled={createMutation.isPending}
                >
                  <Text className="text-base font-semibold text-white">
                    {createMutation.isPending ? "Saving..." : "Save Reading"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
