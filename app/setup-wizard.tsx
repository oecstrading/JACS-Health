/**
 * JACS Health Companion — First-Run Setup Wizard
 *
 * 7-step onboarding collecting:
 *   1. Role (Parent/Guardian, Child self-managing, Caregiver, Provider)
 *   2. Child profile (name, date of birth)
 *   3. Diagnosis info (T1D date, years)
 *   4. Device setup (CGM, Pump)
 *   5. Allergy setup
 *   6. Prescription (CR, ISF, BG target)
 *   7. GluCrew invite
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "parent" | "child" | "caregiver" | "provider";
export type CGMDevice = "dexcom_g7" | "dexcom_g6" | "dexcom_one" | "libre_2" | "libre_3" | "none";
export type PumpDevice = "omnipod_5" | "omnipod_dash" | "tandem_tslim" | "mdi" | "none";

export interface ChildProfile {
  name: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  ageYears: number;
  diagnosisDate: string; // ISO date string YYYY-MM-DD
  cgmDevice: CGMDevice;
  pumpDevice: PumpDevice;
  allergies: string[];
  carbRatio: number;       // grams of carbs per 1 unit insulin
  isf: number;             // mg/dL drop per 1 unit insulin
  bgTargetLow: number;     // mg/dL
  bgTargetHigh: number;    // mg/dL
  glucoseUnit: "mgdl" | "mmol";
  language: string;
}

export interface SetupProfile {
  role: UserRole;
  caregiverName: string;
  child: ChildProfile;
  glucrewInvites: string[]; // email or phone
  setupComplete: boolean;
  setupDate: string;
}

const ALLERGIES_LIST = [
  { id: "wheat", label: "Wheat / Gluten", emoji: "🌾" },
  { id: "peanut", label: "Peanuts", emoji: "🥜" },
  { id: "tree_nuts", label: "Tree Nuts", emoji: "🌰" },
  { id: "dairy", label: "Dairy / Milk", emoji: "🥛" },
  { id: "egg", label: "Eggs", emoji: "🥚" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "sesame", label: "Sesame", emoji: "🌿" },
];

const CGM_DEVICES: { id: CGMDevice; label: string; desc: string }[] = [
  { id: "dexcom_g7", label: "Dexcom G7", desc: "10-day wear, no fingerstick calibration" },
  { id: "dexcom_g6", label: "Dexcom G6", desc: "10-day wear, factory calibrated" },
  { id: "dexcom_one", label: "Dexcom ONE", desc: "10-day wear, simplified" },
  { id: "libre_3", label: "FreeStyle Libre 3", desc: "14-day wear, real-time alerts" },
  { id: "libre_2", label: "FreeStyle Libre 2", desc: "14-day wear, optional alarms" },
  { id: "none", label: "No CGM / Fingerstick", desc: "Manual glucose logging" },
];

const PUMP_DEVICES: { id: PumpDevice; label: string; desc: string }[] = [
  { id: "omnipod_5", label: "Omnipod 5", desc: "Tubeless AID, FDA-cleared age 2+" },
  { id: "omnipod_dash", label: "Omnipod DASH", desc: "Tubeless, manual mode" },
  { id: "tandem_tslim", label: "Tandem t:slim X2", desc: "Control-IQ AID system" },
  { id: "mdi", label: "Multiple Daily Injections", desc: "Pen or syringe" },
  { id: "none", label: "No Pump", desc: "Injections or pump not yet set up" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ht", label: "Kreyòl Ayisyen" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
];

const TOTAL_STEPS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

function calcDiagnosisYears(diagDate: string): number {
  if (!diagDate) return 0;
  const d = new Date(diagDate);
  const today = new Date();
  return Math.max(0, today.getFullYear() - d.getFullYear());
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SetupWizardScreen() {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);

  // Form state
  const [role, setRole] = useState<UserRole>("parent");
  const [caregiverName, setCaregiverName] = useState("");
  const [childName, setChildName] = useState("");
  const [childDOB, setChildDOB] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [cgmDevice, setCgmDevice] = useState<CGMDevice>("none");
  const [pumpDevice, setPumpDevice] = useState<PumpDevice>("none");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [carbRatio, setCarbRatio] = useState("15");
  const [isf, setIsf] = useState("50");
  const [bgTargetLow, setBgTargetLow] = useState("70");
  const [bgTargetHigh, setBgTargetHigh] = useState("180");
  const [glucoseUnit, setGlucoseUnit] = useState<"mgdl" | "mmol">("mgdl");
  const [language, setLanguage] = useState("en");
  const [inviteInput, setInviteInput] = useState("");
  const [invites, setInvites] = useState<string[]>([]);

  const s = styles(colors);

  const goNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleComplete();
    }
  };

  const goBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleComplete = async () => {
    const profile: SetupProfile = {
      role,
      caregiverName,
      child: {
        name: childName || "My Child",
        dateOfBirth: childDOB,
        ageYears: calcAge(childDOB),
        diagnosisDate,
        cgmDevice,
        pumpDevice,
        allergies: selectedAllergies,
        carbRatio: parseFloat(carbRatio) || 15,
        isf: parseFloat(isf) || 50,
        bgTargetLow: parseFloat(bgTargetLow) || 70,
        bgTargetHigh: parseFloat(bgTargetHigh) || 180,
        glucoseUnit,
        language,
      },
      glucrewInvites: invites,
      setupComplete: true,
      setupDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem("@jacs_setup_profile", JSON.stringify(profile));
    await AsyncStorage.setItem("@jacs_setup_complete", "true");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const toggleAllergy = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addInvite = () => {
    const trimmed = inviteInput.trim();
    if (trimmed && !invites.includes(trimmed)) {
      setInvites([...invites, trimmed]);
      setInviteInput("");
    }
  };

  const removeInvite = (inv: string) => {
    setInvites(invites.filter((i) => i !== inv));
  };

  // Progress bar
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={s.stepLabel}>Step {step + 1} of {TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && <StepRole role={role} setRole={setRole} caregiverName={caregiverName} setCaregiverName={setCaregiverName} colors={colors} />}
          {step === 1 && <StepChildProfile childName={childName} setChildName={setChildName} childDOB={childDOB} setChildDOB={setChildDOB} role={role} colors={colors} />}
          {step === 2 && <StepDiagnosis diagnosisDate={diagnosisDate} setDiagnosisDate={setDiagnosisDate} childName={childName} colors={colors} />}
          {step === 3 && <StepDevices cgmDevice={cgmDevice} setCgmDevice={setCgmDevice} pumpDevice={pumpDevice} setPumpDevice={setPumpDevice} colors={colors} />}
          {step === 4 && <StepAllergies selectedAllergies={selectedAllergies} toggleAllergy={toggleAllergy} colors={colors} />}
          {step === 5 && <StepPrescription carbRatio={carbRatio} setCarbRatio={setCarbRatio} isf={isf} setIsf={setIsf} bgTargetLow={bgTargetLow} setBgTargetLow={setBgTargetLow} bgTargetHigh={bgTargetHigh} setBgTargetHigh={setBgTargetHigh} glucoseUnit={glucoseUnit} setGlucoseUnit={setGlucoseUnit} language={language} setLanguage={setLanguage} colors={colors} />}
          {step === 6 && <StepGluCrew inviteInput={inviteInput} setInviteInput={setInviteInput} invites={invites} addInvite={addInvite} removeInvite={removeInvite} childName={childName} colors={colors} />}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={s.navRow}>
          {step > 0 ? (
            <TouchableOpacity style={s.backBtn} onPress={goBack} activeOpacity={0.7}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <TouchableOpacity style={s.nextBtn} onPress={goNext} activeOpacity={0.8}>
            <Text style={s.nextBtnText}>
              {step === TOTAL_STEPS - 1 ? "🚀 Get Started!" : "Continue →"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Step 1: Role ─────────────────────────────────────────────────────────────
function StepRole({ role, setRole, caregiverName, setCaregiverName, colors }: any) {
  const s = styles(colors);
  const roles = [
    { id: "parent", emoji: "👨‍👧", label: "Parent / Guardian", desc: "Managing my child's T1D" },
    { id: "child", emoji: "🧒", label: "Child (Self-Managing)", desc: "I manage my own diabetes" },
    { id: "caregiver", emoji: "🏥", label: "Caregiver / Grandparent", desc: "Helping care for someone with T1D" },
    { id: "provider", emoji: "👩‍⚕️", label: "Healthcare Provider", desc: "School nurse, educator, or clinician" },
  ];
  return (
    <View>
      <Text style={s.stepEmoji}>👋</Text>
      <Text style={s.stepTitle}>Welcome to JACS!</Text>
      <Text style={s.stepSubtitle}>Let's set up your profile. Who are you?</Text>
      {roles.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={[s.optionCard, role === r.id && s.optionCardSelected]}
          onPress={() => { setRole(r.id); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          activeOpacity={0.8}
        >
          <Text style={s.optionEmoji}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.optionLabel, role === r.id && s.optionLabelSelected]}>{r.label}</Text>
            <Text style={s.optionDesc}>{r.desc}</Text>
          </View>
          {role === r.id && <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>}
        </TouchableOpacity>
      ))}
      <Text style={[s.fieldLabel, { marginTop: 20 }]}>Your Name</Text>
      <TextInput
        style={s.textInput}
        value={caregiverName}
        onChangeText={setCaregiverName}
        placeholder="Enter your name"
        placeholderTextColor={colors.muted}
        returnKeyType="done"
      />
    </View>
  );
}

// ─── Step 2: Child Profile ────────────────────────────────────────────────────
function StepChildProfile({ childName, setChildName, childDOB, setChildDOB, role, colors }: any) {
  const s = styles(colors);
  const isChild = role === "child";
  const label = isChild ? "Your" : "Child's";
  const age = calcAge(childDOB);
  return (
    <View>
      <Text style={s.stepEmoji}>🧒</Text>
      <Text style={s.stepTitle}>{label} Profile</Text>
      <Text style={s.stepSubtitle}>
        {isChild ? "Tell us about yourself." : "Tell us about the child you're caring for."}
      </Text>
      <Text style={s.fieldLabel}>{label} First Name</Text>
      <TextInput
        style={s.textInput}
        value={childName}
        onChangeText={setChildName}
        placeholder={isChild ? "Your first name" : "Child's first name"}
        placeholderTextColor={colors.muted}
        returnKeyType="done"
      />
      <Text style={s.fieldLabel}>{label} Date of Birth</Text>
      <TextInput
        style={s.textInput}
        value={childDOB}
        onChangeText={setChildDOB}
        placeholder="YYYY-MM-DD (e.g. 2020-03-15)"
        placeholderTextColor={colors.muted}
        keyboardType="numbers-and-punctuation"
        returnKeyType="done"
      />
      {childDOB.length === 10 && (
        <View style={s.infoPill}>
          <Text style={s.infoPillText}>
            {age === 0 ? "Under 1 year old" : `${age} year${age !== 1 ? "s" : ""} old`}
          </Text>
        </View>
      )}
      <View style={s.tipBox}>
        <Text style={s.tipText}>
          💡 Age determines ADA-recommended glucose targets. Under 6: 100–180 mg/dL · Ages 6–12: 90–180 mg/dL · Teens: 70–180 mg/dL
        </Text>
      </View>
    </View>
  );
}

// ─── Step 3: Diagnosis ────────────────────────────────────────────────────────
function StepDiagnosis({ diagnosisDate, setDiagnosisDate, childName, colors }: any) {
  const s = styles(colors);
  const years = calcDiagnosisYears(diagnosisDate);
  const name = childName || "your child";
  return (
    <View>
      <Text style={s.stepEmoji}>📋</Text>
      <Text style={s.stepTitle}>T1D Diagnosis</Text>
      <Text style={s.stepSubtitle}>When was {name} diagnosed with Type 1 Diabetes?</Text>
      <Text style={s.fieldLabel}>Diagnosis Date</Text>
      <TextInput
        style={s.textInput}
        value={diagnosisDate}
        onChangeText={setDiagnosisDate}
        placeholder="YYYY-MM-DD (e.g. 2023-06-01)"
        placeholderTextColor={colors.muted}
        keyboardType="numbers-and-punctuation"
        returnKeyType="done"
      />
      {diagnosisDate.length === 10 && (
        <View style={s.infoPill}>
          <Text style={s.infoPillText}>
            {years === 0
              ? "Diagnosed this year — newly diagnosed"
              : `${years} year${years !== 1 ? "s" : ""} since diagnosis`}
          </Text>
        </View>
      )}
      <View style={s.tipBox}>
        <Text style={s.tipText}>
          💡 This helps JACS tailor insulin sensitivity estimates and honeymoon phase guidance. You can skip this and set it later in Settings.
        </Text>
      </View>
      <TouchableOpacity onPress={() => setDiagnosisDate("")} style={s.skipLink}>
        <Text style={s.skipLinkText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 4: Devices ──────────────────────────────────────────────────────────
function StepDevices({ cgmDevice, setCgmDevice, pumpDevice, setPumpDevice, colors }: any) {
  const s = styles(colors);
  return (
    <View>
      <Text style={s.stepEmoji}>📡</Text>
      <Text style={s.stepTitle}>Devices</Text>
      <Text style={s.stepSubtitle}>Which CGM and insulin delivery system are you using?</Text>

      <Text style={s.sectionLabel}>Continuous Glucose Monitor (CGM)</Text>
      {CGM_DEVICES.map((d) => (
        <TouchableOpacity
          key={d.id}
          style={[s.optionCard, cgmDevice === d.id && s.optionCardSelected]}
          onPress={() => { setCgmDevice(d.id); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={[s.optionLabel, cgmDevice === d.id && s.optionLabelSelected]}>{d.label}</Text>
            <Text style={s.optionDesc}>{d.desc}</Text>
          </View>
          {cgmDevice === d.id && <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>}
        </TouchableOpacity>
      ))}

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Insulin Delivery</Text>
      {PUMP_DEVICES.map((d) => (
        <TouchableOpacity
          key={d.id}
          style={[s.optionCard, pumpDevice === d.id && s.optionCardSelected]}
          onPress={() => { setPumpDevice(d.id); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={[s.optionLabel, pumpDevice === d.id && s.optionLabelSelected]}>{d.label}</Text>
            <Text style={s.optionDesc}>{d.desc}</Text>
          </View>
          {pumpDevice === d.id && <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>}
        </TouchableOpacity>
      ))}
      <View style={s.tipBox}>
        <Text style={s.tipText}>💡 No device? No problem. JACS works with manual fingerstick logging too.</Text>
      </View>
    </View>
  );
}

// ─── Step 5: Allergies ────────────────────────────────────────────────────────
function StepAllergies({ selectedAllergies, toggleAllergy, colors }: any) {
  const s = styles(colors);
  return (
    <View>
      <Text style={s.stepEmoji}>⚠️</Text>
      <Text style={s.stepTitle}>Food Allergies</Text>
      <Text style={s.stepSubtitle}>
        Select all known food allergies. JACS will alert you when scanning food labels.
      </Text>
      <View style={s.allergyGrid}>
        {ALLERGIES_LIST.map((a) => {
          const selected = selectedAllergies.includes(a.id);
          return (
            <TouchableOpacity
              key={a.id}
              style={[s.allergyChip, selected && s.allergyChipSelected]}
              onPress={() => toggleAllergy(a.id)}
              activeOpacity={0.8}
            >
              <Text style={s.allergyEmoji}>{a.emoji}</Text>
              <Text style={[s.allergyLabel, selected && s.allergyLabelSelected]}>{a.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedAllergies.includes("wheat") && (
        <View style={[s.tipBox, { borderColor: "#F59E0B", backgroundColor: "#FEF3C7" }]}>
          <Text style={[s.tipText, { color: "#92400E" }]}>
            🌾 Wheat/Gluten allergy detected! JACS will activate the Food Scanner with gluten alerts and the Emergency Anaphylaxis Protocol.
          </Text>
        </View>
      )}
      <TouchableOpacity onPress={() => {}} style={s.skipLink}>
        <Text style={s.skipLinkText}>No known allergies — skip</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 6: Prescription ─────────────────────────────────────────────────────
function StepPrescription({ carbRatio, setCarbRatio, isf, setIsf, bgTargetLow, setBgTargetLow, bgTargetHigh, setBgTargetHigh, glucoseUnit, setGlucoseUnit, language, setLanguage, colors }: any) {
  const s = styles(colors);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={s.stepEmoji}>💊</Text>
      <Text style={s.stepTitle}>Prescription Settings</Text>
      <Text style={s.stepSubtitle}>
        Enter the values from your endocrinologist. You can update these any time in Settings.
      </Text>

      <View style={s.unitRow}>
        <Text style={s.fieldLabel}>Glucose Units</Text>
        <View style={s.unitToggle}>
          {(["mgdl", "mmol"] as const).map((u) => (
            <TouchableOpacity
              key={u}
              style={[s.unitBtn, glucoseUnit === u && s.unitBtnActive]}
              onPress={() => setGlucoseUnit(u)}
            >
              <Text style={[s.unitBtnText, glucoseUnit === u && s.unitBtnTextActive]}>
                {u === "mgdl" ? "mg/dL" : "mmol/L"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={s.fieldLabel}>Carb Ratio (CR)</Text>
      <Text style={s.fieldHint}>Grams of carbs covered by 1 unit of insulin</Text>
      <TextInput style={s.textInput} value={carbRatio} onChangeText={setCarbRatio} keyboardType="decimal-pad" placeholder="e.g. 15" placeholderTextColor={colors.muted} returnKeyType="done" />

      <Text style={s.fieldLabel}>Insulin Sensitivity Factor (ISF)</Text>
      <Text style={s.fieldHint}>How many {glucoseUnit === "mgdl" ? "mg/dL" : "mmol/L"} 1 unit of insulin lowers BG</Text>
      <TextInput style={s.textInput} value={isf} onChangeText={setIsf} keyboardType="decimal-pad" placeholder={glucoseUnit === "mgdl" ? "e.g. 50" : "e.g. 2.8"} placeholderTextColor={colors.muted} returnKeyType="done" />

      <Text style={s.fieldLabel}>BG Target Range</Text>
      <View style={s.rangeRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={s.fieldHint}>Low ({glucoseUnit === "mgdl" ? "mg/dL" : "mmol/L"})</Text>
          <TextInput style={s.textInput} value={bgTargetLow} onChangeText={setBgTargetLow} keyboardType="decimal-pad" placeholder={glucoseUnit === "mgdl" ? "70" : "3.9"} placeholderTextColor={colors.muted} returnKeyType="done" />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.fieldHint}>High ({glucoseUnit === "mgdl" ? "mg/dL" : "mmol/L"})</Text>
          <TextInput style={s.textInput} value={bgTargetHigh} onChangeText={setBgTargetHigh} keyboardType="decimal-pad" placeholder={glucoseUnit === "mgdl" ? "180" : "10.0"} placeholderTextColor={colors.muted} returnKeyType="done" />
        </View>
      </View>

      <Text style={s.fieldLabel}>App Language</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[s.langChip, language === lang.code && s.langChipSelected]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={[s.langLabel, language === lang.code && s.langLabelSelected]}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.tipBox}>
        <Text style={s.tipText}>💡 Don't know these values yet? Leave the defaults — they are based on ADA guidelines for your child's age. Your endocrinologist will provide exact values.</Text>
      </View>
    </ScrollView>
  );
}

// ─── Step 7: GluCrew ──────────────────────────────────────────────────────────
function StepGluCrew({ inviteInput, setInviteInput, invites, addInvite, removeInvite, childName, colors }: any) {
  const s = styles(colors);
  const name = childName || "your child";
  return (
    <View>
      <Text style={s.stepEmoji}>👨‍👩‍👧</Text>
      <Text style={s.stepTitle}>Build Your Care Team</Text>
      <Text style={s.stepSubtitle}>
        Invite family, caregivers, and school nurses to monitor {name}'s health in real time.
      </Text>
      <Text style={s.fieldLabel}>Invite by Email or Phone</Text>
      <View style={s.inviteRow}>
        <TextInput
          style={[s.textInput, { flex: 1, marginBottom: 0, marginRight: 8 }]}
          value={inviteInput}
          onChangeText={setInviteInput}
          placeholder="email@example.com or +1-555-0100"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={addInvite}
        />
        <TouchableOpacity style={s.addBtn} onPress={addInvite} activeOpacity={0.8}>
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {invites.length > 0 && (
        <View style={{ marginTop: 12 }}>
          {invites.map((inv: string) => (
            <View key={inv} style={s.inviteChip}>
              <Text style={s.inviteChipText} numberOfLines={1}>✉️ {inv}</Text>
              <TouchableOpacity onPress={() => removeInvite(inv)}>
                <Text style={{ color: colors.error, fontSize: 18, paddingLeft: 8 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <View style={s.tipBox}>
        <Text style={s.tipText}>
          💡 Your Care Team can see {name}'s live glucose, log meals and insulin, and receive emergency alerts — all from their own phone. You control what they can see.
        </Text>
      </View>
      <View style={[s.tipBox, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]}>
        <Text style={[s.tipText, { color: colors.primary }]}>
          🎉 You're almost done! Tap "Get Started" to launch JACS. You can always update these settings from the Settings tab.
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function styles(colors: any) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    stepLabel: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 4,
      textAlign: "right",
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 32,
    },
    stepEmoji: {
      fontSize: 48,
      textAlign: "center",
      marginBottom: 8,
    },
    stepTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 6,
    },
    stepSubtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    fieldLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 4,
      marginTop: 12,
    },
    fieldHint: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 4,
    },
    textInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      marginBottom: 4,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    optionEmoji: {
      fontSize: 28,
      marginRight: 12,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    optionLabelSelected: {
      color: colors.primary,
    },
    optionDesc: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    allergyGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    allergyChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    allergyChipSelected: {
      borderColor: "#EF4444",
      backgroundColor: "#FEE2E2",
    },
    allergyEmoji: {
      fontSize: 18,
      marginRight: 6,
    },
    allergyLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.foreground,
    },
    allergyLabelSelected: {
      color: "#DC2626",
    },
    tipBox: {
      backgroundColor: `${colors.primary}10`,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
    },
    tipText: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
    },
    infoPill: {
      alignSelf: "flex-start",
      backgroundColor: `${colors.success}20`,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 4,
      marginBottom: 8,
    },
    infoPillText: {
      fontSize: 13,
      color: colors.success,
      fontWeight: "600",
    },
    skipLink: {
      alignSelf: "center",
      marginTop: 12,
      padding: 8,
    },
    skipLinkText: {
      color: colors.muted,
      fontSize: 14,
      textDecorationLine: "underline",
    },
    unitRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
      marginBottom: 4,
    },
    unitToggle: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    unitBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    unitBtnActive: {
      backgroundColor: colors.primary,
    },
    unitBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
    },
    unitBtnTextActive: {
      color: "#fff",
    },
    rangeRow: {
      flexDirection: "row",
    },
    langChip: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 8,
    },
    langChipSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    langLabel: {
      fontSize: 14,
      color: colors.foreground,
      fontWeight: "500",
    },
    langLabelSelected: {
      color: colors.primary,
    },
    inviteRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    addBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
    addBtnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
    inviteChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inviteChipText: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: 12,
    },
    backBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
    },
    backBtnText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    nextBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    nextBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
}
