import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { VoiceVitalsService, type VitalData } from "@/lib/voice-vitals-service";
import { useSpeechRecognitionEvent } from "expo-speech-recognition";

interface VoiceVitalsInputProps {
  onVitalDetected: (data: VitalData) => void;
}

export function VoiceVitalsInput({ onVitalDetected }: VoiceVitalsInputProps) {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await VoiceVitalsService.isAvailable();
    setIsAvailable(available);
  };

  // Listen for speech recognition results
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const text = event.results[0]?.transcript || "";
      setTranscript(text);
      handleVoiceResult(text);
    }
  });

  // Listen for speech recognition errors
  useSpeechRecognitionEvent("error", (event) => {
    console.error("[Voice Input] Error:", event.error);
    setIsListening(false);
    Alert.alert("Voice Recognition Error", "Failed to recognize speech. Please try again.");
  });

  // Listen for speech recognition end
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  const handleVoiceResult = (text: string) => {
    const vitalData = VoiceVitalsService.parseVoiceInput(text);
    
    if (vitalData.type !== "unknown") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const message = VoiceVitalsService.getConfirmationMessage(vitalData);
      Alert.alert("Vital Detected", message, [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsListening(false);
            setTranscript("");
          },
        },
        {
          text: "Save",
          onPress: () => {
            onVitalDetected(vitalData);
            setIsListening(false);
            setTranscript("");
          },
        },
      ]);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Not Recognized",
        "I didn't understand that. Try saying:\n\n• \"My blood pressure is 120 over 80\"\n• \"I weigh 165 pounds\"\n• \"Heart rate 72\"\n• \"Blood sugar 95\"",
        [
          {
            text: "Try Again",
            onPress: startListening,
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsListening(false);
              setTranscript("");
            },
          },
        ]
      );
    }
  };

  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Request permissions
    const hasPermission = await VoiceVitalsService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Microphone Permission Required",
        "Please enable microphone access in Settings to use voice input."
      );
      return;
    }

    setIsListening(true);
    setTranscript("");

    try {
      await VoiceVitalsService.startListening(
        (text) => {
          setTranscript(text);
        },
        (error) => {
          console.error("[Voice Input] Error:", error);
          setIsListening(false);
          Alert.alert("Voice Recognition Error", error);
        }
      );
    } catch (error) {
      console.error("[Voice Input] Start error:", error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await VoiceVitalsService.stopListening();
    setIsListening(false);
  };

  if (!isAvailable) {
    return null; // Don't show voice button if not available
  }

  return (
    <>
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: isListening ? colors.error : colors.primary,
        }}
      >
        <IconSymbol
          name={isListening ? "stop.fill" : "mic.fill"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Listening Modal */}
      <Modal
        visible={isListening}
        transparent
        animationType="fade"
        onRequestClose={stopListening}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View
            className="mx-6 w-80 rounded-3xl p-8"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="mb-6 items-center">
              <View
                className="mb-4 h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <IconSymbol name="mic.fill" size={40} color={colors.primary} />
              </View>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>

            <Text className="mb-2 text-center text-xl font-bold text-foreground">
              Listening...
            </Text>
            <Text className="mb-6 text-center text-sm text-muted">
              Say your vital measurement
            </Text>

            {transcript ? (
              <View
                className="mb-6 rounded-2xl p-4"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-center text-base text-foreground">
                  "{transcript}"
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={stopListening}
              className="items-center justify-center rounded-full py-4"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-base font-semibold text-white">Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
