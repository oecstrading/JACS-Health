import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Surgeon Communication Module
 * 
 * Enables patients to communicate with their surgeon's office:
 * - Surgeon contact information
 * - Pre-op question templates
 * - Post-op recovery updates
 * - Photo sharing for incision healing
 * - Appointment reminders
 * - Emergency contact
 */

interface RecoveryUpdate {
  id: string;
  date: string;
  week: number;
  message: string;
  photos?: number;
}

const MOCK_UPDATES: RecoveryUpdate[] = [
  {
    id: "1",
    date: "2024-02-05",
    week: 2,
    message: "Feeling much better! Walking 100 feet with walker. Pain level down to 3/10.",
    photos: 2,
  },
  {
    id: "2",
    date: "2024-01-29",
    week: 1,
    message: "First week post-op. Some swelling but following all instructions. Doing PT exercises daily.",
    photos: 1,
  },
];

const PRE_OP_QUESTIONS = [
  "What should I stop eating/drinking before surgery?",
  "When should I stop taking blood thinners?",
  "How long will I be in the hospital?",
  "What equipment do I need at home?",
  "When can I return to work?",
  "What are the signs of infection I should watch for?",
];

export default function SurgeonCommunication() {
  const colors = useColors();
  const [message, setMessage] = useState("");
  const [updates, setUpdates] = useState<RecoveryUpdate[]>(MOCK_UPDATES);

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Empty Message", "Please type a message before sending.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Message Sent",
      "Your message has been sent to Dr. Smith's office. They typically respond within 24 hours."
    );
    setMessage("");
  };

  const handleQuickQuestion = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Send Question?",
      `Send this question to your surgeon?\n\n"${question}"`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("Question Sent", "Dr. Smith's office will respond within 24 hours.");
          },
        },
      ]
    );
  };

  const handleSharePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Share Photo",
      "Take a photo of your incision to share with your surgeon for healing progress review.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: () => Alert.alert("Photo captured and sent!") },
      ]
    );
  };

  const handleEmergencyCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Emergency Contact",
      "Call surgeon's emergency line?\n\n(555) 123-4567",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call Now", style: "destructive", onPress: () => Alert.alert("Calling...") },
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
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Surgeon Communication
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Stay connected with your care team
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Surgeon Contact Card */}
        <View className="mb-6">
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-4 mb-4">
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                  Dr. Sarah Smith
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Orthopedic Surgeon
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 20 }}>📞</Text>
                <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                  (555) 123-4567
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 20 }}>📧</Text>
                <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                  office@drsmith.com
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 20 }}>📍</Text>
                <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                  123 Medical Plaza, Suite 200
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={handleSharePhoto}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text className="text-base font-bold text-white" style={{ lineHeight: 22 }}>
                  📸 Share Photo
                </Text>
              </Pressable>
              <Pressable
                onPress={handleEmergencyCall}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.error,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text className="text-base font-bold text-white" style={{ lineHeight: 22 }}>
                  🚨 Emergency
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Pre-Op Questions */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Common Pre-Op Questions
          </Text>
          <View className="gap-3">
            {PRE_OP_QUESTIONS.map((question, index) => (
              <Pressable
                key={index}
                onPress={() => handleQuickQuestion(question)}
                style={({ pressed }) => ({
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                })}
              >
                <Text style={{ fontSize: 20 }}>❓</Text>
                <Text className="flex-1 text-base text-foreground" style={{ lineHeight: 22 }}>
                  {question}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recovery Updates History */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Recovery Updates
          </Text>
          <View className="gap-4">
            {updates.map((update) => (
              <View
                key={update.id}
                className="rounded-2xl p-5"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    <Text className="text-sm font-bold" style={{ color: colors.primary, lineHeight: 20 }}>
                      Week {update.week} Post-Op
                    </Text>
                  </View>
                  <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                    {new Date(update.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-base text-foreground mb-2" style={{ lineHeight: 22 }}>
                  {update.message}
                </Text>
                {update.photos && (
                  <View className="flex-row items-center gap-2">
                    <Text style={{ fontSize: 16 }}>📷</Text>
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      {update.photos} photo{update.photos > 1 ? "s" : ""} attached
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Message Composer */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Send Message
          </Text>
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message or question here..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              style={{
                color: colors.foreground,
                fontSize: 16,
                lineHeight: 22,
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
            <Pressable
              onPress={handleSendMessage}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-base font-bold text-white" style={{ lineHeight: 22 }}>
                Send Message
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
