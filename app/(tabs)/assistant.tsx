import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
// Audio permissions will be handled when implementing actual speech-to-text
import * as Speech from "expo-speech";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * AI Assistant Screen - Voice and Text Interaction
 *
 * Conversational AI health companion using voice recognition and text-to-speech.
 * Designed for easy interaction with large buttons and clear feedback.
 */
export default function AssistantScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI health companion. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickSuggestions = [
    "How am I doing?",
    "Remind me to take medication",
    "What should I eat?",
    "Show my health trends",
  ];

  const handleStartListening = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsListening(true);

      // TODO: Implement actual speech-to-text with microphone permissions
      // For now, simulate listening for 2 seconds
      setTimeout(() => {
        setIsListening(false);
        handleUserMessage("How is my blood pressure doing?");
      }, 2000);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsListening(false);
      alert("Voice recognition error. Please try again.");
    }
  };

  const handleUserMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response (in production, this would call the server LLM)
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakMessage(aiResponse);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("blood pressure")) {
      return "Your blood pressure has been stable this week, averaging 120 over 80. That's in the healthy range. Keep up the good work!";
    } else if (lowerMessage.includes("medication")) {
      return "You have 3 medications scheduled for today. You've taken 2 so far. Don't forget your evening dose of Atorvastatin at 8 PM.";
    } else if (lowerMessage.includes("eat") || lowerMessage.includes("food")) {
      return "Based on your health conditions, I recommend a balanced meal with lean protein, vegetables, and whole grains. Try to limit salt and sugar.";
    } else if (lowerMessage.includes("doing") || lowerMessage.includes("health")) {
      return "You're doing great! You've logged all your medications on time, your vitals are in healthy ranges, and you've been active. Keep it up!";
    } else {
      return "I'm here to help with your health questions. You can ask me about your medications, vitals, activity, or general health tips.";
    }
  };

  const speakMessage = async (text: string) => {
    try {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.85, // Slightly slower for older adults
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error("Error speaking message:", error);
      setIsSpeaking(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleUserMessage(suggestion);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          AI Assistant
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Ask me anything about your health
        </Text>
      </View>

      {/* Conversation */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-4">
          {messages.map(message => (
            <View
              key={message.id}
              className="rounded-3xl p-6"
              style={{
                backgroundColor: message.role === "user" ? `${colors.primary}20` : colors.surface,
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-lg text-foreground" style={{ lineHeight: 26 }}>
                {message.content}
              </Text>
              <Text className="text-sm text-muted mt-2" style={{ lineHeight: 18 }}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <View className="mt-4 mb-4">
            <Text className="text-base text-muted mb-3" style={{ lineHeight: 22 }}>
              Try asking:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                      backgroundColor: colors.surface,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: colors.border,
                    } as ViewStyle,
                  ]}
                >
                  <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Input Button */}
      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={handleStartListening}
          disabled={isListening || isSpeaking}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed || isListening || isSpeaking ? 0.8 : 1,
              backgroundColor: colors.primary,
              paddingVertical: 20,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 12,
            } as ViewStyle,
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="mic.fill" size={32} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold" style={{ color: "#ffffff", lineHeight: 32 }}>
            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to Talk"}
          </Text>
        </Pressable>
        <Text className="text-base text-muted text-center mt-3" style={{ lineHeight: 22 }}>
          Hold and speak your question
        </Text>
      </View>
    </ScreenContainer>
  );
}
