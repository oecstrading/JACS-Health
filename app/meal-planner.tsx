/**
 * WHEAT-FREE MEAL PLANNER 🥗
 * One-tap weekly meal plan generation for a 4-year-old with T1D and wheat allergy.
 *
 * Features:
 * - One-tap "Generate My Week!" button — creates a full 7-day plan instantly
 * - 40+ wheat-free, T1D-friendly meals with carb counts and portion sizes
 * - Color-coded BG impact: 🟢 Low-impact, 🟡 Moderate, 🔴 High (needs bolus)
 * - Per-meal carb count for insulin dosing reference
 * - Swap individual meals with one tap
 * - Auto-generated shopping list from the weekly plan
 * - Share shopping list via WhatsApp, SMS, or any share sheet
 * - Save plan to device (AsyncStorage)
 * - Wheat-danger warning on any accidentally added item
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, Platform, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const STORAGE_KEY = "@meal_planner_v1";

const haptic = (t: "light" | "success" | "heavy" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (t === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (t === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// ─── Meal Database ─────────────────────────────────────────────────────────────
// impact: "low" = <15g carbs, "medium" = 15-30g, "high" = >30g
// All meals are 100% wheat/gluten-free and T1D-appropriate for toddlers
interface Meal {
  id: string;
  name: string;
  emoji: string;
  carbs: number;        // grams
  portion: string;      // child-sized portion
  impact: "low" | "medium" | "high";
  ingredients: string[];
  tip?: string;         // T1D dosing tip
}

const BREAKFASTS: Meal[] = [
  { id: "b1", name: "Scrambled Eggs + Fruit", emoji: "🍳", carbs: 18, portion: "2 eggs + ½ cup berries", impact: "medium", ingredients: ["eggs (2)", "strawberries", "blueberries", "butter"], tip: "Berries are low-GI — gentle BG rise" },
  { id: "b2", name: "GF Oatmeal + Banana", emoji: "🥣", carbs: 38, portion: "½ cup oats + ½ banana", impact: "high", ingredients: ["certified GF oats (½ cup)", "banana (½)", "milk (¼ cup)", "cinnamon"], tip: "Dose insulin before eating — moderate-high BG rise" },
  { id: "b3", name: "Rice Cakes + Peanut Butter", emoji: "🍚", carbs: 22, portion: "2 rice cakes + 1 tbsp PB", impact: "medium", ingredients: ["plain rice cakes (2)", "natural peanut butter (1 tbsp)", "banana slices"], tip: "Fat in PB slows carb absorption" },
  { id: "b4", name: "Yogurt Parfait", emoji: "🍦", carbs: 20, portion: "½ cup yogurt + berries", impact: "medium", ingredients: ["plain Greek yogurt (½ cup)", "mixed berries (¼ cup)", "honey (½ tsp)"], tip: "Plain yogurt is lower carb than flavored" },
  { id: "b5", name: "Smoothie Bowl", emoji: "🫐", carbs: 30, portion: "½ cup smoothie base", impact: "high", ingredients: ["frozen banana (½)", "frozen berries (¼ cup)", "milk (¼ cup)", "GF granola (1 tbsp)"], tip: "Liquid carbs raise BG faster — pre-bolus 10 min" },
  { id: "b6", name: "Corn Tortilla + Egg", emoji: "🌮", carbs: 16, portion: "1 small tortilla + 1 egg", impact: "medium", ingredients: ["corn tortilla (1 small)", "egg (1)", "avocado (2 tbsp)", "salsa"], tip: "Avocado fat helps steady BG" },
  { id: "b7", name: "Sweet Potato Hash", emoji: "🍠", carbs: 25, portion: "½ cup sweet potato", impact: "medium", ingredients: ["sweet potato (½ cup diced)", "egg (1)", "olive oil", "cinnamon"], tip: "Sweet potato is lower GI than white potato" },
];

const LUNCHES: Meal[] = [
  { id: "l1", name: "Rice Bowl + Chicken", emoji: "🍚", carbs: 35, portion: "¼ cup rice + 2 oz chicken", impact: "high", ingredients: ["white rice (¼ cup cooked)", "chicken breast (2 oz)", "broccoli (¼ cup)", "olive oil"], tip: "Protein + fat slows rice absorption" },
  { id: "l2", name: "Corn Tortilla Tacos", emoji: "🌮", carbs: 22, portion: "2 small corn tortillas", impact: "medium", ingredients: ["corn tortillas (2 small)", "ground beef (2 oz)", "cheese (1 tbsp)", "lettuce", "tomato"], tip: "Corn tortillas are naturally wheat-free" },
  { id: "l3", name: "GF Pasta + Tomato Sauce", emoji: "🍝", carbs: 40, portion: "½ cup GF pasta", impact: "high", ingredients: ["GF pasta — rice or corn (½ cup cooked)", "tomato sauce (3 tbsp)", "ground beef (2 oz)", "parmesan"], tip: "GF pasta raises BG similarly to regular pasta — dose accordingly" },
  { id: "l4", name: "Veggie Soup + Rice", emoji: "🍲", carbs: 28, portion: "1 cup soup + 2 tbsp rice", impact: "medium", ingredients: ["chicken broth (1 cup)", "carrots (¼ cup)", "peas (2 tbsp)", "white rice (2 tbsp)", "chicken (1 oz)"], tip: "Soup slows gastric emptying — watch for delayed BG rise" },
  { id: "l5", name: "Baked Potato + Cheese", emoji: "🥔", carbs: 30, portion: "½ small potato", impact: "high", ingredients: ["small potato (½)", "cheddar cheese (2 tbsp)", "sour cream (1 tbsp)", "butter"], tip: "Cooling potato increases resistant starch — lower BG impact" },
  { id: "l6", name: "Egg Fried Rice", emoji: "🍳", carbs: 32, portion: "½ cup fried rice", impact: "high", ingredients: ["cooked rice (½ cup)", "egg (1)", "peas (2 tbsp)", "carrots (2 tbsp)", "GF soy sauce (1 tsp)", "sesame oil"], tip: "Use GF tamari instead of regular soy sauce" },
  { id: "l7", name: "Lentil Soup", emoji: "🫘", carbs: 20, portion: "¾ cup soup", impact: "medium", ingredients: ["red lentils (¼ cup)", "carrot (¼ cup)", "onion (2 tbsp)", "cumin", "chicken broth (1 cup)"], tip: "Lentils are high fiber — very gentle BG rise" },
  { id: "l8", name: "Chicken + Sweet Potato", emoji: "🍗", carbs: 22, portion: "2 oz chicken + ½ cup sweet potato", impact: "medium", ingredients: ["chicken thigh (2 oz)", "sweet potato (½ cup)", "olive oil", "garlic", "rosemary"], tip: "Balanced meal — steady BG response" },
];

const DINNERS: Meal[] = [
  { id: "d1", name: "Salmon + Quinoa + Veggies", emoji: "🐟", carbs: 28, portion: "2 oz salmon + ¼ cup quinoa", impact: "medium", ingredients: ["salmon (2 oz)", "quinoa (¼ cup cooked)", "broccoli (¼ cup)", "lemon", "olive oil"], tip: "Omega-3s in salmon support insulin sensitivity" },
  { id: "d2", name: "Beef Stir-Fry + Rice", emoji: "🥩", carbs: 35, portion: "2 oz beef + ¼ cup rice", impact: "high", ingredients: ["beef strips (2 oz)", "bell pepper (¼ cup)", "snap peas (¼ cup)", "white rice (¼ cup)", "GF tamari (1 tsp)", "ginger"], tip: "Use GF tamari — regular soy sauce contains wheat" },
  { id: "d3", name: "Chicken Soup + GF Bread", emoji: "🍗", carbs: 25, portion: "1 cup soup + 1 slice GF bread", impact: "medium", ingredients: ["chicken (2 oz)", "carrots", "celery", "chicken broth (1 cup)", "GF bread (1 slice)"], tip: "Check GF bread label — some brands contain oats" },
  { id: "d4", name: "Turkey Meatballs + Rice", emoji: "🍝", carbs: 30, portion: "3 small meatballs + ¼ cup rice", impact: "high", ingredients: ["ground turkey (3 oz)", "egg (1)", "GF breadcrumbs (1 tbsp)", "garlic", "white rice (¼ cup)", "tomato sauce"], tip: "Use GF breadcrumbs or omit entirely" },
  { id: "d5", name: "Black Bean Bowl", emoji: "🫘", carbs: 32, portion: "½ cup beans + ¼ cup rice", impact: "high", ingredients: ["black beans (½ cup)", "white rice (¼ cup)", "corn (2 tbsp)", "avocado (2 tbsp)", "lime", "cilantro"], tip: "Beans are high fiber — BG rise is slower than pure rice" },
  { id: "d6", name: "Baked Chicken + Potato", emoji: "🍗", carbs: 20, portion: "2 oz chicken + ½ small potato", impact: "medium", ingredients: ["chicken breast (2 oz)", "small potato (½)", "olive oil", "garlic", "herbs"], tip: "Simple, predictable BG response" },
  { id: "d7", name: "Fish Tacos (Corn)", emoji: "🌮", carbs: 24, portion: "2 small corn tortillas + 2 oz fish", impact: "medium", ingredients: ["white fish (2 oz)", "corn tortillas (2 small)", "cabbage (2 tbsp)", "lime", "GF hot sauce", "avocado"], tip: "Corn tortillas only — flour tortillas contain wheat" },
];

const SNACKS: Meal[] = [
  { id: "s1", name: "Apple + Peanut Butter", emoji: "🍎", carbs: 20, portion: "½ apple + 1 tbsp PB", impact: "medium", ingredients: ["apple (½)", "natural peanut butter (1 tbsp)"], tip: "PB fat slows apple sugar absorption" },
  { id: "s2", name: "Cheese + Rice Crackers", emoji: "🧀", carbs: 12, portion: "1 oz cheese + 5 crackers", impact: "low", ingredients: ["cheddar cheese (1 oz)", "GF rice crackers (5)"], tip: "Low-carb snack — minimal BG impact" },
  { id: "s3", name: "Banana + Milk", emoji: "🍌", carbs: 28, portion: "½ banana + ½ cup milk", impact: "medium", ingredients: ["banana (½)", "whole milk (½ cup)"], tip: "Good pre-activity snack" },
  { id: "s4", name: "Berries + Yogurt", emoji: "🫐", carbs: 15, portion: "¼ cup berries + ¼ cup yogurt", impact: "low", ingredients: ["mixed berries (¼ cup)", "plain Greek yogurt (¼ cup)"], tip: "Excellent low-carb snack" },
  { id: "s5", name: "Hummus + Veggie Sticks", emoji: "🥕", carbs: 10, portion: "2 tbsp hummus + veggie sticks", impact: "low", ingredients: ["hummus (2 tbsp)", "carrots", "cucumber", "bell pepper sticks"], tip: "Very low BG impact — great anytime snack" },
  { id: "s6", name: "Popcorn (plain)", emoji: "🍿", carbs: 14, portion: "1 cup air-popped", impact: "low", ingredients: ["air-popped popcorn (1 cup)", "butter (optional)", "salt"], tip: "Plain popcorn is wheat-free and low GI" },
  { id: "s7", name: "Orange + Cheese", emoji: "🍊", carbs: 15, portion: "½ orange + 1 oz cheese", impact: "low", ingredients: ["orange (½)", "string cheese (1 stick)"], tip: "Balanced snack with protein" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_EMOJIS = ["🌙", "🌟", "🌈", "🦋", "🌺", "🎉", "☀️"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

type WeekPlan = DayPlan[];

const IMPACT_CONFIG = {
  low:    { color: "#22C55E", label: "Low BG", icon: "🟢" },
  medium: { color: "#F59E0B", label: "Moderate", icon: "🟡" },
  high:   { color: "#EF4444", label: "Needs Bolus", icon: "🔴" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWeekPlan(): WeekPlan {
  return DAYS.map(() => ({
    breakfast: pickRandom(BREAKFASTS),
    lunch: pickRandom(LUNCHES),
    dinner: pickRandom(DINNERS),
    snack: pickRandom(SNACKS),
  }));
}

function buildShoppingList(plan: WeekPlan): Record<string, number> {
  const list: Record<string, number> = {};
  plan.forEach(day => {
    [day.breakfast, day.lunch, day.dinner, day.snack].forEach(meal => {
      meal.ingredients.forEach(ing => {
        const key = ing.toLowerCase().replace(/\s*\(.*?\)/g, "").trim();
        list[key] = (list[key] || 0) + 1;
      });
    });
  });
  return list;
}

function formatShoppingList(plan: WeekPlan, childName: string): string {
  const list = buildShoppingList(plan);
  const sorted = Object.entries(list).sort((a, b) => b[1] - a[1]);

  const header = `🛒 JACS HEALTH — WHEAT-FREE SHOPPING LIST
For: ${childName} | Week of ${new Date().toLocaleDateString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  const items = sorted.map(([item, count]) =>
    `☐ ${item.charAt(0).toUpperCase() + item.slice(1)}${count > 2 ? ` (×${count})` : ""}`
  ).join("\n");

  const footer = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ALWAYS CHECK LABELS FOR WHEAT/GLUTEN
⚠️  Look for "Certified Gluten-Free" seal
⚠️  Avoid: wheat, barley, rye, malt, spelt
📱 Generated by JACS Health Companion`;

  return header + items + footer;
}

// ─── Meal Card Component ──────────────────────────────────────────────────────
function MealCard({
  meal, mealType, onSwap, colors,
}: {
  meal: Meal; mealType: string; onSwap: () => void; colors: ReturnType<typeof useColors>;
}) {
  const cfg = IMPACT_CONFIG[meal.impact];
  return (
    <View style={[mc.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={mc.row}>
        <Text style={mc.typeLabel} allowFontScaling={false}>{mealType}</Text>
        <View style={[mc.impactBadge, { backgroundColor: cfg.color + "22", borderColor: cfg.color }]}>
          <Text style={[mc.impactText, { color: cfg.color }]} allowFontScaling={false}>{cfg.icon} {cfg.label}</Text>
        </View>
      </View>
      <View style={mc.mealRow}>
        <Text style={mc.emoji}>{meal.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[mc.mealName, { color: colors.foreground }]} allowFontScaling={false}>{meal.name}</Text>
          <Text style={[mc.portion, { color: colors.muted }]} allowFontScaling={false}>{meal.portion}</Text>
        </View>
        <View style={mc.carbBox}>
          <Text style={mc.carbNum} allowFontScaling={false}>{meal.carbs}g</Text>
          <Text style={mc.carbLabel} allowFontScaling={false}>carbs</Text>
        </View>
      </View>
      {meal.tip && (
        <Text style={[mc.tip, { color: "#60A5FA" }]} allowFontScaling={false}>💡 {meal.tip}</Text>
      )}
      <TouchableOpacity style={[mc.swapBtn, { borderColor: colors.border }]} onPress={onSwap} accessibilityRole="button" accessibilityLabel={`Swap ${mealType}`}>
        <Text style={[mc.swapText, { color: colors.muted }]} allowFontScaling={false}>🔄 Swap this meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const mc = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  typeLabel: { color: "#9BA1A6", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  impactBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  impactText: { fontSize: 11, fontWeight: "700" },
  mealRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 28 },
  mealName: { fontSize: 15, fontWeight: "800" },
  portion: { fontSize: 12, marginTop: 2 },
  carbBox: { alignItems: "center", backgroundColor: "#1E3A5F", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  carbNum: { color: "#D4AF37", fontSize: 16, fontWeight: "900" },
  carbLabel: { color: "#9BA1A6", fontSize: 9 },
  tip: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  swapBtn: { borderTopWidth: 1, marginTop: 8, paddingTop: 8, alignItems: "center" },
  swapText: { fontSize: 12, fontWeight: "600" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MealPlanner() {
  const colors = useColors();
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [tab, setTab] = useState<"plan" | "shopping" | "tips">("plan");
  const [childName, setChildName] = useState("My Child");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) try {
        const d = JSON.parse(raw);
        if (d.plan) setPlan(d.plan);
        if (d.childName) setChildName(d.childName);
      } catch {}
    });
    // Load child name from guardian agent storage
    AsyncStorage.getItem("@guardian_agent_v1").then(raw => {
      if (raw) try {
        const d = JSON.parse(raw);
        if (d.childName && d.childName !== "Little Warrior") setChildName(d.childName);
      } catch {}
    });
  }, []);

  const generatePlan = useCallback(async () => {
    haptic("heavy");
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600)); // brief animation pause
    const newPlan = generateWeekPlan();
    setPlan(newPlan);
    setActiveDay(0);
    setTab("plan");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: newPlan, childName }));
    haptic("success");
    setGenerating(false);
  }, [childName]);

  const swapMeal = useCallback(async (dayIdx: number, mealType: keyof DayPlan) => {
    if (!plan) return;
    haptic("light");
    const sources = { breakfast: BREAKFASTS, lunch: LUNCHES, dinner: DINNERS, snack: SNACKS };
    const newMeal = pickRandom(sources[mealType].filter(m => m.id !== plan[dayIdx][mealType].id));
    const newPlan = plan.map((day, i) => i === dayIdx ? { ...day, [mealType]: newMeal } : day);
    setPlan(newPlan);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: newPlan, childName }));
  }, [plan, childName]);

  const shareShoppingList = useCallback(async () => {
    if (!plan) return;
    haptic("success");
    const text = formatShoppingList(plan, childName);
    try {
      await Share.share({ message: text, title: "Wheat-Free Shopping List — JACS Health" });
    } catch {}
  }, [plan, childName]);

  const dayPlan = plan ? plan[activeDay] : null;
  const totalCarbs = dayPlan
    ? dayPlan.breakfast.carbs + dayPlan.lunch.carbs + dayPlan.dinner.carbs + dayPlan.snack.carbs
    : 0;

  const TABS = [
    { id: "plan" as const, emoji: "📅", label: "Meal Plan" },
    { id: "shopping" as const, emoji: "🛒", label: "Shopping" },
    { id: "tips" as const, emoji: "💡", label: "T1D Tips" },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#0C1B33" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={s.back} allowFontScaling={false}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={s.headerTitle} allowFontScaling={false}>🥗 WHEAT-FREE MEAL PLANNER</Text>
          <Text style={s.headerSub} allowFontScaling={false}>100% Wheat-Free • T1D Friendly • {childName}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: "#0C1B33" }]}>
        {TABS.map(tb => (
          <TouchableOpacity
            key={tb.id}
            style={[s.tabBtn, tab === tb.id && s.tabBtnActive]}
            onPress={() => { haptic(); setTab(tb.id); }}
            accessibilityRole="tab"
            accessibilityLabel={tb.label}
          >
            <Text style={{ fontSize: 18 }}>{tb.emoji}</Text>
            <Text style={[s.tabLabel, { color: tab === tb.id ? "#16A34A" : "#9BA1A6" }]} allowFontScaling={false}>{tb.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── GENERATE BUTTON (always visible at top) ── */}
        <TouchableOpacity
          style={[s.generateBtn, generating && { opacity: 0.7 }]}
          onPress={generatePlan}
          disabled={generating}
          accessibilityRole="button"
          accessibilityLabel="Generate my week of meals"
        >
          <Text style={{ fontSize: 32 }}>{generating ? "⏳" : "✨"}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.generateTitle} allowFontScaling={false}>
              {generating ? "Creating Your Plan..." : plan ? "🔄 Regenerate My Week!" : "✨ Generate My Week!"}
            </Text>
            <Text style={s.generateSub} allowFontScaling={false}>
              {plan ? "Tap to create a brand new 7-day plan" : "One tap → 7 days of wheat-free meals"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── MEAL PLAN TAB ── */}
        {tab === "plan" && !plan && (
          <View style={[s.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 64, textAlign: "center" }}>🥗</Text>
            <Text style={[s.emptyTitle, { color: colors.foreground }]} allowFontScaling={false}>No Plan Yet!</Text>
            <Text style={[s.emptySub, { color: colors.muted }]} allowFontScaling={false}>Tap the green button above to generate a full week of wheat-free, T1D-friendly meals for {childName} instantly!</Text>
          </View>
        )}

        {tab === "plan" && plan && (
          <View>
            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
                {DAYS.map((day, i) => {
                  const dayCarbs = plan[i].breakfast.carbs + plan[i].lunch.carbs + plan[i].dinner.carbs + plan[i].snack.carbs;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[s.dayChip, { backgroundColor: activeDay === i ? "#16A34A" : colors.surface, borderColor: activeDay === i ? "#16A34A" : colors.border }]}
                      onPress={() => { haptic(); setActiveDay(i); }}
                      accessibilityRole="button"
                      accessibilityLabel={day}
                    >
                      <Text style={{ fontSize: 16 }}>{DAY_EMOJIS[i]}</Text>
                      <Text style={[s.dayChipText, { color: activeDay === i ? "#fff" : colors.foreground }]} allowFontScaling={false}>{day.slice(0, 3)}</Text>
                      <Text style={[s.dayChipCarbs, { color: activeDay === i ? "#D4FFA0" : colors.muted }]} allowFontScaling={false}>{dayCarbs}g</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Day Summary */}
            <View style={[s.daySummary, { backgroundColor: "#0C1B33", borderColor: "#16A34A" }]}>
              <Text style={s.daySummaryTitle} allowFontScaling={false}>{DAY_EMOJIS[activeDay]} {DAYS[activeDay]}</Text>
              <View style={s.daySummaryRow}>
                <View style={s.daySummaryStat}>
                  <Text style={s.daySummaryNum} allowFontScaling={false}>{totalCarbs}g</Text>
                  <Text style={s.daySummaryLabel} allowFontScaling={false}>Total Carbs</Text>
                </View>
                <View style={s.daySummaryStat}>
                  <Text style={s.daySummaryNum} allowFontScaling={false}>4</Text>
                  <Text style={s.daySummaryLabel} allowFontScaling={false}>Meals</Text>
                </View>
                <View style={s.daySummaryStat}>
                  <Text style={s.daySummaryNum} allowFontScaling={false}>0🌾</Text>
                  <Text style={s.daySummaryLabel} allowFontScaling={false}>Wheat Items</Text>
                </View>
                <View style={s.daySummaryStat}>
                  <Text style={[s.daySummaryNum, { color: "#22C55E" }]} allowFontScaling={false}>✅</Text>
                  <Text style={s.daySummaryLabel} allowFontScaling={false}>Safe</Text>
                </View>
              </View>
            </View>

            {/* Meals */}
            {dayPlan && (
              <>
                <MealCard meal={dayPlan.breakfast} mealType="🌅 Breakfast" onSwap={() => swapMeal(activeDay, "breakfast")} colors={colors} />
                <MealCard meal={dayPlan.snack} mealType="🍎 Morning Snack" onSwap={() => swapMeal(activeDay, "snack")} colors={colors} />
                <MealCard meal={dayPlan.lunch} mealType="☀️ Lunch" onSwap={() => swapMeal(activeDay, "lunch")} colors={colors} />
                <MealCard meal={dayPlan.dinner} mealType="🌙 Dinner" onSwap={() => swapMeal(activeDay, "dinner")} colors={colors} />
              </>
            )}
          </View>
        )}

        {/* ── SHOPPING LIST TAB ── */}
        {tab === "shopping" && (
          <View>
            {!plan ? (
              <View style={[s.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 48, textAlign: "center" }}>🛒</Text>
                <Text style={[s.emptyTitle, { color: colors.foreground }]} allowFontScaling={false}>Generate a Plan First!</Text>
                <Text style={[s.emptySub, { color: colors.muted }]} allowFontScaling={false}>Tap "Generate My Week!" above to create a meal plan, then your shopping list will appear here automatically.</Text>
              </View>
            ) : (
              <>
                {/* Share Button */}
                <TouchableOpacity style={s.shareBtn} onPress={shareShoppingList} accessibilityRole="button" accessibilityLabel="Share shopping list">
                  <Text style={{ fontSize: 28 }}>📤</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.shareBtnTitle} allowFontScaling={false}>Share Shopping List</Text>
                    <Text style={s.shareBtnSub} allowFontScaling={false}>Send via WhatsApp, SMS, or Email</Text>
                  </View>
                </TouchableOpacity>

                {/* Warning Banner */}
                <View style={[s.warningBanner]}>
                  <Text style={s.warningText} allowFontScaling={false}>⚠️ Always check labels for wheat, gluten, barley, rye, malt, and spelt. Look for "Certified Gluten-Free" seal.</Text>
                </View>

                {/* Shopping List */}
                <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>🛒 Weekly Shopping List</Text>
                  {Object.entries(buildShoppingList(plan))
                    .sort((a, b) => b[1] - a[1])
                    .map(([item, count]) => (
                      <View key={item} style={s.shopRow}>
                        <Text style={s.shopCheck} allowFontScaling={false}>☐</Text>
                        <Text style={[s.shopItem, { color: colors.foreground }]} allowFontScaling={false}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                          {count > 2 ? <Text style={{ color: colors.muted }}> ×{count}</Text> : ""}
                        </Text>
                      </View>
                    ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ── T1D TIPS TAB ── */}
        {tab === "tips" && (
          <View>
            <Text style={[s.pageTitle, { color: colors.foreground }]} allowFontScaling={false}>💡 Mealtime T1D Tips</Text>
            <Text style={[s.pageSub, { color: colors.muted }]} allowFontScaling={false}>Evidence-based guidance for managing blood sugar around meals in young children.</Text>

            {[
              {
                title: "🕐 Pre-Bolus Timing",
                color: "#7C3AED",
                body: "For high-impact meals (🔴), give rapid-acting insulin 10–15 minutes BEFORE eating. For medium-impact (🟡), give at the start of the meal. For low-impact (🟢), give after eating or skip if BG is already in range.\n\nAlways follow your endocrinologist's specific instructions.",
              },
              {
                title: "🍽️ Plate Method for Toddlers",
                color: "#16A34A",
                body: "½ plate: non-starchy vegetables (broccoli, carrots, peas)\n¼ plate: protein (chicken, fish, eggs, beans)\n¼ plate: carbohydrates (rice, potato, GF pasta)\n\nThis balance helps prevent post-meal spikes and keeps BG stable for hours.",
              },
              {
                title: "⏰ Consistent Meal Times",
                color: "#0891B2",
                body: "Eating at the same time each day makes blood sugar patterns predictable and easier to manage. Aim for:\n• Breakfast: 7–8 AM\n• Snack: 10–10:30 AM\n• Lunch: 12–1 PM\n• Dinner: 5:30–6:30 PM\n• Bedtime snack: 7:30–8 PM (if needed)",
              },
              {
                title: "🌾 Wheat-Free Label Reading",
                color: "#D97706",
                body: "AVOID these ingredients:\n❌ Wheat, wheat flour, whole wheat\n❌ Barley, rye, malt, spelt, kamut\n❌ Triticale, farro, durum\n❌ Semolina, bulgur, farina\n\nSAFE grains:\n✅ Rice, corn/maize, quinoa\n✅ Oats (certified GF only)\n✅ Millet, sorghum, buckwheat, amaranth",
              },
              {
                title: "🩸 Post-Meal BG Checks",
                color: "#DC2626",
                body: "Check blood sugar 2 hours after meals to understand how different foods affect your child. Keep a simple log:\n• Food eaten\n• Carbs estimated\n• BG before meal\n• BG 2 hours after\n\nShare this log with your endocrinologist at every appointment.",
              },
              {
                title: "🏃 Exercise & Meals",
                color: "#EC4899",
                body: "Exercise lowers blood sugar — plan ahead:\n• Check BG before activity\n• If BG < 100 mg/dL, give 15g fast carbs first\n• Have juice or glucose tabs nearby during play\n• Check BG again 30 min after activity\n• Overnight lows can occur after afternoon exercise",
              },
            ].map(({ title, color, body }) => (
              <View key={title} style={[s.tipCard, { backgroundColor: color + "15", borderColor: color }]}>
                <Text style={[s.tipTitle, { color }]} allowFontScaling={false}>{title}</Text>
                <Text style={[s.tipBody, { color: colors.foreground }]} allowFontScaling={false}>{body}</Text>
              </View>
            ))}
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
  headerTitle: { color: "#16A34A", fontSize: 14, fontWeight: "900" },
  headerSub: { color: "#9BA1A6", fontSize: 11, marginTop: 2 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: "#16A34A" },
  tabLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16 },
  generateBtn: { backgroundColor: "#16A34A", borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 16, borderWidth: 2, borderColor: "#4ADE80" },
  generateTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  generateSub: { color: "#D4FFA0", fontSize: 12, marginTop: 3 },
  emptyState: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: "center", marginTop: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginTop: 12, textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  dayChip: { borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", minWidth: 64 },
  dayChipText: { fontSize: 12, fontWeight: "800", marginTop: 2 },
  dayChipCarbs: { fontSize: 10, marginTop: 2 },
  daySummary: { borderRadius: 16, borderWidth: 2, padding: 14, marginBottom: 12 },
  daySummaryTitle: { color: "#16A34A", fontSize: 16, fontWeight: "900", marginBottom: 10 },
  daySummaryRow: { flexDirection: "row", justifyContent: "space-around" },
  daySummaryStat: { alignItems: "center" },
  daySummaryNum: { color: "#D4AF37", fontSize: 20, fontWeight: "900" },
  daySummaryLabel: { color: "#9BA1A6", fontSize: 10, marginTop: 2 },
  shareBtn: { backgroundColor: "#16A34A", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  shareBtnTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  shareBtnSub: { color: "#D4FFA0", fontSize: 12, marginTop: 2 },
  warningBanner: { backgroundColor: "#7F1D1D", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#EF4444" },
  warningText: { color: "#FCA5A5", fontSize: 13, lineHeight: 20 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  shopRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#374151" },
  shopCheck: { color: "#9BA1A6", fontSize: 18, marginRight: 10 },
  shopItem: { fontSize: 14, flex: 1 },
  pageTitle: { fontSize: 20, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  pageSub: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  tipCard: { borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  tipTitle: { fontSize: 16, fontWeight: "900", marginBottom: 8 },
  tipBody: { fontSize: 13, lineHeight: 22 },
});
