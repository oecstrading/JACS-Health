import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import VoiceEmergencyService, {
  type EmergencyContact,
  type MedicalInformation,
  type EmergencyEvent,
} from "@/services/voiceEmergencyService";

export default function VoiceEmergencyScreen() {
  const colors = useColors();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInformation>({
    bloodType: "",
    allergies: [],
    medications: [],
    conditions: [],
    emergencyNotes: "",
  });
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"contacts" | "medical" | "history">("contacts");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [contactsData, medicalData, eventsData] = await Promise.all([
      VoiceEmergencyService.getEmergencyContacts(),
      VoiceEmergencyService.getMedicalInformation(),
      VoiceEmergencyService.getAllEmergencyEvents(),
    ]);

    setContacts(contactsData);
    setMedicalInfo(medicalData);
    setEvents(eventsData);
  };

  const handleActivateEmergency = async () => {
    Alert.alert(
      "Activate Emergency Response",
      "This will call your emergency contacts and broadcast your medical information. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          style: "destructive",
          onPress: async () => {
            await VoiceEmergencyService.activateEmergency();
            await loadData();
          },
        },
      ]
    );
  };

  const handleCall911 = async () => {
    Alert.alert("Call 911", "This will dial emergency services. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        style: "destructive",
        onPress: async () => {
          await VoiceEmergencyService.call911();
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Emergency Response</Text>
            <Text className="text-base text-muted mt-1">
              Voice-activated emergency assistance
            </Text>
          </View>

          {/* Emergency Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleActivateEmergency}
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-6xl mb-2">🚨</Text>
              <Text className="text-2xl font-bold text-white mb-1">Activate Emergency</Text>
              <Text className="text-sm text-white opacity-90">
                Say "Hey Xela, Emergency" to activate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCall911}
              className="rounded-2xl p-4 items-center"
              style={{ backgroundColor: colors.error, opacity: 0.8 }}
            >
              <Text className="text-lg font-bold text-white">Call 911</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("contacts")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "contacts" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "contacts" ? "#fff" : colors.foreground }}
              >
                Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("medical")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "medical" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "medical" ? "#fff" : colors.foreground }}
              >
                Medical Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("history")}
              className="flex-1 p-3 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === "history" ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: activeTab === "history" ? "#fff" : colors.foreground }}
              >
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <View className="gap-4">
              {contacts.length === 0 ? (
                <View
                  className="rounded-2xl p-8 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-6xl mb-4">👥</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Emergency Contacts
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Add emergency contacts to be notified during emergencies
                  </Text>
                </View>
              ) : (
                contacts
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact) => (
                    <View
                      key={contact.id}
                      className="rounded-2xl p-5"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-foreground">
                            {contact.name}
                          </Text>
                          <Text className="text-sm text-muted">{contact.relationship}</Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-xs font-bold text-white">
                            Priority {contact.priority}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-base text-foreground">{contact.phone}</Text>
                    </View>
                  ))
              )}
            </View>
          )}

          {/* Medical Info Tab */}
          {activeTab === "medical" && (
            <View className="gap-4">
              <View
                className="rounded-2xl p-5"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-4">
                  Medical Information
                </Text>

                <View className="gap-3">
                  <View>
                    <Text className="text-sm font-semibold text-muted mb-1">Blood Type</Text>
                    <Text className="text-lg text-foreground">
                      {medicalInfo.bloodType || "Not set"}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-muted mb-1">Allergies</Text>
                    <Text className="text-lg text-foreground">
                      {medicalInfo.allergies.length > 0
                        ? medicalInfo.allergies.join(", ")
                        : "None"}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-muted mb-1">
                      Current Medications
                    </Text>
                    <Text className="text-lg text-foreground">
                      {medicalInfo.medications.length > 0
                        ? medicalInfo.medications.join(", ")
                        : "None"}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-muted mb-1">
                      Medical Conditions
                    </Text>
                    <Text className="text-lg text-foreground">
                      {medicalInfo.conditions.length > 0
                        ? medicalInfo.conditions.join(", ")
                        : "None"}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-muted mb-1">
                      Emergency Notes
                    </Text>
                    <Text className="text-lg text-foreground">
                      {medicalInfo.emergencyNotes || "None"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.surface, opacity: 0.8 }}
              >
                <Text className="text-sm text-muted text-center">
                  This information will be broadcast via voice during emergencies
                </Text>
              </View>
            </View>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <View className="gap-4">
              {events.length === 0 ? (
                <View
                  className="rounded-2xl p-8 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-6xl mb-4">📋</Text>
                  <Text className="text-xl font-bold text-foreground text-center mb-2">
                    No Emergency Events
                  </Text>
                  <Text className="text-base text-muted text-center">
                    Emergency activations will appear here
                  </Text>
                </View>
              ) : (
                events.map((event) => (
                  <View
                    key={event.id}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground mb-1">
                          Emergency Event
                        </Text>
                        <Text className="text-sm text-muted">
                          {new Date(event.timestamp).toLocaleString()}
                        </Text>
                      </View>
                      {event.resolved ? (
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: colors.success }}
                        >
                          <Text className="text-xs font-bold text-white">Resolved</Text>
                        </View>
                      ) : (
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: colors.error }}
                        >
                          <Text className="text-xs font-bold text-white">Active</Text>
                        </View>
                      )}
                    </View>

                    <View className="gap-2">
                      <Text className="text-sm text-muted">
                        Contacts Called: {event.contactsCalled.length}
                      </Text>
                      <Text className="text-sm text-muted">
                        Medical Info Broadcasted: {event.medicalInfoBroadcasted ? "Yes" : "No"}
                      </Text>
                      {event.location && (
                        <Text className="text-sm text-muted">
                          Location: {event.location.latitude.toFixed(4)},{" "}
                          {event.location.longitude.toFixed(4)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
