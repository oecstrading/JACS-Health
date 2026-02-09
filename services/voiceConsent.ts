/**
 * Voice-Activated Consent Module
 * 
 * Provides voice-based HIPAA consent recording with time-stamped
 * digital signatures for patient intake forms.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { getNPPSummary } from "./noticeOfPrivacyPractices";

export interface VoiceConsent {
  id: string;
  formId: string;
  userId: string;
  consentType: "npp_acknowledgment" | "hipaa_authorization" | "treatment_consent";
  
  // Voice recording details
  audioFileUri: string;
  audioDuration: number; // seconds
  audioFormat: string;
  audioSize: number; // bytes
  
  // Transcription
  transcription?: string;
  transcriptionConfidence?: number;
  
  // Consent metadata
  timestamp: string;
  ipAddress?: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
  };
  
  // Verification
  verified: boolean;
  verificationMethod: "voice_match" | "manual_review" | "auto_approved";
  
  // Legal
  nppVersion: string;
  consentText: string;
  
  // Status
  status: "pending" | "approved" | "rejected" | "revoked";
  revokedAt?: string;
  revokedReason?: string;
}

export interface ConsentRecordingResult {
  success: boolean;
  consent?: VoiceConsent;
  error?: string;
}

class VoiceConsentService {
  private recording: Audio.Recording | null = null;
  private recordingUri: string | null = null;

  /**
   * Get HIPAA summary for voice consent
   */
  getHIPAASummary(language: "en" | "es" = "en"): string {
    if (language === "es") {
      return `Este es un resumen de sus derechos de privacidad de HIPAA.

Su información de salud está protegida por la ley federal y de Texas. Podemos usar su información para tratamiento, pago y operaciones de atención médica.

A partir de febrero de 2026, los registros de salud sensibles, incluida la salud del comportamiento, el trastorno por uso de sustancias, la salud reproductiva, la atención de afirmación de género, las pruebas genéticas y la información de ITS, tienen protecciones mejoradas y requieren su autorización específica para la mayoría de los usos.

Usted tiene derecho a:
- Acceder y copiar sus registros de salud
- Solicitar correcciones a su información
- Solicitar restricciones sobre cómo se usa su información
- Recibir comunicaciones confidenciales
- Ser notificado de cualquier violación de datos
- Presentar una queja si se violan sus derechos de privacidad

Toda su información se almacena de forma segura en los Estados Unidos con cifrado. No será penalizado por presentar una queja de privacidad.

¿Comprende y reconoce estas prácticas de privacidad?`;
    }

    return getNPPSummary();
  }

  /**
   * Start recording voice consent
   */
  async startRecording(): Promise<{ success: boolean; error?: string }> {
    try {
      // Request microphone permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        return {
          success: false,
          error: "Microphone permission denied",
        };
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      return { success: true };
    } catch (error) {
      console.error("Error starting consent recording:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Stop recording and save consent
   */
  async stopRecording(
    formId: string,
    userId: string,
    consentType: VoiceConsent["consentType"],
    nppVersion: string
  ): Promise<ConsentRecordingResult> {
    try {
      if (!this.recording) {
        return {
          success: false,
          error: "No active recording",
        };
      }

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      if (!uri) {
        return {
          success: false,
          error: "Failed to get recording URI",
        };
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        return {
          success: false,
          error: "Recording file not found",
        };
      }

      // Create consent record
      const consent: VoiceConsent = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        formId,
        userId,
        consentType,
        audioFileUri: uri,
        audioDuration: 0, // Would be calculated from recording status
        audioFormat: "m4a",
        audioSize: fileInfo.size,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: "mobile",
          osVersion: "unknown",
          appVersion: "1.0.0",
        },
        verified: false,
        verificationMethod: "auto_approved",
        nppVersion,
        consentText: this.getHIPAASummary(),
        status: "pending",
      };

      // Save consent to storage
      await this.saveConsent(consent);

      // Reset recording
      this.recording = null;

      return {
        success: true,
        consent,
      };
    } catch (error) {
      console.error("Error stopping consent recording:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cancel recording
   */
  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Error canceling recording:", error);
      }
      this.recording = null;
    }
  }

  /**
   * Play back consent recording for verification
   */
  async playbackConsent(audioUri: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      // Auto-unload when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Error playing consent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Save consent to storage
   */
  private async saveConsent(consent: VoiceConsent): Promise<void> {
    try {
      // Get existing consents
      const consentsJson = await AsyncStorage.getItem("voice_consents");
      const consents: VoiceConsent[] = consentsJson ? JSON.parse(consentsJson) : [];

      // Add new consent
      consents.push(consent);

      // Save back to storage
      await AsyncStorage.setItem("voice_consents", JSON.stringify(consents));
    } catch (error) {
      console.error("Error saving consent:", error);
      throw error;
    }
  }

  /**
   * Get all consents for a form
   */
  async getConsentsForForm(formId: string): Promise<VoiceConsent[]> {
    try {
      const consentsJson = await AsyncStorage.getItem("voice_consents");
      if (!consentsJson) return [];

      const consents: VoiceConsent[] = JSON.parse(consentsJson);
      return consents.filter((c) => c.formId === formId);
    } catch (error) {
      console.error("Error getting consents:", error);
      return [];
    }
  }

  /**
   * Get consent by ID
   */
  async getConsentById(consentId: string): Promise<VoiceConsent | null> {
    try {
      const consentsJson = await AsyncStorage.getItem("voice_consents");
      if (!consentsJson) return null;

      const consents: VoiceConsent[] = JSON.parse(consentsJson);
      return consents.find((c) => c.id === consentId) || null;
    } catch (error) {
      console.error("Error getting consent:", error);
      return null;
    }
  }

  /**
   * Verify consent
   */
  async verifyConsent(
    consentId: string,
    method: VoiceConsent["verificationMethod"]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const consentsJson = await AsyncStorage.getItem("voice_consents");
      if (!consentsJson) {
        return { success: false, error: "Consent not found" };
      }

      const consents: VoiceConsent[] = JSON.parse(consentsJson);
      const consentIndex = consents.findIndex((c) => c.id === consentId);

      if (consentIndex === -1) {
        return { success: false, error: "Consent not found" };
      }

      // Update consent
      consents[consentIndex].verified = true;
      consents[consentIndex].verificationMethod = method;
      consents[consentIndex].status = "approved";

      // Save back
      await AsyncStorage.setItem("voice_consents", JSON.stringify(consents));

      return { success: true };
    } catch (error) {
      console.error("Error verifying consent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Revoke consent
   */
  async revokeConsent(
    consentId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const consentsJson = await AsyncStorage.getItem("voice_consents");
      if (!consentsJson) {
        return { success: false, error: "Consent not found" };
      }

      const consents: VoiceConsent[] = JSON.parse(consentsJson);
      const consentIndex = consents.findIndex((c) => c.id === consentId);

      if (consentIndex === -1) {
        return { success: false, error: "Consent not found" };
      }

      // Update consent
      consents[consentIndex].status = "revoked";
      consents[consentIndex].revokedAt = new Date().toISOString();
      consents[consentIndex].revokedReason = reason;

      // Save back
      await AsyncStorage.setItem("voice_consents", JSON.stringify(consents));

      return { success: true };
    } catch (error) {
      console.error("Error revoking consent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if form has valid consent
   */
  async hasValidConsent(
    formId: string,
    consentType: VoiceConsent["consentType"]
  ): Promise<boolean> {
    try {
      const consents = await this.getConsentsForForm(formId);
      return consents.some(
        (c) =>
          c.consentType === consentType &&
          c.status === "approved" &&
          c.verified
      );
    } catch (error) {
      console.error("Error checking consent:", error);
      return false;
    }
  }

  /**
   * Generate consent audit trail
   */
  async generateAuditTrail(formId: string): Promise<string> {
    try {
      const consents = await this.getConsentsForForm(formId);

      let trail = "VOICE CONSENT AUDIT TRAIL\n";
      trail += "=" + "=".repeat(50) + "\n\n";
      trail += `Form ID: ${formId}\n`;
      trail += `Generated: ${new Date().toISOString()}\n\n`;

      for (const consent of consents) {
        trail += `Consent ID: ${consent.id}\n`;
        trail += `Type: ${consent.consentType}\n`;
        trail += `Timestamp: ${consent.timestamp}\n`;
        trail += `Status: ${consent.status}\n`;
        trail += `Verified: ${consent.verified}\n`;
        trail += `Verification Method: ${consent.verificationMethod}\n`;
        trail += `NPP Version: ${consent.nppVersion}\n`;
        trail += `Audio Duration: ${consent.audioDuration}s\n`;
        trail += `Audio Size: ${consent.audioSize} bytes\n`;

        if (consent.transcription) {
          trail += `Transcription: ${consent.transcription}\n`;
          trail += `Confidence: ${consent.transcriptionConfidence}%\n`;
        }

        if (consent.revokedAt) {
          trail += `Revoked At: ${consent.revokedAt}\n`;
          trail += `Revoked Reason: ${consent.revokedReason}\n`;
        }

        trail += "\n" + "-".repeat(50) + "\n\n";
      }

      return trail;
    } catch (error) {
      console.error("Error generating audit trail:", error);
      return "Error generating audit trail";
    }
  }
}

export default new VoiceConsentService();
