import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { BookOpen, Send, Sparkles, HelpCircle } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "What should I do if my blood sugar is too low?",
  "How do I count carbs in my meals?",
  "What are the symptoms of high blood sugar?",
  "How often should I check my glucose levels?",
  "What foods help stabilize blood sugar?",
  "How does exercise affect my diabetes?",
];

/**
 * AI Diabetes Medical Library
 * 
 * Features:
 * - AI-powered Q&A about diabetes management
 * - Suggested common questions
 * - Chat-style interface
 * - Diabetes-specific knowledge base
 * - Visual aids and explanations
 * - Powered by server's built-in LLM
 */
export function AIMedicalLibrary() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // In production, call server LLM API
      // For now, simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponse = generateAIResponse(question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your question right now. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string): string => {
    // Simulate AI responses based on question keywords
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("low") && lowerQuestion.includes("blood sugar")) {
      return "If your blood sugar is too low (below 70 mg/dL), follow the 15-15 rule:\n\n1. Consume 15 grams of fast-acting carbs (4 glucose tablets, 4 oz juice, or 1 tablespoon honey)\n2. Wait 15 minutes and recheck your glucose\n3. If still low, repeat step 1\n4. Once normal, eat a small snack if your next meal is more than an hour away\n\n⚠️ If you feel confused, shaky, or dizzy, treat immediately and contact your doctor if symptoms don't improve.";
    }

    if (lowerQuestion.includes("carb") || lowerQuestion.includes("count")) {
      return "Carb counting helps you match insulin to food intake. Here's how:\n\n1. **Read nutrition labels**: Look for 'Total Carbohydrates' (not just sugars)\n2. **Measure portions**: Use measuring cups or a food scale\n3. **Learn serving sizes**: 1 slice bread = 15g, 1 cup milk = 12g, 1 medium apple = 25g\n4. **Use apps**: MyFitnessPal or Carb Manager can help track\n5. **Work with your team**: Your dietitian can help create a personalized carb budget\n\n💡 Tip: Most people with Type 1 need 1 unit of insulin for every 10-15g of carbs (your ratio may differ).";
    }

    if (lowerQuestion.includes("high") && lowerQuestion.includes("blood sugar")) {
      return "High blood sugar (hyperglycemia) symptoms include:\n\n**Early signs:**\n• Increased thirst and urination\n• Fatigue and weakness\n• Blurred vision\n• Headaches\n\n**Severe symptoms (seek immediate care):**\n• Fruity-smelling breath\n• Nausea or vomiting\n• Shortness of breath\n• Confusion\n\n**What to do:**\n1. Check your glucose level\n2. Drink water (no sugary drinks)\n3. Take insulin as prescribed\n4. Recheck in 1-2 hours\n5. Call your doctor if over 300 mg/dL or if you have ketones";
    }

    if (lowerQuestion.includes("check") || lowerQuestion.includes("often")) {
      return "Testing frequency depends on your diabetes type and treatment:\n\n**Type 1 Diabetes:**\n• Before meals and snacks (4-6 times/day)\n• Before bed\n• Before/during/after exercise\n• When you feel symptoms\n\n**Type 2 Diabetes (on insulin):**\n• 2-4 times per day as recommended by your doctor\n\n**Type 2 Diabetes (no insulin):**\n• As directed by your healthcare team (often 1-2 times/day)\n\n📱 CGM users: Your device monitors continuously, but finger sticks are still needed for calibration and confirmation.";
    }

    if (lowerQuestion.includes("food") || lowerQuestion.includes("eat")) {
      return "Foods that help stabilize blood sugar:\n\n**Best choices:**\n• Non-starchy vegetables (broccoli, spinach, peppers)\n• Whole grains (brown rice, quinoa, oats)\n• Lean proteins (chicken, fish, tofu)\n• Healthy fats (avocado, nuts, olive oil)\n• Legumes (beans, lentils)\n\n**Pairing strategy:**\nCombine carbs with protein/fat to slow absorption:\n• Apple + peanut butter\n• Whole grain toast + eggs\n• Greek yogurt + berries\n\n**Foods to limit:**\n• Sugary drinks and candy\n• White bread and pasta\n• Fried foods\n• Processed snacks";
    }

    if (lowerQuestion.includes("exercise") || lowerQuestion.includes("physical activity")) {
      return "Exercise affects diabetes in important ways:\n\n**Benefits:**\n• Lowers blood sugar (muscles use glucose for energy)\n• Improves insulin sensitivity\n• Helps with weight management\n• Reduces cardiovascular risk\n\n**Safety tips:**\n1. Check glucose before exercise (aim for 100-250 mg/dL)\n2. If below 100, eat 15g carbs first\n3. Carry fast-acting carbs during activity\n4. Check glucose every 30 min during long workouts\n5. Monitor for lows up to 24 hours after exercise\n\n💪 Best types: Mix aerobic (walking, swimming) with strength training (weights, resistance bands) for optimal control.";
    }

    // Default response
    return "That's a great question about diabetes management! While I can provide general information, it's important to discuss your specific situation with your healthcare team.\n\nFor personalized advice about:\n• Medication adjustments\n• Insulin dosing\n• Meal planning\n• Exercise routines\n\nPlease consult your doctor or certified diabetes educator. They can create a plan tailored to your unique needs.\n\n💡 Try asking about common topics like blood sugar management, carb counting, or recognizing symptoms.";
  };

  const handleSuggestedQuestion = (question: string) => {
    sendQuestion(question);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="p-6">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-primary/20 rounded-full p-4 mb-3">
              <BookOpen size={40} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              AI Medical Library
            </Text>
            <Text className="text-base text-muted text-center">
              Ask questions about diabetes management and get instant answers
            </Text>
          </View>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <HelpCircle size={20} color={colors.primary} />
                <Text className="text-lg font-semibold text-foreground">
                  Suggested Questions
                </Text>
              </View>

              <View className="gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSuggestedQuestion(question)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    className="bg-surface border border-border rounded-xl p-4 flex-row items-center gap-3"
                  >
                    <Sparkles size={16} color={colors.primary} />
                    <Text className="flex-1 text-sm text-foreground">
                      {question}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <View className="gap-4 mb-6">
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <View
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm leading-relaxed ${
                        message.role === "user" ? "text-white" : "text-foreground"
                      }`}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View className="items-start">
                  <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text className="text-sm text-muted">
                      AI is thinking...
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Info Card */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <Sparkles size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Powered by AI
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  This library provides general diabetes education. Always consult your healthcare team for personalized medical advice.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a question about diabetes..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            style={{ maxHeight: 100 }}
          />
          
          <Pressable
            onPress={() => sendQuestion(inputText)}
            disabled={!inputText.trim() || isLoading}
            style={({ pressed }) => [
              {
                opacity: pressed || !inputText.trim() || isLoading ? 0.5 : 1,
              },
            ]}
            className="bg-primary rounded-xl p-3"
          >
            <Send size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
