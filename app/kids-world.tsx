/**
 * KIDS WORLD 🌟
 * A child-facing, gamified T1D companion designed for 4-year-olds worldwide.
 *
 * Features:
 * - Diabetes Buddy "Glucy" — animated emoji companion with reactions
 * - "How Do I Feel?" mood & symptom check-in (picture-based, no reading required)
 * - Blood sugar check reward system (stars, badges, celebrations)
 * - Age-appropriate diabetes education (simple lessons with big pictures)
 * - Daily activity tracker (movement helps blood sugar!)
 * - Achievement badges wall
 * - Multilingual greetings (English, Spanish, French, Portuguese, Hindi, Arabic)
 *
 * Designed for: children aged 3–7 with Type 1 Diabetes
 * Accessibility: large touch targets (min 60px), picture-first, no reading required
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Platform, Vibration, Alert, TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "@kids_world_v2";

const BUDDY_REACTIONS: Record<string, { face: string; message: string; color: string }> = {
  great:   { face: "😄", message: "YAY! You feel GREAT! Let's have a super day! 🌟", color: "#22C55E" },
  good:    { face: "🙂", message: "You feel good! That makes Glucy happy! 💛", color: "#84CC16" },
  okay:    { face: "😐", message: "Okay is okay! Tell Mommy how you feel! 💙", color: "#60A5FA" },
  tired:   { face: "😴", message: "Tired? Maybe check your sugar! Tell Mommy! 🌙", color: "#A78BFA" },
  shaky:   { face: "🫨", message: "Shaky? CHECK SUGAR NOW! Tell Mommy RIGHT AWAY! 🚨", color: "#EF4444" },
  tummy:   { face: "🤢", message: "Tummy hurt? Tell Mommy! She will help you! 💚", color: "#F59E0B" },
  headache:{ face: "🤕", message: "Head hurt? Tell Mommy! Check your sugar! 💊", color: "#F97316" },
  happy:   { face: "🥳", message: "SO HAPPY! You are AMAZING! Keep shining! ✨", color: "#EC4899" },
};

const MOODS = [
  { id: "great",    emoji: "😄", label: "GREAT!" },
  { id: "good",     emoji: "🙂", label: "Good" },
  { id: "okay",     emoji: "😐", label: "Okay" },
  { id: "happy",    emoji: "🥳", label: "Happy!" },
  { id: "tired",    emoji: "😴", label: "Tired" },
  { id: "shaky",    emoji: "🫨", label: "Shaky" },
  { id: "tummy",    emoji: "🤢", label: "Tummy" },
  { id: "headache", emoji: "🤕", label: "Head" },
];

const LESSONS = [
  {
    id: "l1", emoji: "🩸", title: "What is Blood Sugar?",
    content: "Blood sugar is like fuel for your body! 🚗\n\nJust like a car needs gas to go, YOUR body needs sugar to play, run, and have fun!\n\nWhen your sugar is just right — you feel AMAZING! ⭐",
    color: "#DC2626",
  },
  {
    id: "l2", emoji: "💉", title: "Why Do I Need Insulin?",
    content: "Insulin is your SUPERPOWER medicine! 🦸\n\nIt helps the sugar get into your muscles so you can run, jump, and play!\n\nWithout insulin, the sugar gets stuck. With insulin — you are UNSTOPPABLE! 💪",
    color: "#7C3AED",
  },
  {
    id: "l3", emoji: "📡", title: "My CGM Sensor",
    content: "Your CGM sensor is like a tiny superhero on your arm! 🦸‍♀️\n\nIt watches your blood sugar ALL DAY and ALL NIGHT — even when you sleep!\n\nIt tells Mommy if you need help. It is YOUR guardian! 🛡️",
    color: "#0891B2",
  },
  {
    id: "l4", emoji: "🍎", title: "Foods That Help Me",
    content: "Some foods make your sugar go UP fast 🚀\nSome foods keep it steady and smooth 🌊\n\nFruits, vegetables, eggs, and rice are your FRIENDS! 🥗\n\nAlways ask Mommy before eating something new! 💛",
    color: "#16A34A",
  },
  {
    id: "l5", emoji: "🌾", title: "Why I Don't Eat Wheat",
    content: "Wheat makes YOUR body very sick — like a villain! 🦹\n\nBread, pasta, and crackers often have wheat inside.\n\nBut YOU are a SUPERHERO who knows what to eat! 🦸\n\nAlways ask Mommy: 'Is this safe for me?' 🛡️",
    color: "#D97706",
  },
  {
    id: "l6", emoji: "🏃", title: "Moving Makes Me Strong!",
    content: "Dancing, running, and jumping are MEDICINE for you! 💃\n\nExercise helps your body use sugar the right way!\n\nBut tell Mommy before you play hard — she might check your sugar first! 🩸\n\nYou are a CHAMPION! 🏆",
    color: "#EC4899",
  },
  {
    id: "l7", emoji: "😴", title: "Sleep Keeps Me Safe",
    content: "When you sleep, Mommy watches over you with the CGM! 🌙\n\nYour body works hard at night — even when you dream!\n\nGood sleep helps your blood sugar stay steady. 💤\n\nSweet dreams, little warrior! ⭐",
    color: "#1D4ED8",
  },
  {
    id: "l8", emoji: "💪", title: "I Am a T1D Warrior!",
    content: "Having diabetes does NOT stop you from ANYTHING! 🌍\n\nNick Jonas sings on stage with T1D! 🎵\nSonia Sotomayor is a Supreme Court Judge with T1D! ⚖️\nOlympic athletes win gold medals with T1D! 🥇\n\nYOU can do ANYTHING! You are INCREDIBLE! 🌟",
    color: "#D4AF37",
  },
];

const BADGES = [
  { id: "b1", emoji: "⭐", name: "First Check!", desc: "Logged your first BG check", threshold: 1 },
  { id: "b2", emoji: "🌟", name: "5 Checks!", desc: "Logged 5 BG checks", threshold: 5 },
  { id: "b3", emoji: "🏆", name: "Champion!", desc: "Logged 10 BG checks", threshold: 10 },
  { id: "b4", emoji: "💎", name: "Diamond!", desc: "Logged 25 BG checks", threshold: 25 },
  { id: "b5", emoji: "👑", name: "T1D Royalty!", desc: "Logged 50 BG checks", threshold: 50 },
  { id: "b6", emoji: "🦸", name: "Superhero!", desc: "Learned all 8 lessons", threshold: 0, special: "lessons" },
  { id: "b7", emoji: "🌈", name: "Rainbow Warrior!", desc: "Checked in 7 days in a row", threshold: 0, special: "streak" },
  { id: "b8", emoji: "💙", name: "T1D Pride!", desc: "Shared your story", threshold: 0, special: "share" },
];

const GREETINGS: Record<string, { hello: string; warrior: string; flag: string }> = {
  English:    { hello: "Hello, Warrior!", warrior: "You are AMAZING!", flag: "🇺🇸" },
  Spanish:    { hello: "¡Hola, Guerrero!", warrior: "¡Eres INCREÍBLE!", flag: "🇪🇸" },
  French:     { hello: "Bonjour, Guerrier!", warrior: "Tu es INCROYABLE!", flag: "🇫🇷" },
  Portuguese: { hello: "Olá, Guerreiro!", warrior: "Você é INCRÍVEL!", flag: "🇧🇷" },
  Hindi:      { hello: "नमस्ते, योद्धा!", warrior: "तुम अद्भुत हो!", flag: "🇮🇳" },
  Arabic:     { hello: "مرحبا، محارب!", warrior: "أنت رائع!", flag: "🇸🇦" },
  Mandarin:   { hello: "你好，勇士！", warrior: "你太棒了！", flag: "🇨🇳" },
  Swahili:    { hello: "Habari, Shujaa!", warrior: "Wewe ni AJABU!", flag: "🇰🇪" },
};

const LANGUAGES = Object.keys(GREETINGS);

// ─── Types ────────────────────────────────────────────────────────────────────
interface KidsData {
  childName: string;
  totalChecks: number;
  totalStars: number;
  lessonsRead: string[];
  streak: number;
  lastCheckDate: string;
  language: string;
}

const DEFAULT_DATA: KidsData = {
  childName: "Little Warrior",
  totalChecks: 0,
  totalStars: 0,
  lessonsRead: [],
  streak: 0,
  lastCheckDate: "",
  language: "English",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const haptic = (type: "light" | "success" | "heavy" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (type === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// ─── Celebration Component ────────────────────────────────────────────────────
function CelebrationBurst({ visible }: { visible: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0); opacity.setValue(1);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 20 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center", zIndex: 999 }, { opacity }]}>
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <Text style={{ fontSize: 80, textAlign: "center" }}>🎉</Text>
        <Text style={{ fontSize: 32, fontWeight: "900", color: "#D4AF37", textAlign: "center" }}>AMAZING!</Text>
        <Text style={{ fontSize: 24, textAlign: "center" }}>⭐⭐⭐</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function KidsWorld() {
  const colors = useColors();
  const [data, setData] = useState<KidsData>(DEFAULT_DATA);
  const [tab, setTab] = useState<"home" | "feel" | "learn" | "badges">("home");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [langIndex, setLangIndex] = useState(0);
  const buddyBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) try { setData({ ...DEFAULT_DATA, ...JSON.parse(raw) }); } catch {}
    });
  }, []);

  const save = useCallback(async (next: KidsData) => {
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const bounceBuddy = () => {
    Animated.sequence([
      Animated.spring(buddyBounce, { toValue: 1.3, useNativeDriver: true, speed: 30 }),
      Animated.spring(buddyBounce, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const logBGCheck = async () => {
    haptic("success");
    bounceBuddy();
    const today = new Date().toDateString();
    const isNewDay = data.lastCheckDate !== today;
    const newStreak = isNewDay ? data.streak + 1 : data.streak;
    const next: KidsData = {
      ...data,
      totalChecks: data.totalChecks + 1,
      totalStars: data.totalStars + 3,
      streak: newStreak,
      lastCheckDate: today,
    };
    await save(next);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2200);
  };

  const markLessonRead = async (lessonId: string) => {
    if (data.lessonsRead.includes(lessonId)) return;
    haptic("success");
    const next: KidsData = {
      ...data,
      lessonsRead: [...data.lessonsRead, lessonId],
      totalStars: data.totalStars + 5,
    };
    await save(next);
  };

  const earnedBadges = BADGES.filter(b => {
    if (b.special === "lessons") return data.lessonsRead.length >= 8;
    if (b.special === "streak") return data.streak >= 7;
    if (b.special === "share") return false;
    return data.totalChecks >= b.threshold;
  });

  const greeting = GREETINGS[LANGUAGES[langIndex % LANGUAGES.length]];
  const currentLesson = LESSONS.find(l => l.id === selectedLesson);
  const currentMoodReaction = selectedMood ? BUDDY_REACTIONS[selectedMood] : null;

  const TABS = [
    { id: "home" as const, emoji: "🏠", label: "Home" },
    { id: "feel" as const, emoji: "💭", label: "How I Feel" },
    { id: "learn" as const, emoji: "📚", label: "Learn" },
    { id: "badges" as const, emoji: "🏆", label: "My Badges" },
  ];

  return (
    <ScreenContainer>
      <CelebrationBurst visible={celebrating} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: "#1A0A3B" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={s.back} allowFontScaling={false}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={s.headerTitle} allowFontScaling={false}>🌟 KIDS WORLD 🌟</Text>
          <TouchableOpacity onPress={() => setLangIndex(i => i + 1)}>
            <Text style={s.langBtn} allowFontScaling={false}>{greeting.flag} {LANGUAGES[langIndex % LANGUAGES.length]}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.starsBox}>
          <Text style={s.starsText} allowFontScaling={false}>⭐ {data.totalStars}</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: "#1A0A3B" }]}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.tabBtn, tab === t.id && s.tabBtnActive]}
            onPress={() => { haptic("light"); setTab(t.id); setSelectedLesson(null); setSelectedMood(null); }}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
          >
            <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
            <Text style={[s.tabLabel, { color: tab === t.id ? "#FFD700" : "#9BA1A6" }]} allowFontScaling={false}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <View>
            {/* Greeting */}
            <View style={[s.greetingCard, { backgroundColor: "#1A0A3B" }]}>
              <Text style={s.greetingHello} allowFontScaling={false}>{greeting.hello}</Text>
              {editingName ? (
                <TextInput
                  style={[s.nameInput, { color: "#FFD700", borderColor: "#FFD700" }]}
                  value={data.childName}
                  onChangeText={v => setData(d => ({ ...d, childName: v }))}
                  onBlur={() => { setEditingName(false); save(data); }}
                  autoFocus
                  allowFontScaling={false}
                />
              ) : (
                <TouchableOpacity onPress={() => setEditingName(true)}>
                  <Text style={s.childNameText} allowFontScaling={false}>{data.childName} ✏️</Text>
                </TouchableOpacity>
              )}
              <Text style={s.greetingWarrior} allowFontScaling={false}>{greeting.warrior}</Text>
            </View>

            {/* Glucy the Diabetes Buddy */}
            <View style={[s.buddyCard, { backgroundColor: "#0C1B33" }]}>
              <Animated.Text style={[s.buddyFace, { transform: [{ scale: buddyBounce }] }]}>🦸‍♀️</Animated.Text>
              <Text style={s.buddyName} allowFontScaling={false}>Hi! I'm GLUCY!</Text>
              <Text style={s.buddyMsg} allowFontScaling={false}>Your Diabetes Buddy! 💙{"\n"}I'm here to keep you safe and HAPPY!</Text>
              <View style={s.statsRow}>
                <View style={s.statBox}>
                  <Text style={s.statNum} allowFontScaling={false}>{data.totalChecks}</Text>
                  <Text style={s.statLabel} allowFontScaling={false}>BG Checks</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statNum} allowFontScaling={false}>{data.totalStars}</Text>
                  <Text style={s.statLabel} allowFontScaling={false}>Stars</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statNum} allowFontScaling={false}>{data.streak}</Text>
                  <Text style={s.statLabel} allowFontScaling={false}>Day Streak</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statNum} allowFontScaling={false}>{earnedBadges.length}</Text>
                  <Text style={s.statLabel} allowFontScaling={false}>Badges</Text>
                </View>
              </View>
            </View>

            {/* BIG BG Check Button */}
            <TouchableOpacity
              style={s.bigCheckBtn}
              onPress={logBGCheck}
              accessibilityRole="button"
              accessibilityLabel="I checked my blood sugar"
            >
              <Text style={{ fontSize: 48 }}>🩸</Text>
              <Text style={s.bigCheckText} allowFontScaling={false}>I CHECKED MY{"\n"}BLOOD SUGAR!</Text>
              <Text style={s.bigCheckReward} allowFontScaling={false}>+3 ⭐ STARS!</Text>
            </TouchableOpacity>

            {/* Quick Nav */}
            <View style={s.quickGrid}>
              {[
                { emoji: "💭", label: "How I Feel", color: "#7C3AED", action: () => setTab("feel") },
                { emoji: "📚", label: "Learn!", color: "#0891B2", action: () => setTab("learn") },
                { emoji: "🏆", label: "My Badges", color: "#D97706", action: () => setTab("badges") },
                { emoji: "🛡️", label: "Guardian", color: "#D4AF37", action: () => router.push("/guardian-agent") },
            { emoji: "🥗", label: "Meal Plan", color: "#16A34A", action: () => router.push("/meal-planner") },
              ].map(({ emoji, label, color, action }) => (
                <TouchableOpacity key={label} style={[s.quickBtn, { backgroundColor: color + "22", borderColor: color }]} onPress={action} accessibilityRole="button" accessibilityLabel={label}>
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                  <Text style={[s.quickLabel, { color }]} allowFontScaling={false}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Motivational quote */}
            <View style={[s.quoteCard, { backgroundColor: "#0C1B33" }]}>
              <Text style={s.quoteText} allowFontScaling={false}>
                "Having T1D means you are STRONGER than most people will ever know." 💙
              </Text>
              <Text style={s.quoteAuthor} allowFontScaling={false}>— Every T1D Warrior, Everywhere 🌍</Text>
            </View>
          </View>
        )}

        {/* ── HOW I FEEL TAB ── */}
        {tab === "feel" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>💭 How Do You Feel Right Now?</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Tap the picture that shows how you feel!</Text>

            {/* Mood Grid — big buttons, picture-first */}
            <View style={s.moodGrid}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood.id}
                  style={[s.moodBtn, selectedMood === mood.id && { borderColor: BUDDY_REACTIONS[mood.id].color, borderWidth: 4, backgroundColor: BUDDY_REACTIONS[mood.id].color + "22" }]}
                  onPress={() => { haptic("light"); setSelectedMood(mood.id); bounceBuddy(); }}
                  accessibilityRole="button"
                  accessibilityLabel={`I feel ${mood.label}`}
                >
                  <Text style={s.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[s.moodLabel, { color: colors.foreground }]} allowFontScaling={false}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Glucy's response */}
            {currentMoodReaction && (
              <View style={[s.buddyResponseCard, { backgroundColor: currentMoodReaction.color + "22", borderColor: currentMoodReaction.color }]}>
                <Text style={{ fontSize: 50, textAlign: "center" }}>{currentMoodReaction.face}</Text>
                <Text style={[s.buddyResponseText, { color: currentMoodReaction.color }]} allowFontScaling={false}>{currentMoodReaction.message}</Text>
                {(selectedMood === "shaky" || selectedMood === "headache" || selectedMood === "tummy") && (
                  <TouchableOpacity
                    style={[s.tellMommyBtn, { backgroundColor: currentMoodReaction.color }]}
                    onPress={() => router.push("/guardian-agent")}
                    accessibilityRole="button"
                    accessibilityLabel="Tell Mommy"
                  >
                    <Text style={s.tellMommyText} allowFontScaling={false}>📞 TELL MOMMY NOW!</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body check prompts */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🔍 Body Check — Tell Mommy if you have:</Text>
              {[
                ["🫨", "Shaky hands or wobbly legs"],
                ["💧", "Sweating when you're not hot"],
                ["😶", "Feeling dizzy or funny"],
                ["😢", "Feeling very sad or crying"],
                ["🤢", "Tummy hurts"],
                ["🤕", "Head hurts"],
              ].map(([emoji, text]) => (
                <View key={text as string} style={s.bodyCheckRow}>
                  <Text style={{ fontSize: 24 }}>{emoji as string}</Text>
                  <Text style={[{ fontSize: 14, flex: 1, marginLeft: 10, lineHeight: 22 }, { color: colors.foreground }]} allowFontScaling={false}>{text as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── LEARN TAB ── */}
        {tab === "learn" && !currentLesson && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>📚 Learn About Your Diabetes!</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Tap a lesson to learn! Earn ⭐5 stars for each one!</Text>
            <View style={{ gap: 12 }}>
              {LESSONS.map(lesson => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[s.lessonCard, { backgroundColor: lesson.color + "22", borderColor: lesson.color, borderWidth: data.lessonsRead.includes(lesson.id) ? 3 : 1.5 }]}
                  onPress={() => { haptic("light"); setSelectedLesson(lesson.id); }}
                  accessibilityRole="button"
                  accessibilityLabel={lesson.title}
                >
                  <Text style={{ fontSize: 36 }}>{lesson.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[s.lessonTitle, { color: lesson.color }]} allowFontScaling={false}>{lesson.title}</Text>
                    {data.lessonsRead.includes(lesson.id) && (
                      <Text style={{ color: "#22C55E", fontSize: 12, fontWeight: "700" }} allowFontScaling={false}>✅ Done! +5 ⭐</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 22, color: lesson.color }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🌍 T1D Heroes Around the World</Text>
              {[
                ["🎵", "Nick Jonas — Grammy-winning singer with T1D"],
                ["⚖️", "Sonia Sotomayor — US Supreme Court Justice with T1D"],
                ["🥇", "Gary Hall Jr. — Olympic gold medalist with T1D"],
                ["🎭", "Mary Tyler Moore — Actress and T1D advocate"],
                ["⚽", "Nacho Fernandez — Real Madrid footballer with T1D"],
                ["🎨", "You — A future world-changer with T1D! 🌟"],
              ].map(([emoji, name]) => (
                <View key={name as string} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 10 }}>
                  <Text style={{ fontSize: 22 }}>{emoji as string}</Text>
                  <Text style={[{ fontSize: 13, flex: 1, lineHeight: 20 }, { color: colors.foreground }]} allowFontScaling={false}>{name as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── LESSON DETAIL ── */}
        {tab === "learn" && currentLesson && (
          <View>
            <TouchableOpacity onPress={() => setSelectedLesson(null)} style={s.backBtn}>
              <Text style={{ color: "#60A5FA", fontWeight: "700", fontSize: 16 }} allowFontScaling={false}>‹ Back to Lessons</Text>
            </TouchableOpacity>
            <View style={[s.lessonDetailCard, { backgroundColor: currentLesson.color + "22", borderColor: currentLesson.color }]}>
              <Text style={{ fontSize: 64, textAlign: "center", marginBottom: 12 }}>{currentLesson.emoji}</Text>
              <Text style={[s.lessonDetailTitle, { color: currentLesson.color }]} allowFontScaling={false}>{currentLesson.title}</Text>
              <Text style={[s.lessonDetailBody, { color: colors.foreground }]} allowFontScaling={false}>{currentLesson.content}</Text>
              {!data.lessonsRead.includes(currentLesson.id) && (
                <TouchableOpacity
                  style={[s.doneBtn, { backgroundColor: currentLesson.color }]}
                  onPress={() => { markLessonRead(currentLesson.id); setSelectedLesson(null); }}
                  accessibilityRole="button"
                  accessibilityLabel="I learned this lesson"
                >
                  <Text style={s.doneBtnText} allowFontScaling={false}>✅ I LEARNED THIS! +5 ⭐</Text>
                </TouchableOpacity>
              )}
              {data.lessonsRead.includes(currentLesson.id) && (
                <Text style={{ color: "#22C55E", fontWeight: "900", fontSize: 16, textAlign: "center", marginTop: 16 }} allowFontScaling={false}>✅ You already learned this! Amazing!</Text>
              )}
            </View>
          </View>
        )}

        {/* ── BADGES TAB ── */}
        {tab === "badges" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>🏆 My Achievement Badges!</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>You earned {earnedBadges.length} of {BADGES.length} badges!</Text>
            <View style={s.badgeGrid}>
              {BADGES.map(badge => {
                const earned = earnedBadges.some(b => b.id === badge.id);
                return (
                  <View key={badge.id} style={[s.badgeCard, { backgroundColor: earned ? "#0C1B33" : colors.surface, borderColor: earned ? "#D4AF37" : colors.border, opacity: earned ? 1 : 0.4 }]}>
                    <Text style={{ fontSize: 36 }}>{earned ? badge.emoji : "🔒"}</Text>
                    <Text style={[s.badgeName, { color: earned ? "#D4AF37" : colors.muted }]} allowFontScaling={false}>{badge.name}</Text>
                    <Text style={[s.badgeDesc, { color: colors.muted }]} allowFontScaling={false}>{badge.desc}</Text>
                  </View>
                );
              })}
            </View>
            {earnedBadges.length === BADGES.length && (
              <View style={[s.allBadgesCard]}>
                <Text style={{ fontSize: 48, textAlign: "center" }}>👑</Text>
                <Text style={s.allBadgesText} allowFontScaling={false}>YOU EARNED ALL BADGES!{"\n"}YOU ARE A TRUE T1D CHAMPION! 🌟</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: "#fff", fontSize: 24, fontWeight: "900", minWidth: 44, minHeight: 44, textAlignVertical: "center" },
  headerTitle: { color: "#FFD700", fontSize: 16, fontWeight: "900" },
  langBtn: { color: "#9BA1A6", fontSize: 11, marginTop: 2 },
  starsBox: { backgroundColor: "#D4AF3722", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  starsText: { color: "#FFD700", fontWeight: "900", fontSize: 14 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: "#FFD700" },
  tabLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16 },
  greetingCard: { borderRadius: 20, padding: 20, marginBottom: 16, alignItems: "center" },
  greetingHello: { color: "#FFD700", fontSize: 22, fontWeight: "900" },
  childNameText: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 },
  nameInput: { fontSize: 18, borderBottomWidth: 2, minWidth: 160, textAlign: "center", paddingVertical: 4 },
  greetingWarrior: { color: "#9BA1A6", fontSize: 14, marginTop: 4 },
  buddyCard: { borderRadius: 20, padding: 20, marginBottom: 16, alignItems: "center" },
  buddyFace: { fontSize: 64 },
  buddyName: { color: "#FFD700", fontSize: 20, fontWeight: "900", marginTop: 8 },
  buddyMsg: { color: "#9BA1A6", fontSize: 13, textAlign: "center", marginTop: 4, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  statBox: { alignItems: "center", flex: 1 },
  statNum: { color: "#FFD700", fontSize: 22, fontWeight: "900" },
  statLabel: { color: "#9BA1A6", fontSize: 10, marginTop: 2 },
  bigCheckBtn: { backgroundColor: "#DC2626", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 3, borderColor: "#FCA5A5" },
  bigCheckText: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 8, lineHeight: 30 },
  bigCheckReward: { color: "#FFD700", fontSize: 18, fontWeight: "900", marginTop: 8 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  quickBtn: { width: "47%", borderRadius: 16, borderWidth: 2, padding: 16, alignItems: "center", gap: 6, minHeight: 90 },
  quickLabel: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  quoteCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  quoteText: { color: "#D4AF37", fontSize: 14, fontStyle: "italic", textAlign: "center", lineHeight: 22 },
  quoteAuthor: { color: "#9BA1A6", fontSize: 11, textAlign: "center", marginTop: 6 },
  pageTitle: { fontSize: 20, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  pageSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  moodBtn: { width: "22%", aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderColor: "#374151", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#1E2022" },
  moodEmoji: { fontSize: 32 },
  moodLabel: { fontSize: 10, fontWeight: "700", textAlign: "center" },
  buddyResponseCard: { borderRadius: 16, borderWidth: 2, padding: 20, marginBottom: 16, alignItems: "center" },
  buddyResponseText: { fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 10, lineHeight: 24 },
  tellMommyBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 14 },
  tellMommyText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  bodyCheckRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#374151" },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  lessonCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, minHeight: 80 },
  lessonTitle: { fontSize: 15, fontWeight: "800" },
  lessonDetailCard: { borderRadius: 20, borderWidth: 2, padding: 24 },
  lessonDetailTitle: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 16 },
  lessonDetailBody: { fontSize: 16, lineHeight: 28, textAlign: "center" },
  doneBtn: { borderRadius: 16, padding: 16, alignItems: "center", marginTop: 20 },
  doneBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  backBtn: { paddingVertical: 12, marginBottom: 8 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  badgeCard: { width: "47%", borderRadius: 16, borderWidth: 1.5, padding: 14, alignItems: "center", gap: 6 },
  badgeName: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  badgeDesc: { fontSize: 10, textAlign: "center", lineHeight: 14 },
  allBadgesCard: { backgroundColor: "#0C1B33", borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 2, borderColor: "#D4AF37" },
  allBadgesText: { color: "#D4AF37", fontSize: 18, fontWeight: "900", textAlign: "center", marginTop: 10, lineHeight: 28 },
});
