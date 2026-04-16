/**
 * JACS Health Companion — Smart First-Run Setup Wizard
 *
 * Branching onboarding flow:
 *   Step 0: Welcome
 *   Step 1: Primary goal (Diabetes · General Health · Hospice Care · Caregiver)
 *   Step 2a [Diabetes]: T1D or T2D?
 *   Step 2b [General]: What to monitor?
 *   Step 2c [Hospice]: Role
 *   Step 2d [Caregiver]: Straight to profile
 *   Step 3: Name + language
 *   Step 4: Benefits discovery — ALL platform features shown to EVERY user
 *
 * Saves to AsyncStorage:
 *   @jacs_setup_complete  = "true"
 *   @jacs_user_profile    = JSON
 */
import React, { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Dimensions, Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";

const { width: _W } = Dimensions.get("window");

export type PrimaryGoal = "diabetes" | "general" | "hospice" | "caregiver";
export type DiabetesType = "type1" | "type2" | "both" | "prediabetes";
export type GeneralGoal = "weight" | "heart" | "sleep" | "nutrition" | "fitness" | "mental" | "medication" | "bloodpressure";

export interface JacsUserProfile {
  primaryGoal: PrimaryGoal;
  diabetesType?: DiabetesType;
  generalGoals?: GeneralGoal[];
  hospiceRole?: string;
  name: string;
  language: string;
  setupComplete: boolean;
  setupDate: string;
}

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "es", label: "Español" },
  { code: "fr", label: "Français" }, { code: "pt", label: "Português" },
  { code: "ht", label: "Kreyòl" },  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" }, { code: "hi", label: "हिन्दी" },
];

const PRIMARY_GOALS: { id: PrimaryGoal; emoji: string; title: string; desc: string; color: string }[] = [
  { id: "diabetes",  emoji: "🩸", title: "Diabetes Management",  desc: "I manage Type 1 or Type 2 diabetes",       color: "#F87171" },
  { id: "general",   emoji: "💚", title: "General Health",        desc: "I want to monitor my overall wellness",     color: "#4ADE80" },
  { id: "hospice",   emoji: "🏥", title: "Hospice / Palliative",  desc: "I am a hospice patient or care recipient",  color: "#FB923C" },
  { id: "caregiver", emoji: "👩‍⚕️", title: "Caregiver / Provider", desc: "I care for someone else using this app",    color: "#A78BFA" },
];

const DIABETES_TYPES: { id: DiabetesType; emoji: string; title: string; desc: string; color: string }[] = [
  { id: "type1",       emoji: "🩸", title: "Type 1 Diabetes",  desc: "Autoimmune, insulin-dependent",              color: "#F87171" },
  { id: "type2",       emoji: "🍊", title: "Type 2 Diabetes",  desc: "Insulin resistance, lifestyle-related",       color: "#FF9F43" },
  { id: "both",        emoji: "🔄", title: "Both / Dual",      desc: "Managing T1D and T2D in the household",       color: "#FBBF24" },
  { id: "prediabetes", emoji: "⚠️", title: "Pre-Diabetes",     desc: "At-risk, monitoring blood sugar",             color: "#34D399" },
];

const GENERAL_GOALS: { id: GeneralGoal; emoji: string; title: string; color: string }[] = [
  { id: "weight",        emoji: "⚖️",  title: "Weight Management",    color: "#38BDF8" },
  { id: "heart",         emoji: "❤️",  title: "Heart Health",         color: "#F87171" },
  { id: "sleep",         emoji: "😴",  title: "Sleep Quality",        color: "#A78BFA" },
  { id: "nutrition",     emoji: "🥗",  title: "Nutrition Tracking",   color: "#4ADE80" },
  { id: "fitness",       emoji: "🏃",  title: "Fitness & Activity",   color: "#FBBF24" },
  { id: "mental",        emoji: "🧘",  title: "Mental Wellness",      color: "#34D399" },
  { id: "medication",    emoji: "💊",  title: "Medication Reminders", color: "#F472B6" },
  { id: "bloodpressure", emoji: "🩺",  title: "Blood Pressure",       color: "#FB923C" },
];

const HOSPICE_ROLES = [
  { id: "patient",   emoji: "🛏️",  title: "Patient",               desc: "I am receiving hospice or palliative care",   color: "#FB923C" },
  { id: "family",    emoji: "👨‍👩‍👧", title: "Family Caregiver",      desc: "I care for a loved one at home",              color: "#FBBF24" },
  { id: "nurse",     emoji: "👩‍⚕️", title: "Nurse / Care Provider",  desc: "I am a professional hospice care provider",   color: "#A78BFA" },
  { id: "admin",     emoji: "🏥",  title: "Hospice Administrator",  desc: "I manage a hospice program or facility",      color: "#38BDF8" },
];

const ALL_BENEFITS = [
  { emoji: "🩸", title: "Type 1 Diabetes Portal",   desc: "CGM integration, insulin logging, hypo alerts, school nurse tools",        color: "#F87171" },
  { emoji: "🍊", title: "Type 2 Diabetes Portal",   desc: "A1C tracking, oral meds, lifestyle coaching, ADA 2024 guidelines",         color: "#FF9F43" },
  { emoji: "💚", title: "General Health Dashboard", desc: "Vitals, nutrition, sleep, fitness, mood — all in one place",               color: "#4ADE80" },
  { emoji: "🏥", title: "Hospice Care Suite",       desc: "Comfort care plans, symptom management, family coordination tools",        color: "#FB923C" },
  { emoji: "💊", title: "Smart Medication Manager", desc: "Due-today badge, reminders, cost comparison, scan-to-log",                 color: "#F472B6" },
  { emoji: "📡", title: "Wearable & CGM Sync",      desc: "Dexcom, Libre, Apple Watch, Fitbit — real-time data on your dashboard",    color: "#38BDF8" },
  { emoji: "👩‍⚕️", title: "Care Team Hub",          desc: "Share reports with doctors, nurses, and family caregivers instantly",      color: "#A78BFA" },
  { emoji: "🚨", title: "Emergency Mode",           desc: "One-tap 911, medical ID card, hypo first-aid, DKA warning signs",          color: "#EF4444" },
  { emoji: "📊", title: "AI Health Reports",        desc: "Auto-generated PDF reports for your healthcare provider visits",           color: "#FBBF24" },
  { emoji: "🌐", title: "Public Web Portal",        desc: "Access JACS from any browser — share with family and providers",           color: "#67E8F9" },
];

function doHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / (total - 1)) * 100);
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 }}>
      <View style={{ height: 4, backgroundColor: "#1e3a5f", borderRadius: 2 }}>
        <View style={{ height: 4, width: `${pct}%` as any, backgroundColor: "#38BDF8", borderRadius: 2 }} />
      </View>
      <Text style={{ color: "#687076", fontSize: 11, marginTop: 4, textAlign: "right" }}>
        Step {current} of {total - 1}
      </Text>
    </View>
  );
}

export default function SetupWizardScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [diabetesType, setDiabetesType] = useState<DiabetesType | null>(null);
  const [generalGoals, setGeneralGoals] = useState<GeneralGoal[]>([]);
  const [hospiceRole, setHospiceRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");

  const TOTAL = 5; // steps 0–4

  const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: false });
  const goNext = () => { doHaptic(); setStep((s) => s + 1); scrollTop(); };
  const goBack = () => { doHaptic(); setStep((s) => Math.max(0, s - 1)); scrollTop(); };
  const toggleGoal = (g: GeneralGoal) => {
    doHaptic();
    setGeneralGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const handleComplete = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const profile: JacsUserProfile = {
      primaryGoal: primaryGoal!,
      diabetesType: primaryGoal === "diabetes" ? (diabetesType ?? undefined) : undefined,
      generalGoals: primaryGoal === "general" ? generalGoals : undefined,
      hospiceRole: primaryGoal === "hospice" ? (hospiceRole ?? undefined) : undefined,
      name: name.trim() || "Friend",
      language,
      setupComplete: true,
      setupDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem("@jacs_user_profile", JSON.stringify(profile));
    await AsyncStorage.setItem("@jacs_setup_complete", "true");
    router.replace("/(tabs)");
  };

  const primaryColor =
    primaryGoal === "diabetes"  ? "#F87171" :
    primaryGoal === "general"   ? "#4ADE80" :
    primaryGoal === "hospice"   ? "#FB923C" :
    primaryGoal === "caregiver" ? "#A78BFA" : "#38BDF8";

  const renderStep = () => {
    // ── Step 0: Welcome ────────────────────────────────────────────────────────
    if (step === 0) {
      return (
        <View style={st.center}>
          <Text style={{ fontSize: 72, marginBottom: 20, textAlign: "center" }}>🩺</Text>
          <Text style={st.heroTitle}>Welcome to JACS</Text>
          <Text style={st.heroSub}>
            Your complete health command center.{"\n"}
            Let's personalise the app for you — it only takes 2 minutes.
          </Text>
          <TouchableOpacity style={[st.btn, { backgroundColor: "#38BDF8" }]} onPress={goNext}>
            <Text style={st.btnText}>Get Started →</Text>
          </TouchableOpacity>
          <Text style={st.hint}>You can update your profile anytime in Settings</Text>
        </View>
      );
    }

    // ── Step 1: Primary goal ───────────────────────────────────────────────────
    if (step === 1) {
      return (
        <View>
          <Text style={st.title}>What brings you to JACS?</Text>
          <Text style={st.sub}>Choose your primary reason. You can explore all features anytime.</Text>
          {PRIMARY_GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[st.card, primaryGoal === g.id && { borderColor: g.color, backgroundColor: g.color + "18" }]}
              onPress={() => { doHaptic(); setPrimaryGoal(g.id); }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 30, marginRight: 14 }}>{g.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[st.cardTitle, primaryGoal === g.id && { color: g.color }]}>{g.title}</Text>
                <Text style={st.cardDesc}>{g.desc}</Text>
              </View>
              {primaryGoal === g.id && <Text style={{ color: g.color, fontSize: 20, fontWeight: "800" }}>✓</Text>}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[st.btn, { backgroundColor: primaryGoal ? "#38BDF8" : "#1e3a5f" }]}
            onPress={goNext}
            disabled={!primaryGoal}
          >
            <Text style={[st.btnText, !primaryGoal && { color: "#687076" }]}>Continue →</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Step 2: Condition-specific ─────────────────────────────────────────────
    if (step === 2) {
      if (primaryGoal === "diabetes") {
        return (
          <View>
            <Text style={st.title}>Which type of diabetes?</Text>
            <Text style={st.sub}>JACS will customise your dashboard, glucose targets, and medication tools.</Text>
            {DIABETES_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[st.card, diabetesType === t.id && { borderColor: t.color, backgroundColor: t.color + "18" }]}
                onPress={() => { doHaptic(); setDiabetesType(t.id); }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 30, marginRight: 14 }}>{t.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[st.cardTitle, diabetesType === t.id && { color: t.color }]}>{t.title}</Text>
                  <Text style={st.cardDesc}>{t.desc}</Text>
                </View>
                {diabetesType === t.id && <Text style={{ color: t.color, fontSize: 20, fontWeight: "800" }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[st.btn, { backgroundColor: diabetesType ? "#38BDF8" : "#1e3a5f" }]}
              onPress={goNext}
              disabled={!diabetesType}
            >
              <Text style={[st.btnText, !diabetesType && { color: "#687076" }]}>Continue →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.backBtn} onPress={goBack}>
              <Text style={st.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (primaryGoal === "general") {
        return (
          <View>
            <Text style={st.title}>What would you like to monitor?</Text>
            <Text style={st.sub}>Select all that apply. Your home screen will highlight these areas.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {GENERAL_GOALS.map((g) => {
                const on = generalGoals.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[st.chip, on && { backgroundColor: g.color + "22", borderColor: g.color }]}
                    onPress={() => toggleGoal(g.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>{g.emoji}</Text>
                    <Text style={[st.chipText, on && { color: g.color }]}>{g.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[st.btn, { backgroundColor: generalGoals.length > 0 ? "#4ADE80" : "#1e3a5f" }]}
              onPress={goNext}
              disabled={generalGoals.length === 0}
            >
              <Text style={[st.btnText, generalGoals.length === 0 && { color: "#687076" }]}>Continue →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.backBtn} onPress={goBack}>
              <Text style={st.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (primaryGoal === "hospice") {
        return (
          <View>
            <Text style={st.title}>What is your role?</Text>
            <Text style={st.sub}>JACS will configure the Hospice Care Suite to match your needs.</Text>
            {HOSPICE_ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[st.card, hospiceRole === r.id && { borderColor: r.color, backgroundColor: r.color + "18" }]}
                onPress={() => { doHaptic(); setHospiceRole(r.id); }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 30, marginRight: 14 }}>{r.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[st.cardTitle, hospiceRole === r.id && { color: r.color }]}>{r.title}</Text>
                  <Text style={st.cardDesc}>{r.desc}</Text>
                </View>
                {hospiceRole === r.id && <Text style={{ color: r.color, fontSize: 20, fontWeight: "800" }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[st.btn, { backgroundColor: hospiceRole ? "#FB923C" : "#1e3a5f" }]}
              onPress={goNext}
              disabled={!hospiceRole}
            >
              <Text style={[st.btnText, !hospiceRole && { color: "#687076" }]}>Continue →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.backBtn} onPress={goBack}>
              <Text style={st.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      // caregiver — skip condition step, go straight to profile
      return (
        <View>
          <Text style={st.title}>Tell us about yourself</Text>
          <Text style={st.sub}>Your name personalises your dashboard.</Text>
          <Text style={st.label}>Your first name</Text>
          <TextInput
            value={name} onChangeText={setName}
            placeholder="e.g. Maria" placeholderTextColor="#687076"
            style={st.input} returnKeyType="done" autoCapitalize="words"
          />
          <Text style={[st.label, { marginTop: 16 }]}>Preferred language</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[st.chip, language === l.code && { backgroundColor: "#38BDF833", borderColor: "#38BDF8" }]}
                onPress={() => { doHaptic(); setLanguage(l.code); }}
                activeOpacity={0.8}
              >
                <Text style={[st.chipText, language === l.code && { color: "#38BDF8" }]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[st.btn, { backgroundColor: name.trim() ? "#A78BFA" : "#1e3a5f" }]}
            onPress={goNext}
            disabled={!name.trim()}
          >
            <Text style={[st.btnText, !name.trim() && { color: "#687076" }]}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.backBtn} onPress={goBack}>
            <Text style={st.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Step 3: Profile (name + language) ─────────────────────────────────────
    if (step === 3) {
      return (
        <View>
          <Text style={st.title}>Tell us about yourself</Text>
          <Text style={st.sub}>Your name personalises your dashboard. Language sets the display language.</Text>
          <Text style={st.label}>Your first name</Text>
          <TextInput
            value={name} onChangeText={setName}
            placeholder="e.g. Maria" placeholderTextColor="#687076"
            style={st.input} returnKeyType="done" autoCapitalize="words"
          />
          <Text style={[st.label, { marginTop: 16 }]}>Preferred language</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[st.chip, language === l.code && { backgroundColor: "#38BDF833", borderColor: "#38BDF8" }]}
                onPress={() => { doHaptic(); setLanguage(l.code); }}
                activeOpacity={0.8}
              >
                <Text style={[st.chipText, language === l.code && { color: "#38BDF8" }]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[st.btn, { backgroundColor: name.trim() ? "#38BDF8" : "#1e3a5f" }]}
            onPress={goNext}
            disabled={!name.trim()}
          >
            <Text style={[st.btnText, !name.trim() && { color: "#687076" }]}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.backBtn} onPress={goBack}>
            <Text style={st.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Step 4: Benefits discovery ─────────────────────────────────────────────
    if (step === 4) {
      const conditionLabel =
        primaryGoal === "diabetes"
          ? diabetesType === "type1" ? "Type 1 Diabetes"
          : diabetesType === "type2" ? "Type 2 Diabetes"
          : diabetesType === "both" ? "T1D & T2D"
          : "Pre-Diabetes"
        : primaryGoal === "general"   ? "General Health"
        : primaryGoal === "hospice"   ? "Hospice Care"
        : "Caregiver Tools";

      return (
        <View>
          <View style={[st.badge, { backgroundColor: primaryColor + "22", borderColor: primaryColor }]}>
            <Text style={[st.badgeText, { color: primaryColor }]}>✓ Customised for {conditionLabel}</Text>
          </View>
          <Text style={st.title}>But there's so much more!</Text>
          <Text style={st.sub}>
            Hi {name || "there"} — JACS is a complete health platform.{"\n"}
            Here's everything available to you, regardless of your primary goal:
          </Text>
          {ALL_BENEFITS.map((b) => (
            <View key={b.title} style={[st.benefitRow, { borderLeftColor: b.color }]}>
              <Text style={{ fontSize: 20, marginRight: 12, width: 28 }}>{b.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[st.benefitTitle, { color: b.color }]}>{b.title}</Text>
                <Text style={st.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
          <Text style={st.hint}>All features are free. Explore them anytime from the tab bar.</Text>
          <TouchableOpacity style={[st.btn, { backgroundColor: primaryColor, marginTop: 8 }]} onPress={handleComplete}>
            <Text style={st.btnText}>I'm Ready — Open JACS 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.backBtn} onPress={goBack}>
            <Text style={st.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0F1E]">
      {step > 0 && <ProgressBar current={step} total={TOTAL} />}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  center:      { alignItems: "center", paddingTop: 20 },
  heroTitle:   { fontSize: 34, fontWeight: "800", color: "#ECEDEE", textAlign: "center", marginBottom: 12 },
  heroSub:     { fontSize: 16, color: "#9BA1A6", textAlign: "center", lineHeight: 24, marginBottom: 36 },
  title:       { fontSize: 26, fontWeight: "800", color: "#ECEDEE", marginBottom: 8, lineHeight: 34 },
  sub:         { fontSize: 14, color: "#9BA1A6", lineHeight: 22, marginBottom: 20 },
  card:        { flexDirection: "row", alignItems: "center", backgroundColor: "#0F1A2A", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: "#1e3a5f" },
  cardTitle:   { fontSize: 16, fontWeight: "700", color: "#ECEDEE", marginBottom: 3 },
  cardDesc:    { fontSize: 12, color: "#9BA1A6", lineHeight: 18 },
  chip:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, backgroundColor: "#0F1A2A", borderWidth: 1.5, borderColor: "#1e3a5f" },
  chipText:    { fontSize: 13, fontWeight: "600", color: "#9BA1A6" },
  label:       { fontSize: 14, fontWeight: "700", color: "#ECEDEE", marginBottom: 8 },
  input:       { backgroundColor: "#0F1A2A", borderRadius: 14, padding: 14, color: "#ECEDEE", fontSize: 16, borderWidth: 1.5, borderColor: "#1e3a5f", marginBottom: 8 },
  btn:         { borderRadius: 18, padding: 18, alignItems: "center", marginTop: 8, marginBottom: 4 },
  btnText:     { color: "#0F0F1A", fontWeight: "800", fontSize: 17 },
  backBtn:     { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  backText:    { color: "#38BDF8", fontSize: 15, fontWeight: "600" },
  hint:        { textAlign: "center", color: "#687076", fontSize: 12, marginTop: 8, marginBottom: 20, lineHeight: 18 },
  badge:       { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, marginBottom: 14 },
  badgeText:   { fontSize: 13, fontWeight: "700" },
  benefitRow:  { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#0F1A2A", borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3 },
  benefitTitle:{ fontSize: 14, fontWeight: "700", marginBottom: 2 },
  benefitDesc: { fontSize: 12, color: "#9BA1A6", lineHeight: 18 },
});
