import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import SpecialistBookingService, { type Specialist, type SpecialtyType } from "@/services/specialistBookingService";

export default function SpecialistBookingScreen() {
  const colors = useColors();
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyType | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const specialties: { type: SpecialtyType; label: string; icon: string }[] = [
    { type: "rheumatologist", label: "Rheumatologist", icon: "🦴" },
    { type: "endocrinologist", label: "Endocrinologist", icon: "💉" },
    { type: "primary_care", label: "Primary Care", icon: "👨‍⚕️" },
    { type: "cardiologist", label: "Cardiologist", icon: "❤️" },
    { type: "neurologist", label: "Neurologist", icon: "🧠" },
  ];

  const handleSearch = async () => {
    if (!selectedSpecialty || !zipCode) {
      Alert.alert("Missing Information", "Please select a specialty and enter your ZIP code.");
      return;
    }

    setIsSearching(true);
    try {
      const results = await SpecialistBookingService.searchSpecialists(selectedSpecialty, zipCode);
      setSpecialists(results);
      if (results.length === 0) {
        Alert.alert("No Results", "No specialists found in your area. Try expanding your search radius.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search for specialists.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookAppointment = async (specialist: Specialist) => {
    const verification = await SpecialistBookingService.verifyInsurance(specialist.id);
    
    Alert.alert(
      "Book Appointment",
      `${specialist.name}\n\nInsurance: ${verification.inNetwork ? "In-Network" : "Out-of-Network"}\nEstimated Copay: $${verification.copay}\n\nWould you like to proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: async () => {
            try {
              await SpecialistBookingService.bookAppointment(
                specialist,
                specialist.nextAvailableDate,
                "10:00 AM",
                specialist.telehealth ? "telehealth" : "in_person"
              );
              Alert.alert("Success", "Appointment booked successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to book appointment.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Book Specialist</Text>
            <Text className="text-base text-muted mt-1">
              Find and schedule appointments with specialists
            </Text>
          </View>

          {/* Specialty Selection */}
          <View>
            <Text className="text-xl font-bold text-foreground mb-3">
              Select Specialty
            </Text>
            <View className="gap-3">
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty.type}
                  onPress={() => setSelectedSpecialty(specialty.type)}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor:
                      selectedSpecialty === specialty.type ? colors.primary : colors.surface,
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-3xl">{specialty.icon}</Text>
                    <Text
                      className="text-lg font-semibold"
                      style={{
                        color:
                          selectedSpecialty === specialty.type ? "#FFFFFF" : colors.foreground,
                      }}
                    >
                      {specialty.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ZIP Code Input */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-semibold text-foreground mb-3">
              Your ZIP Code
            </Text>
            <TextInput
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              placeholder="12345"
              maxLength={5}
              className="text-xl text-foreground p-4 rounded-xl"
              style={{ backgroundColor: colors.background }}
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={isSearching}
            className="rounded-full p-4 items-center"
            style={{ backgroundColor: colors.primary, opacity: isSearching ? 0.6 : 1 }}
          >
            <Text className="text-lg font-semibold text-white">
              {isSearching ? "Searching..." : "Find Specialists"}
            </Text>
          </TouchableOpacity>

          {/* Results */}
          {specialists.length > 0 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-3">
                {specialists.length} Specialists Found
              </Text>

              <View className="gap-3">
                {specialists.map((specialist) => (
                  <View
                    key={specialist.id}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-foreground">
                          {specialist.name}
                        </Text>
                        <Text className="text-base text-muted mt-1">{specialist.address}</Text>
                        <Text className="text-base text-muted">{specialist.phone}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                          ⭐ {specialist.rating.toFixed(1)}
                        </Text>
                        <Text className="text-sm text-muted">{specialist.reviewCount} reviews</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-2 mb-3">
                      <Text className="text-base text-muted">{specialist.distance} miles away</Text>
                      <Text className="text-base text-muted">•</Text>
                      <Text className="text-base text-muted">
                        Next: {specialist.nextAvailableDate.toLocaleDateString()}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {specialist.acceptingNewPatients && (
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#DCFCE7" }}>
                          <Text className="text-xs font-semibold" style={{ color: "#166534" }}>
                            Accepting New Patients
                          </Text>
                        </View>
                      )}
                      {specialist.inNetwork && (
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#DBEAFE" }}>
                          <Text className="text-xs font-semibold" style={{ color: "#1E40AF" }}>
                            In Network
                          </Text>
                        </View>
                      )}
                      {specialist.telehealth && (
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#F3E8FF" }}>
                          <Text className="text-xs font-semibold" style={{ color: "#6B21A8" }}>
                            Telehealth Available
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleBookAppointment(specialist)}
                      className="rounded-full p-3 items-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-base font-semibold text-white">
                        Book Appointment
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
