import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './ui/icon-symbol';

const PERSONALIZATION_KEY = '@jacs_personalization_completed';

/**
 * Personalization Prompt Component
 * 
 * Prompts first-time users to personalize their profile after app installation.
 * Guides users to the settings page to complete their profile setup.
 */
export function PersonalizationPrompt() {
  const colors = useColors();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const completed = await AsyncStorage.getItem(PERSONALIZATION_KEY);
      if (!completed) {
        // Show prompt after a short delay to let the app fully load
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking personalization status:', error);
    }
  };

  const handlePersonalize = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Mark personalization as shown (user can complete it later)
      await AsyncStorage.setItem(PERSONALIZATION_KEY, 'shown');
      
      setShowPrompt(false);
      
      // Navigate to settings page
      router.push('/(tabs)/settings');
    } catch (error) {
      console.error('Error navigating to settings:', error);
    }
  };

  const handleSkip = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Mark personalization as skipped
      await AsyncStorage.setItem(PERSONALIZATION_KEY, 'skipped');
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error skipping personalization:', error);
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Modal
      visible={showPrompt}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
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
              <IconSymbol name="person.circle.fill" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Title and Message */}
          <Text
            className="text-2xl font-bold text-foreground text-center mb-3"
            style={{ lineHeight: 32 }}
          >
            Personalize for Use
          </Text>
          <Text
            className="text-base text-muted text-center mb-6"
            style={{ lineHeight: 24 }}
          >
            Welcome to JACS Medical Monitoring System! Let's set up your profile to personalize your experience and get the most out of the app.
          </Text>

          {/* Features List */}
          <View className="mb-6 gap-3">
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark" size={18} color={colors.success} />
              </View>
              <Text className="text-sm text-foreground flex-1">Complete your health profile</Text>
            </View>
            
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark" size={18} color={colors.success} />
              </View>
              <Text className="text-sm text-foreground flex-1">Set up medication reminders</Text>
            </View>
            
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark" size={18} color={colors.success} />
              </View>
              <Text className="text-sm text-foreground flex-1">Connect health devices</Text>
            </View>
            
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark" size={18} color={colors.success} />
              </View>
              <Text className="text-sm text-foreground flex-1">Customize app preferences</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handlePersonalize}
              className="rounded-2xl p-5 items-center"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className="text-lg font-bold text-white">Get Started</Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              className="rounded-2xl p-5 items-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-base font-semibold text-muted">Skip for Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
