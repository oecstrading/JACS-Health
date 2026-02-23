import { View, Text, Pressable, ScrollView, Alert, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AlertTriangle, Phone, MapPin, Heart, Pill, Users, X } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function EmergencySOSScreen() {
  const colors = useColors();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const emergencyProfile = {
    name: "Janice John",
    age: 58,
    bloodType: "O+",
    allergies: ["None"],
    conditions: ["Type 2 Diabetes", "Hypertension"],
    medications: [
      "Metformin 1000mg - 2x daily",
      "Lisinopril 10mg - 1x daily",
      "Atorvastatin 20mg - 1x daily",
    ],
    emergencyContacts: [
      { name: "John Smith (Spouse)", phone: "+1 (555) 123-4567" },
      { name: "Sarah Johnson (Daughter)", phone: "+1 (555) 987-6543" },
    ],
    currentVitals: {
      glucose: "125 mg/dL",
      bloodPressure: "128/82 mmHg",
      heartRate: "78 bpm",
      location: "123 Main St, Springfield, IL 62701",
    },
  };

  const handleActivateSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "Activate Emergency SOS?",
      "This will:\\n• Call 911\\n• Share your location\\n• Send alerts to emergency contacts\\n• Share current vitals and medications",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          style: "destructive",
          onPress: () => {
            setSosActive(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            // Simulate countdown
            let count = 5;
            const interval = setInterval(() => {
              count--;
              setCountdown(count);
              if (count === 0) {
                clearInterval(interval);
                Alert.alert("Emergency SOS Activated", "911 has been notified. Emergency contacts have been alerted.");
                Linking.openURL("tel:911");
              }
            }, 1000);
          },
        },
      ]
    );
  };

  const handleCancelSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSosActive(false);
    setCountdown(5);
    Alert.alert("SOS Cancelled", "Emergency alert has been cancelled.");
  };

  const handleCallContact = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <AlertTriangle size={28} color={colors.error} />
            <Text className="text-2xl font-bold text-foreground">Emergency SOS</Text>
          </View>
          <Text className="text-base text-muted">One-tap emergency assistance</Text>
        </View>

        {/* SOS Button */}
        {sosActive ? (
          <View className="px-6 pb-6">
            <View className="bg-error/10 border-4 border-error rounded-xl p-8 items-center">
              <AlertTriangle size={64} color={colors.error} />
              <Text className="text-3xl font-bold text-error mt-4">SOS ACTIVE</Text>
              <Text className="text-6xl font-bold text-error my-4">{countdown}</Text>
              <Text className="text-base text-center text-muted mb-6">
                Calling 911 and notifying emergency contacts...
              </Text>
              <Pressable
                onPress={handleCancelSOS}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-foreground px-8 py-4 rounded-xl flex-row items-center gap-2"
              >
                <X size={24} color="#ffffff" />
                <Text className="text-white font-bold text-lg">CANCEL</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleActivateSOS}
              onLongPress={handleActivateSOS}
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                }
              ]}
              className="bg-error rounded-2xl p-8 items-center"
            >
              <AlertTriangle size={80} color="#ffffff" />
              <Text className="text-white font-bold text-2xl mt-4">EMERGENCY SOS</Text>
              <Text className="text-white/80 text-center mt-2">
                Tap to activate emergency alert
              </Text>
            </Pressable>
          </View>
        )}

        {/* Emergency Profile */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Emergency Profile</Text>
          <View className="bg-surface border border-border rounded-xl p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Name</Text>
              <Text className="text-sm font-semibold text-foreground">{emergencyProfile.name}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Age</Text>
              <Text className="text-sm font-semibold text-foreground">{emergencyProfile.age}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Blood Type</Text>
              <Text className="text-sm font-semibold text-error">{emergencyProfile.bloodType}</Text>
            </View>
            <View className="flex-row items-start justify-between">
              <Text className="text-sm text-muted">Allergies</Text>
              <Text className="text-sm font-semibold text-foreground text-right flex-1 ml-4">
                {emergencyProfile.allergies.join(", ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Vitals */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Heart size={20} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Current Vitals</Text>
          </View>
          <View className="bg-surface border border-border rounded-xl p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Glucose</Text>
              <Text className="text-sm font-semibold text-foreground">{emergencyProfile.currentVitals.glucose}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Blood Pressure</Text>
              <Text className="text-sm font-semibold text-foreground">{emergencyProfile.currentVitals.bloodPressure}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Heart Rate</Text>
              <Text className="text-sm font-semibold text-foreground">{emergencyProfile.currentVitals.heartRate}</Text>
            </View>
          </View>
        </View>

        {/* Current Medications */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Pill size={20} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Current Medications</Text>
          </View>
          <View className="bg-surface border border-border rounded-xl p-4 gap-2">
            {emergencyProfile.medications.map((med, i) => (
              <Text key={i} className="text-sm text-foreground">• {med}</Text>
            ))}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Users size={20} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Emergency Contacts</Text>
          </View>
          {emergencyProfile.emergencyContacts.map((contact, i) => (
            <View key={i} className="bg-surface border border-border rounded-xl p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground mb-1">{contact.name}</Text>
                <Text className="text-sm text-muted">{contact.phone}</Text>
              </View>
              <Pressable
                onPress={() => handleCallContact(contact.phone)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
              >
                <Phone size={16} color="#ffffff" />
                <Text className="text-white font-semibold text-sm">Call</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Current Location */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <MapPin size={20} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Current Location</Text>
          </View>
          <View className="bg-surface border border-border rounded-xl p-4">
            <Text className="text-sm text-foreground">{emergencyProfile.currentVitals.location}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
