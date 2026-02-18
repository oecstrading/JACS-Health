import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { Linking, Alert } from "react-native";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number; // 1 = highest priority
}

export interface MedicalInformation {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyNotes: string;
}

export interface EmergencyEvent {
  id: string;
  timestamp: Date;
  location: { latitude: number; longitude: number } | null;
  contactsCalled: string[];
  medicalInfoBroadcasted: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  cancelledByUser: boolean;
}

class VoiceEmergencyService {
  private static STORAGE_KEY_CONTACTS = "emergency_contacts";
  private static STORAGE_KEY_MEDICAL_INFO = "emergency_medical_info";
  private static STORAGE_KEY_EVENTS = "emergency_events";
  private static COUNTDOWN_SECONDS = 10;

  /**
   * Activate emergency response
   */
  async activateEmergency(): Promise<void> {
    try {
      // Start countdown
      const cancelled = await this.startCountdown();
      
      if (cancelled) {
        console.log("Emergency activation cancelled by user");
        return;
      }

      // Get current location
      const location = await this.getCurrentLocation();

      // Get emergency contacts
      const contacts = await this.getEmergencyContacts();

      // Get medical information
      const medicalInfo = await this.getMedicalInformation();

      // Create emergency event
      const event: EmergencyEvent = {
        id: `emergency_${Date.now()}`,
        timestamp: new Date(),
        location,
        contactsCalled: [],
        medicalInfoBroadcasted: false,
        resolved: false,
        cancelledByUser: false,
      };

      // Broadcast medical information
      await this.broadcastMedicalInformation(medicalInfo);
      event.medicalInfoBroadcasted = true;

      // Call emergency contacts
      for (const contact of contacts.sort((a, b) => a.priority - b.priority)) {
        await this.callEmergencyContact(contact, location);
        event.contactsCalled.push(contact.id);
      }

      // Save event
      await this.saveEmergencyEvent(event);

      // Start continuous location tracking
      await this.startLocationTracking();

    } catch (error) {
      console.error("Error activating emergency:", error);
      Alert.alert("Error", "Failed to activate emergency response");
    }
  }

  /**
   * Start countdown before activating emergency
   */
  private async startCountdown(): Promise<boolean> {
    return new Promise((resolve) => {
      let secondsLeft = VoiceEmergencyService.COUNTDOWN_SECONDS;
      let cancelled = false;

      const countdownInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(countdownInterval);
          resolve(true);
          return;
        }

        if (secondsLeft > 0) {
          Speech.speak(`Emergency activation in ${secondsLeft} seconds. Say cancel to stop.`, {
            language: "en-US",
          });
          secondsLeft--;
        } else {
          clearInterval(countdownInterval);
          resolve(false);
        }
      }, 1000);

      // In production, implement voice recognition to detect "cancel" command
      // For now, we'll just proceed after countdown
    });
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  /**
   * Broadcast medical information via speech
   */
  private async broadcastMedicalInformation(medicalInfo: MedicalInformation): Promise<void> {
    const message = this.generateMedicalInfoMessage(medicalInfo);
    
    await Speech.speak(message, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.75, // Slower for clarity
    });
  }

  /**
   * Generate medical information message
   */
  private generateMedicalInfoMessage(medicalInfo: MedicalInformation): string {
    let message = "Emergency medical information. ";

    if (medicalInfo.bloodType) {
      message += `Blood type: ${medicalInfo.bloodType}. `;
    }

    if (medicalInfo.allergies.length > 0) {
      message += `Allergies: ${medicalInfo.allergies.join(", ")}. `;
    }

    if (medicalInfo.medications.length > 0) {
      message += `Current medications: ${medicalInfo.medications.join(", ")}. `;
    }

    if (medicalInfo.conditions.length > 0) {
      message += `Medical conditions: ${medicalInfo.conditions.join(", ")}. `;
    }

    if (medicalInfo.emergencyNotes) {
      message += `Additional notes: ${medicalInfo.emergencyNotes}. `;
    }

    return message;
  }

  /**
   * Call emergency contact
   */
  private async callEmergencyContact(
    contact: EmergencyContact,
    location: { latitude: number; longitude: number } | null
  ): Promise<void> {
    try {
      const phoneUrl = `tel:${contact.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);

        // Send SMS with location if available
        if (location) {
          const message = `EMERGENCY: I need help. My current location is: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
          const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
          await Linking.openURL(smsUrl);
        }
      }
    } catch (error) {
      console.error("Error calling emergency contact:", error);
    }
  }

  /**
   * Start continuous location tracking
   */
  private async startLocationTracking(): Promise<void> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Background location permission not granted");
        return;
      }

      // In production, implement background location tracking
      console.log("Starting continuous location tracking");
    } catch (error) {
      console.error("Error starting location tracking:", error);
    }
  }

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const contactsJson = await AsyncStorage.getItem(VoiceEmergencyService.STORAGE_KEY_CONTACTS);
      return contactsJson ? JSON.parse(contactsJson) : [];
    } catch (error) {
      console.error("Error getting emergency contacts:", error);
      return [];
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(contact: Omit<EmergencyContact, "id">): Promise<void> {
    try {
      const contacts = await this.getEmergencyContacts();
      const newContact: EmergencyContact = {
        ...contact,
        id: `contact_${Date.now()}`,
      };
      contacts.push(newContact);

      await AsyncStorage.setItem(
        VoiceEmergencyService.STORAGE_KEY_CONTACTS,
        JSON.stringify(contacts)
      );
    } catch (error) {
      console.error("Error adding emergency contact:", error);
      throw error;
    }
  }

  /**
   * Get medical information
   */
  async getMedicalInformation(): Promise<MedicalInformation> {
    try {
      const medicalInfoJson = await AsyncStorage.getItem(VoiceEmergencyService.STORAGE_KEY_MEDICAL_INFO);
      return medicalInfoJson
        ? JSON.parse(medicalInfoJson)
        : {
            bloodType: "",
            allergies: [],
            medications: [],
            conditions: [],
            emergencyNotes: "",
          };
    } catch (error) {
      console.error("Error getting medical information:", error);
      return {
        bloodType: "",
        allergies: [],
        medications: [],
        conditions: [],
        emergencyNotes: "",
      };
    }
  }

  /**
   * Update medical information
   */
  async updateMedicalInformation(medicalInfo: MedicalInformation): Promise<void> {
    try {
      await AsyncStorage.setItem(
        VoiceEmergencyService.STORAGE_KEY_MEDICAL_INFO,
        JSON.stringify(medicalInfo)
      );
    } catch (error) {
      console.error("Error updating medical information:", error);
      throw error;
    }
  }

  /**
   * Save emergency event
   */
  private async saveEmergencyEvent(event: EmergencyEvent): Promise<void> {
    try {
      const eventsJson = await AsyncStorage.getItem(VoiceEmergencyService.STORAGE_KEY_EVENTS);
      const events: EmergencyEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
      events.unshift(event);

      // Keep only last 50 events
      if (events.length > 50) {
        events.splice(50);
      }

      await AsyncStorage.setItem(
        VoiceEmergencyService.STORAGE_KEY_EVENTS,
        JSON.stringify(events)
      );
    } catch (error) {
      console.error("Error saving emergency event:", error);
    }
  }

  /**
   * Get all emergency events
   */
  async getAllEmergencyEvents(): Promise<EmergencyEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(VoiceEmergencyService.STORAGE_KEY_EVENTS);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error("Error getting emergency events:", error);
      return [];
    }
  }

  /**
   * Resolve emergency event
   */
  async resolveEmergencyEvent(eventId: string): Promise<void> {
    try {
      const events = await this.getAllEmergencyEvents();
      const event = events.find((e) => e.id === eventId);

      if (event) {
        event.resolved = true;
        event.resolvedAt = new Date();

        await AsyncStorage.setItem(
          VoiceEmergencyService.STORAGE_KEY_EVENTS,
          JSON.stringify(events)
        );
      }
    } catch (error) {
      console.error("Error resolving emergency event:", error);
    }
  }

  /**
   * Call 911
   */
  async call911(): Promise<void> {
    try {
      const phoneUrl = "tel:911";
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Error", "Unable to make phone call");
      }
    } catch (error) {
      console.error("Error calling 911:", error);
      Alert.alert("Error", "Failed to call 911");
    }
  }
}

export default new VoiceEmergencyService();
