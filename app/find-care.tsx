import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import LocalHealthFinderService, {
  type HealthcareProvider,
  type DoctorVisitSummary,
} from "@/services/localHealthFinder";

export default function FindCareScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const condition = (params.condition as string) || "";

  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicareOnly, setMedicareOnly] = useState(false);
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [visitSummary, setVisitSummary] = useState<DoctorVisitSummary | null>(null);

  useEffect(() => {
    loadProviders();
    if (condition) {
      generateVisitSummary();
    }
  }, [medicareOnly, medicaidOnly]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await LocalHealthFinderService.findProvidersForCondition(condition, {
        acceptsMedicare: medicareOnly,
        acceptsMedicaid: medicaidOnly,
      });
      setProviders(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load healthcare providers");
    } finally {
      setLoading(false);
    }
  };

  const generateVisitSummary = async () => {
    try {
      const summary = await LocalHealthFinderService.generateVisitSummary(
        condition,
        ["Metformin 500mg", "Lisinopril 10mg"], // In production, get from user's medication list
        ["Fatigue", "Dizziness"] // In production, get from symptom diary
      );
      setVisitSummary(summary);
    } catch (error) {
      console.error("Error generating visit summary:", error);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (provider: HealthcareProvider) => {
    const fullAddress = `${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url);
  };

  const handleWebsite = (website?: string) => {
    if (website) {
      Linking.openURL(website);
    }
  };

  const handleSaveFavorite = async (provider: HealthcareProvider) => {
    try {
      await LocalHealthFinderService.saveFavoriteProvider(provider);
      Alert.alert("Success", `${provider.name} saved to favorites!`);
    } catch (error) {
      Alert.alert("Error", "Failed to save favorite");
    }
  };

  const handleShareVisitSummary = () => {
    if (!visitSummary) return;
    Alert.alert("Visit Summary", "Visit summary will be shared with your caregiver");
  };

  const renderProvider = (provider: HealthcareProvider) => (
    <View
      key={provider.id}
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View
            className="self-start rounded-full px-3 py-1 mb-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-xs font-bold text-white uppercase">
              {provider.type.replace("_", " ")}
            </Text>
          </View>
          <Text className="text-xl font-bold text-foreground mb-1">{provider.name}</Text>
          {provider.distance && (
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              {provider.distance.toFixed(1)} miles away
            </Text>
          )}
        </View>
        {provider.rating && (
          <View className="items-center">
            <Text className="text-2xl">⭐</Text>
            <Text className="text-sm font-bold text-foreground">{provider.rating}</Text>
          </View>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-base text-foreground mb-1">
          {provider.address}
        </Text>
        <Text className="text-base text-foreground">
          {provider.city}, {provider.state} {provider.zipCode}
        </Text>
        {provider.hours && (
          <Text className="text-sm text-muted mt-1">{provider.hours}</Text>
        )}
      </View>

      {/* Insurance Badges */}
      <View className="flex-row gap-2 mb-3">
        {provider.acceptsMedicare && (
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-xs font-bold text-white">✓ Medicare</Text>
          </View>
        )}
        {provider.acceptsMedicaid && (
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-xs font-bold text-white">✓ Medicaid</Text>
          </View>
        )}
      </View>

      {/* Specialties */}
      {provider.specialties.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Specialties:</Text>
          <View className="flex-row flex-wrap gap-2">
            {provider.specialties.map((specialty, index) => (
              <View
                key={index}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-xs text-foreground">{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleCall(provider.phone)}
            className="flex-1 rounded-full p-4 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-bold text-white">📞 Call Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate(provider)}
            className="flex-1 rounded-full p-4 items-center"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-base font-bold text-white">🗺️ Directions</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          {provider.website && (
            <TouchableOpacity
              onPress={() => handleWebsite(provider.website)}
              className="flex-1 rounded-full p-3 items-center"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-sm font-semibold text-foreground">🌐 Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleSaveFavorite(provider)}
            className="flex-1 rounded-full p-3 items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-sm font-semibold text-foreground">⭐ Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Find Care Near Me</Text>
            {condition ? (
              <Text className="text-base text-muted mt-1">
                Healthcare providers for {condition} in Fulshear/Houston
              </Text>
            ) : (
              <Text className="text-base text-muted mt-1">
                Find healthcare providers in your area
              </Text>
            )}
          </View>

          {/* Filters */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Insurance Filters</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setMedicareOnly(!medicareOnly)}
                className="flex-1 rounded-full p-4 items-center"
                style={{
                  backgroundColor: medicareOnly ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: medicareOnly ? "#fff" : colors.foreground }}
                >
                  {medicareOnly ? "✓" : ""} Medicare
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMedicaidOnly(!medicaidOnly)}
                className="flex-1 rounded-full p-4 items-center"
                style={{
                  backgroundColor: medicaidOnly ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: medicaidOnly ? "#fff" : colors.foreground }}
                >
                  {medicaidOnly ? "✓" : ""} Medicaid
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Doctor's Visit Summary */}
          {visitSummary && (
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xl font-bold text-foreground mb-3">
                📋 Doctor's Visit Summary
              </Text>
              <Text className="text-base text-muted mb-4">
                Bring this summary to your appointment
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Questions to Ask:</Text>
                {visitSummary.questions.map((question, index) => (
                  <Text key={index} className="text-base text-foreground mb-1" style={{ lineHeight: 24 }}>
                    • {question}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleShareVisitSummary}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-base font-bold text-white">Share with Caregiver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Providers List */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">
              Healthcare Providers ({providers.length})
            </Text>
            {providers.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">🏥</Text>
                <Text className="text-xl font-bold text-foreground text-center mb-2">
                  No Providers Found
                </Text>
                <Text className="text-base text-muted text-center">
                  Try adjusting your filters or search criteria
                </Text>
              </View>
            ) : (
              providers.map(renderProvider)
            )}
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/pharmacy-finder" as any)}
              className="rounded-2xl p-5 flex-row items-center justify-between"
              style={{ backgroundColor: colors.primary }}
            >
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">💊 Find Pharmacies</Text>
                <Text className="text-sm text-white mt-1 opacity-90">
                  Locate nearby pharmacies and resources
                </Text>
              </View>
              <Text className="text-2xl text-white">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
