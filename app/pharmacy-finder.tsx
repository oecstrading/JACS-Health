import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import LocalHealthFinderService, {
  type Pharmacy,
  type SocialResource,
} from "@/services/localHealthFinder";

export default function PharmacyFinderScreen() {
  const colors = useColors();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [socialResources, setSocialResources] = useState<SocialResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"pharmacies" | "resources">("pharmacies");
  const [zipCode, setZipCode] = useState("77441"); // Default to Fulshear

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pharmacyData, resourceData] = await Promise.all([
        LocalHealthFinderService.findNearbyPharmacies(),
        LocalHealthFinderService.findSocialResources(zipCode),
      ]);
      setPharmacies(pharmacyData);
      setSocialResources(resourceData);
    } catch (error) {
      Alert.alert("Error", "Failed to load pharmacy and resource data");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (address: string, city: string, state: string, zipCode: string) => {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url);
  };

  const handleWebsite = (website?: string) => {
    if (website) {
      Linking.openURL(website);
    }
  };

  const renderPharmacy = (pharmacy: Pharmacy) => (
    <View
      key={pharmacy.id}
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground mb-1">{pharmacy.name}</Text>
          {pharmacy.distance && (
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              {pharmacy.distance.toFixed(1)} miles away
            </Text>
          )}
        </View>
        {pharmacy.accepts24Hour && (
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-xs font-bold text-white">24 HOURS</Text>
          </View>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-base text-foreground mb-1">
          {pharmacy.address}
        </Text>
        <Text className="text-base text-foreground">
          {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}
        </Text>
        <Text className="text-sm text-muted mt-1">{pharmacy.hours}</Text>
      </View>

      {/* Services */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">Services:</Text>
        <View className="flex-row flex-wrap gap-2">
          {pharmacy.services.map((service, index) => (
            <View
              key={index}
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-xs text-foreground">{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleCall(pharmacy.phone)}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-bold text-white">📞 Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigate(pharmacy.address, pharmacy.city, pharmacy.state, pharmacy.zipCode)}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: colors.success }}
        >
          <Text className="text-base font-bold text-white">🗺️ Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSocialResource = (resource: SocialResource) => (
    <View
      key={resource.id}
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="mb-3">
        <View
          className="self-start rounded-full px-3 py-1 mb-2"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-xs font-bold text-white uppercase">
            {resource.category.replace("_", " ")}
          </Text>
        </View>
        <Text className="text-xl font-bold text-foreground mb-2">{resource.name}</Text>
        <Text className="text-base text-foreground mb-3" style={{ lineHeight: 24 }}>
          {resource.description}
        </Text>
      </View>

      <View className="mb-3">
        <Text className="text-base text-foreground mb-1">
          {resource.address}
        </Text>
        <Text className="text-base text-foreground">
          {resource.city}, {resource.state} {resource.zipCode}
        </Text>
        {resource.hours && (
          <Text className="text-sm text-muted mt-1">{resource.hours}</Text>
        )}
      </View>

      {resource.eligibility && (
        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.background }}
        >
          <Text className="text-sm font-semibold text-foreground mb-1">Eligibility:</Text>
          <Text className="text-sm text-foreground">{resource.eligibility}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleCall(resource.phone)}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-bold text-white">📞 Call</Text>
        </TouchableOpacity>

        {resource.website && (
          <TouchableOpacity
            onPress={() => handleWebsite(resource.website)}
            className="flex-1 rounded-full p-4 items-center"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-base font-bold text-white">🌐 Website</Text>
          </TouchableOpacity>
        )}
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
            <Text className="text-3xl font-bold text-foreground">Pharmacy & Resources</Text>
            <Text className="text-base text-muted mt-1">
              Find nearby pharmacies and community resources
            </Text>
          </View>

          {/* Tab Selector */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setSelectedTab("pharmacies")}
              className="flex-1 rounded-full p-4 items-center"
              style={{
                backgroundColor: selectedTab === "pharmacies" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: selectedTab === "pharmacies" ? "#fff" : colors.foreground }}
              >
                💊 Pharmacies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("resources")}
              className="flex-1 rounded-full p-4 items-center"
              style={{
                backgroundColor: selectedTab === "resources" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: selectedTab === "resources" ? "#fff" : colors.foreground }}
              >
                🤝 Resources
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {selectedTab === "pharmacies" ? (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-4">
                Nearby Pharmacies in Fulshear/Houston
              </Text>
              {pharmacies.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-6xl mb-4">💊</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Pharmacies Found
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Try adjusting your location or search filters
                  </Text>
                </View>
              ) : (
                pharmacies.map(renderPharmacy)
              )}
            </View>
          ) : (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-4">
                Community Resources in Fort Bend County
              </Text>
              {socialResources.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-6xl mb-4">🤝</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Resources Found
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Try adjusting your ZIP code or category filters
                  </Text>
                </View>
              ) : (
                socialResources.map(renderSocialResource)
              )}
            </View>
          )}

          {/* Info Box */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-bold text-foreground mb-2">
              📍 Location: Fulshear, TX
            </Text>
            <Text className="text-base text-muted">
              Showing results for ZIP code {zipCode}. Distances calculated from Fulshear Family Medicine.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
