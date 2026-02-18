import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface TranscriptSegment {
  id: string;
  speaker: "doctor" | "patient";
  text: string;
  timestamp: Date;
  medicalTerms?: MedicalTerm[];
}

interface MedicalTerm {
  term: string;
  explanation: string;
}

interface VisitSummary {
  actionItems: string[];
  medicationChanges: string[];
  followUpDates: string[];
  keyPoints: string[];
}

export default function MedicalVisitModeScreen() {
  const colors = useColors();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<MedicalTerm | null>(null);
  const [visitSummary, setVisitSummary] = useState<VisitSummary | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startRecording() {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    // Simulate real-time transcription - in production, use server LLM with audio streaming
    simulateTranscription();
  }

  function stopRecording() {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Generate visit summary
    generateSummary();
  }

  function simulateTranscription() {
    // Mock transcription segments with medical terms
    const mockSegments: TranscriptSegment[] = [
      {
        id: "1",
        speaker: "doctor",
        text: "Your blood pressure is slightly elevated at 145/92. I'm going to prescribe you Lisinopril to help manage your hypertension.",
        timestamp: new Date(),
        medicalTerms: [
          {
            term: "Lisinopril",
            explanation: "A medication that helps lower blood pressure by relaxing blood vessels",
          },
          {
            term: "Hypertension",
            explanation: "High blood pressure - when the force of blood against artery walls is too high",
          },
        ],
      },
      {
        id: "2",
        speaker: "patient",
        text: "Will this interact with my current medications?",
        timestamp: new Date(),
      },
      {
        id: "3",
        speaker: "doctor",
        text: "I've checked your chart. It should be safe with your current regimen, but avoid NSAIDs like ibuprofen as they can reduce effectiveness.",
        timestamp: new Date(),
        medicalTerms: [
          {
            term: "NSAIDs",
            explanation: "Non-Steroidal Anti-Inflammatory Drugs - pain relievers like ibuprofen and aspirin",
          },
        ],
      },
    ];

    // Add segments gradually to simulate real-time
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockSegments.length && isRecording) {
        setTranscript((prev) => [...prev, mockSegments[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);
  }

  function generateSummary() {
    const summary: VisitSummary = {
      actionItems: [
        "Start taking Lisinopril 10mg once daily",
        "Monitor blood pressure at home twice daily",
        "Avoid NSAIDs (ibuprofen, aspirin)",
      ],
      medicationChanges: [
        "Added: Lisinopril 10mg - once daily for blood pressure",
      ],
      followUpDates: [
        "Follow-up appointment in 4 weeks to check blood pressure response",
      ],
      keyPoints: [
        "Blood pressure is elevated (145/92)",
        "New medication prescribed to manage hypertension",
        "Avoid certain pain relievers that interfere with treatment",
      ],
    };

    setVisitSummary(summary);
  }

  function shareWithCaregiver() {
    Alert.alert(
      "Share Visit Summary",
      "Visit summary has been shared with your caregivers",
      [{ text: "OK" }]
    );
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Medical Visit Mode</Text>
          <View className="w-12" />
        </View>

        {!visitSummary ? (
          /* Recording Interface */
          <View className="gap-6">
            {/* Recording Status */}
            <View className="bg-surface p-6 rounded-2xl items-center">
              <View
                className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
                  isRecording ? "bg-error/20" : "bg-primary/20"
                }`}
              >
                <Text className="text-5xl">{isRecording ? "🎙️" : "🩺"}</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {isRecording ? "Recording Visit..." : "Ready to Record"}
              </Text>
              {isRecording && (
                <Text className="text-lg text-muted">{formatDuration(recordingDuration)}</Text>
              )}
              <Text className="text-base text-muted text-center mt-2">
                {isRecording
                  ? "Transcribing in real-time"
                  : "Tap the button below to start recording your doctor visit"}
              </Text>
            </View>

            {/* Recording Control */}
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className={`py-4 rounded-xl items-center ${
                isRecording ? "bg-error" : "bg-primary"
              }`}
            >
              <Text className="text-white text-lg font-bold">
                {isRecording ? "⏹ Stop Recording" : "⏺ Start Recording"}
              </Text>
            </Pressable>

            {/* Live Transcript */}
            {transcript.length > 0 && (
              <View className="bg-surface p-6 rounded-2xl">
                <Text className="text-xl font-bold text-foreground mb-4">
                  Live Transcript
                </Text>
                <View className="gap-4">
                  {transcript.map((segment) => (
                    <View key={segment.id} className="gap-2">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`px-3 py-1 rounded-full ${
                            segment.speaker === "doctor"
                              ? "bg-primary/20"
                              : "bg-success/20"
                          }`}
                        >
                          <Text
                            className={`text-sm font-bold ${
                              segment.speaker === "doctor"
                                ? "text-primary"
                                : "text-success"
                            }`}
                          >
                            {segment.speaker === "doctor" ? "Doctor" : "You"}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted">
                          {segment.timestamp.toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text className="text-base text-foreground leading-relaxed">
                        {segment.text}
                      </Text>
                      {segment.medicalTerms && segment.medicalTerms.length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mt-2">
                          {segment.medicalTerms.map((term, idx) => (
                            <Pressable
                              key={idx}
                              onPress={() => setSelectedTerm(term)}
                              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                              className="bg-primary/10 border border-primary px-3 py-1 rounded-full"
                            >
                              <Text className="text-sm text-primary font-semibold">
                                ℹ️ {term.term}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Medical Term Explanation Panel */}
            {selectedTerm && (
              <View className="bg-primary/10 border-2 border-primary p-6 rounded-2xl">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-xl font-bold text-primary flex-1">
                    {selectedTerm.term}
                  </Text>
                  <Pressable
                    onPress={() => setSelectedTerm(null)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text className="text-lg text-primary">✕</Text>
                  </Pressable>
                </View>
                <Text className="text-base text-foreground leading-relaxed">
                  {selectedTerm.explanation}
                </Text>
                <Pressable
                  onPress={() => {
                    Speech.speak(selectedTerm.explanation, { language: "en" });
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="bg-primary px-4 py-2 rounded-full mt-4 self-start"
                >
                  <Text className="text-white font-semibold">🔊 Read Aloud</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* Visit Summary */
          <View className="gap-6">
            {/* Summary Header */}
            <View className="bg-success/20 p-6 rounded-2xl items-center">
              <Text className="text-5xl mb-3">✅</Text>
              <Text className="text-2xl font-bold text-foreground mb-2">
                Visit Complete
              </Text>
              <Text className="text-base text-muted text-center">
                Your visit has been transcribed and analyzed
              </Text>
            </View>

            {/* Action Items */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                📋 Action Items
              </Text>
              <View className="gap-3">
                {visitSummary.actionItems.map((item, idx) => (
                  <View key={idx} className="flex-row gap-3">
                    <Text className="text-primary text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Medication Changes */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                💊 Medication Changes
              </Text>
              <View className="gap-3">
                {visitSummary.medicationChanges.map((change, idx) => (
                  <View key={idx} className="bg-primary/10 p-4 rounded-xl">
                    <Text className="text-base text-foreground font-semibold">
                      {change}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Follow-Up */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                📅 Follow-Up
              </Text>
              <View className="gap-3">
                {visitSummary.followUpDates.map((date, idx) => (
                  <View key={idx} className="flex-row gap-3">
                    <Text className="text-primary text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">{date}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Key Points */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                🔑 Key Points
              </Text>
              <View className="gap-3">
                {visitSummary.keyPoints.map((point, idx) => (
                  <View key={idx} className="flex-row gap-3">
                    <Text className="text-primary text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">{point}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View className="gap-3">
              <Pressable
                onPress={shareWithCaregiver}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white text-lg font-bold">
                  📤 Share with Caregiver
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setVisitSummary(null);
                  setTranscript([]);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-surface border border-border py-4 rounded-xl items-center"
              >
                <Text className="text-foreground text-lg font-bold">
                  ⏺ Record Another Visit
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
