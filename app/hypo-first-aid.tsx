/**
 * Hypo First-Aid Screen
 * Clinically accurate per ADA 2024 Standards of Care
 *
 * Covers:
 * - Mild/moderate hypoglycemia: 15-15 Rule
 * - Severe hypoglycemia: Glucagon administration
 * - DKA warning signs and action steps
 * - Sick-day rules for Type 1 diabetes
 * - Pediatric-specific guidance (under 6 years)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

type Section = "hypo" | "severe" | "dka" | "sick";

export default function HypoFirstAid() {
  const colors = useColors();
  const [section, setSection] = useState<Section>("hypo");

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#DC2626" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Emergency First-Aid</Text>
        <TouchableOpacity onPress={() => Linking.openURL("tel:911")}>
          <Text style={styles.callBtn}>Call 911</Text>
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      <View style={[styles.tabBar, { backgroundColor: "#FEE2E2" }]}>
        {([
          { key: "hypo",   label: "⚠️ Low BG" },
          { key: "severe", label: "🚨 Severe" },
          { key: "dka",    label: "🧪 DKA" },
          { key: "sick",   label: "🤒 Sick Day" },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, section === t.key && { backgroundColor: "#DC2626" }]}
            onPress={() => setSection(t.key)}
          >
            <Text style={[styles.tabText, { color: section === t.key ? "#fff" : "#991B1B" }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── MILD/MODERATE HYPO ── */}
        {section === "hypo" && (
          <View>
            <View style={styles.alertBanner}>
              <Text style={styles.alertTitle}>Hypoglycemia — Low Blood Sugar</Text>
              <Text style={styles.alertSub}>Blood glucose below 70 mg/dL (3.9 mmol/L)</Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>⚠️ Symptoms to Watch For</Text>
              <View style={styles.symptomGrid}>
                {[
                  "Shaking / trembling", "Sweating", "Pale skin", "Rapid heartbeat",
                  "Hunger", "Dizziness", "Headache", "Irritability / mood change",
                  "Confusion", "Blurry vision", "Weakness", "Crying (in young children)",
                ].map((s, i) => (
                  <View key={i} style={styles.symptomTag}>
                    <Text style={styles.symptomText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7" }]}>
              <Text style={[styles.cardTitle, { color: "#065F46" }]}>✅ The 15-15 Rule</Text>
              <Text style={[styles.cardSub, { color: "#047857" }]}>
                For mild to moderate hypoglycemia (glucose 54–69 mg/dL)
              </Text>
              {[
                { step: "1", text: "Give 15g of fast-acting carbohydrates", detail: "See options below" },
                { step: "2", text: "Wait 15 minutes", detail: "Do NOT give more food yet" },
                { step: "3", text: "Recheck blood glucose", detail: "Use glucometer or CGM" },
                { step: "4", text: "If still below 70 mg/dL — repeat steps 1–3", detail: "Give another 15g carbs" },
                { step: "5", text: "Once glucose is above 70 mg/dL", detail: "Give a small snack with protein if next meal is >1 hour away" },
              ].map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{s.step}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepText, { color: "#065F46" }]}>{s.text}</Text>
                    <Text style={[styles.stepDetail, { color: "#047857" }]}>{s.detail}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>🍬 15g Fast-Acting Carb Options</Text>
              <Text style={[styles.cardSub, { color: colors.muted }]}>
                Use ONLY fast-acting carbs — no fat, no protein (slows absorption)
              </Text>
              {[
                { item: "Glucose tablets", amount: "3–4 tablets (4g each)", best: true },
                { item: "Glucose gel", amount: "1 tube (15g)", best: true },
                { item: "Regular juice box (4oz)", amount: "1 box (~15g)", best: false },
                { item: "Regular soda (not diet)", amount: "½ can (4oz)", best: false },
                { item: "Honey", amount: "1 tablespoon (17g)", best: false },
                { item: "Sugar packets", amount: "3–4 packets", best: false },
                { item: "Hard candy", amount: "3–4 pieces (check label)", best: false },
                { item: "Raisins", amount: "2 tablespoons (~15g)", best: false },
              ].map((item, i) => (
                <View key={i} style={[styles.carbItem, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.carbName, { color: colors.foreground }]}>
                      {item.best ? "⭐ " : ""}{item.item}
                    </Text>
                    <Text style={[styles.carbAmt, { color: colors.muted }]}>{item.amount}</Text>
                  </View>
                  {item.best && <Text style={styles.bestBadge}>BEST</Text>}
                </View>
              ))}
              <View style={[styles.warningBox, { backgroundColor: "#FEE2E2", borderColor: "#F87171" }]}>
                <Text style={{ color: "#991B1B", fontWeight: "700" }}>
                  ❌ Do NOT use chocolate, peanut butter, or milk as the only treatment — fat slows sugar absorption
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" }]}>
              <Text style={[styles.cardTitle, { color: "#1E40AF" }]}>👶 For Young Children (Under 6)</Text>
              <Text style={[styles.cardSub, { color: "#1D4ED8" }]}>
                Use smaller doses — 10g carbs instead of 15g to avoid rebound hyperglycemia
              </Text>
              {[
                "½ juice box (2oz) = ~7–8g",
                "2 glucose tablets = ~8g",
                "1 teaspoon honey = ~6g",
                "½ tablespoon corn syrup = ~8g",
              ].map((item, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#1E40AF" }]}>• {item}</Text>
              ))}
              <View style={[styles.warningBox, { backgroundColor: "#DBEAFE", borderColor: "#93C5FD" }]}>
                <Text style={{ color: "#1E3A8A", fontWeight: "700" }}>
                  ⚠️ Children under 6 with Type 1 have higher risk of severe hypoglycemia — always have glucagon nearby
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── SEVERE HYPOGLYCEMIA ── */}
        {section === "severe" && (
          <View>
            <View style={[styles.alertBanner, { backgroundColor: "#DC2626" }]}>
              <Text style={styles.alertTitle}>🚨 SEVERE HYPOGLYCEMIA</Text>
              <Text style={styles.alertSub}>Unconscious, seizure, or cannot swallow — CALL 911 IMMEDIATELY</Text>
            </View>

            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#DC2626" }]}
              onPress={() => Linking.openURL("tel:911")}
            >
              <Text style={styles.emergencyBtnText}>📞 CALL 911 NOW</Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: "#FEE2E2", borderColor: "#F87171" }]}>
              <Text style={[styles.cardTitle, { color: "#991B1B" }]}>Signs of Severe Hypoglycemia</Text>
              {[
                "Cannot be woken up / unconscious",
                "Seizure or convulsions",
                "Cannot swallow safely",
                "Extreme confusion or combativeness",
                "Lips or fingernails turning blue",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#991B1B" }]}>🔴 {s}</Text>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>💉 Glucagon — How to Use</Text>
              <Text style={[styles.cardSub, { color: "#B45309" }]}>
                Only if unconscious or cannot swallow. Do NOT give food or drink.
              </Text>
              <Text style={[styles.subHeading, { color: "#92400E" }]}>Nasal Glucagon (Baqsimi) — EASIEST</Text>
              {[
                "1. Peel back foil and remove device",
                "2. Hold device between thumb and first finger",
                "3. Tilt head back gently",
                "4. Insert tip into ONE nostril",
                "5. Press plunger firmly — full dose in one push",
                "6. Turn patient on their side",
                "7. Call 911 if not responding in 15 minutes",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#92400E" }]}>{s}</Text>
              ))}
              <Text style={[styles.subHeading, { color: "#92400E", marginTop: 16 }]}>Injectable Glucagon Kit</Text>
              {[
                "1. Mix powder with liquid in kit",
                "2. Draw up full dose into syringe",
                "3. Inject into outer thigh (through clothing is OK)",
                "4. Dose: Under 6 years = 0.5mg | Over 6 years = 1mg",
                "5. Turn patient on their side (prevents choking)",
                "6. Call 911 if not responding in 15 minutes",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#92400E" }]}>{s}</Text>
              ))}
              <View style={[styles.warningBox, { backgroundColor: "#FEE2E2", borderColor: "#F87171" }]}>
                <Text style={{ color: "#991B1B", fontWeight: "700" }}>
                  ⚠️ After glucagon: patient will likely vomit. Keep on their side. Do NOT give food until fully awake and alert.
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7" }]}>
              <Text style={[styles.cardTitle, { color: "#065F46" }]}>✅ After Recovery</Text>
              {[
                "Give 15–20g fast carbs once fully awake and able to swallow",
                "Follow with a meal or snack with protein",
                "Check glucose every 30 minutes for 2 hours",
                "Contact diabetes care team — severe hypo must be reported",
                "Review what caused the severe low and adjust insulin if needed",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#065F46" }]}>✓ {s}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── DKA WARNING ── */}
        {section === "dka" && (
          <View>
            <View style={[styles.alertBanner, { backgroundColor: "#7C3AED" }]}>
              <Text style={styles.alertTitle}>🧪 Diabetic Ketoacidosis (DKA)</Text>
              <Text style={styles.alertSub}>Life-threatening — requires immediate hospital treatment</Text>
            </View>

            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#DC2626" }]}
              onPress={() => Linking.openURL("tel:911")}
            >
              <Text style={styles.emergencyBtnText}>🏥 GO TO ER IMMEDIATELY</Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: "#F5F3FF", borderColor: "#A78BFA" }]}>
              <Text style={[styles.cardTitle, { color: "#5B21B6" }]}>⚠️ DKA Warning Signs</Text>
              {[
                { sign: "Fruity or acetone breath", severity: "Early" },
                { sign: "Nausea and vomiting", severity: "Early" },
                { sign: "Stomach pain / abdominal cramps", severity: "Early" },
                { sign: "Excessive thirst and urination", severity: "Early" },
                { sign: "Weakness and fatigue", severity: "Moderate" },
                { sign: "Rapid, deep breathing", severity: "Severe" },
                { sign: "Confusion or difficulty thinking", severity: "Severe" },
                { sign: "Loss of consciousness", severity: "Critical — 911" },
              ].map((item, i) => (
                <View key={i} style={[styles.dkaRow, { borderBottomColor: "#C4B5FD" }]}>
                  <Text style={[styles.dkaSign, { color: "#5B21B6" }]}>{item.sign}</Text>
                  <Text style={[styles.dkaSeverity, {
                    color: item.severity === "Critical — 911" ? "#DC2626" :
                           item.severity === "Severe" ? "#F97316" :
                           item.severity === "Moderate" ? "#F59E0B" : "#6D28D9",
                  }]}>{item.severity}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>🧪 Ketone Levels & Actions</Text>
              {[
                { level: "Negative (<0.6 mmol/L)", action: "Continue normal management", color: "#22C55E" },
                { level: "Trace (0.6–1.0 mmol/L)", action: "Drink water, recheck in 2 hours", color: "#86EFAC" },
                { level: "Small (1.0–1.5 mmol/L)", action: "Contact diabetes team, extra fluids", color: "#F59E0B" },
                { level: "Moderate (1.5–3.0 mmol/L)", action: "Call diabetes team NOW", color: "#F97316" },
                { level: "Large (>3.0 mmol/L)", action: "GO TO ER IMMEDIATELY", color: "#DC2626" },
              ].map((item, i) => (
                <View key={i} style={[styles.ketoneRow, { backgroundColor: item.color + "18", borderColor: item.color }]}>
                  <Text style={[styles.ketoneLevel, { color: item.color }]}>{item.level}</Text>
                  <Text style={[styles.ketoneAction, { color: item.color }]}>{item.action}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7" }]}>
              <Text style={[styles.cardTitle, { color: "#065F46" }]}>✅ DKA Prevention</Text>
              {[
                "NEVER skip insulin — even when sick or not eating",
                "Check glucose and ketones every 2–4 hours when ill",
                "Stay hydrated — drink water or sugar-free fluids",
                "Contact diabetes team if vomiting prevents keeping fluids down",
                "Carry glucagon and ketone strips at all times",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#065F46" }]}>✓ {s}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── SICK DAY RULES ── */}
        {section === "sick" && (
          <View>
            <View style={[styles.alertBanner, { backgroundColor: "#0EA5E9" }]}>
              <Text style={styles.alertTitle}>🤒 Sick Day Rules for Type 1</Text>
              <Text style={styles.alertSub}>Illness raises blood sugar — never stop insulin</Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#FEE2E2", borderColor: "#F87171" }]}>
              <Text style={[styles.cardTitle, { color: "#991B1B" }]}>⚠️ The Golden Rule</Text>
              <Text style={{ color: "#DC2626", fontSize: 18, fontWeight: "800", textAlign: "center", marginVertical: 8 }}>
                NEVER STOP INSULIN WHEN SICK
              </Text>
              <Text style={{ color: "#991B1B", textAlign: "center" }}>
                Even if not eating, the body still needs insulin. Illness causes glucose to rise even without food.
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>📋 Sick Day Checklist</Text>
              {[
                { task: "Check glucose every 2–4 hours", freq: "Every 2–4h" },
                { task: "Check ketones if glucose >250 mg/dL", freq: "With each glucose check" },
                { task: "Continue basal/long-acting insulin", freq: "As prescribed" },
                { task: "Give correction doses for high glucose", freq: "Per your sick-day plan" },
                { task: "Drink 8oz sugar-free fluids every hour", freq: "Hourly" },
                { task: "If vomiting — call diabetes team immediately", freq: "Immediately" },
              ].map((item, i) => (
                <View key={i} style={[styles.checkRow, { borderBottomColor: colors.border }]}>
                  <Text style={{ fontSize: 16 }}>☐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.checkTask, { color: colors.foreground }]}>{item.task}</Text>
                    <Text style={[styles.checkFreq, { color: colors.muted }]}>{item.freq}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>📞 When to Call Your Doctor</Text>
              {[
                "Glucose above 250 mg/dL for more than 2 hours despite correction",
                "Moderate or large ketones",
                "Vomiting and unable to keep fluids down",
                "Illness lasting more than 24 hours",
                "Signs of dehydration (dry mouth, no tears, sunken eyes in children)",
                "Any confusion, extreme fatigue, or difficulty breathing",
              ].map((s, i) => (
                <Text key={i} style={[styles.bulletItem, { color: "#92400E" }]}>🔴 {s}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  backBtn: { padding: 4 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  callBtn: { color: "#fff", fontSize: 14, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tabBar: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabText: { fontSize: 11, fontWeight: "700" },
  scroll: { padding: 16 },
  alertBanner: { backgroundColor: "#F97316", borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 16 },
  alertTitle: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "center" },
  alertSub: { color: "#fff", fontSize: 13, marginTop: 4, textAlign: "center" },
  emergencyBtn: { borderRadius: 14, padding: 18, alignItems: "center", marginBottom: 16 },
  emergencyBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6 },
  cardSub: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  symptomGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  symptomTag: { backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  symptomText: { color: "#92400E", fontSize: 12, fontWeight: "600" },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#065F46", alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  stepText: { fontSize: 14, fontWeight: "700" },
  stepDetail: { fontSize: 12, marginTop: 2 },
  carbItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5 },
  carbName: { fontSize: 14, fontWeight: "600" },
  carbAmt: { fontSize: 12, marginTop: 2 },
  bestBadge: { backgroundColor: "#22C55E", color: "#fff", fontSize: 10, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  warningBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  bulletItem: { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  subHeading: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  dkaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5 },
  dkaSign: { fontSize: 14, flex: 1 },
  dkaSeverity: { fontSize: 12, fontWeight: "700" },
  ketoneRow: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
  ketoneLevel: { fontSize: 14, fontWeight: "700" },
  ketoneAction: { fontSize: 12, marginTop: 4 },
  checkRow: { flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: 0.5 },
  checkTask: { fontSize: 14, fontWeight: "600" },
  checkFreq: { fontSize: 12, marginTop: 2 },
});
