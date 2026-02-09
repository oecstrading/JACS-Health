import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MedicationInteractionService, {
  type Medication,
  type InteractionCheckResult,
} from "@/services/medicationInteractionService";

export default function MedicationInteractionScreen() {
  const colors = useColors();
  const [currentMedications, setCurrentMedications] = useState<Medication[]>([]);
  const [newMedicationName, setNewMedicationName] = useState("");
  const [checkResult, setCheckResult] = useState<InteractionCheckResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadCurrentMedications();
  }, []);

  const loadCurrentMedications = async () => {
    const meds = await MedicationInteractionService.getCurrentMedications();
    setCurrentMedications(meds);
  };

  const handleCheckInteraction = async () => {
    if (!newMedicationName.trim()) {
      Alert.alert("Error", "Please enter a medication name");
      return;
    }

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: newMedicationName,
      genericName: newMedicationName,
      dosage: "",
      frequency: "",
    };

    const result = await MedicationInteractionService.checkInteractions(newMed);
    setCheckResult(result);
    setShowResult(true);
  };

  const handleBookConsultation = async () => {
    if (!checkResult) return;

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: newMedicationName,
      genericName: newMedicationName,
      dosage: "",
      frequency: "",
    };

    const { consultationId, scheduledTime } =
      await MedicationInteractionService.bookPharmacistConsultation(
        newMed,
        checkResult.interactions
      );

    Alert.alert(
      "Consultation Booked",
      `Your pharmacist consultation is scheduled for ${scheduledTime.toLocaleString()}.\n\nConsultation ID: ${consultationId}`,
      [{ text: "OK" }]
    );
  };

  const renderSeverityBadge = (severity: string) => {
    const color = MedicationInteractionService.getSeverityColor(severity);
    const label = MedicationInteractionService.getSeverityLabel(severity);

    return (
      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: color }}>
        <Text className="text-xs font-bold text-white">{label}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Interaction Checker</Text>
            <Text className="text-base text-muted mt-1">
              Check for dangerous medication combinations
            </Text>
          </View>

          {/* Current Medications */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Current Medications ({currentMedications.length})
            </Text>
            {currentMedications.length === 0 ? (
              <View
                className="rounded-2xl p-6 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-4xl mb-2">💊</Text>
                <Text className="text-base text-muted text-center">
                  No medications added yet
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {currentMedications.map((med) => (
                  <View
                    key={med.id}
                    className="rounded-xl p-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-base font-semibold text-foreground">{med.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Check New Medication */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Check New Medication
            </Text>
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-sm font-semibold text-muted mb-2">Medication Name</Text>
              <TextInput
                value={newMedicationName}
                onChangeText={setNewMedicationName}
                placeholder="Enter medication name"
                placeholderTextColor={colors.muted}
                className="text-base text-foreground p-3 rounded-xl mb-4"
                style={{ backgroundColor: colors.background }}
              />

              <TouchableOpacity
                onPress={handleCheckInteraction}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-base font-semibold text-white">Check Interactions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results */}
          {showResult && checkResult && (
            <View className="gap-4">
              {/* Summary */}
              <View
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: checkResult.hasInteractions ? colors.error : colors.success,
                  opacity: 0.9,
                }}
              >
                <Text className="text-2xl font-bold text-white mb-1">
                  {checkResult.hasInteractions ? "⚠️ Interactions Found" : "✅ No Interactions"}
                </Text>
                <Text className="text-base text-white">
                  {checkResult.hasInteractions
                    ? `Found ${checkResult.interactions.length} potential interaction(s)`
                    : "This medication is safe to take with your current medications"}
                </Text>
              </View>

              {/* Interactions */}
              {checkResult.interactions.map((interaction) => (
                <View
                  key={interaction.id}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {interaction.medication1} + {interaction.medication2}
                      </Text>
                    </View>
                    {renderSeverityBadge(interaction.severity)}
                  </View>

                  <Text className="text-base text-foreground mb-3">{interaction.description}</Text>

                  <View className="mb-3">
                    <Text className="text-sm font-semibold text-muted mb-2">Potential Effects:</Text>
                    {interaction.effects.map((effect, index) => (
                      <View key={index} className="flex-row items-start gap-2 mb-1">
                        <Text className="text-base text-foreground">•</Text>
                        <Text className="flex-1 text-base text-foreground">{effect}</Text>
                      </View>
                    ))}
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-muted mb-2">Recommendations:</Text>
                    {interaction.recommendations.map((rec, index) => (
                      <View key={index} className="flex-row items-start gap-2 mb-1">
                        <Text className="text-base text-foreground">•</Text>
                        <Text className="flex-1 text-base text-foreground">{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              {/* Safer Alternatives */}
              {checkResult.saferAlternatives.length > 0 && (
                <View>
                  <Text className="text-lg font-semibold text-foreground mb-3">
                    Safer Alternatives
                  </Text>
                  {checkResult.saferAlternatives.map((alt, index) => (
                    <View
                      key={index}
                      className="rounded-2xl p-5 mb-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {alt.medicationName}
                      </Text>
                      <Text className="text-sm text-muted mb-2">{alt.genericName}</Text>
                      <Text className="text-base text-foreground mb-2">{alt.reason}</Text>
                      <Text className="text-sm text-muted">{alt.effectiveness}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Pharmacist Consultation */}
              {checkResult.pharmacistConsultationRecommended && (
                <View
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.warning, opacity: 0.9 }}
                >
                  <Text className="text-xl font-bold text-white mb-2">
                    ⚕️ Pharmacist Consultation Recommended
                  </Text>
                  <Text className="text-base text-white mb-4">
                    Due to the severity of the interactions, we recommend consulting with a
                    pharmacist before taking this medication.
                  </Text>
                  <TouchableOpacity
                    onPress={handleBookConsultation}
                    className="rounded-full p-4 items-center"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <Text className="text-base font-semibold" style={{ color: colors.warning }}>
                      Book Pharmacist Consultation
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
