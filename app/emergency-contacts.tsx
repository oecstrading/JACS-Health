import { ScrollView, Text, View, TextInput, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

/**
 * Emergency Contacts Management Screen
 * 
 * Manage emergency contacts who will be notified in case of emergencies.
 */
export default function EmergencyContactsScreen() {
  const colors = useColors();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, "id">>({
    name: "",
    relationship: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem("emergency_contacts");
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        // Initialize with sample data
        const sampleContacts: EmergencyContact[] = [
          {
            id: "1",
            name: "Jane Doe",
            relationship: "Spouse",
            phone: "(555) 987-6543",
            email: "jane.doe@example.com",
          },
        ];
        setContacts(sampleContacts);
        await AsyncStorage.setItem("emergency_contacts", JSON.stringify(sampleContacts));
      }
    } catch (error) {
      console.error("Error loading emergency contacts:", error);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    try {
      await AsyncStorage.setItem("emergency_contacts", JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error saving emergency contacts:", error);
      Alert.alert("Error", "Failed to save emergency contacts");
    }
  };

  const handleAdd = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Missing Information", "Please enter at least name and phone number");
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);
    
    setNewContact({ name: "", relationship: "", phone: "", email: "" });
    setIsAdding(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "Emergency contact added successfully");
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== id);
            saveContacts(updatedContacts);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="flex-row items-center gap-2 mb-2"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-lg text-primary" style={{ lineHeight: 24 }}>
            Back
          </Text>
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Emergency Contacts
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Manage who to notify in emergencies
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Existing Contacts */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Your Emergency Contacts
          </Text>
          {contacts.map(contact => (
            <View key={contact.id} className="bg-surface border border-border rounded-2xl p-5 mb-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                    {contact.name}
                  </Text>
                  <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                    {contact.relationship}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(contact.id)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <IconSymbol name="trash" size={24} color={colors.error} />
                </Pressable>
              </View>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="phone.fill" size={18} color={colors.primary} />
                  <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
                    {contact.phone}
                  </Text>
                </View>
                {contact.email && (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="envelope.fill" size={18} color={colors.primary} />
                    <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
                      {contact.email}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add New Contact */}
        {!isAdding ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsAdding(true);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="bg-primary rounded-2xl py-5 items-center mb-8"
          >
            <Text className="text-xl font-bold text-white" style={{ lineHeight: 28 }}>
              + Add Emergency Contact
            </Text>
          </Pressable>
        ) : (
          <View className="bg-surface border-2 border-primary rounded-2xl p-5 mb-8">
            <Text className="text-xl font-bold text-foreground mb-4" style={{ lineHeight: 28 }}>
              New Emergency Contact
            </Text>
            
            <View className="gap-4">
              <View>
                <Text className="text-base font-semibold text-foreground mb-2" style={{ lineHeight: 22 }}>
                  Name *
                </Text>
                <TextInput
                  value={newContact.name}
                  onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                  style={{ lineHeight: 24 }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2" style={{ lineHeight: 22 }}>
                  Relationship
                </Text>
                <TextInput
                  value={newContact.relationship}
                  onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
                  placeholder="e.g., Spouse, Daughter, Friend"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                  style={{ lineHeight: 24 }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2" style={{ lineHeight: 22 }}>
                  Phone Number *
                </Text>
                <TextInput
                  value={newContact.phone}
                  onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                  style={{ lineHeight: 24 }}
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2" style={{ lineHeight: 22 }}>
                  Email (Optional)
                </Text>
                <TextInput
                  value={newContact.email}
                  onChangeText={(text) => setNewContact({ ...newContact, email: text })}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
                  style={{ lineHeight: 24 }}
                />
              </View>

              <View className="flex-row gap-3 mt-2">
                <Pressable
                  onPress={handleAdd}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  })}
                  className="flex-1 bg-primary rounded-xl py-4 items-center"
                >
                  <Text className="text-lg font-bold text-white" style={{ lineHeight: 24 }}>
                    Save Contact
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => {
                    setIsAdding(false);
                    setNewContact({ name: "", relationship: "", phone: "", email: "" });
                  }}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className="flex-1 bg-surface border border-border rounded-xl py-4 items-center"
                >
                  <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 24 }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
