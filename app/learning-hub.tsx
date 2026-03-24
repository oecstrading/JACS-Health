/**
 * LEARNING HUB 🌍
 * Multilingual T1D education for caregivers and children worldwide.
 *
 * Features:
 * - 6 language tracks (English, Spanish, French, Portuguese, Hindi, Arabic)
 * - Caregiver crash course (T1D 101 for new parents)
 * - Carb counting basics with visual guides
 * - Hypo/Hyper recognition and response
 * - School accommodation guide (504 Plan, IEP)
 * - T1D myth busters (10 common misconceptions)
 * - Glucagon kit tracker
 * - Caregiver handoff card (shareable via WhatsApp/SMS)
 * - Global T1D statistics and resources
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Share, Platform, TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const STORAGE_KEY = "@learning_hub_v1";

const haptic = (type: "light" | "success" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// ─── Multilingual T1D Key Phrases ─────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    title: "Learning Hub",
    emergency: "My child has Type 1 Diabetes. She needs sugar NOW.",
    low: "Low blood sugar",
    high: "High blood sugar",
    insulin: "Insulin",
    glucagon: "Glucagon emergency kit",
    call911: "Please call emergency services",
    epipen: "She is allergic to wheat. She may need an EpiPen.",
  },
  Spanish: {
    title: "Centro de Aprendizaje",
    emergency: "Mi hija tiene Diabetes Tipo 1. Necesita azúcar AHORA.",
    low: "Azúcar baja en sangre",
    high: "Azúcar alta en sangre",
    insulin: "Insulina",
    glucagon: "Kit de emergencia de glucagón",
    call911: "Por favor llame a los servicios de emergencia",
    epipen: "Es alérgica al trigo. Puede necesitar un EpiPen.",
  },
  French: {
    title: "Centre d'Apprentissage",
    emergency: "Mon enfant a le Diabète de Type 1. Elle a besoin de sucre MAINTENANT.",
    low: "Hypoglycémie",
    high: "Hyperglycémie",
    insulin: "Insuline",
    glucagon: "Kit d'urgence glucagon",
    call911: "Veuillez appeler les services d'urgence",
    epipen: "Elle est allergique au blé. Elle peut avoir besoin d'un EpiPen.",
  },
  Portuguese: {
    title: "Centro de Aprendizagem",
    emergency: "Minha filha tem Diabetes Tipo 1. Ela precisa de açúcar AGORA.",
    low: "Hipoglicemia",
    high: "Hiperglicemia",
    insulin: "Insulina",
    glucagon: "Kit de emergência glucagon",
    call911: "Por favor ligue para os serviços de emergência",
    epipen: "Ela é alérgica ao trigo. Ela pode precisar de um EpiPen.",
  },
  Hindi: {
    title: "सीखने का केंद्र",
    emergency: "मेरे बच्चे को टाइप 1 मधुमेह है। उसे अभी चीनी चाहिए।",
    low: "कम रक्त शर्करा",
    high: "उच्च रक्त शर्करा",
    insulin: "इंसुलिन",
    glucagon: "ग्लूकागन आपातकालीन किट",
    call911: "कृपया आपातकालीन सेवाओं को कॉल करें",
    epipen: "उसे गेहूं से एलर्जी है। उसे EpiPen की जरूरत हो सकती है।",
  },
  Arabic: {
    title: "مركز التعلم",
    emergency: "طفلتي مصابة بداء السكري من النوع الأول. تحتاج إلى سكر الآن.",
    low: "انخفاض سكر الدم",
    high: "ارتفاع سكر الدم",
    insulin: "الأنسولين",
    glucagon: "مجموعة طوارئ الجلوكاجون",
    call911: "يرجى الاتصال بخدمات الطوارئ",
    epipen: "إنها تعاني من حساسية القمح. قد تحتاج إلى EpiPen.",
  },
};

const LANGUAGES = Object.keys(TRANSLATIONS);

// ─── Caregiver Modules ────────────────────────────────────────────────────────
const CAREGIVER_MODULES = [
  {
    id: "c1", emoji: "🎓", title: "T1D 101 — Caregiver Crash Course", color: "#7C3AED",
    sections: [
      { heading: "What is Type 1 Diabetes?", body: "T1D is an autoimmune condition where the pancreas produces little or no insulin. It is NOT caused by diet or lifestyle — it is genetic and autoimmune. The child's immune system attacked the insulin-producing beta cells." },
      { heading: "Insulin is Life", body: "Without insulin, glucose cannot enter cells and builds up dangerously in the blood (DKA). Children with T1D require insulin every day — there is no cure, but it is fully manageable with the right tools and knowledge." },
      { heading: "The 15-15 Rule for Low BG", body: "If blood sugar is below 70 mg/dL:\n1. Give 15g fast-acting carbs (4 oz juice, 3-4 glucose tabs, or regular soda)\n2. Wait 15 minutes\n3. Recheck blood sugar\n4. If still low, repeat\n5. If unconscious — use Glucagon and call 911 immediately" },
      { heading: "High Blood Sugar (Hyperglycemia)", body: "Signs: excessive thirst, frequent urination, fatigue, blurry vision, fruity breath.\nAction: Check ketones, give correction insulin dose per doctor's orders, hydrate, call doctor if ketones are moderate/large." },
      { heading: "Target Ranges for Young Children (ADA 2024)", body: "Before meals: 100–180 mg/dL\nAfter meals (2hr): <250 mg/dL\nBedtime: 120–180 mg/dL\nOvernight: >80 mg/dL\n\nNote: Ranges for toddlers are wider than adults. Always follow your endocrinologist's specific targets." },
    ],
  },
  {
    id: "c2", emoji: "🍎", title: "Carb Counting Basics", color: "#16A34A",
    sections: [
      { heading: "Why Count Carbs?", body: "Carbohydrates raise blood sugar more than protein or fat. Counting carbs helps calculate the correct insulin dose (insulin-to-carb ratio, set by your doctor)." },
      { heading: "Common Carb Counts", body: "🍌 Banana (medium): 27g\n🍎 Apple (medium): 25g\n🍚 White rice (½ cup cooked): 22g\n🥛 Milk (1 cup): 12g\n🍊 Orange juice (4 oz): 15g\n🍬 Glucose tablet: 4g\n🧃 Juice box (4 oz): 15g" },
      { heading: "Fast vs. Slow Carbs", body: "FAST (raise BG quickly — use for lows):\nJuice, regular soda, glucose tabs, candy, white bread\n\nSLOW (steady BG — use for meals):\nBrown rice, oats, sweet potato, beans, vegetables" },
      { heading: "Reading Food Labels", body: "Look for 'Total Carbohydrate' on the nutrition label — this is the number to use.\nSubtract dietary fiber for net carbs.\nAlways check serving size first!" },
    ],
  },
  {
    id: "c3", emoji: "🏫", title: "School Accommodation Guide", color: "#0891B2",
    sections: [
      { heading: "Your Child's Legal Rights (USA)", body: "Under Section 504 of the Rehabilitation Act and the ADA, your child is entitled to a 504 Plan or IEP that accommodates T1D management at school." },
      { heading: "What to Include in a 504 Plan", body: "✅ Permission to check BG in class\n✅ Permission to eat/drink in class for lows\n✅ Nurse access at any time\n✅ No penalty for diabetes-related absences\n✅ Extra time on tests during BG issues\n✅ Emergency glucagon kit on site\n✅ Trained staff for emergency response" },
      { heading: "Diabetes Medical Management Plan (DMMP)", body: "Work with your endocrinologist to create a DMMP — a written plan that tells school staff exactly what to do in every diabetes situation. This is separate from the 504 Plan and is a medical document." },
      { heading: "International Resources", body: "🇬🇧 UK: JDRF UK School Pack\n🇦🇺 AU: Diabetes Australia School Resources\n🇨🇦 CA: Diabetes Canada School Support\n🇮🇳 IN: Juvenile Diabetes Research Foundation India\n🌍 Global: IDF (International Diabetes Federation) — idf.org" },
    ],
  },
  {
    id: "c4", emoji: "🚫", title: "T1D Myth Busters", color: "#DC2626",
    sections: [
      { heading: "Myth 1: 'She ate too much sugar'", body: "❌ FALSE. T1D is an autoimmune disease. It has nothing to do with diet or sugar consumption. No one causes T1D." },
      { heading: "Myth 2: 'She'll outgrow it'", body: "❌ FALSE. T1D is lifelong. There is currently no cure, though research is ongoing. It can be managed extremely well." },
      { heading: "Myth 3: 'She can't eat sugar at all'", body: "❌ FALSE. Children with T1D can eat anything — they just need to count carbs and dose insulin accordingly. They can eat birthday cake!" },
      { heading: "Myth 4: 'Insulin means she's really sick'", body: "❌ FALSE. Insulin is a hormone, not a sign of severity. All T1D patients need insulin to live — it is life-sustaining medicine." },
      { heading: "Myth 5: 'She can't exercise or play sports'", body: "❌ FALSE. Exercise is excellent for T1D management. Many Olympic athletes, professional footballers, and world champions have T1D. She can do ANYTHING." },
      { heading: "Myth 6: 'She'll have a short life'", body: "❌ FALSE. With modern CGM, insulin pumps, and good management, people with T1D live full, long, healthy lives. The future is incredibly bright." },
    ],
  },
];

// ─── Glucagon Kit Tracker ─────────────────────────────────────────────────────
interface GlucagonKit {
  location: string;
  expiry: string;
  brand: string;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LearningHub() {
  const colors = useColors();
  const [tab, setTab] = useState<"caregiver" | "language" | "glucagon" | "handoff">("caregiver");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("English");
  const [glucagonKit, setGlucagonKit] = useState<GlucagonKit>({ location: "", expiry: "", brand: "" });
  const [childName, setChildName] = useState("My Child");
  const [childDOB, setChildDOB] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [insulinType, setInsulinType] = useState("");
  const [targetRange, setTargetRange] = useState("100-180 mg/dL");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) try {
        const d = JSON.parse(raw);
        if (d.glucagonKit) setGlucagonKit(d.glucagonKit);
        if (d.childName) setChildName(d.childName);
        if (d.childDOB) setChildDOB(d.childDOB);
        if (d.doctorName) setDoctorName(d.doctorName);
        if (d.doctorPhone) setDoctorPhone(d.doctorPhone);
        if (d.insulinType) setInsulinType(d.insulinType);
        if (d.targetRange) setTargetRange(d.targetRange);
      } catch {}
    });
  }, []);

  const saveAll = useCallback(async (patch: object) => {
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...patch }));
  }, []);

  const shareHandoffCard = async () => {
    const t = TRANSLATIONS[selectedLang];
    const card = `🛡️ JACS HEALTH — CAREGIVER HANDOFF CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👧 Child: ${childName}
📅 DOB: ${childDOB || "N/A"}
🩺 Condition: Type 1 Diabetes + Wheat Allergy

⚠️ EMERGENCY PHRASE (${selectedLang}):
"${t.emergency}"

🩸 LOW SUGAR (${t.low}): Give juice or glucose tabs immediately
📈 HIGH SUGAR (${t.high}): Check ketones, call doctor
💉 ${t.insulin}: Required daily — do NOT skip
🚨 ${t.glucagon}: Location: ${glucagonKit.location || "Ask parent"}
🌾 WHEAT ALLERGY: ${t.epipen}

👨‍⚕️ Doctor: ${doctorName || "N/A"} | ${doctorPhone || "N/A"}
🎯 Target BG: ${targetRange}
💊 Insulin: ${insulinType || "Ask parent"}

📱 JACS Health Companion App — Keeping children safe worldwide 🌍
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    try {
      await Share.share({ message: card, title: "JACS Caregiver Handoff Card" });
    } catch {}
  };

  const currentModule = CAREGIVER_MODULES.find(m => m.id === selectedModule);
  const t = TRANSLATIONS[selectedLang];

  const TABS = [
    { id: "caregiver" as const, emoji: "🎓", label: "Education" },
    { id: "language" as const, emoji: "🌍", label: "Languages" },
    { id: "glucagon" as const, emoji: "💊", label: "Glucagon" },
    { id: "handoff" as const, emoji: "📋", label: "Handoff Card" },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#0C1B33" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={s.back} allowFontScaling={false}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} allowFontScaling={false}>🌍 LEARNING HUB</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: "#0C1B33" }]}>
        {TABS.map(tb => (
          <TouchableOpacity
            key={tb.id}
            style={[s.tabBtn, tab === tb.id && s.tabBtnActive]}
            onPress={() => { haptic(); setTab(tb.id); setSelectedModule(null); }}
            accessibilityRole="tab"
            accessibilityLabel={tb.label}
          >
            <Text style={{ fontSize: 18 }}>{tb.emoji}</Text>
            <Text style={[s.tabLabel, { color: tab === tb.id ? "#D4AF37" : "#9BA1A6" }]} allowFontScaling={false}>{tb.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── EDUCATION TAB ── */}
        {tab === "caregiver" && !currentModule && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>Caregiver Education Modules</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Everything you need to keep your child safe, healthy, and thriving.</Text>
            {CAREGIVER_MODULES.map(mod => (
              <TouchableOpacity
                key={mod.id}
                style={[s.moduleCard, { backgroundColor: mod.color + "18", borderColor: mod.color }]}
                onPress={() => { haptic(); setSelectedModule(mod.id); }}
                accessibilityRole="button"
                accessibilityLabel={mod.title}
              >
                <Text style={{ fontSize: 36 }}>{mod.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[s.moduleTitle, { color: mod.color }]} allowFontScaling={false}>{mod.title}</Text>
                  <Text style={[s.moduleSections, { color: colors.muted }]} allowFontScaling={false}>{mod.sections.length} sections</Text>
                </View>
                <Text style={{ color: mod.color, fontSize: 22 }}>›</Text>
              </TouchableOpacity>
            ))}

            {/* Global Stats */}
            <View style={[s.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🌍 T1D Around the World</Text>
              {[
                ["8.4M+", "People with T1D worldwide (IDF 2023)"],
                ["1.5M+", "Children under 15 with T1D globally"],
                ["98,200", "New T1D diagnoses in children each year"],
                ["#1", "Most common chronic disease in children"],
                ["$0", "Cost of JACS Health Companion — FREE for all"],
              ].map(([num, desc]) => (
                <View key={num as string} style={s.statRow}>
                  <Text style={[s.statNum, { color: "#D4AF37" }]} allowFontScaling={false}>{num as string}</Text>
                  <Text style={[s.statDesc, { color: colors.foreground }]} allowFontScaling={false}>{desc as string}</Text>
                </View>
              ))}
            </View>

            {/* External Resources */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🔗 Trusted Resources</Text>
              {[
                { name: "JDRF — Juvenile Diabetes Research Foundation", url: "https://www.jdrf.org" },
                { name: "ADA — American Diabetes Association", url: "https://www.diabetes.org" },
                { name: "FARE — Food Allergy Research & Education", url: "https://www.foodallergy.org" },
                { name: "IDF — International Diabetes Federation", url: "https://www.idf.org" },
                { name: "Beyond Type 1 — Community & Resources", url: "https://beyondtype1.org" },
                { name: "Children with Diabetes", url: "https://www.childrenwithdiabetes.com" },
              ].map(({ name, url }) => (
                <TouchableOpacity key={url} onPress={() => Linking.openURL(url)} style={s.linkRow} accessibilityRole="link" accessibilityLabel={name}>
                  <Text style={s.linkText} allowFontScaling={false}>🔗 {name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── MODULE DETAIL ── */}
        {tab === "caregiver" && currentModule && (
          <View>
            <TouchableOpacity onPress={() => setSelectedModule(null)} style={s.backBtn}>
              <Text style={{ color: "#60A5FA", fontWeight: "700", fontSize: 16 }} allowFontScaling={false}>‹ Back to Modules</Text>
            </TouchableOpacity>
            <View style={[s.moduleDetailCard, { backgroundColor: currentModule.color + "18", borderColor: currentModule.color }]}>
              <Text style={{ fontSize: 48, textAlign: "center" }}>{currentModule.emoji}</Text>
              <Text style={[s.moduleDetailTitle, { color: currentModule.color }]} allowFontScaling={false}>{currentModule.title}</Text>
            </View>
            {currentModule.sections.map((sec, i) => (
              <View key={i} style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.sectionHeading, { color: colors.foreground }]} allowFontScaling={false}>{sec.heading}</Text>
                <Text style={[s.sectionBody, { color: colors.muted }]} allowFontScaling={false}>{sec.body}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── LANGUAGE TAB ── */}
        {tab === "language" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>🌍 Emergency Phrases</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Critical phrases in 6 languages. Tap a language to see emergency phrases you can show to anyone worldwide.</Text>

            {/* Language Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[s.langChip, { backgroundColor: selectedLang === lang ? "#D4AF37" : colors.surface, borderColor: selectedLang === lang ? "#D4AF37" : colors.border }]}
                    onPress={() => { haptic(); setSelectedLang(lang); }}
                    accessibilityRole="button"
                    accessibilityLabel={lang}
                  >
                    <Text style={[s.langChipText, { color: selectedLang === lang ? "#0C1B33" : colors.foreground }]} allowFontScaling={false}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Emergency Phrases Card */}
            <View style={[s.phraseCard, { backgroundColor: "#1A0A3B", borderColor: "#D4AF37" }]}>
              <Text style={s.phraseCardTitle} allowFontScaling={false}>🚨 Emergency Phrases — {selectedLang}</Text>
              {Object.entries(t).filter(([k]) => k !== "title").map(([key, phrase]) => (
                <View key={key} style={s.phraseRow}>
                  <Text style={s.phraseKey} allowFontScaling={false}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
                  <Text style={s.phraseValue} allowFontScaling={false}>{phrase as string}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={s.copyBtn}
                onPress={async () => {
                  const text = Object.entries(t).filter(([k]) => k !== "title").map(([k, v]) => `${k}: ${v}`).join("\n");
                  await Share.share({ message: text, title: `T1D Emergency Phrases — ${selectedLang}` });
                }}
                accessibilityRole="button"
                accessibilityLabel="Share emergency phrases"
              >
                <Text style={s.copyBtnText} allowFontScaling={false}>📤 Share These Phrases</Text>
              </TouchableOpacity>
            </View>

            {/* Language Stats */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🌐 T1D Children by Region</Text>
              {[
                ["🇺🇸 North America", "~200,000 children with T1D"],
                ["🇪🇺 Europe", "~180,000 children with T1D"],
                ["🌍 Africa", "~76,000 children with T1D"],
                ["🌏 Asia-Pacific", "~120,000 children with T1D"],
                ["🌎 Latin America", "~80,000 children with T1D"],
                ["🌍 Middle East", "~45,000 children with T1D"],
              ].map(([region, count]) => (
                <View key={region as string} style={s.statRow}>
                  <Text style={[s.statDesc, { color: colors.foreground, flex: 1 }]} allowFontScaling={false}>{region as string}</Text>
                  <Text style={[s.statNum, { color: "#D4AF37", fontSize: 12 }]} allowFontScaling={false}>{count as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── GLUCAGON TRACKER TAB ── */}
        {tab === "glucagon" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>💊 Glucagon Kit Tracker</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Glucagon is the emergency medicine for severe low blood sugar when the child cannot eat or drink. Always know where it is.</Text>

            <View style={[s.card, { backgroundColor: "#1A0A3B", borderColor: "#D4AF37" }]}>
              <Text style={[s.cardTitle, { color: "#D4AF37" }]} allowFontScaling={false}>📍 Kit Location</Text>
              <TextInput
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. Kitchen drawer, Backpack, School nurse"
                placeholderTextColor={colors.muted}
                value={glucagonKit.location}
                onChangeText={v => { setGlucagonKit(g => ({ ...g, location: v })); saveAll({ glucagonKit: { ...glucagonKit, location: v } }); }}
                allowFontScaling={false}
              />
              <Text style={[s.cardTitle, { color: "#D4AF37", marginTop: 12 }]} allowFontScaling={false}>📅 Expiry Date</Text>
              <TextInput
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="MM/YYYY"
                placeholderTextColor={colors.muted}
                value={glucagonKit.expiry}
                onChangeText={v => { setGlucagonKit(g => ({ ...g, expiry: v })); saveAll({ glucagonKit: { ...glucagonKit, expiry: v } }); }}
                allowFontScaling={false}
              />
              <Text style={[s.cardTitle, { color: "#D4AF37", marginTop: 12 }]} allowFontScaling={false}>💊 Brand / Type</Text>
              <TextInput
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. Baqsimi nasal, Gvoke auto-injector, Glucagen"
                placeholderTextColor={colors.muted}
                value={glucagonKit.brand}
                onChangeText={v => { setGlucagonKit(g => ({ ...g, brand: v })); saveAll({ glucagonKit: { ...glucagonKit, brand: v } }); }}
                allowFontScaling={false}
              />
            </View>

            {/* How to Use Glucagon */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: "#EF4444" }]}>
              <Text style={[s.cardTitle, { color: "#EF4444" }]} allowFontScaling={false}>🚨 How to Use Glucagon — Step by Step</Text>
              {[
                "1. Child is unconscious, having seizure, or cannot swallow",
                "2. CALL 911 IMMEDIATELY — do this first",
                "3. Position child on their side (recovery position)",
                "4. Baqsimi Nasal: Insert tip in one nostril, press plunger",
                "5. Gvoke Auto-Injector: Remove cap, press firmly on outer thigh",
                "6. Traditional Kit: Mix powder + liquid, inject into thigh or arm",
                "7. Child should wake within 10-15 minutes",
                "8. Once awake, give fast-acting carbs (juice, glucose tabs)",
                "9. Stay with child until emergency services arrive",
                "10. Report to endocrinologist — adjust management plan",
              ].map((step, i) => (
                <Text key={i} style={[s.stepText, { color: colors.foreground }]} allowFontScaling={false}>{step}</Text>
              ))}
            </View>

            {/* Glucagon brands info */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>💊 Available Glucagon Options (2024)</Text>
              {[
                { name: "Baqsimi", type: "Nasal Powder", note: "No injection needed — easiest for caregivers", color: "#7C3AED" },
                { name: "Gvoke", type: "Auto-Injector", note: "Pre-mixed, one-step injection", color: "#0891B2" },
                { name: "Zegalogue", type: "Auto-Injector", note: "Dasiglucagon — fast acting", color: "#16A34A" },
                { name: "Glucagen", type: "Traditional Kit", note: "Mix and inject — requires training", color: "#D97706" },
              ].map(({ name, type, note, color }) => (
                <View key={name} style={[s.glucagonRow, { borderLeftColor: color }]}>
                  <Text style={[s.glucagonName, { color }]} allowFontScaling={false}>{name} — {type}</Text>
                  <Text style={[s.glucagonNote, { color: colors.muted }]} allowFontScaling={false}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── HANDOFF CARD TAB ── */}
        {tab === "handoff" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>📋 Caregiver Handoff Card</Text>
            <Text style={[s.pageSubtitle, { color: colors.muted }]} allowFontScaling={false}>Fill in your child's details, then share via WhatsApp or SMS with any babysitter, teacher, or family member.</Text>

            <View style={[s.card, { backgroundColor: "#0C1B33", borderColor: "#D4AF37" }]}>
              {[
                { label: "Child's Name", value: childName, setter: setChildName, key: "childName", placeholder: "Enter child's name" },
                { label: "Date of Birth", value: childDOB, setter: setChildDOB, key: "childDOB", placeholder: "MM/DD/YYYY" },
                { label: "Doctor's Name", value: doctorName, setter: setDoctorName, key: "doctorName", placeholder: "Dr. Smith" },
                { label: "Doctor's Phone", value: doctorPhone, setter: setDoctorPhone, key: "doctorPhone", placeholder: "(555) 000-0000" },
                { label: "Insulin Type", value: insulinType, setter: setInsulinType, key: "insulinType", placeholder: "e.g. Humalog + Lantus" },
                { label: "Target BG Range", value: targetRange, setter: setTargetRange, key: "targetRange", placeholder: "100-180 mg/dL" },
              ].map(({ label, value, setter, key, placeholder }) => (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={[s.inputLabel, { color: "#D4AF37" }]} allowFontScaling={false}>{label}</Text>
                  <TextInput
                    style={[s.input, { color: colors.foreground, borderColor: "#D4AF3760" }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.muted}
                    value={value}
                    onChangeText={v => { setter(v); saveAll({ [key]: v }); }}
                    allowFontScaling={false}
                  />
                </View>
              ))}

              <Text style={[s.inputLabel, { color: "#D4AF37" }]} allowFontScaling={false}>Language for Emergency Phrases</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity
                      key={lang}
                      style={[s.langChip, { backgroundColor: selectedLang === lang ? "#D4AF37" : "#1E2022", borderColor: selectedLang === lang ? "#D4AF37" : "#374151" }]}
                      onPress={() => setSelectedLang(lang)}
                      accessibilityRole="button"
                      accessibilityLabel={lang}
                    >
                      <Text style={[s.langChipText, { color: selectedLang === lang ? "#0C1B33" : colors.foreground }]} allowFontScaling={false}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={s.shareBtn}
              onPress={shareHandoffCard}
              accessibilityRole="button"
              accessibilityLabel="Share caregiver handoff card"
            >
              <Text style={{ fontSize: 28 }}>📤</Text>
              <Text style={s.shareBtnText} allowFontScaling={false}>Share Handoff Card{"\n"}via WhatsApp / SMS / Email</Text>
            </TouchableOpacity>

            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>💡 When to Share This Card</Text>
              {[
                "👩‍🏫 New teacher or homeschool co-op instructor",
                "👵 Grandparent or family member babysitting",
                "🏕️ Camp counselor or sports coach",
                "✈️ Airline staff before a flight",
                "🏥 Emergency room — show on arrival",
                "🌍 Traveling internationally — translate to local language",
              ].map(tip => (
                <Text key={tip} style={[s.stepText, { color: colors.foreground }]} allowFontScaling={false}>{tip}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  back: { color: "#fff", fontSize: 24, fontWeight: "900", minWidth: 44, minHeight: 44, textAlignVertical: "center" },
  headerTitle: { color: "#D4AF37", fontSize: 16, fontWeight: "900" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: "#D4AF37" },
  tabLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16 },
  pageTitle: { fontSize: 20, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  pageSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  moduleCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 12, minHeight: 80 },
  moduleTitle: { fontSize: 15, fontWeight: "800" },
  moduleSections: { fontSize: 12, marginTop: 2 },
  moduleDetailCard: { borderRadius: 20, borderWidth: 2, padding: 20, marginBottom: 16, alignItems: "center" },
  moduleDetailTitle: { fontSize: 20, fontWeight: "900", textAlign: "center", marginTop: 8 },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionHeading: { fontSize: 15, fontWeight: "800", marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  statsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 12, borderBottomWidth: 1, borderBottomColor: "#374151" },
  statNum: { fontSize: 18, fontWeight: "900", minWidth: 60 },
  statDesc: { fontSize: 13, flex: 1, lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  linkRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#374151" },
  linkText: { color: "#60A5FA", fontSize: 14, lineHeight: 20 },
  langChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  langChipText: { fontSize: 13, fontWeight: "700" },
  phraseCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 16 },
  phraseCardTitle: { color: "#D4AF37", fontSize: 15, fontWeight: "900", marginBottom: 12 },
  phraseRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
  phraseKey: { color: "#9BA1A6", fontSize: 10, fontWeight: "700", marginBottom: 2 },
  phraseValue: { color: "#fff", fontSize: 14, lineHeight: 20 },
  copyBtn: { backgroundColor: "#D4AF37", borderRadius: 12, padding: 12, alignItems: "center", marginTop: 12 },
  copyBtnText: { color: "#0C1B33", fontWeight: "900", fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, marginTop: 4 },
  inputLabel: { fontSize: 13, fontWeight: "700" },
  stepText: { fontSize: 13, lineHeight: 22, paddingVertical: 3 },
  glucagonRow: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 10 },
  glucagonName: { fontSize: 14, fontWeight: "800" },
  glucagonNote: { fontSize: 12, marginTop: 2 },
  backBtn: { paddingVertical: 12, marginBottom: 8 },
  shareBtn: { backgroundColor: "#16A34A", borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  shareBtnText: { color: "#fff", fontWeight: "900", fontSize: 16, flex: 1, lineHeight: 24 },
});
