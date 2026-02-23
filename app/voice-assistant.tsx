import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Mic, MicOff, MessageSquare, Settings } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

export default function VoiceAssistantScreen() {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);

  const conversationHistory = [
    { role: "user", text: "What's my current glucose level?", time: "2 min ago" },
    { role: "assistant", text: "Your current glucose is 125 mg/dL, which is in the healthy range.", time: "2 min ago" },
    { role: "user", text: "Remind me to take insulin in 30 minutes", time: "5 min ago" },
    { role: "assistant", text: "I've set a reminder for insulin in 30 minutes.", time: "5 min ago" },
  ];

  const voiceCommands = [
    "What's my glucose level?",
    "Log my blood pressure",
    "Set a medication reminder",
    "How many steps today?",
    "What's my health score?",
    "Show my medications",
  ];

  const handleStartListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(true);
    Speech.speak("I'm listening. How can I help you?", { language: "en" });
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      Speech.speak("Your current glucose is 125 milligrams per deciliter, which is in the healthy range.", { language: "en" });
    }, 3000);
  };

  const handleStopListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsListening(false);
  };

  const handleToggleWakeWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWakeWordEnabled(!wakeWordEnabled);
    Alert.alert(
      wakeWordEnabled ? "Wake Word Disabled" : "Wake Word Enabled",
      wakeWordEnabled 
        ? "You'll need to tap the microphone to activate voice assistant."
        : "Say 'Hey Health' to activate voice assistant hands-free."
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <MessageSquare size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Voice Assistant</Text>
          </View>
          <Text className="text-base text-muted">Hands-free health management</Text>
        </View>

        {/* Wake Word Status */}
        <View className="px-6 pb-6">
          <View className={`border-2 rounded-xl p-4 flex-row items-center justify-between ${wakeWordEnabled ? 'bg-primary/10 border-primary' : 'bg-surface border-border'}`}>
            <View className="flex-1">
              <Text className={`text-base font-semibold ${wakeWordEnabled ? 'text-primary' : 'text-foreground'} mb-1`}>
                {wakeWordEnabled ? '"Hey Health" Active' : 'Wake Word Disabled'}
              </Text>
              <Text className="text-sm text-muted">
                {wakeWordEnabled ? 'Say "Hey Health" to start' : 'Tap microphone to activate'}
              </Text>
            </View>
            <Pressable
              onPress={handleToggleWakeWord}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className={`px-4 py-2 rounded-lg ${wakeWordEnabled ? 'bg-primary' : 'bg-muted/30'}`}
            >
              <Text className={`font-semibold text-sm ${wakeWordEnabled ? 'text-white' : 'text-muted'}`}>
                {wakeWordEnabled ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Microphone Button */}
        <View className="px-6 pb-6 items-center">
          <Pressable
            onPress={isListening ? handleStopListening : handleStartListening}
            style={({ pressed }) => [
              { 
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: isListening ? 1.1 : 1 }],
              }
            ]}
            className={`w-32 h-32 rounded-full items-center justify-center ${isListening ? 'bg-error' : 'bg-primary'}`}
          >
            {isListening ? (
              <MicOff size={48} color="#ffffff" />
            ) : (
              <Mic size={48} color="#ffffff" />
            )}
          </Pressable>
          <Text className={`mt-4 text-lg font-semibold ${isListening ? 'text-error' : 'text-primary'}`}>
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </Text>
        </View>

        {/* Quick Commands */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Try Saying</Text>
          <View className="gap-2">
            {voiceCommands.map((cmd, i) => (
              <View key={i} className="bg-surface border border-border rounded-lg p-3 flex-row items-center gap-2">
                <MessageSquare size={16} color={colors.muted} />
                <Text className="text-sm text-foreground flex-1">"{cmd}"</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conversation History */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Recent Conversations</Text>
          {conversationHistory.map((msg, i) => (
            <View key={i} className={`mb-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <View className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary' : 'bg-surface border border-border'}`}>
                <Text className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-foreground'}`}>
                  {msg.text}
                </Text>
                <Text className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-muted'}`}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-surface border border-border rounded-xl p-4 flex-row items-center gap-3"
          >
            <Settings size={24} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">Voice Settings</Text>
              <Text className="text-sm text-muted">Language, voice speed, and more</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
