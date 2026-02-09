import { ScrollView, Text, View, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

/**
 * Account Management Screen
 * 
 * Allows users to view and update their profile information.
 */
export default function AccountManagementScreen() {
  const colors = useColors();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize with sample data - in production, load from AsyncStorage or API
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: "01/15/1950",
    address: "123 Main St, Fulshear, TX 77441",
    emergencyContact: "Jane Doe",
    emergencyPhone: "(555) 987-6543",
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem("user_profile", JSON.stringify(editedProfile));
      
      // Update state
      setProfile(editedProfile);
      setIsEditing(false);
      
      Alert.alert(
        "Success",
        "Your profile has been updated successfully.",
        [{ text: "OK", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }]
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        "Error",
        "Failed to save your profile. Please try again.",
        [{ text: "OK", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const ProfileField = ({
    label,
    value,
    field,
    placeholder,
    keyboardType = "default",
  }: {
    label: string;
    value: string;
    field: keyof UserProfile;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-foreground mb-2" style={{ lineHeight: 24 }}>
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          value={editedProfile[field]}
          onChangeText={(text) => setEditedProfile({ ...editedProfile, [field]: text })}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          className="bg-surface border-2 border-border rounded-2xl px-6 py-4 text-lg text-foreground"
          style={{ lineHeight: 24 }}
        />
      ) : (
        <View className="bg-surface border border-border rounded-2xl px-6 py-4">
          <Text className="text-lg text-foreground" style={{ lineHeight: 24 }}>
            {value || "Not set"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <View className="flex-1">
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
            Account Management
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            {isEditing ? "Edit your profile information" : "View and update your profile"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Personal Information
          </Text>
          
          <ProfileField
            label="Full Name"
            value={profile.fullName}
            field="fullName"
            placeholder="Enter your full name"
          />
          
          <ProfileField
            label="Email"
            value={profile.email}
            field="email"
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <ProfileField
            label="Phone Number"
            value={profile.phone}
            field="phone"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <ProfileField
            label="Date of Birth"
            value={profile.dateOfBirth}
            field="dateOfBirth"
            placeholder="MM/DD/YYYY"
          />
          
          <ProfileField
            label="Address"
            value={profile.address}
            field="address"
            placeholder="Enter your address"
          />
        </View>

        {/* Emergency Contact */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Emergency Contact
          </Text>
          
          <ProfileField
            label="Contact Name"
            value={profile.emergencyContact}
            field="emergencyContact"
            placeholder="Enter emergency contact name"
          />
          
          <ProfileField
            label="Contact Phone"
            value={profile.emergencyPhone}
            field="emergencyPhone"
            placeholder="Enter emergency contact phone"
            keyboardType="phone-pad"
          />
        </View>

        {/* Action Buttons */}
        <View className="mb-8 gap-4">
          {!isEditing ? (
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary rounded-2xl py-5 items-center"
            >
              <Text className="text-xl font-bold text-white" style={{ lineHeight: 28 }}>
                Edit Profile
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed || isSaving ? 0.9 : 1,
                })}
                className="bg-primary rounded-2xl py-5 items-center"
              >
                <Text className="text-xl font-bold text-white" style={{ lineHeight: 28 }}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleCancel}
                disabled={isSaving}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed || isSaving ? 0.7 : 1,
                })}
                className="bg-surface border-2 border-border rounded-2xl py-5 items-center"
              >
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
