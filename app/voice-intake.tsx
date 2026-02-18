import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import PatientIntakeService, {
  type PatientIntakeForm,
  type IntakeQuestion,
} from "@/services/patientIntake";
import { speak, stop } from "expo-speech";

export default function VoiceIntakeScreen() {
  const colors = useColors();
  const [form, setForm] = useState<PatientIntakeForm | null>(null);
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    initializeForm();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      speakQuestion();
    }
  }, [currentQuestionIndex, questions]);

  const initializeForm = async () => {
    try {
      let currentForm = await PatientIntakeService.getCurrentIntakeForm();
      
      if (!currentForm) {
        currentForm = await PatientIntakeService.createIntakeForm();
      }
      
      setForm(currentForm);
      setQuestions(PatientIntakeService.getIntakeQuestions());
    } catch (error) {
      Alert.alert("Error", "Failed to initialize intake form");
    }
  };

  const speakQuestion = async () => {
    if (currentQuestionIndex >= questions.length) return;
    
    const question = questions[currentQuestionIndex];
    setIsSpeaking(true);
    
    try {
      await speak(question.voicePrompt, {
        language: "en-US",
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      console.error("Error speaking question:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
    // In production, this would use expo-speech-recognition or similar
    setIsListening(true);
    
    // Simulate voice recognition for now
    setTimeout(() => {
      setIsListening(false);
      // Mock answer - in production, this would be the transcribed speech
      setCurrentAnswer("Sample answer from voice");
      setShowConfirmation(true);
    }, 2000);
  };

  const handleTextInput = () => {
    Alert.prompt(
      "Enter Answer",
      questions[currentQuestionIndex].question,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: (text?: string) => {
            if (text) {
              setCurrentAnswer(text);
              setShowConfirmation(true);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleConfirmAnswer = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowConfirmation(false);
      setCurrentAnswer("");
      return;
    }

    if (!form) return;

    const question = questions[currentQuestionIndex];
    
    try {
      // Update form with answer
      PatientIntakeService.updateFieldValue(form, question.field, currentAnswer);
      await PatientIntakeService.saveIntakeForm(form);
      
      // Move to next question
      setShowConfirmation(false);
      setCurrentAnswer("");
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered
        await PatientIntakeService.completeIntakeForm(form.id);
        Alert.alert(
          "Intake Complete!",
          "You've answered all the questions. Let's review your information.",
          [
            {
              text: "Review & Sign",
              onPress: () => router.push({ pathname: "/intake-review" as any, params: { formId: form.id } }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save answer");
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleGoBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handlePause = async () => {
    if (form) {
      form.status = "in_progress";
      await PatientIntakeService.saveIntakeForm(form);
      Alert.alert(
        "Progress Saved",
        "Your progress has been saved. You can continue later.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!form || questions.length === 0) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-lg text-muted mt-4">Loading intake form...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Smart Voice Intake</Text>
            <Text className="text-base text-muted mt-1">
              Answer questions by voice or typing
            </Text>
          </View>

          {/* Progress Bar */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                {Math.round(progress)}% Complete
              </Text>
            </View>
            <View
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              <View
                className="h-full rounded-full"
                style={{ backgroundColor: colors.primary, width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Current Question */}
          {currentQuestion && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="mb-4">
                <View
                  className="self-start rounded-full px-4 py-2 mb-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-sm font-bold text-white uppercase">
                    {currentQuestion.section}
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-foreground mb-3" style={{ lineHeight: 36 }}>
                  {currentQuestion.question}
                </Text>
                {currentQuestion.helpText && (
                  <View
                    className="rounded-xl p-4 mb-3"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      💡 Why we need this:
                    </Text>
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      {currentQuestion.helpText}
                    </Text>
                  </View>
                )}
                {currentQuestion.example && (
                  <Text className="text-sm text-muted">
                    Example: {currentQuestion.example}
                  </Text>
                )}
              </View>

              {/* Voice Input Button */}
              <TouchableOpacity
                onPress={handleVoiceInput}
                disabled={isListening || isSpeaking}
                className="rounded-2xl p-8 items-center mb-4"
                style={{
                  backgroundColor: isListening ? colors.success : colors.primary,
                }}
              >
                {isListening ? (
                  <>
                    <Text className="text-6xl mb-3">🎤</Text>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-xl font-bold text-white mt-3">Listening...</Text>
                    <Text className="text-sm text-white mt-1 opacity-90">
                      Speak your answer now
                    </Text>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Text className="text-6xl mb-3">🔊</Text>
                    <Text className="text-xl font-bold text-white">Speaking...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-6xl mb-3">🎤</Text>
                    <Text className="text-xl font-bold text-white">Tap to Answer by Voice</Text>
                    <Text className="text-sm text-white mt-1 opacity-90">
                      Or use the buttons below to type
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Text Input Button */}
              <TouchableOpacity
                onPress={handleTextInput}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border }}
              >
                <Text className="text-lg font-bold text-foreground">⌨️ Type Answer Instead</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-xl font-bold text-white mb-3">
                I heard: "{currentAnswer}"
              </Text>
              <Text className="text-base text-white mb-4 opacity-90">
                Is that correct?
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleConfirmAnswer(true)}
                  className="flex-1 rounded-full p-4 items-center"
                  style={{ backgroundColor: "#fff" }}
                >
                  <Text className="text-lg font-bold" style={{ color: colors.success }}>
                    ✓ Yes, Correct
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleConfirmAnswer(false)}
                  className="flex-1 rounded-full p-4 items-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <Text className="text-lg font-bold text-white">✗ No, Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleGoBack}
                disabled={currentQuestionIndex === 0}
                className="flex-1 rounded-full p-4 items-center"
                style={{
                  backgroundColor: currentQuestionIndex === 0 ? colors.surface : colors.primary,
                  opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: currentQuestionIndex === 0 ? colors.muted : "#fff" }}
                >
                  ← Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkip}
                disabled={currentQuestion?.required}
                className="flex-1 rounded-full p-4 items-center"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: colors.border,
                  opacity: currentQuestion?.required ? 0.5 : 1,
                }}
              >
                <Text className="text-base font-bold text-foreground">
                  Skip →
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePause}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-bold text-foreground">⏸ Save & Continue Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => speakQuestion()}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-bold text-foreground">🔊 Repeat Question</Text>
            </TouchableOpacity>
          </View>

          {/* Estimated Time */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-base text-muted text-center">
              ⏱ Estimated time remaining: {Math.ceil((questions.length - currentQuestionIndex) * 0.5)} minutes
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
