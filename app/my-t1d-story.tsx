/**
 * MY T1D STORY 🎙️
 * A child-friendly voice journal for Kids World.
 * Kids can record how their day went, play it back, and build a story library.
 * Designed for 4-year-olds — giant buttons, emoji-only prompts, celebration animations.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Alert,
} from "react-native";
import {
  useAudioRecorder, useAudioRecorderState,
  requestRecordingPermissionsAsync, setAudioModeAsync,
  RecordingPresets, createAudioPlayer,
} from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

const STORAGE_KEY = "@t1d_story_v1";

const haptic = (t: "light" | "success" | "heavy" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (t === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (t === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

interface StoryEntry {
  id: string;
  date: string;           // ISO date string
  uri: string;            // local file URI
  durationSec: number;
  mood: string;           // emoji
  bgLevel: string;        // "low" | "good" | "high"
  title: string;
}

const MOODS = [
  { emoji: "😄", label: "Happy" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "OK" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😴", label: "Tired" },
  { emoji: "💪", label: "Strong" },
];

const BG_LEVELS = [
  { key: "low", emoji: "⬇️", label: "Low", color: "#EF4444" },
  { key: "good", emoji: "✅", label: "Good", color: "#22C55E" },
  { key: "high", emoji: "⬆️", label: "High", color: "#F59E0B" },
];

const PROMPTS = [
  "How are you feeling today? 🌟",
  "What was the best part of your day? 🎉",
  "Did you check your blood sugar? 🩸",
  "What did you eat today? 🍎",
  "Did you play today? What did you do? 🎮",
  "Are you feeling brave today? 💪",
  "What made you smile today? 😊",
  "Tell me about your tummy — does it feel good? 🫶",
];

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function MyT1dStory() {
  const colors = useColors();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [stories, setStories] = useState<StoryEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>("😊");
  const [selectedBg, setSelectedBg] = useState<string>("good");
  const [recording, setRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [permGranted, setPermGranted] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [promptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  useEffect(() => {
    // Load saved stories
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) try { setStories(JSON.parse(raw)); } catch {}
    });
    // Request mic permission
    if (Platform.OS !== "web") {
      requestRecordingPermissionsAsync().then(({ granted }) => {
        setPermGranted(granted);
        if (granted) {
          setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        }
      });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playerRef.current) try { playerRef.current.remove(); } catch {}
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!permGranted) {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Microphone Needed", "Please allow microphone access so your child can record their story!", [{ text: "OK" }]);
        return;
      }
      setPermGranted(true);
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    }
    haptic("heavy");
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setRecording(true);
    setRecordingSec(0);
    timerRef.current = setInterval(() => setRecordingSec(s => s + 1), 1000);
  }, [permGranted, audioRecorder]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    haptic("success");
    await audioRecorder.stop();
    setRecording(false);
    const uri = audioRecorder.uri;
    if (!uri) return;
    const entry: StoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      uri,
      durationSec: recordingSec,
      mood: selectedMood,
      bgLevel: selectedBg,
      title: `My Story — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    };
    const updated = [entry, ...stories];
    setStories(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [audioRecorder, recordingSec, selectedMood, selectedBg, stories]);

  const playStory = useCallback(async (entry: StoryEntry) => {
    if (playingId === entry.id) {
      // Stop
      if (playerRef.current) { try { playerRef.current.remove(); } catch {} playerRef.current = null; }
      setPlayingId(null);
      return;
    }
    haptic();
    if (playerRef.current) { try { playerRef.current.remove(); } catch {} }
    const p = createAudioPlayer({ uri: entry.uri });
    playerRef.current = p;
    setPlayingId(entry.id);
    p.play();
    // Auto-stop after duration
    setTimeout(() => {
      try { p.remove(); } catch {}
      setPlayingId(null);
    }, (entry.durationSec + 2) * 1000);
  }, [playingId]);

  const deleteStory = useCallback(async (id: string) => {
    Alert.alert("Delete Story?", "This recording will be gone forever.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          haptic();
          const updated = stories.filter(s => s.id !== id);
          setStories(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  }, [stories]);

  const bgConfig = BG_LEVELS.find(b => b.key === selectedBg) || BG_LEVELS[1];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#1A0A3B" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={s.back} allowFontScaling={false}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={s.headerTitle} allowFontScaling={false}>🎙️ MY T1D STORY</Text>
          <Text style={s.headerSub} allowFontScaling={false}>Record your day! 🌟</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Today's Prompt */}
        <View style={[s.promptCard, { backgroundColor: "#1A0A3B", borderColor: "#FFD700" }]}>
          <Text style={s.promptEmoji}>💬</Text>
          <Text style={s.promptText} allowFontScaling={false}>{PROMPTS[promptIdx]}</Text>
        </View>

        {/* Mood Selector */}
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]} allowFontScaling={false}>How do you feel? 😊</Text>
          <View style={s.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.emoji}
                style={[s.moodBtn, selectedMood === m.emoji && s.moodBtnActive]}
                onPress={() => { haptic(); setSelectedMood(m.emoji); }}
                accessibilityLabel={m.label}
              >
                <Text style={{ fontSize: 32 }}>{m.emoji}</Text>
                <Text style={[s.moodLabel, { color: selectedMood === m.emoji ? "#FFD700" : colors.muted }]} allowFontScaling={false}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BG Level Selector */}
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]} allowFontScaling={false}>Blood sugar today? 🩸</Text>
          <View style={s.bgRow}>
            {BG_LEVELS.map(b => (
              <TouchableOpacity
                key={b.key}
                style={[s.bgBtn, { borderColor: selectedBg === b.key ? b.color : colors.border, backgroundColor: selectedBg === b.key ? b.color + "22" : "transparent" }]}
                onPress={() => { haptic(); setSelectedBg(b.key); }}
                accessibilityLabel={b.label}
              >
                <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                <Text style={[s.bgLabel, { color: selectedBg === b.key ? b.color : colors.muted }]} allowFontScaling={false}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Record Button */}
        {Platform.OS === "web" ? (
          <View style={[s.webNote, { backgroundColor: "#1E3A5F", borderColor: "#60A5FA" }]}>
            <Text style={s.webNoteText} allowFontScaling={false}>🎙️ Voice recording works on iOS and Android devices. Scan the QR code on the Home screen to use this feature on your phone!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.recordBtn, recording && s.recordBtnActive]}
            onPress={recording ? stopRecording : startRecording}
            accessibilityRole="button"
            accessibilityLabel={recording ? "Stop recording" : "Start recording"}
          >
            <Text style={{ fontSize: 56 }}>{recording ? "⏹️" : "🎙️"}</Text>
            <Text style={s.recordBtnTitle} allowFontScaling={false}>
              {recording ? `Recording... ${formatDuration(recordingSec)}` : "Tap to Record Your Story!"}
            </Text>
            <Text style={s.recordBtnSub} allowFontScaling={false}>
              {recording ? "Tap to stop and save 💾" : "Tell me about your day! 🌟"}
            </Text>
            {recording && (
              <View style={s.recordingDot} />
            )}
          </TouchableOpacity>
        )}

        {/* Stories Library */}
        {stories.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={[s.libraryTitle, { color: colors.foreground }]} allowFontScaling={false}>📚 My Story Library ({stories.length})</Text>
            {stories.map(entry => {
              const bgCfg = BG_LEVELS.find(b => b.key === entry.bgLevel) || BG_LEVELS[1];
              const isPlaying = playingId === entry.id;
              return (
                <View key={entry.id} style={[s.storyCard, { backgroundColor: colors.surface, borderColor: isPlaying ? "#FFD700" : colors.border }]}>
                  <View style={s.storyRow}>
                    <Text style={{ fontSize: 32 }}>{entry.mood}</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[s.storyTitle, { color: colors.foreground }]} allowFontScaling={false}>{entry.title}</Text>
                      <Text style={[s.storyMeta, { color: colors.muted }]} allowFontScaling={false}>
                        {formatDate(entry.date)} • {formatDuration(entry.durationSec)} • {bgCfg.emoji} {bgCfg.label} BG
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[s.playBtn, { backgroundColor: isPlaying ? "#EF4444" : "#FFD700" }]}
                      onPress={() => playStory(entry)}
                      accessibilityRole="button"
                      accessibilityLabel={isPlaying ? "Stop" : "Play"}
                    >
                      <Text style={s.playBtnText} allowFontScaling={false}>{isPlaying ? "⏹" : "▶"}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => deleteStory(entry.id)} accessibilityLabel="Delete story">
                    <Text style={s.deleteBtnText} allowFontScaling={false}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {stories.length === 0 && Platform.OS !== "web" && (
          <View style={[s.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 56, textAlign: "center" }}>🎙️</Text>
            <Text style={[s.emptyTitle, { color: colors.foreground }]} allowFontScaling={false}>No Stories Yet!</Text>
            <Text style={[s.emptySub, { color: colors.muted }]} allowFontScaling={false}>Tap the big button above to record your first story. Your library will grow every day! 🌟</Text>
          </View>
        )}

        {/* Encouragement */}
        <View style={[s.encourageCard, { backgroundColor: "#1A0A3B", borderColor: "#FFD700" }]}>
          <Text style={s.encourageText} allowFontScaling={false}>
            🦸 You are a T1D Warrior! Every day you check your blood sugar and take your insulin, you are SUPER BRAVE! 💙
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: "#fff", fontSize: 24, fontWeight: "900", minWidth: 44, minHeight: 44, textAlignVertical: "center" },
  headerTitle: { color: "#FFD700", fontSize: 14, fontWeight: "900" },
  headerSub: { color: "#9BA1A6", fontSize: 11, marginTop: 2 },
  scroll: { padding: 16 },
  promptCard: { borderRadius: 20, borderWidth: 2, padding: 20, marginBottom: 16, alignItems: "center" },
  promptEmoji: { fontSize: 36, marginBottom: 8 },
  promptText: { color: "#FFD700", fontSize: 18, fontWeight: "800", textAlign: "center", lineHeight: 26 },
  section: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 12 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  moodBtn: { alignItems: "center", padding: 10, borderRadius: 14, borderWidth: 2, borderColor: "transparent", minWidth: 64 },
  moodBtnActive: { borderColor: "#FFD700", backgroundColor: "#FFD70022" },
  moodLabel: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  bgRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  bgBtn: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 2 },
  bgLabel: { fontSize: 13, fontWeight: "800", marginTop: 6 },
  recordBtn: { backgroundColor: "#1A0A3B", borderRadius: 24, borderWidth: 3, borderColor: "#FFD700", padding: 28, alignItems: "center", marginBottom: 16 },
  recordBtnActive: { backgroundColor: "#7F1D1D", borderColor: "#EF4444" },
  recordBtnTitle: { color: "#FFD700", fontSize: 20, fontWeight: "900", marginTop: 10, textAlign: "center" },
  recordBtnSub: { color: "#9BA1A6", fontSize: 13, marginTop: 6, textAlign: "center" },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#EF4444", marginTop: 10 },
  webNote: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  webNoteText: { color: "#93C5FD", fontSize: 14, lineHeight: 22, textAlign: "center" },
  libraryTitle: { fontSize: 16, fontWeight: "900", marginBottom: 12 },
  storyCard: { borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  storyRow: { flexDirection: "row", alignItems: "center" },
  storyTitle: { fontSize: 14, fontWeight: "800" },
  storyMeta: { fontSize: 12, marginTop: 3 },
  playBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  playBtnText: { fontSize: 18, fontWeight: "900", color: "#000" },
  deleteBtn: { borderTopWidth: 1, borderTopColor: "#374151", marginTop: 10, paddingTop: 8, alignItems: "center" },
  deleteBtnText: { color: "#EF4444", fontSize: 12, fontWeight: "600" },
  emptyState: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  encourageCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 8 },
  encourageText: { color: "#FFD700", fontSize: 15, fontWeight: "700", textAlign: "center", lineHeight: 24 },
});
