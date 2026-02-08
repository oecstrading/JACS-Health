import { Linking, Platform, Alert } from "react-native";
import * as SMS from "expo-sms";
import { getUserProfile, getCaregivers } from "./storage";

/**
 * Emergency SOS System
 * 
 * Provides emergency calling, SMS alerts, and location sharing capabilities.
 */

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<EmergencyLocation | null> {
  try {
    // Mock implementation - in production, use expo-location
    // const location = await Location.getCurrentPositionAsync({});
    
    // Simulate getting location
    const mockLocation: EmergencyLocation = {
      latitude: 30.2672, // Austin, TX coordinates
      longitude: -97.7431,
      accuracy: 10,
      address: "123 Main St, Austin, TX 78701",
    };

    return mockLocation;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

/**
 * Format location as Google Maps link
 */
export function formatLocationLink(location: EmergencyLocation): string {
  return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}

/**
 * Get emergency contacts from user profile
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const profile = await getUserProfile();
    if (!profile || !profile.emergencyContacts) {
      return [];
    }

    return profile.emergencyContacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    }));
  } catch (error) {
    console.error("Error getting emergency contacts:", error);
    return [];
  }
}

/**
 * Call emergency contact
 */
export async function callEmergencyContact(phone: string): Promise<boolean> {
  try {
    const phoneUrl = `tel:${phone.replace(/[^0-9+]/g, "")}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
    if (!canOpen) {
      Alert.alert("Error", "Cannot make phone calls on this device");
      return false;
    }

    await Linking.openURL(phoneUrl);
    return true;
  } catch (error) {
    console.error("Error calling emergency contact:", error);
    Alert.alert("Error", "Failed to initiate call");
    return false;
  }
}

/**
 * Call 911
 */
export async function call911(): Promise<boolean> {
  try {
    const phoneUrl = "tel:911";
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
    if (!canOpen) {
      Alert.alert("Error", "Cannot make phone calls on this device");
      return false;
    }

    await Linking.openURL(phoneUrl);
    return true;
  } catch (error) {
    console.error("Error calling 911:", error);
    Alert.alert("Error", "Failed to call 911");
    return false;
  }
}

/**
 * Send emergency SMS with location
 */
export async function sendEmergencySMS(
  phone: string,
  userName: string,
  location: EmergencyLocation | null
): Promise<boolean> {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      console.warn("SMS not available on this device");
      return false;
    }

    let message = `🚨 EMERGENCY ALERT from ${userName}\n\n`;
    message += `I need immediate assistance. Please call me or check on me.\n\n`;
    
    if (location) {
      message += `My location:\n${formatLocationLink(location)}\n\n`;
      if (location.address) {
        message += `Address: ${location.address}\n\n`;
      }
    }
    
    message += `Sent from HealthMate Emergency SOS`;

    const { result } = await SMS.sendSMSAsync([phone], message);
    return result === "sent";
  } catch (error) {
    console.error("Error sending emergency SMS:", error);
    return false;
  }
}

/**
 * Alert all emergency contacts
 */
export async function alertAllEmergencyContacts(): Promise<{
  success: boolean;
  sentCount: number;
  totalCount: number;
}> {
  try {
    const contacts = await getEmergencyContacts();
    if (contacts.length === 0) {
      Alert.alert(
        "No Emergency Contacts",
        "Please add emergency contacts in Settings before using this feature."
      );
      return { success: false, sentCount: 0, totalCount: 0 };
    }

    const profile = await getUserProfile();
    const userName = profile?.name || "HealthMate User";
    const location = await getCurrentLocation();

    let sentCount = 0;
    for (const contact of contacts) {
      const sent = await sendEmergencySMS(contact.phone, userName, location);
      if (sent) {
        sentCount++;
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      totalCount: contacts.length,
    };
  } catch (error) {
    console.error("Error alerting emergency contacts:", error);
    return { success: false, sentCount: 0, totalCount: 0 };
  }
}

/**
 * Alert caregivers
 */
export async function alertCaregivers(message: string): Promise<number> {
  try {
    const caregivers = await getCaregivers();
    const alertEnabledCaregivers = caregivers.filter(
      c => c.permissions.receiveAlerts
    );

    if (alertEnabledCaregivers.length === 0) {
      return 0;
    }

    const profile = await getUserProfile();
    const userName = profile?.name || "HealthMate User";
    const location = await getCurrentLocation();

    let fullMessage = `⚠️ Health Alert from ${userName}\n\n${message}\n\n`;
    if (location) {
      fullMessage += `Location: ${formatLocationLink(location)}\n\n`;
    }
    fullMessage += `Sent from HealthMate`;

    let sentCount = 0;
    for (const caregiver of alertEnabledCaregivers) {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync([caregiver.phone], fullMessage);
        if (result === "sent") {
          sentCount++;
        }
      }
    }

    return sentCount;
  } catch (error) {
    console.error("Error alerting caregivers:", error);
    return 0;
  }
}

/**
 * Show emergency options dialog
 */
export function showEmergencyDialog(
  onCall911: () => void,
  onCallEmergencyContact: () => void,
  onAlertAll: () => void
): void {
  Alert.alert(
    "🚨 Emergency SOS",
    "Choose an emergency action:",
    [
      {
        text: "Call 911",
        onPress: onCall911,
        style: "destructive",
      },
      {
        text: "Call Emergency Contact",
        onPress: onCallEmergencyContact,
      },
      {
        text: "Alert All Contacts",
        onPress: onAlertAll,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
}

/**
 * Get medical information for emergency responders
 */
export async function getEmergencyMedicalInfo(): Promise<string> {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return "No medical information available";
    }

    let info = "EMERGENCY MEDICAL INFORMATION\n\n";
    info += `Name: ${profile.name}\n`;
    if (profile.age) {
      info += `Age: ${profile.age}\n`;
    }
    
    if (profile.healthConditions && profile.healthConditions.length > 0) {
      info += `\nHealth Conditions:\n`;
      profile.healthConditions.forEach(condition => {
        info += `• ${condition}\n`;
      });
    }

    if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
      info += `\nEmergency Contacts:\n`;
      profile.emergencyContacts.forEach(contact => {
        info += `• ${contact.name} (${contact.relationship}): ${contact.phone}\n`;
      });
    }

    return info;
  } catch (error) {
    console.error("Error getting emergency medical info:", error);
    return "Error retrieving medical information";
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === "1");
}
