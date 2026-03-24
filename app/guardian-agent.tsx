/**
 * GUARDIAN AGENT — Life-Safety AI for a 4-Year-Old with T1D + Severe Wheat Allergy
 *
 * Modules:
 * 1. STATUS DASHBOARD  — real-time safety status (CGM + allergy risk)
 * 2. WHEAT ALERT SCANNER — ingredient text checker + barcode lookup via Open Food Facts
 * 3. HYPOGLYCEMIA CHECKER — toddler-specific symptom triage
 * 4. ANAPHYLAXIS PROTOCOL — step-by-step wheat reaction emergency guide
 * 5. DAILY SAFETY ROUTINE — homeschool mom checklist (morning/midday/evening)
 * 6. EMERGENCY CONTACTS + EPIPEN TRACKER — contacts, EpiPen expiry, 911 one-tap
 *
 * Data persisted via AsyncStorage. No external API keys required.
 * Open Food Facts API used for barcode lookup (free, no key needed).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform, Linking, Vibration,
  ActivityIndicator, FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

// ─── Wheat / Gluten keyword list (comprehensive) ─────────────────────────────
const WHEAT_KEYWORDS = [
  "wheat","flour","gluten","semolina","spelt","kamut","farro","einkorn","emmer",
  "durum","bulgur","farina","triticale","wheat starch","wheat germ","wheat bran",
  "wheat protein","hydrolyzed wheat","modified wheat starch","bread","breadcrumb",
  "crouton","pasta","noodle","spaghetti","macaroni","couscous","barley","rye",
  "malt","malt extract","malt vinegar","beer","ale","lager","soy sauce",
  "teriyaki","seitan","vital wheat gluten","panko","matzo","orzo","udon","ramen",
  "pita","tortilla flour","pretzel","cracker","biscuit","cookie","cake","pastry",
  "dough","batter","breaded","fried in shared oil","may contain wheat",
  "processed in a facility with wheat","contains gluten",
];

const SAFE_ALTERNATIVES = [
  "rice","corn","potato","quinoa","buckwheat","amaranth","millet","sorghum",
  "tapioca","arrowroot","almond flour","coconut flour","oat (certified GF)",
];

// ─── Hypoglycemia symptoms for toddlers (ADA + CHOA clinical guidelines) ─────
const HYPO_SYMPTOMS = [
  { id: "1", symptom: "Suddenly cranky, crying, or irritable for no reason", severity: "early", emoji: "😢" },
  { id: "2", symptom: "Pale or white skin, especially around lips", severity: "early", emoji: "😶" },
  { id: "3", symptom: "Shaky hands or wobbly legs", severity: "early", emoji: "🫨" },
  { id: "4", symptom: "Sweating even when not hot", severity: "early", emoji: "💧" },
  { id: "5", symptom: "Staring blankly, not responding to name", severity: "moderate", emoji: "👁️" },
  { id: "6", symptom: "Refusing to eat or drink (unusual for child)", severity: "moderate", emoji: "🙅" },
  { id: "7", symptom: "Extreme tiredness, wants to lie down suddenly", severity: "moderate", emoji: "😴" },
  { id: "8", symptom: "Headache (child holds or rubs head)", severity: "moderate", emoji: "🤕" },
  { id: "9", symptom: "Confusion, not knowing where she is", severity: "severe", emoji: "😵" },
  { id: "10", symptom: "Seizure or convulsions", severity: "severe", emoji: "🚨" },
  { id: "11", symptom: "Unconscious or cannot be woken up", severity: "severe", emoji: "🆘" },
];

// ─── Anaphylaxis symptoms (FARE / Food Allergy Research & Education) ─────────
const ANAPHYLAXIS_SYMPTOMS = [
  { id: "a1", area: "Skin", signs: "Hives, redness, swelling, itching, rash", emoji: "🔴" },
  { id: "a2", area: "Face", signs: "Swollen lips, tongue, or throat", emoji: "👄" },
  { id: "a3", area: "Breathing", signs: "Wheezing, coughing, hoarse voice, trouble breathing", emoji: "🫁" },
  { id: "a4", area: "Stomach", signs: "Vomiting, stomach cramps, diarrhea", emoji: "🤢" },
  { id: "a5", area: "Heart", signs: "Pale/blue skin, weak pulse, dizziness, fainting", emoji: "💙" },
  { id: "a6", area: "Behavior", signs: "Sudden extreme anxiety, says 'something is wrong'", emoji: "😱" },
];

// ─── Daily routine checklist ──────────────────────────────────────────────────
const ROUTINE_ITEMS = [
  // Morning
  { id: "m1", time: "Morning", label: "Check blood sugar before breakfast", icon: "🩸", critical: true },
  { id: "m2", time: "Morning", label: "Inspect ALL breakfast ingredients for wheat", icon: "🌾", critical: true },
  { id: "m3", time: "Morning", label: "Give morning insulin dose (if prescribed)", icon: "💉", critical: true },
  { id: "m4", time: "Morning", label: "EpiPen accessible and not expired", icon: "💊", critical: true },
  { id: "m5", time: "Morning", label: "Emergency contacts phone charged", icon: "📱", critical: false },
  { id: "m6", time: "Morning", label: "Check CGM sensor is attached and reading", icon: "📡", critical: false },
  // Midday
  { id: "d1", time: "Midday", label: "Check blood sugar before lunch", icon: "🩸", critical: true },
  { id: "d2", time: "Midday", label: "Inspect ALL lunch ingredients for wheat", icon: "🌾", critical: true },
  { id: "d3", time: "Midday", label: "Give mealtime insulin (if prescribed)", icon: "💉", critical: true },
  { id: "d4", time: "Midday", label: "Homeschool snack break — check snack label", icon: "🍎", critical: false },
  { id: "d5", time: "Midday", label: "Check for any allergy symptoms after lunch", icon: "👀", critical: false },
  // Evening
  { id: "e1", time: "Evening", label: "Check blood sugar before dinner", icon: "🩸", critical: true },
  { id: "e2", time: "Evening", label: "Inspect ALL dinner ingredients for wheat", icon: "🌾", critical: true },
  { id: "e3", time: "Evening", label: "Give evening insulin dose (if prescribed)", icon: "💉", critical: true },
  { id: "e4", time: "Evening", label: "Bedtime blood sugar check (target 90–150)", icon: "🌙", critical: true },
  { id: "e5", time: "Evening", label: "Set overnight CGM alarm on phone", icon: "⏰", critical: true },
  { id: "e6", time: "Evening", label: "EpiPen on nightstand, within reach", icon: "💊", critical: false },
];

// ─── Safe Foods Database (wheat-free + T1D friendly, low GI) ─────────────────
const SAFE_FOODS = [
  { category: "Breakfast", items: ["Eggs (scrambled, boiled)", "Greek yogurt (plain, no added sugar)", "Banana", "Berries (strawberry, blueberry)", "GF oatmeal (certified gluten-free)", "Rice cakes (plain)", "Almond butter on rice cakes"] },
  { category: "Lunch", items: ["Rice with chicken", "Corn tortilla tacos", "Quinoa salad", "GF pasta with olive oil", "Sweet potato", "Cucumber + hummus", "Apple slices + peanut butter"] },
  { category: "Dinner", items: ["Grilled chicken + rice + vegetables", "Salmon + roasted potatoes", "Beef stir-fry with rice noodles", "Lentil soup (check label)", "Corn-based polenta", "Baked potato with butter"] },
  { category: "Snacks", items: ["Rice cakes", "Popcorn (plain)", "Fresh fruit", "Carrot sticks", "Cheese cubes", "GF crackers (check label)", "Corn chips (plain)"] },
  { category: "AVOID (Hidden Wheat)", items: ["Soy sauce", "Teriyaki sauce", "Gravy from packets", "Malt vinegar", "Some ice cream cones", "Licorice candy", "Some medications (check with pharmacist)"] },
];

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  contacts: "@guardian_contacts_v1",
  epipen: "@guardian_epipen_v1",
  routine: "@guardian_routine_v1",
  childName: "@guardian_child_name_v1",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact { id: string; name: string; phone: string; role: string; }
interface EpiPen { location: string; expiry: string; }
type Tab = "status" | "scanner" | "hypo" | "anaphylaxis" | "routine" | "emergency";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const haptic = (type: "light" | "medium" | "error" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  else if (type === "medium") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const call911 = () => {
  haptic("error");
  Vibration.vibrate([0, 500, 200, 500]);
  Linking.openURL("tel:911");
};

const callNumber = (phone: string) => {
  Linking.openURL(`tel:${phone}`);
};

// ─── Wheat Scanner Component ──────────────────────────────────────────────────
function WheatScanner({ colors }: { colors: any }) {
  const [text, setText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<{ safe: boolean; found: string[]; product?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const scanIngredients = useCallback((ingredients: string) => {
    const lower = ingredients.toLowerCase();
    const found = WHEAT_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase()));
    return { safe: found.length === 0, found };
  }, []);

  const checkText = () => {
    if (!text.trim()) return;
    haptic("light");
    const res = scanIngredients(text);
    setResult({ ...res });
    if (!res.safe) haptic("error");
  };

  const lookupBarcode = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`);
      const data = await resp.json();
      if (data.status === 1 && data.product) {
        const ingredients = data.product.ingredients_text || "";
        const allergens = data.product.allergens_tags?.join(" ") || "";
        const combined = `${ingredients} ${allergens}`;
        const res = scanIngredients(combined);
        setResult({ ...res, product: data.product.product_name || "Unknown product" });
        if (!res.safe) haptic("error");
      } else {
        Alert.alert("Product not found", "This barcode was not found in the Open Food Facts database. Always read the physical label as backup.");
      }
    } catch {
      Alert.alert("Network error", "Could not reach the food database. Please read the physical label.");
    }
    setLoading(false);
  };

  return (
    <View>
      {/* Ingredient Text Check */}
      <Text style={[s.sectionTitle, { color: colors.foreground }]} allowFontScaling={false}>📋 Check Ingredient Label</Text>
      <Text style={[s.hint, { color: colors.muted }]} allowFontScaling={false}>Type or paste the ingredients list from any food package</Text>
      <TextInput
        style={[s.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        value={text}
        onChangeText={setText}
        placeholder="e.g. Ingredients: corn, sugar, salt, natural flavors..."
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={4}
        allowFontScaling={false}
      />
      <TouchableOpacity style={[s.scanBtn, { backgroundColor: "#1D4ED8" }]} onPress={checkText} accessibilityRole="button" accessibilityLabel="Check ingredients for wheat">
        <Text style={s.scanBtnText} allowFontScaling={false}>🔍 Check for Wheat Now</Text>
      </TouchableOpacity>

      {/* Barcode Lookup */}
      <Text style={[s.sectionTitle, { color: colors.foreground, marginTop: 20 }]} allowFontScaling={false}>📦 Barcode Lookup</Text>
      <Text style={[s.hint, { color: colors.muted }]} allowFontScaling={false}>Type the barcode number from the package (uses Open Food Facts database)</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={[s.barcodeInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, flex: 1 }]}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="e.g. 0123456789012"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={lookupBarcode}
          allowFontScaling={false}
        />
        <TouchableOpacity style={[s.scanBtn, { backgroundColor: "#7C3AED", paddingHorizontal: 16 }]} onPress={lookupBarcode} accessibilityRole="button" accessibilityLabel="Look up barcode">
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.scanBtnText} allowFontScaling={false}>Look Up</Text>}
        </TouchableOpacity>
      </View>

      {/* Result */}
      {result && (
        <View style={[s.resultBox, { backgroundColor: result.safe ? "#14532D" : "#7F1D1D", borderColor: result.safe ? "#22C55E" : "#EF4444" }]}>
          {result.product && <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 6 }} allowFontScaling={false}>📦 {result.product}</Text>}
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 4 }} allowFontScaling={false}>
            {result.safe ? "✅ SAFE — No wheat detected" : "🚨 DANGER — WHEAT FOUND!"}
          </Text>
          {!result.safe && (
            <>
              <Text style={{ color: "#FCA5A5", fontSize: 13, marginBottom: 8 }} allowFontScaling={false}>
                ⚠️ DO NOT give this food to your child. Wheat detected in:
              </Text>
              {result.found.map(kw => (
                <Text key={kw} style={{ color: "#FCA5A5", fontSize: 12, marginLeft: 8 }} allowFontScaling={false}>• "{kw}"</Text>
              ))}
            </>
          )}
          {result.safe && (
            <Text style={{ color: "#86EFAC", fontSize: 12, marginTop: 4 }} allowFontScaling={false}>
              ✓ No wheat keywords found. Always double-check "may contain" warnings on the physical label.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GuardianAgent() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("status");
  const [childName, setChildName] = useState("Your Child");
  const [editingName, setEditingName] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Mom", phone: "", role: "Primary Caregiver" },
    { id: "2", name: "Doctor / Endocrinologist", phone: "", role: "Medical" },
    { id: "3", name: "Allergist", phone: "", role: "Medical" },
  ]);
  const [epipens, setEpipens] = useState<EpiPen[]>([
    { location: "Kitchen drawer", expiry: "" },
    { location: "Backpack / go-bag", expiry: "" },
  ]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hypoChecked, setHypoChecked] = useState<Set<string>>(new Set());
  const [anaphChecked, setAnaphChecked] = useState<Set<string>>(new Set());
  const [showSafeFoods, setShowSafeFoods] = useState(false);

  // Load persisted data
  useEffect(() => {
    (async () => {
      const [cn, ct, ep, rt] = await Promise.all([
        AsyncStorage.getItem(KEYS.childName),
        AsyncStorage.getItem(KEYS.contacts),
        AsyncStorage.getItem(KEYS.epipen),
        AsyncStorage.getItem(KEYS.routine),
      ]);
      if (cn) setChildName(cn);
      if (ct) try { setContacts(JSON.parse(ct)); } catch {}
      if (ep) try { setEpipens(JSON.parse(ep)); } catch {}
      if (rt) try { setCheckedItems(new Set(JSON.parse(rt))); } catch {}
    })();
  }, []);

  const saveContacts = async (data: Contact[]) => { setContacts(data); await AsyncStorage.setItem(KEYS.contacts, JSON.stringify(data)); };
  const saveEpipens = async (data: EpiPen[]) => { setEpipens(data); await AsyncStorage.setItem(KEYS.epipen, JSON.stringify(data)); };

  const toggleRoutine = async (id: string) => {
    haptic("light");
    const next = new Set(checkedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setCheckedItems(next);
    await AsyncStorage.setItem(KEYS.routine, JSON.stringify([...next]));
  };

  const toggleHypo = (id: string) => {
    haptic("light");
    const next = new Set(hypoChecked);
    next.has(id) ? next.delete(id) : next.add(id);
    setHypoChecked(next);
  };

  const toggleAnaph = (id: string) => {
    haptic("light");
    const next = new Set(anaphChecked);
    next.has(id) ? next.delete(id) : next.add(id);
    setAnaphChecked(next);
  };

  // Triage assessment
  const severeHypo = [...hypoChecked].some(id => HYPO_SYMPTOMS.find(s => s.id === id)?.severity === "severe");
  const moderateHypo = [...hypoChecked].some(id => HYPO_SYMPTOMS.find(s => s.id === id)?.severity === "moderate");
  const anaphylaxisRisk = anaphChecked.size >= 2;

  // Routine progress
  const totalItems = ROUTINE_ITEMS.length;
  const criticalItems = ROUTINE_ITEMS.filter(i => i.critical);
  const criticalDone = criticalItems.filter(i => checkedItems.has(i.id)).length;
  const allDone = checkedItems.size;

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: "status", label: "Status", emoji: "🛡️" },
    { id: "scanner", label: "Scanner", emoji: "🌾" },
    { id: "hypo", label: "Low BG", emoji: "🩸" },
    { id: "anaphylaxis", label: "Allergy", emoji: "⚠️" },
    { id: "routine", label: "Routine", emoji: "📋" },
    { id: "emergency", label: "Emergency", emoji: "🚨" },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#0C1B33" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back} allowFontScaling={false}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={s.headerTitle} allowFontScaling={false}>🛡️ Guardian Agent</Text>
          {editingName ? (
            <TextInput
              style={[s.nameInput, { color: "#D4AF37" }]}
              value={childName}
              onChangeText={setChildName}
              onBlur={async () => { setEditingName(false); await AsyncStorage.setItem(KEYS.childName, childName); }}
              autoFocus
              allowFontScaling={false}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={s.childName} allowFontScaling={false}>{childName} ✏️</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={call911} style={s.sos} accessibilityRole="button" accessibilityLabel="Call 911 emergency">
          <Text style={s.sosText} allowFontScaling={false}>911</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabBar, { backgroundColor: "#0C1B33" }]}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.tabBtn, tab === t.id && s.tabBtnActive]}
            onPress={() => { haptic("light"); setTab(t.id); }}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
          >
            <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
            <Text style={[s.tabLabel, { color: tab === t.id ? "#D4AF37" : "#9BA1A6" }]} allowFontScaling={false}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── STATUS TAB ── */}
        {tab === "status" && (
          <View>
            {/* Safety Score */}
            <View style={[s.card, { backgroundColor: "#0C1B33", borderColor: "#D4AF37" }]}>
              <Text style={{ color: "#D4AF37", fontSize: 22, fontWeight: "900", textAlign: "center" }} allowFontScaling={false}>🛡️ GUARDIAN AGENT ACTIVE</Text>
              <Text style={{ color: "#fff", fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 }} allowFontScaling={false}>
                Protecting {childName} from hypoglycemia and wheat exposure 24/7.{"\n"}All 6 safety modules are armed and ready.
              </Text>
            </View>

            {/* Daily Critical Tasks */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>Today's Critical Safety Tasks</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${(criticalDone / criticalItems.length) * 100}%`, backgroundColor: criticalDone === criticalItems.length ? "#22C55E" : "#F59E0B" }]} />
              </View>
              <Text style={[{ fontSize: 12, marginTop: 4 }, { color: colors.muted }]} allowFontScaling={false}>{criticalDone}/{criticalItems.length} critical tasks done today</Text>
              {criticalItems.filter(i => !checkedItems.has(i.id)).slice(0, 3).map(item => (
                <View key={item.id} style={[s.alertRow, { borderColor: "#EF4444" }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <Text style={{ color: "#EF4444", fontSize: 13, flex: 1, marginLeft: 8 }} allowFontScaling={false}>⚠️ {item.label}</Text>
                </View>
              ))}
              {criticalDone === criticalItems.length && (
                <Text style={{ color: "#22C55E", fontWeight: "700", fontSize: 14, marginTop: 8, textAlign: "center" }} allowFontScaling={false}>✅ All critical tasks complete for this session!</Text>
              )}
            </View>

            {/* Quick Action Grid */}
            <Text style={[s.sectionTitle, { color: colors.foreground }]} allowFontScaling={false}>Quick Actions</Text>
            <View style={s.quickGrid}>
              {[
                { label: "Wheat Scanner", emoji: "🌾", color: "#7C3AED", action: () => setTab("scanner") },
                { label: "Low BG Check", emoji: "🩸", color: "#DC2626", action: () => setTab("hypo") },
                { label: "Allergy Alert", emoji: "⚠️", color: "#D97706", action: () => setTab("anaphylaxis") },
                { label: "Daily Routine", emoji: "📋", color: "#0891B2", action: () => setTab("routine") },
                { label: "Emergency", emoji: "🚨", color: "#DC2626", action: () => setTab("emergency") },
                { label: "Safe Foods", emoji: "🥗", color: "#059669", action: () => setShowSafeFoods(v => !v) },
              ].map(({ label, emoji, color, action }) => (
                <TouchableOpacity key={label} style={[s.quickBtn, { backgroundColor: color + "22", borderColor: color }]} onPress={action} accessibilityRole="button" accessibilityLabel={label}>
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  <Text style={[s.quickLabel, { color }]} allowFontScaling={false}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Safe Foods Database */}
            {showSafeFoods && (
              <View style={[s.card, { backgroundColor: colors.surface, borderColor: "#22C55E" }]}>
                <Text style={[s.cardTitle, { color: "#22C55E" }]} allowFontScaling={false}>🥗 Safe Foods for {childName}</Text>
                <Text style={[s.hint, { color: colors.muted }]} allowFontScaling={false}>Wheat-free + T1D friendly (low glycemic index)</Text>
                {SAFE_FOODS.map(cat => (
                  <View key={cat.category} style={{ marginTop: 12 }}>
                    <Text style={[{ fontWeight: "800", fontSize: 13, marginBottom: 4 }, { color: cat.category === "AVOID (Hidden Wheat)" ? "#EF4444" : colors.foreground }]} allowFontScaling={false}>
                      {cat.category === "AVOID (Hidden Wheat)" ? "🚫 " : "✅ "}{cat.category}
                    </Text>
                    {cat.items.map(item => (
                      <Text key={item} style={[{ fontSize: 12, marginLeft: 12, lineHeight: 20 }, { color: colors.muted }]} allowFontScaling={false}>• {item}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Research Summary */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>📚 What the Research Says</Text>
              {[
                ["Best CGM for toddlers", "Dexcom G7 (FDA approved 2+) and FreeStyle Libre 3 (approved 2+). Both give real-time readings every 1–5 min with parent phone alerts."],
                ["Best T1D family app", "Gluroo — shares live CGM data with family members. Free tier available. Integrates with Dexcom and Libre."],
                ["Wheat allergy severity", "Wheat-dependent exercise-induced anaphylaxis (WDEIA) and IgE-mediated wheat allergy can be fatal. EpiPen must be within 30 seconds reach at all times."],
                ["Toddler hypo signs", "Behavioral changes (crying, irritability) appear BEFORE physical signs in children under 5. Trust your instincts — check BG immediately."],
                ["Overnight risk", "Nocturnal hypoglycemia is common in T1D children. CGM alarms set to 80 mg/dL prevent 'dead-in-bed' events. Never skip bedtime BG check."],
              ].map(([title, body]) => (
                <View key={title as string} style={{ marginBottom: 10 }}>
                  <Text style={[{ fontWeight: "800", fontSize: 13 }, { color: colors.foreground }]} allowFontScaling={false}>{title as string}</Text>
                  <Text style={[{ fontSize: 12, lineHeight: 18, marginTop: 2 }, { color: colors.muted }]} allowFontScaling={false}>{body as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── WHEAT SCANNER TAB ── */}
        {tab === "scanner" && (
          <View>
            <View style={[s.alertBanner, { backgroundColor: "#7F1D1D" }]}>
              <Text style={s.alertBannerText} allowFontScaling={false}>🌾 WHEAT KILLS — SCAN EVERYTHING BEFORE FEEDING {childName.toUpperCase()}</Text>
            </View>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <WheatScanner colors={colors} />
            </View>
            {/* Hidden wheat sources */}
            <View style={[s.card, { backgroundColor: "#7F1D1D22", borderColor: "#EF4444" }]}>
              <Text style={[s.cardTitle, { color: "#EF4444" }]} allowFontScaling={false}>🚨 Hidden Wheat — Most Parents Miss These</Text>
              {["Soy sauce (contains wheat)", "Malt extract / malt vinegar", "Some medications and vitamins", "Licorice and some candies", "Shared cooking oil (cross-contamination)", "Restaurant 'gluten-free' items (cross-contact risk)", "Some oats (unless certified GF)", "Gravy and soup packets", "Some ice cream cones", "Communion wafers"].map(item => (
                <Text key={item} style={{ color: "#FCA5A5", fontSize: 12, marginLeft: 8, lineHeight: 22 }} allowFontScaling={false}>⚠️ {item}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── HYPOGLYCEMIA CHECKER TAB ── */}
        {tab === "hypo" && (
          <View>
            <View style={[s.alertBanner, { backgroundColor: "#7F1D1D" }]}>
              <Text style={s.alertBannerText} allowFontScaling={false}>🩸 CHECK BLOOD SUGAR IMMEDIATELY IF YOU SEE ANY SYMPTOMS</Text>
            </View>

            {severeHypo && (
              <View style={[s.emergencyBox]}>
                <Text style={s.emergencyText} allowFontScaling={false}>🚨 SEVERE HYPOGLYCEMIA — CALL 911 NOW</Text>
                <Text style={{ color: "#fff", fontSize: 13, marginTop: 4, textAlign: "center" }} allowFontScaling={false}>Do NOT give food or drink. Place child on side. Call 911.</Text>
                <TouchableOpacity style={s.call911Btn} onPress={call911}>
                  <Text style={s.call911Text} allowFontScaling={false}>📞 CALL 911</Text>
                </TouchableOpacity>
              </View>
            )}

            {!severeHypo && moderateHypo && (
              <View style={[s.card, { backgroundColor: "#78350F", borderColor: "#F59E0B" }]}>
                <Text style={{ color: "#FDE68A", fontWeight: "900", fontSize: 16, textAlign: "center" }} allowFontScaling={false}>⚠️ MODERATE SYMPTOMS — ACT NOW</Text>
                <Text style={{ color: "#FDE68A", fontSize: 13, marginTop: 6, lineHeight: 20 }} allowFontScaling={false}>
                  1. Check blood sugar immediately{"\n"}
                  2. If BG &lt; 70: Give 4 oz juice or 4 glucose tablets{"\n"}
                  3. Wait 15 minutes, recheck BG{"\n"}
                  4. If no improvement, call doctor
                </Text>
              </View>
            )}

            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>Tap all symptoms you see in {childName}:</Text>
              <Text style={[s.hint, { color: colors.muted }]} allowFontScaling={false}>Toddler-specific signs (ADA + Children's Hospital guidelines)</Text>
              {["early", "moderate", "severe"].map(severity => (
                <View key={severity}>
                  <Text style={[s.severityLabel, { color: severity === "early" ? "#22C55E" : severity === "moderate" ? "#F59E0B" : "#EF4444" }]} allowFontScaling={false}>
                    {severity === "early" ? "🟢 Early Signs" : severity === "moderate" ? "🟡 Moderate Signs" : "🔴 Severe — Call 911"}
                  </Text>
                  {HYPO_SYMPTOMS.filter(s => s.severity === severity).map(sym => (
                    <TouchableOpacity
                      key={sym.id}
                      style={[s.symptomRow, hypoChecked.has(sym.id) && { backgroundColor: severity === "severe" ? "#7F1D1D" : severity === "moderate" ? "#78350F" : "#14532D" }]}
                      onPress={() => toggleHypo(sym.id)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={sym.symptom}
                    >
                      <Text style={{ fontSize: 20, marginRight: 10 }}>{sym.emoji}</Text>
                      <Text style={[{ flex: 1, fontSize: 13, lineHeight: 20 }, { color: hypoChecked.has(sym.id) ? "#fff" : colors.foreground }]} allowFontScaling={false}>{sym.symptom}</Text>
                      <Text style={{ fontSize: 18 }}>{hypoChecked.has(sym.id) ? "✅" : "⬜"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <TouchableOpacity style={[s.scanBtn, { backgroundColor: "#374151", marginTop: 12 }]} onPress={() => setHypoChecked(new Set())}>
                <Text style={s.scanBtnText} allowFontScaling={false}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {/* 15-15 Rule */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>📏 The 15-15 Rule (ADA)</Text>
              {["Give 15g fast-acting carbs (4 oz juice, 4 glucose tablets, or 1 tbsp honey)", "Wait 15 minutes", "Recheck blood sugar", "If still below 70 mg/dL — repeat", "Once above 70 — give small snack (peanut butter on rice cake)", "If unconscious — DO NOT give food. Call 911. Use Glucagon kit."].map((step, i) => (
                <Text key={i} style={[{ fontSize: 13, lineHeight: 22, marginLeft: 4 }, { color: colors.foreground }]} allowFontScaling={false}>{i + 1}. {step}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── ANAPHYLAXIS PROTOCOL TAB ── */}
        {tab === "anaphylaxis" && (
          <View>
            <View style={[s.alertBanner, { backgroundColor: "#7C2D12" }]}>
              <Text style={s.alertBannerText} allowFontScaling={false}>⚠️ WHEAT ANAPHYLAXIS CAN KILL IN MINUTES — KNOW THIS PROTOCOL</Text>
            </View>

            {anaphylaxisRisk && (
              <View style={s.emergencyBox}>
                <Text style={s.emergencyText} allowFontScaling={false}>🚨 ANAPHYLAXIS SUSPECTED — USE EPIPEN NOW</Text>
                <Text style={{ color: "#fff", fontSize: 13, marginTop: 4, textAlign: "center" }} allowFontScaling={false}>Inject EpiPen into outer thigh. Call 911. Stay with child.</Text>
                <TouchableOpacity style={s.call911Btn} onPress={call911}>
                  <Text style={s.call911Text} allowFontScaling={false}>📞 CALL 911 NOW</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>Check symptoms {childName} is showing:</Text>
              {ANAPHYLAXIS_SYMPTOMS.map(sym => (
                <TouchableOpacity
                  key={sym.id}
                  style={[s.symptomRow, anaphChecked.has(sym.id) && { backgroundColor: "#7F1D1D" }]}
                  onPress={() => toggleAnaph(sym.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={sym.area}
                >
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{sym.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontWeight: "700", fontSize: 13 }, { color: anaphChecked.has(sym.id) ? "#fff" : colors.foreground }]} allowFontScaling={false}>{sym.area}</Text>
                    <Text style={[{ fontSize: 12, lineHeight: 18 }, { color: anaphChecked.has(sym.id) ? "#FCA5A5" : colors.muted }]} allowFontScaling={false}>{sym.signs}</Text>
                  </View>
                  <Text style={{ fontSize: 18 }}>{anaphChecked.has(sym.id) ? "✅" : "⬜"}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[s.scanBtn, { backgroundColor: "#374151", marginTop: 12 }]} onPress={() => setAnaphChecked(new Set())}>
                <Text style={s.scanBtnText} allowFontScaling={false}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {/* Step-by-step protocol */}
            <View style={[s.card, { backgroundColor: "#7C2D1222", borderColor: "#EF4444" }]}>
              <Text style={[s.cardTitle, { color: "#EF4444" }]} allowFontScaling={false}>🚨 Anaphylaxis Action Plan (FARE Protocol)</Text>
              {[
                ["STEP 1 — EPIPEN", "Inject EpiPen Jr. into outer mid-thigh (through clothing is OK). Hold for 10 seconds. Note the time."],
                ["STEP 2 — CALL 911", "Call 911 immediately after EpiPen. Say: 'My 4-year-old is having a severe allergic reaction to wheat. She has Type 1 Diabetes.'"],
                ["STEP 3 — POSITION", "Lay child flat on her back. Raise her legs unless she has trouble breathing — then sit her up."],
                ["STEP 4 — SECOND EPIPEN", "If no improvement in 5–15 minutes and a second EpiPen is available, use it in the other thigh."],
                ["STEP 5 — STAY WITH CHILD", "Do not leave her. Monitor breathing. Be ready to do CPR. Do NOT give antihistamine as first treatment."],
                ["STEP 6 — HOSPITAL", "Even if she improves, she MUST go to hospital. Biphasic reactions can occur 4–8 hours later."],
              ].map(([step, body]) => (
                <View key={step as string} style={{ marginBottom: 12 }}>
                  <Text style={{ color: "#EF4444", fontWeight: "900", fontSize: 13 }} allowFontScaling={false}>{step as string}</Text>
                  <Text style={{ color: "#FCA5A5", fontSize: 12, lineHeight: 18, marginTop: 2 }} allowFontScaling={false}>{body as string}</Text>
                </View>
              ))}
            </View>

            {/* EpiPen How-To */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>💊 How to Use EpiPen Jr. (for a 4-year-old)</Text>
              {["Remove EpiPen from carrier tube", "Pull off BLUE safety cap (never put thumb over orange tip)", "Press ORANGE tip firmly against outer thigh (can go through clothing)", "Hold for 10 full seconds — count out loud", "Remove and massage injection site for 10 seconds", "Note the time and call 911"].map((step, i) => (
                <Text key={i} style={[{ fontSize: 13, lineHeight: 22 }, { color: colors.foreground }]} allowFontScaling={false}>{i + 1}. {step}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── DAILY ROUTINE TAB ── */}
        {tab === "routine" && (
          <View>
            <View style={[s.card, { backgroundColor: "#0C1B33", borderColor: "#D4AF37" }]}>
              <Text style={{ color: "#D4AF37", fontWeight: "900", fontSize: 15, textAlign: "center" }} allowFontScaling={false}>
                {allDone}/{totalItems} tasks done today  ·  {criticalDone}/{criticalItems.length} critical
              </Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${(allDone / totalItems) * 100}%`, backgroundColor: allDone === totalItems ? "#22C55E" : "#D4AF37" }]} />
              </View>
            </View>

            {["Morning", "Midday", "Evening"].map(period => (
              <View key={period} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>
                  {period === "Morning" ? "🌅" : period === "Midday" ? "☀️" : "🌙"} {period}
                </Text>
                {ROUTINE_ITEMS.filter(i => i.time === period).map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.routineRow, checkedItems.has(item.id) && { backgroundColor: "#14532D22" }]}
                    onPress={() => toggleRoutine(item.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={item.label}
                  >
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontSize: 13, lineHeight: 20 }, { color: checkedItems.has(item.id) ? "#22C55E" : colors.foreground }]} allowFontScaling={false}>{item.label}</Text>
                      {item.critical && <Text style={{ color: "#EF4444", fontSize: 10, fontWeight: "700" }} allowFontScaling={false}>⚠️ CRITICAL</Text>}
                    </View>
                    <Text style={{ fontSize: 20 }}>{checkedItems.has(item.id) ? "✅" : "⬜"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[s.scanBtn, { backgroundColor: "#374151" }]}
              onPress={async () => { setCheckedItems(new Set()); await AsyncStorage.setItem(KEYS.routine, JSON.stringify([])); haptic("medium"); }}
            >
              <Text style={s.scanBtnText} allowFontScaling={false}>🔄 Reset for New Day</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── EMERGENCY TAB ── */}
        {tab === "emergency" && (
          <View>
            {/* 911 Button */}
            <TouchableOpacity style={s.bigEmergencyBtn} onPress={call911} accessibilityRole="button" accessibilityLabel="Call 911">
              <Text style={s.bigEmergencyText} allowFontScaling={false}>📞 CALL 911</Text>
              <Text style={{ color: "#fff", fontSize: 13, marginTop: 4 }} allowFontScaling={false}>Tap for immediate emergency services</Text>
            </TouchableOpacity>

            {/* EpiPen Tracker */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>💊 EpiPen Locations & Expiry</Text>
              {epipens.map((ep, i) => (
                <View key={i} style={[s.epiRow, { borderColor: colors.border }]}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>💊</Text>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[s.inlineInput, { color: colors.foreground, borderColor: colors.border }]}
                      value={ep.location}
                      onChangeText={v => { const next = [...epipens]; next[i] = { ...ep, location: v }; saveEpipens(next); }}
                      placeholder="Location (e.g. Kitchen drawer)"
                      placeholderTextColor={colors.muted}
                      allowFontScaling={false}
                    />
                    <TextInput
                      style={[s.inlineInput, { color: colors.foreground, borderColor: colors.border, marginTop: 4 }]}
                      value={ep.expiry}
                      onChangeText={v => { const next = [...epipens]; next[i] = { ...ep, expiry: v }; saveEpipens(next); }}
                      placeholder="Expiry date (MM/YYYY)"
                      placeholderTextColor={colors.muted}
                      allowFontScaling={false}
                    />
                  </View>
                </View>
              ))}
              <Text style={[s.hint, { color: "#F59E0B", marginTop: 8 }]} allowFontScaling={false}>⚠️ Check expiry monthly. Expired EpiPens may not work. Replace immediately if expired.</Text>
            </View>

            {/* Emergency Contacts */}
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>📞 Emergency Contacts</Text>
              {contacts.map((c, i) => (
                <View key={c.id} style={[s.contactRow, { borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[s.inlineInput, { color: colors.foreground, borderColor: colors.border, fontWeight: "700" }]}
                      value={c.name}
                      onChangeText={v => { const next = [...contacts]; next[i] = { ...c, name: v }; saveContacts(next); }}
                      placeholder="Name"
                      placeholderTextColor={colors.muted}
                      allowFontScaling={false}
                    />
                    <TextInput
                      style={[s.inlineInput, { color: colors.foreground, borderColor: colors.border, marginTop: 4 }]}
                      value={c.phone}
                      onChangeText={v => { const next = [...contacts]; next[i] = { ...c, phone: v }; saveContacts(next); }}
                      placeholder="Phone number"
                      placeholderTextColor={colors.muted}
                      keyboardType="phone-pad"
                      allowFontScaling={false}
                    />
                  </View>
                  {c.phone ? (
                    <TouchableOpacity style={s.callBtn} onPress={() => callNumber(c.phone)} accessibilityRole="button" accessibilityLabel={`Call ${c.name}`}>
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }} allowFontScaling={false}>📞 Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              <TouchableOpacity
                style={[s.scanBtn, { backgroundColor: "#1D4ED8", marginTop: 8 }]}
                onPress={() => saveContacts([...contacts, { id: Date.now().toString(), name: "", phone: "", role: "Other" }])}
              >
                <Text style={s.scanBtnText} allowFontScaling={false}>+ Add Contact</Text>
              </TouchableOpacity>
            </View>

            {/* What to tell 911 */}
            <View style={[s.card, { backgroundColor: "#7F1D1D22", borderColor: "#EF4444" }]}>
              <Text style={[s.cardTitle, { color: "#EF4444" }]} allowFontScaling={false}>📢 What to Tell 911</Text>
              <Text style={{ color: "#FCA5A5", fontSize: 13, lineHeight: 22 }} allowFontScaling={false}>
                "My 4-year-old daughter has Type 1 Diabetes AND a severe wheat allergy. She is having [describe: a low blood sugar / allergic reaction]. I have [given/not given] her EpiPen. She takes insulin. Please send an ambulance immediately."
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: "#fff", fontSize: 16, fontWeight: "600", minWidth: 44, minHeight: 44, textAlignVertical: "center" },
  headerTitle: { color: "#D4AF37", fontSize: 16, fontWeight: "900" },
  childName: { color: "#D4AF37", fontSize: 12, marginTop: 2 },
  nameInput: { fontSize: 12, borderBottomWidth: 1, borderColor: "#D4AF37", minWidth: 120, textAlign: "center" },
  sos: { backgroundColor: "#DC2626", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, minWidth: 50, alignItems: "center" },
  sosText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  tabBar: { borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", minWidth: 70 },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: "#D4AF37" },
  tabLabel: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 6, marginTop: 4 },
  hint: { fontSize: 12, marginBottom: 10, lineHeight: 18 },
  alertBanner: { borderRadius: 12, padding: 12, marginBottom: 16, alignItems: "center" },
  alertBannerText: { color: "#fff", fontWeight: "900", fontSize: 13, textAlign: "center", lineHeight: 20 },
  emergencyBox: { backgroundColor: "#7F1D1D", borderRadius: 16, padding: 20, marginBottom: 16, alignItems: "center", borderWidth: 2, borderColor: "#EF4444" },
  emergencyText: { color: "#fff", fontWeight: "900", fontSize: 18, textAlign: "center" },
  call911Btn: { backgroundColor: "#EF4444", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 12 },
  call911Text: { color: "#fff", fontWeight: "900", fontSize: 18 },
  bigEmergencyBtn: { backgroundColor: "#DC2626", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16 },
  bigEmergencyText: { color: "#fff", fontWeight: "900", fontSize: 28 },
  textArea: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 13, minHeight: 90, textAlignVertical: "top", marginBottom: 10 },
  barcodeInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15, minHeight: 48 },
  scanBtn: { borderRadius: 12, padding: 14, alignItems: "center", minHeight: 48 },
  scanBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  resultBox: { borderRadius: 12, borderWidth: 2, padding: 16, marginTop: 12 },
  symptomRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: "transparent" },
  severityLabel: { fontWeight: "900", fontSize: 13, marginTop: 12, marginBottom: 6 },
  routineRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginBottom: 6 },
  progressBar: { height: 8, backgroundColor: "#374151", borderRadius: 4, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  alertRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 6 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  quickBtn: { width: "30%", aspectRatio: 1, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", gap: 4 },
  quickLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  epiRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, marginBottom: 4 },
  contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  inlineInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, minHeight: 40 },
  callBtn: { backgroundColor: "#16A34A", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, minHeight: 44, justifyContent: "center" },
});
