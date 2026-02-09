/**
 * Multi-Factor Authentication (MFA) Service
 * 
 * Provides two-factor authentication for caregiver access
 * Supports SMS, email, and biometric verification
 */

import { secureStorage } from './secureStorageService';
import { encryptionService } from './encryptionService';
import * as LocalAuthentication from 'expo-local-authentication';

export interface MFASettings {
  enabled: boolean;
  methods: MFAMethod[];
  preferredMethod: MFAMethod;
  backupCodes: string[];
}

export enum MFAMethod {
  SMS = 'sms',
  EMAIL = 'email',
  BIOMETRIC = 'biometric',
  AUTHENTICATOR_APP = 'authenticator_app',
}

export interface VerificationCode {
  code: string;
  expiresAt: string;
  attempts: number;
}

class MFAService {
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Check if device supports biometric authentication
   */
  async isBiometricSupported(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getAvailableBiometrics(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map((type: number) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to access patient data',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Generate a random verification code
   */
  generateVerificationCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Send verification code via SMS
   */
  async sendSMSCode(phoneNumber: string, caregiverId: string): Promise<boolean> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

      // Store code securely
      const verificationData: VerificationCode = {
        code,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
      };

      await secureStorage.setItem(
        `mfa_code_${caregiverId}`,
        verificationData
      );

      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`[MFA] SMS code ${code} sent to ${phoneNumber}`);
      
      // For demo purposes, show code in console
      if (__DEV__) {
        console.log(`[DEV] Verification code: ${code}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send SMS code:', error);
      return false;
    }
  }

  /**
   * Send verification code via email
   */
  async sendEmailCode(email: string, caregiverId: string): Promise<boolean> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

      // Store code securely
      const verificationData: VerificationCode = {
        code,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
      };

      await secureStorage.setItem(
        `mfa_code_${caregiverId}`,
        verificationData
      );

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`[MFA] Email code ${code} sent to ${email}`);
      
      // For demo purposes, show code in console
      if (__DEV__) {
        console.log(`[DEV] Verification code: ${code}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send email code:', error);
      return false;
    }
  }

  /**
   * Verify the entered code
   */
  async verifyCode(caregiverId: string, enteredCode: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const stored = await secureStorage.getItem<VerificationCode>(
        `mfa_code_${caregiverId}`
      );

      if (!stored) {
        return {
          success: false,
          message: 'No verification code found. Please request a new code.',
        };
      }

      // Check expiry
      const now = new Date();
      const expiresAt = new Date(stored.expiresAt);

      if (now > expiresAt) {
        await secureStorage.removeItem(`mfa_code_${caregiverId}`);
        return {
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        };
      }

      // Check attempts
      if (stored.attempts >= this.MAX_ATTEMPTS) {
        await secureStorage.removeItem(`mfa_code_${caregiverId}`);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new code.',
        };
      }

      // Verify code
      if (stored.code === enteredCode) {
        await secureStorage.removeItem(`mfa_code_${caregiverId}`);
        return {
          success: true,
          message: 'Verification successful',
        };
      } else {
        // Increment attempts
        stored.attempts++;
        await secureStorage.setItem(`mfa_code_${caregiverId}`, stored);

        const remainingAttempts = this.MAX_ATTEMPTS - stored.attempts;
        return {
          success: false,
          message: `Incorrect code. ${remainingAttempts} attempt(s) remaining.`,
        };
      }
    } catch (error) {
      console.error('Code verification failed:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Generate backup codes for account recovery
   */
  async generateBackupCodes(count: number = 10): Promise<string[]> {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = Array.from({ length: 8 }, () => 
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(
          Math.floor(Math.random() * 36)
        )
      ).join('');
      
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(
    caregiverId: string,
    enteredCode: string
  ): Promise<boolean> {
    try {
      const settings = await this.getMFASettings(caregiverId);
      
      if (!settings || !settings.backupCodes) {
        return false;
      }

      const codeIndex = settings.backupCodes.indexOf(enteredCode);
      
      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      settings.backupCodes.splice(codeIndex, 1);
      await this.saveMFASettings(caregiverId, settings);

      return true;
    } catch (error) {
      console.error('Backup code verification failed:', error);
      return false;
    }
  }

  /**
   * Get MFA settings for a caregiver
   */
  async getMFASettings(caregiverId: string): Promise<MFASettings | null> {
    return await secureStorage.getItem<MFASettings>(
      `mfa_settings_${caregiverId}`
    );
  }

  /**
   * Save MFA settings
   */
  async saveMFASettings(
    caregiverId: string,
    settings: MFASettings
  ): Promise<void> {
    await secureStorage.setItem(`mfa_settings_${caregiverId}`, settings);
  }

  /**
   * Enable MFA for a caregiver
   */
  async enableMFA(
    caregiverId: string,
    preferredMethod: MFAMethod
  ): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      const backupCodes = await this.generateBackupCodes();

      const settings: MFASettings = {
        enabled: true,
        methods: [preferredMethod],
        preferredMethod,
        backupCodes,
      };

      await this.saveMFASettings(caregiverId, settings);

      return {
        success: true,
        backupCodes,
      };
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      return { success: false };
    }
  }

  /**
   * Disable MFA for a caregiver
   */
  async disableMFA(caregiverId: string): Promise<boolean> {
    try {
      await secureStorage.removeItem(`mfa_settings_${caregiverId}`);
      return true;
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      return false;
    }
  }

  /**
   * Check if MFA is required for a caregiver
   */
  async isMFARequired(caregiverId: string): Promise<boolean> {
    const settings = await this.getMFASettings(caregiverId);
    return settings?.enabled || false;
  }
}

export const mfaService = new MFAService();
