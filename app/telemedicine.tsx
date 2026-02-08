import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  getHealthcareProviders,
  scheduleVideoAppointment,
  getAvailableTimeSlots,
  getSpecialtyIcon,
  formatAppointmentTime,
  type HealthcareProvider,
  type VideoAppointment,
} from "@/lib/telemedicine";

export default function TelemedicineScreen() {
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    const data = await getHealthcareProviders();
    setProviders(data);
  }

  function handleProviderSelect(provider: HealthcareProvider) {
    setSelectedProvider(provider);
    setShowBooking(true);
  }

  async function handleBookAppointment() {
    if (!selectedProvider || !selectedTime || !reason) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const appointmentTime = new Date(selectedDate);
    appointmentTime.setHours(hours, minutes, 0, 0);

    try {
      const appointment = await scheduleVideoAppointment(
        selectedProvider.id,
        "Patient", // In production, get from user profile
        appointmentTime,
        reason
      );

      Alert.alert(
        "Appointment Scheduled",
        `Your video consultation with ${selectedProvider.name} is scheduled for ${formatAppointmentTime(appointmentTime)}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowBooking(false);
              setSelectedProvider(null);
              setReason("");
              setSelectedTime("");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to schedule appointment");
    }
  }

  const availableSlots = selectedProvider
    ? getAvailableTimeSlots(selectedProvider, selectedDate)
    : [];

  if (showBooking && selectedProvider) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => setShowBooking(false)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text className="text-lg text-primary">← Back</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Book Appointment</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Provider Info */}
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-3xl mb-2">{getSpecialtyIcon(selectedProvider.specialty)}</Text>
            <Text className="text-xl font-bold text-foreground mb-1">
              {selectedProvider.name}
            </Text>
            <Text className="text-base text-muted mb-2">{selectedProvider.specialty}</Text>
            <Text className="text-sm text-muted">{selectedProvider.credentials}</Text>
            <View className="flex-row items-center mt-3">
              <Text className="text-2xl mr-2">⭐</Text>
              <Text className="text-lg font-semibold text-foreground">
                {selectedProvider.rating}
              </Text>
            </View>
          </View>

          {/* Reason for Visit */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Reason for Consultation
            </Text>
            <TextInput
              className="bg-surface text-foreground text-lg p-4 rounded-xl border border-border"
              placeholder="e.g., Follow-up on blood pressure"
              placeholderTextColor="#9CA3AF"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Available Time Slots */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Select Time Slot
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {availableSlots.map(slot => (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className={`px-6 py-3 rounded-xl ${
                    selectedTime === slot ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedTime === slot ? "text-white" : "text-foreground"
                    }`}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Consultation Fee */}
          <View className="bg-surface p-4 rounded-xl mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-muted">Consultation Fee:</Text>
              <Text className="text-xl font-bold text-foreground">
                ${selectedProvider.consultationFee}
              </Text>
            </View>
          </View>

          {/* Book Button */}
          <Pressable
            onPress={handleBookAppointment}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            className="bg-primary py-5 rounded-2xl items-center mb-8"
          >
            <Text className="text-white text-xl font-bold">Schedule Video Consultation</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Telemedicine
          </Text>
          <Text className="text-lg text-muted">
            Connect with healthcare providers from home
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-primary/10 p-5 rounded-2xl mb-6">
          <Text className="text-lg font-semibold text-primary mb-2">
            📹 Video Consultations Available
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            Schedule video calls with board-certified doctors. No travel required!
          </Text>
        </View>

        {/* Providers List */}
        <Text className="text-xl font-bold text-foreground mb-4">
          Available Providers
        </Text>

        {providers.map(provider => (
          <Pressable
            key={provider.id}
            onPress={() => handleProviderSelect(provider)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            className="bg-surface p-5 rounded-2xl mb-4"
          >
            <View className="flex-row items-start">
              <Text className="text-4xl mr-4">{getSpecialtyIcon(provider.specialty)}</Text>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground mb-1">
                  {provider.name}
                </Text>
                <Text className="text-base text-muted mb-2">{provider.specialty}</Text>
                <Text className="text-sm text-muted mb-3">{provider.credentials}</Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-1">⭐</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {provider.rating}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-primary">
                    ${provider.consultationFee}
                  </Text>
                </View>
                
                <View className="mt-3 pt-3 border-t border-border">
                  <Text className="text-sm text-muted">
                    Accepts: {provider.acceptsInsurance.slice(0, 2).join(", ")}
                    {provider.acceptsInsurance.length > 2 && " +more"}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
