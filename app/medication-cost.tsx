import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MedicationCostService, { type MedicationPriceComparison } from "@/services/medicationCostService";

export default function MedicationCostScreen() {
  const colors = useColors();
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("30");
  const [zipCode, setZipCode] = useState("");
  const [comparison, setComparison] = useState<MedicationPriceComparison | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showGeneric, setShowGeneric] = useState(false);

  const handleSearch = async () => {
    if (!medicationName || !dosage || !zipCode) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    setIsSearching(true);
    try {
      const result = await MedicationCostService.searchMedicationPrices(
        medicationName,
        dosage,
        parseInt(quantity),
        zipCode
      );
      setComparison(result);
      const savings = MedicationCostService.calculateSavings(result);
      Alert.alert(
        "Prices Found!",
        `You can save up to $${savings.maxSavings.toFixed(2)} (${savings.percentSaved.toFixed(0)}%) by choosing the best option.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to search medication prices.");
    } finally {
      setIsSearching(false);
    }
  };

  const getEffectivePrice = (price: any) => {
    return price.hasDiscount && price.discountPrice ? price.discountPrice : price.price;
  };

  const savings = comparison ? MedicationCostService.calculateSavings(comparison) : null;

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Medication Cost Comparison</Text>
            <Text className="text-base text-muted mt-1">
              Find the lowest prices at pharmacies near you
            </Text>
          </View>

          {/* Search Form */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xl font-bold text-foreground mb-4">
              Search Medication
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">
                  Medication Name
                </Text>
                <TextInput
                  value={medicationName}
                  onChangeText={setMedicationName}
                  placeholder="e.g., Metformin"
                  className="text-lg text-foreground p-4 rounded-xl"
                  style={{ backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2">
                  Dosage
                </Text>
                <TextInput
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g., 500mg"
                  className="text-lg text-foreground p-4 rounded-xl"
                  style={{ backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2">
                  Quantity
                </Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="30"
                  className="text-lg text-foreground p-4 rounded-xl"
                  style={{ backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2">
                  ZIP Code
                </Text>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  placeholder="12345"
                  maxLength={5}
                  className="text-lg text-foreground p-4 rounded-xl"
                  style={{ backgroundColor: colors.background }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSearch}
                disabled={isSearching}
                className="rounded-full p-4 items-center mt-2"
                style={{ backgroundColor: colors.primary, opacity: isSearching ? 0.6 : 1 }}
              >
                <Text className="text-lg font-semibold text-white">
                  {isSearching ? "Searching..." : "Compare Prices"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results */}
          {comparison && savings && (
            <>
              {/* Savings Summary */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#10B981" }}
              >
                <Text className="text-xl font-bold text-white mb-2">
                  💰 Potential Savings
                </Text>
                <Text className="text-4xl font-bold text-white">
                  ${savings.maxSavings.toFixed(2)}
                </Text>
                <Text className="text-base text-white mt-1">
                  Save up to {savings.percentSaved.toFixed(0)}% by choosing the best option
                </Text>
              </View>

              {/* Generic Alternative Toggle */}
              {comparison.genericAlternative && (
                <TouchableOpacity
                  onPress={() => setShowGeneric(!showGeneric)}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-lg font-semibold text-foreground">
                        {showGeneric ? "Showing Generic" : "Show Generic Alternative"}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        Generic can save you up to 60%
                      </Text>
                    </View>
                    <Text className="text-2xl">{showGeneric ? "✓" : "→"}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Pharmacy Prices */}
              <View>
                <Text className="text-2xl font-bold text-foreground mb-3">
                  {showGeneric && comparison.genericAlternative
                    ? comparison.genericAlternative.name
                    : comparison.medicationName}
                </Text>
                <Text className="text-base text-muted mb-4">
                  {comparison.dosage} • Quantity: {comparison.quantity}
                </Text>

                <View className="gap-3">
                  {(showGeneric && comparison.genericAlternative
                    ? comparison.genericAlternative.prices
                    : comparison.prices
                  ).map((price, index) => {
                    const effectivePrice = getEffectivePrice(price);
                    const isLowest = effectivePrice === getEffectivePrice(savings.bestOption);

                    return (
                      <View
                        key={index}
                        className="rounded-2xl p-5"
                        style={{
                          backgroundColor: isLowest ? "#DCFCE7" : colors.surface,
                          borderWidth: isLowest ? 2 : 0,
                          borderColor: "#10B981",
                        }}
                      >
                        {isLowest && (
                          <View className="mb-2">
                            <Text className="text-sm font-bold" style={{ color: "#10B981" }}>
                              ⭐ BEST PRICE
                            </Text>
                          </View>
                        )}

                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-foreground">
                              {price.pharmacyName}
                            </Text>
                            <Text className="text-sm text-muted">{price.address}</Text>
                            <Text className="text-sm text-muted">{price.distance} miles away</Text>
                          </View>

                          <View className="items-end">
                            {price.hasDiscount && price.discountPrice ? (
                              <>
                                <Text className="text-sm text-muted line-through">
                                  ${price.price.toFixed(2)}
                                </Text>
                                <Text className="text-2xl font-bold" style={{ color: "#10B981" }}>
                                  ${price.discountPrice.toFixed(2)}
                                </Text>
                              </>
                            ) : (
                              <Text className="text-2xl font-bold text-foreground">
                                ${price.price.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mt-2">
                          {price.inNetwork && (
                            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#DBEAFE" }}>
                              <Text className="text-xs font-semibold" style={{ color: "#1E40AF" }}>
                                In Network
                              </Text>
                            </View>
                          )}
                          {price.couponAvailable && (
                            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#FEF3C7" }}>
                              <Text className="text-xs font-semibold" style={{ color: "#92400E" }}>
                                Coupon: {price.couponCode}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Patient Assistance Programs */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-3">
                  💊 Patient Assistance Programs
                </Text>
                <Text className="text-base text-muted mb-3">
                  You may qualify for free or low-cost medication:
                </Text>
                <View className="gap-2">
                  {comparison.patientAssistancePrograms.map((program, index) => (
                    <Text key={index} className="text-base text-foreground">
                      • {program}
                    </Text>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
