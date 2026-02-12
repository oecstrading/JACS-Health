import { ScrollView, Text, TouchableOpacity, View, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

export default function MedicationTrackerScreen() {
  const colors = useColors();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    prescribedBy: "",
    pharmacy: "",
    refillsRemaining: "",
    startDate: new Date(),
    notes: "",
  });

  const { data: medications = [], refetch } = trpc.medications.list.useQuery();
  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      resetForm();
      Alert.alert("Success", "Medication added successfully");
    },
  });
  const deleteMutation = trpc.medications.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert("Success", "Medication deleted successfully");
    },
  });
  const logMutation = trpc.medications.logMedication.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert("Success", "Medication logged successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      prescribedBy: "",
      pharmacy: "",
      refillsRemaining: "",
      startDate: new Date(),
      notes: "",
    });
  };

  const handleAddMedication = () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      Alert.alert("Error", "Please fill in required fields (Name, Dosage, Frequency)");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      instructions: formData.instructions || undefined,
      prescribedBy: formData.prescribedBy || undefined,
      pharmacy: formData.pharmacy || undefined,
      refillsRemaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining) : undefined,
      startDate: formData.startDate,
      notes: formData.notes || undefined,
    });
  };

  const handleDeleteMedication = (id: string, name: string) => {
    Alert.alert("Delete Medication", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id }),
      },
    ]);
  };

  const handleLogMedication = (medicationId: string, status: "taken" | "skipped") => {
    logMutation.mutate({
      medicationId,
      status,
      takenAt: new Date(),
    });
  };

  const activeMedications = medications.filter((med) => med.isActive);
  const inactiveMedications = medications.filter((med) => !med.isActive);

  return (
    <ScreenContainer className="px-4 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mb-2">
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Medication Tracker</Text>
            <Text className="mt-1 text-base text-muted">
              {activeMedications.length} active {activeMedications.length === 1 ? "medication" : "medications"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-2xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>

        {/* Active Medications */}
        {activeMedications.length > 0 ? (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">Active Medications</Text>
            {activeMedications.map((med) => (
              <View
                key={med.id}
                className="mb-3 rounded-xl border border-border bg-surface p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="mb-3 flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{med.name}</Text>
                    <Text className="mt-1 text-sm text-muted">
                      {med.dosage} • {med.frequency}
                    </Text>
                    {med.prescribedBy && (
                      <Text className="mt-1 text-xs text-muted">Prescribed by: {med.prescribedBy}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteMedication(med.id, med.name)}
                    className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-error/10"
                  >
                    <Text className="text-error">×</Text>
                  </TouchableOpacity>
                </View>

                {med.instructions && (
                  <View className="mb-3 rounded-lg bg-background p-3">
                    <Text className="text-xs font-medium text-muted">Instructions:</Text>
                    <Text className="mt-1 text-sm text-foreground">{med.instructions}</Text>
                  </View>
                )}

                {/* Quick Log Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleLogMedication(med.id, "taken")}
                    className="flex-1 items-center rounded-lg py-3"
                    style={{ backgroundColor: colors.success + "20" }}
                  >
                    <Text className="font-medium" style={{ color: colors.success }}>
                      ✓ Taken
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleLogMedication(med.id, "skipped")}
                    className="flex-1 items-center rounded-lg bg-muted/10 py-3"
                  >
                    <Text className="font-medium text-muted">Skip</Text>
                  </TouchableOpacity>
                </View>

                {med.refillsRemaining !== null && med.refillsRemaining !== undefined && (
                  <View className="mt-3 rounded-lg bg-warning/10 p-2">
                    <Text className="text-center text-xs font-medium text-warning">
                      {med.refillsRemaining} {med.refillsRemaining === 1 ? "refill" : "refills"} remaining
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View className="mb-6 items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 py-12">
            <Text className="text-center text-base text-muted">No active medications</Text>
            <Text className="mt-1 text-center text-sm text-muted">Tap + to add your first medication</Text>
          </View>
        )}

        {/* Inactive Medications */}
        {inactiveMedications.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-muted">Inactive Medications</Text>
            {inactiveMedications.map((med) => (
              <View
                key={med.id}
                className="mb-3 rounded-xl border border-border bg-surface/50 p-4 opacity-60"
              >
                <Text className="text-base font-semibold text-foreground">{med.name}</Text>
                <Text className="mt-1 text-sm text-muted">
                  {med.dosage} • {med.frequency}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="rounded-t-3xl bg-background p-6" style={{ maxHeight: "90%" }}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Add Medication</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    Medication Name <Text className="text-error">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="e.g., Lisinopril"
                    placeholderTextColor={colors.muted}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    Dosage <Text className="text-error">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="e.g., 10 mg"
                    placeholderTextColor={colors.muted}
                    value={formData.dosage}
                    onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    Frequency <Text className="text-error">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="e.g., Once daily"
                    placeholderTextColor={colors.muted}
                    value={formData.frequency}
                    onChangeText={(text) => setFormData({ ...formData, frequency: text })}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Instructions</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="e.g., Take with food"
                    placeholderTextColor={colors.muted}
                    value={formData.instructions}
                    onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Prescribed By</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="Doctor's name"
                    placeholderTextColor={colors.muted}
                    value={formData.prescribedBy}
                    onChangeText={(text) => setFormData({ ...formData, prescribedBy: text })}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Pharmacy</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="Pharmacy name"
                    placeholderTextColor={colors.muted}
                    value={formData.pharmacy}
                    onChangeText={(text) => setFormData({ ...formData, pharmacy: text })}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Refills Remaining</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="Number of refills"
                    placeholderTextColor={colors.muted}
                    value={formData.refillsRemaining}
                    onChangeText={(text) => setFormData({ ...formData, refillsRemaining: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Notes</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    placeholder="Additional notes"
                    placeholderTextColor={colors.muted}
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleAddMedication}
                  className="mt-4 items-center rounded-xl py-4"
                  style={{ backgroundColor: colors.primary }}
                  disabled={createMutation.isPending}
                >
                  <Text className="text-base font-semibold text-white">
                    {createMutation.isPending ? "Adding..." : "Add Medication"}
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
