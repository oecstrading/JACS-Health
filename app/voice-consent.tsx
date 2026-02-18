import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import VoiceConsentService from "@/services/voiceConsent";
import { getCurrentNPP } from "@/services/noticeOfPrivacyPractices";
import * as Speech from "expo-speech";

export default function VoiceConsentScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [consentId, setConsentId] = useState<string | null>(null);

  const formId = params.formId as string;
  const userId = params.userId as string || "user_123";
  const npp = getCurrentNPP();

  const hipaaSummary = VoiceConsentService.getHIPAASummary();

  useEffect(() => {
    // Speak HIPAA summary when screen loads
    speakHIPAASummary();
  }, []);

  const speakHIPAASummary = async () => {
    setIsSpeaking(true);
    Speech.speak(hipaaSummary, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.85, // Slower for seniors
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    const result = await VoiceConsentService.startRecording();
    if (result.success) {
      setIsRecording(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const stopRecording = async () => {
    const result = await VoiceConsentService.stopRecording(
      formId,
      userId,
      "hipaa_authorization",
      npp.version
    );

    if (result.success && result.consent) {
      setIsRecording(false);
      setHasRecorded(true);
      setConsentId(result.consent.id);

      // Auto-verify for demo
      await VoiceConsentService.verifyConsent(result.consent.id, "auto_approved");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const playbackConsent = async () => {
    if (!consentId) return;

    const consent = await VoiceConsentService.getConsentById(consentId);
    if (consent) {
      await VoiceConsentService.playbackConsent(consent.audioFileUri);
    }
  };

  const handleContinue = () => {
    // Navigate back to intake form
    router.push({
      pathname: "/voice-intake" as any,
      params: { formId, consentRecorded: "true" },
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View>
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.foreground }}
            >
              Voice Consent
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.muted }}
            >
              Please listen to your HIPAA privacy rights and provide verbal consent by recording your acknowledgment.
            </Text>
          </View>

          {/* HIPAA Summary Card */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.foreground }}
              >
                Your Privacy Rights
              </Text>

              {isSpeaking ? (
                <TouchableOpacity
                  onPress={stopSpeaking}
                  style={{ backgroundColor: colors.error }}
                  className="rounded-full px-4 py-2"
                >
                  <Text className="text-sm font-medium" style={{ color: colors.background }}>
                    Stop ⏸
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={speakHIPAASummary}
                  style={{ backgroundColor: colors.primary }}
                  className="rounded-full px-4 py-2"
                >
                  <Text className="text-sm font-medium" style={{ color: colors.background }}>
                    Repeat 🔊
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.muted }}
            >
              {hipaaSummary}
            </Text>
          </View>

          {/* Recording Instructions */}
          <View
            style={{
              backgroundColor: colors.warning,
              opacity: 0.1,
            }}
            className="rounded-2xl p-4"
          >
            <Text
              className="text-base font-semibold mb-2"
              style={{ color: colors.foreground }}
            >
              📝 What to Say:
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.foreground }}
            >
              "I understand and acknowledge these privacy practices. I consent to the use and disclosure of my health information as described."
            </Text>
          </View>

          {/* Recording Control */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-6 items-center gap-4"
          >
            {!hasRecorded ? (
              <>
                <View
                  style={{
                    backgroundColor: isRecording ? colors.error : colors.primary,
                    width: 120,
                    height: 120,
                  }}
                  className="rounded-full items-center justify-center"
                >
                  <Text className="text-5xl">
                    {isRecording ? "⏺" : "🎤"}
                  </Text>
                </View>

                {isRecording && (
                  <View className="items-center">
                    <Text
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.error }}
                    >
                      Recording...
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.muted }}
                    >
                      Speak clearly and tap Stop when finished
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={{
                    backgroundColor: isRecording ? colors.error : colors.primary,
                  }}
                  className="rounded-2xl px-8 py-4"
                >
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.background }}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={{
                    backgroundColor: colors.success,
                    width: 120,
                    height: 120,
                  }}
                  className="rounded-full items-center justify-center"
                >
                  <Text className="text-5xl">✓</Text>
                </View>

                <Text
                  className="text-lg font-semibold text-center"
                  style={{ color: colors.success }}
                >
                  Consent Recorded Successfully!
                </Text>

                <Text
                  className="text-base text-center"
                  style={{ color: colors.muted }}
                >
                  Timestamp: {new Date().toLocaleString()}
                </Text>

                <TouchableOpacity
                  onPress={playbackConsent}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                  className="rounded-2xl px-6 py-3"
                >
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.foreground }}
                  >
                    🔊 Play Back Recording
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Legal Notice */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="rounded-2xl p-4"
          >
            <Text
              className="text-sm leading-relaxed"
              style={{ color: colors.muted }}
            >
              <Text className="font-semibold">Legal Notice:</Text> Your voice consent is time-stamped and securely stored as a digital signature. This recording serves as your acknowledgment of the Notice of Privacy Practices (Version {npp.version}) and your authorization for the use and disclosure of your protected health information as described. You may revoke this consent at any time by contacting our Privacy Officer.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!hasRecorded}
              style={{
                backgroundColor: hasRecorded ? colors.primary : colors.surface,
                opacity: hasRecorded ? 1 : 0.5,
              }}
              className="rounded-2xl p-4 items-center"
            >
              <Text
                className="text-lg font-semibold"
                style={{ color: hasRecorded ? colors.background : colors.muted }}
              >
                Continue to Form
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: colors.surface }}
              className="rounded-2xl p-4 items-center"
            >
              <Text
                className="text-base font-medium"
                style={{ color: colors.foreground }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
