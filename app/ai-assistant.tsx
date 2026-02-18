import { ScrollView, Text, TouchableOpacity, View, TextInput, FlatList } from "react-native";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistantScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI health assistant. I can help you with health questions, medication information, symptom analysis, and general wellness advice. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const chatMutation = trpc.system.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: () => {
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    },
  });

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Send to AI
    chatMutation.mutate({
      message: inputText.trim(),
      systemPrompt:
        "You are a helpful AI health assistant. Provide accurate, empathetic health information. Always remind users to consult healthcare professionals for medical decisions. Keep responses concise and actionable.",
    });
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    return (
      <View
        key={message.id}
        className={`mb-4 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <View
            className="mr-2 h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Text className="text-lg">🤖</Text>
          </View>
        )}
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
          style={{
            backgroundColor: isUser ? colors.primary : colors.surface,
          }}
        >
          <Text
            className="text-base leading-relaxed"
            style={{ color: isUser ? "#fff" : colors.foreground }}
          >
            {message.content}
          </Text>
          <Text
            className="mt-1 text-xs"
            style={{ color: isUser ? "#fff9" : colors.muted }}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {isUser && (
          <View
            className="ml-2 h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Text className="text-lg">👤</Text>
          </View>
        )}
      </View>
    );
  };

  const quickPrompts = [
    "What are normal blood pressure ranges?",
    "How can I improve my sleep quality?",
    "What should I know about diabetes management?",
    "Tips for medication adherence",
  ];

  return (
    <ScreenContainer className="px-4 pt-4">
      <View className="flex-1">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mb-2">
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">AI Health Assistant</Text>
            <Text className="mt-1 text-base text-muted">Your 24/7 health companion</Text>
          </View>
        </View>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted">Quick questions:</Text>
            <View className="flex-row flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setInputText(prompt);
                  }}
                  className="rounded-full border border-border bg-surface px-4 py-2"
                >
                  <Text className="text-sm text-foreground">{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 mb-4"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => renderMessage(message))}
          {isLoading && (
            <View className="mb-4 flex-row justify-start">
              <View
                className="mr-2 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text className="text-lg">🤖</Text>
              </View>
              <View
                className="rounded-2xl rounded-tl-sm px-4 py-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-base text-muted">Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-center gap-2 pb-2">
          <View className="flex-1 flex-row items-center rounded-full border border-border bg-surface px-4 py-2">
            <TextInput
              className="flex-1 text-base text-foreground"
              placeholder="Ask me anything about your health..."
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.muted + "40",
            }}
          >
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text className="pb-2 text-center text-xs text-muted">
          AI responses are for informational purposes only. Consult healthcare professionals for medical advice.
        </Text>
      </View>
    </ScreenContainer>
  );
}
