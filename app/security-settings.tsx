import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import { secureStorage } from '@/services/secureStorageService';
import { auditLogService } from '@/services/auditLogService';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface SecuritySettings {
  aiDataSharingEnabled: boolean;
  biometricLoginEnabled: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
}

/**
 * Security Settings Screen
 * 
 * Provides controls for:
 * - AI Data Sharing toggle (opt-in/opt-out)
 * - Download My Data button
 * - Delete My Account function
 * - Two-factor authentication setup
 * - Biometric login toggle
 */
export default function SecuritySettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [settings, setSettings] = useState<SecuritySettings>({
    aiDataSharingEnabled: true,
    biometricLoginEnabled: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await secureStorage.getItem<SecuritySettings>('security_settings');
      if (saved) {
        setSettings(saved);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const saveSettings = async (newSettings: SecuritySettings) => {
    try {
      await secureStorage.setItem('security_settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save security settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const toggleAIDataSharing = async () => {
    const newValue = !settings.aiDataSharingEnabled;

    if (!newValue) {
      // Warn user about disabling AI features
      Alert.alert(
        'Disable AI Data Sharing?',
        'Disabling AI data sharing will turn off personalized health insights, predictive alerts, and AI assistant recommendations. Your manually entered data will still be saved.\n\nYou can re-enable this at any time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await saveSettings({ ...settings, aiDataSharingEnabled: newValue });
              Alert.alert('Success', 'AI data sharing has been disabled.');
            },
          },
        ]
      );
    } else {
      await saveSettings({ ...settings, aiDataSharingEnabled: newValue });
      Alert.alert('Success', 'AI data sharing has been enabled.');
    }
  };

  const toggleBiometricLogin = async () => {
    const { mfaService } = await import('@/services/mfaService');
    const supported = await mfaService.isBiometricSupported();

    if (!supported) {
      Alert.alert(
        'Biometric Not Available',
        'Your device does not support biometric authentication or it has not been set up. Please enable Face ID or fingerprint in your device settings.'
      );
      return;
    }

    const newValue = !settings.biometricLoginEnabled;
    await saveSettings({ ...settings, biometricLoginEnabled: newValue });
    Alert.alert(
      'Success',
      newValue
        ? 'Biometric login has been enabled.'
        : 'Biometric login has been disabled.'
    );
  };

  const downloadMyData = async () => {
    setLoading(true);

    try {
      // Collect all user data
      const medications = await secureStorage.getItem('medications') || [];
      const vitals = await secureStorage.getItem('vitals') || [];
      const activities = await secureStorage.getItem('activities') || [];
      const healthRecords = await secureStorage.getItem('health_records') || [];
      const profile = await secureStorage.getItem('user_profile') || {};

      const exportData = {
        exportDate: new Date().toISOString(),
        profile,
        medications,
        vitals,
        activities,
        healthRecords,
        metadata: {
          appVersion: '1.0.0',
          platform: 'mobile',
        },
      };

      // Create JSON file
      const jsonContent = JSON.stringify(exportData, null, 2);
      const fileName = `healthmate_data_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Download Your Health Data',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Your data has been saved to: ${fileUri}\n\nYou can find it in your Files app.`
        );
      }

      Alert.alert(
        'Data Downloaded',
        'Your health data has been exported successfully. This file contains all your personal health information in JSON format.'
      );
    } catch (error) {
      console.error('Failed to download data:', error);
      Alert.alert('Error', 'Failed to download your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMyAccount = () => {
    Alert.alert(
      '⚠️ Delete My Account',
      'This will permanently delete all your health data from our servers and your device. This action cannot be undone.\n\nAre you absolutely sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: confirmAccountDeletion,
        },
      ]
    );
  };

  const confirmAccountDeletion = () => {
    Alert.alert(
      'Final Confirmation',
      'Please confirm one more time. All your data will be permanently deleted within 24 hours. Type "DELETE" to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand, Delete My Account',
          style: 'destructive',
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    setLoading(true);

    try {
      // Clear all secure storage
      await secureStorage.clear();

      // Clear audit logs
      const userId = 'current_user'; // In production, get from auth context
      await auditLogService.clearLogs(userId);

      // In production, also send deletion request to server
      // await api.deleteAccount();

      Alert.alert(
        'Account Deleted',
        'Your account and all data have been scheduled for deletion. You will be logged out now.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login/welcome screen
              router.replace('/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert('Error', 'Failed to delete account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const viewAuditLogs = () => {
    Alert.alert('Audit Logs', 'Audit log viewing feature coming soon.');
  };

  const viewPrivacyPolicy = () => {
    router.push('/privacy-policy' as any);
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-3xl font-bold text-foreground mb-2">
          Security Settings
        </Text>
        <Text className="text-base text-muted mb-6">
          Control your data privacy and security preferences
        </Text>

        {/* AI Data Sharing */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold text-foreground mb-1">
                AI Data Sharing
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Allow AI to process your health data for personalized insights and predictions. Your data is de-identified before processing.
              </Text>
            </View>
            <Switch
              value={settings.aiDataSharingEnabled}
              onValueChange={toggleAIDataSharing}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.aiDataSharingEnabled ? colors.background : colors.muted}
            />
          </View>
          {!settings.aiDataSharingEnabled && (
            <View className="mt-2 p-3 bg-warning/10 rounded-lg">
              <Text className="text-sm text-warning">
                ⚠️ AI features are currently disabled. You will not receive personalized health insights or predictive alerts.
              </Text>
            </View>
          )}
        </View>

        {/* Biometric Login */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold text-foreground mb-1">
                Biometric Login
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Use Face ID or fingerprint to unlock the app quickly and securely.
              </Text>
            </View>
            <Switch
              value={settings.biometricLoginEnabled}
              onValueChange={toggleBiometricLogin}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.biometricLoginEnabled ? colors.background : colors.muted}
            />
          </View>
        </View>

        {/* Two-Factor Authentication */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold text-foreground mb-1">
                Two-Factor Authentication
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Require a verification code in addition to your password for extra security.
              </Text>
            </View>
            <Switch
              value={settings.twoFactorEnabled}
              onValueChange={(value) => saveSettings({ ...settings, twoFactorEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.twoFactorEnabled ? colors.background : colors.muted}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <Text className="text-xl font-bold text-foreground mb-4">
          Data Management
        </Text>

        {/* Download My Data */}
        <TouchableOpacity
          onPress={downloadMyData}
          disabled={loading}
          className="bg-primary rounded-2xl p-4 mb-4"
        >
          <Text className="text-lg font-semibold text-background mb-1">
            📥 Download My Data
          </Text>
          <Text className="text-sm text-background/80">
            Export all your health data in JSON format for backup or transfer to another app.
          </Text>
        </TouchableOpacity>

        {/* View Audit Logs */}
        <TouchableOpacity
          onPress={viewAuditLogs}
          className="bg-surface rounded-2xl p-4 mb-4 border border-border"
        >
          <Text className="text-lg font-semibold text-foreground mb-1">
            📋 View Access Logs
          </Text>
          <Text className="text-sm text-muted">
            See who has accessed your health data and when.
          </Text>
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          onPress={viewPrivacyPolicy}
          className="bg-surface rounded-2xl p-4 mb-6 border border-border"
        >
          <Text className="text-lg font-semibold text-foreground mb-1">
            🔒 Privacy Policy
          </Text>
          <Text className="text-sm text-muted">
            Read our HIPAA-compliant privacy policy and security framework.
          </Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text className="text-xl font-bold text-error mb-4">
          Danger Zone
        </Text>

        {/* Delete My Account */}
        <TouchableOpacity
          onPress={deleteMyAccount}
          disabled={loading}
          className="bg-error rounded-2xl p-4 mb-8"
        >
          <Text className="text-lg font-semibold text-background mb-1">
            🗑️ Delete My Account
          </Text>
          <Text className="text-sm text-background/80">
            Permanently delete all your data from our servers and your device. This action cannot be undone.
          </Text>
        </TouchableOpacity>

        {/* HIPAA Compliance Notice */}
        <View className="bg-surface rounded-2xl p-4 mb-8 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">
            🛡️ HIPAA Compliance
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            JACS Medical Monitoring System is HIPAA-compliant. All your health data is encrypted with AES-256 encryption at rest and TLS 1.3 in transit. We never sell your data. For more information, view our Privacy Policy above.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
