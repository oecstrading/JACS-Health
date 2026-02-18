import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './ui/icon-symbol';

/**
 * Update Checker Component
 * 
 * Automatically checks for app updates on launch and prompts users to update.
 * Implements seamless OTA (Over-The-Air) updates using Expo Updates.
 */
export function UpdateChecker() {
  const colors = useColors();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Skip update check in development mode or on web
      if (__DEV__ || Platform.OS === 'web' || !Updates.isEnabled) {
        return;
      }

      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsDownloading(true);

      // Download the update
      const result = await Updates.fetchUpdateAsync();
      
      if (result.isNew) {
        // Update downloaded successfully, reload the app
        await Updates.reloadAsync();
      } else {
        setIsDownloading(false);
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      setIsDownloading(false);
    }
  };

  const handleLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <Modal
      visible={updateAvailable}
      transparent
      animationType="fade"
      onRequestClose={handleLater}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className="bg-surface rounded-3xl p-8 mx-6 border border-border"
          style={{ maxWidth: 400, width: '90%' }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="arrow.down.circle.fill" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Title and Message */}
          <Text
            className="text-2xl font-bold text-foreground text-center mb-3"
            style={{ lineHeight: 32 }}
          >
            Update Available
          </Text>
          <Text
            className="text-base text-muted text-center mb-6"
            style={{ lineHeight: 24 }}
          >
            {isDownloading
              ? 'Downloading update... This will only take a moment.'
              : 'A new version of JACS Medical Monitoring System is available. Update now to get the latest features and improvements.'}
          </Text>

          {/* Progress Indicator */}
          {isDownloading && (
            <View className="mb-6">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* Action Buttons */}
          {!isDownloading && (
            <View className="gap-3">
              <Pressable
                onPress={handleUpdate}
                className="rounded-2xl p-5 items-center"
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text className="text-lg font-bold text-white">Update Now</Text>
              </Pressable>

              <Pressable
                onPress={handleLater}
                className="rounded-2xl p-5 items-center"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text className="text-base font-semibold text-muted">Remind Me Later</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
