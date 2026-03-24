/**
 * School Nurse Portal — Type 1 Diabetes Management at School
 *
 * Designed for:
 * - School nurses and teachers who care for children with T1D
 * - Parents to share critical information with school staff
 * - Emergency response at school
 *
 * Clinically accurate per ADA 2024 Safe at School guidelines
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

type Tab = "overview" | "emergency" | "daily" | "activities";

export default function SchoolNursePortal() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("overview");

  const handleShare = async () => {
    try {
      await Share.share({
        title: "Diabetes Care Plan — School",
        message: `DIABETES CARE PLAN FOR SCHOOL\n\nChild: [Child's Name]\nDiagnosis: Type 1 Diabetes\nDiagnosis Date: [Date]\n\nEMERGENCY CONTACTS:\n• Parent/Guardian: [Phone]\n• Endocrinologist: [Phone]\n• Pediatrician: [Phone]\n\nFor full care plan, open the JACS Health Companion app.`,
      });
    } catch (_) {}
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#1D4ED8" }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏫 School Nurse Portal</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareBtn}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: "#EFF6FF" }]}>
        {([
          { key: "overview",   label: "📋 Overview" },
          { key: "emergency",  label: "🚨 Emergency" },
          { key: "daily",      label: "📅 Daily Care" },
          { key: "activities", label: "🏃 Activities" },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && { backgroundColor: "#1D4ED8" }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, { color: tab === t.key ? "#fff" : "#1E40AF" }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <View>
            <View style={[styles.banner, { backgroundColor: "#1D4ED8" }]}>
              <Text style={styles.bannerTitle}>Type 1 Diabetes Care Plan</Text>
              <Text style={styles.bannerSub}>
                This child requires daily insulin and blood glucose monitoring. Type 1 diabetes is an autoimmune condition — the pancreas produces NO insulin. This is not caused by diet and cannot be managed without insulin.
              </Text>
            </View>

            {/* What Teachers Must Know */}
            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>⚠️ What Every Teacher Must Know</Text>
              {[
                "This child MUST be allowed to check blood sugar at any time",
                "This child MUST be allowed to eat or drink to treat low blood sugar immediately — do not make them wait",
                "This child MUST be allowed to use the bathroom without restriction",
                "This child MUST be allowed to keep glucose tablets/juice at their desk",
                "Low blood sugar (hypoglycemia) can affect behavior, concentration, and mood — this is medical, not behavioral",
                "Never send a child with low blood sugar to the nurse's office alone",
              ].map((item, i) => (
                <Text key={i} style={[styles.bullet, { color: "#92400E" }]}>• {item}</Text>
              ))}
            </View>

            {/* Devices */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>📱 Diabetes Devices at School</Text>
              <View style={styles.deviceRow}>
                <View style={[styles.deviceBadge, { backgroundColor: "#DBEAFE" }]}>
                  <Text style={[styles.deviceIcon]}>📡</Text>
                  <Text style={[styles.deviceName, { color: "#1E40AF" }]}>CGM</Text>
                  <Text style={[styles.deviceDesc, { color: "#1D4ED8" }]}>Continuous Glucose Monitor — worn on skin, sends readings every 5 min</Text>
                </View>
                <View style={[styles.deviceBadge, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={styles.deviceIcon}>💉</Text>
                  <Text style={[styles.deviceName, { color: "#166534" }]}>Omnipod</Text>
                  <Text style={[styles.deviceDesc, { color: "#15803D" }]}>Insulin pump — worn on skin, delivers insulin automatically</Text>
                </View>
              </View>
              <View style={[styles.infoBox, { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" }]}>
                <Text style={{ color: "#1E40AF", fontSize: 13 }}>
                  ℹ️ These devices are medical equipment. Do NOT remove, cover, or interfere with them. Alarms from these devices require immediate attention.
                </Text>
              </View>
            </View>

            {/* Legal Rights */}
            <View style={[styles.card, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
              <Text style={[styles.cardTitle, { color: "#166534" }]}>⚖️ Legal Rights at School (USA)</Text>
              {[
                "Section 504 of the Rehabilitation Act — requires reasonable accommodations",
                "IDEA (Individuals with Disabilities Education Act) — may apply",
                "ADA (Americans with Disabilities Act) — protects against discrimination",
                "Child has the right to a written Diabetes Medical Management Plan (DMMP)",
                "School must have trained staff to assist with diabetes care",
              ].map((item, i) => (
                <Text key={i} style={[styles.bullet, { color: "#166534" }]}>✓ {item}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── EMERGENCY ── */}
        {tab === "emergency" && (
          <View>
            <View style={[styles.banner, { backgroundColor: "#DC2626" }]}>
              <Text style={styles.bannerTitle}>🚨 Emergency Response Guide</Text>
              <Text style={styles.bannerSub}>For school nurses and teachers — act immediately</Text>
            </View>

            {/* Low Blood Sugar */}
            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>⚠️ LOW BLOOD SUGAR (Hypoglycemia)</Text>
              <Text style={[styles.cardSub, { color: "#B45309" }]}>Glucose below 70 mg/dL — treat IMMEDIATELY</Text>

              <Text style={[styles.subHead, { color: "#92400E" }]}>Signs:</Text>
              {["Shaking, sweating, pale skin", "Confusion, difficulty concentrating", "Irritability or sudden crying", "Headache, dizziness", "Weakness, fatigue"].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#92400E" }]}>• {s}</Text>
              ))}

              <Text style={[styles.subHead, { color: "#92400E", marginTop: 12 }]}>Immediate Action:</Text>
              {[
                "STEP 1: Give 15g fast carbs NOW (juice box, glucose tablets, regular soda)",
                "STEP 2: Stay with the child — do NOT leave them alone",
                "STEP 3: Wait 15 minutes, recheck glucose",
                "STEP 4: If no improvement or child loses consciousness — call 911 and give glucagon",
                "STEP 5: Notify parents",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#92400E" }]}>{s}</Text>
              ))}
            </View>

            {/* High Blood Sugar */}
            <View style={[styles.card, { backgroundColor: "#FEE2E2", borderColor: "#F87171" }]}>
              <Text style={[styles.cardTitle, { color: "#991B1B" }]}>🔴 HIGH BLOOD SUGAR (Hyperglycemia)</Text>
              <Text style={[styles.cardSub, { color: "#B91C1C" }]}>Glucose above 250 mg/dL — monitor closely</Text>
              {[
                "Allow child to drink water freely",
                "Allow extra bathroom breaks",
                "Check for ketones if glucose >250 mg/dL",
                "Contact parents if glucose >300 mg/dL or child feels unwell",
                "Call 911 if child has fruity breath, vomiting, or confusion (possible DKA)",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#991B1B" }]}>• {s}</Text>
              ))}
            </View>

            {/* Unconscious */}
            <View style={[styles.card, { backgroundColor: "#DC2626", borderColor: "#B91C1C" }]}>
              <Text style={[styles.cardTitle, { color: "#fff" }]}>🚨 UNCONSCIOUS / SEIZURE</Text>
              <Text style={[styles.bullet, { color: "#fff" }]}>1. CALL 911 IMMEDIATELY</Text>
              <Text style={[styles.bullet, { color: "#fff" }]}>2. Do NOT give food or drink</Text>
              <Text style={[styles.bullet, { color: "#fff" }]}>3. Give glucagon (nasal or injection — see kit)</Text>
              <Text style={[styles.bullet, { color: "#fff" }]}>4. Turn child on their side</Text>
              <Text style={[styles.bullet, { color: "#fff" }]}>5. Call parents</Text>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: "#fff", marginTop: 12 }]}
                onPress={() => Linking.openURL("tel:911")}
              >
                <Text style={{ color: "#DC2626", fontWeight: "900", fontSize: 16 }}>📞 CALL 911 NOW</Text>
              </TouchableOpacity>
            </View>

            {/* Glucagon Location */}
            <View style={[styles.card, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
              <Text style={[styles.cardTitle, { color: "#166534" }]}>💉 Glucagon Kit Location</Text>
              <Text style={[styles.cardSub, { color: "#15803D" }]}>
                The glucagon kit should be stored in the nurse's office and in the child's classroom emergency kit.
              </Text>
              <Text style={[styles.bullet, { color: "#166534" }]}>• Nasal glucagon (Baqsimi): Insert in nostril, press once</Text>
              <Text style={[styles.bullet, { color: "#166534" }]}>• Injectable: Mix powder + liquid, inject outer thigh</Text>
              <Text style={[styles.bullet, { color: "#166534" }]}>• Dose under 6 years: 0.5mg | Over 6 years: 1mg</Text>
            </View>
          </View>
        )}

        {/* ── DAILY CARE ── */}
        {tab === "daily" && (
          <View>
            <View style={[styles.banner, { backgroundColor: "#059669" }]}>
              <Text style={styles.bannerTitle}>📅 Daily Diabetes Care at School</Text>
              <Text style={styles.bannerSub}>Routine monitoring and insulin management</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>🩸 Blood Glucose Monitoring</Text>
              {[
                { time: "Before lunch", action: "Check glucose, determine insulin dose for meal" },
                { time: "Before snacks", action: "Check glucose if child feels unwell" },
                { time: "Before PE/sports", action: "Check glucose — may need extra carbs" },
                { time: "Anytime child feels unwell", action: "Check glucose immediately" },
                { time: "After PE/sports", action: "Check glucose — risk of delayed low" },
              ].map((item, i) => (
                <View key={i} style={[styles.scheduleRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.scheduleTime, { color: "#1D4ED8" }]}>{item.time}</Text>
                  <Text style={[styles.scheduleAction, { color: colors.foreground }]}>{item.action}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" }]}>
              <Text style={[styles.cardTitle, { color: "#1E40AF" }]}>🍽️ Lunch and Snack Insulin</Text>
              {[
                "Child needs insulin for every meal and snack",
                "Insulin dose is calculated based on carbohydrate content",
                "Parent/nurse must calculate dose using the child's insulin-to-carb ratio",
                "Allow extra time for insulin administration before eating",
                "Never rush a child with diabetes through lunch",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#1E40AF" }]}>• {s}</Text>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
              <Text style={[styles.cardTitle, { color: "#166534" }]}>🎒 What Should Be in the Child's Bag</Text>
              {[
                "Glucose meter and test strips",
                "Lancets and lancing device",
                "Insulin pen or pump supplies",
                "Fast-acting carbs (glucose tablets, juice boxes)",
                "Glucagon kit",
                "Ketone strips",
                "Emergency contact card",
                "Snacks for low blood sugar",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#166534" }]}>✓ {s}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── PHYSICAL ACTIVITIES ── */}
        {tab === "activities" && (
          <View>
            <View style={[styles.banner, { backgroundColor: "#7C3AED" }]}>
              <Text style={styles.bannerTitle}>🏃 Physical Activity Guidelines</Text>
              <Text style={styles.bannerSub}>Exercise affects blood sugar — special precautions needed</Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
              <Text style={[styles.cardTitle, { color: "#92400E" }]}>⚠️ Before Any Physical Activity</Text>
              {[
                "Check blood glucose before PE, sports, or recess",
                "If glucose is below 100 mg/dL — give 15g carbs before activity",
                "If glucose is above 250 mg/dL — check ketones before activity",
                "If ketones are present — NO exercise until ketones clear",
                "Have fast-acting carbs available on the sideline at all times",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#92400E" }]}>• {s}</Text>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>📊 Glucose Targets for Exercise</Text>
              {[
                { range: "Below 90 mg/dL", action: "Give 15–30g carbs before activity", color: "#DC2626" },
                { range: "90–150 mg/dL", action: "Safe to exercise — monitor during", color: "#22C55E" },
                { range: "150–250 mg/dL", action: "Safe to exercise — watch for symptoms", color: "#F59E0B" },
                { range: "Above 250 mg/dL", action: "Check ketones — may need to skip activity", color: "#F97316" },
              ].map((item, i) => (
                <View key={i} style={[styles.rangeRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.rangeValue, { color: item.color }]}>{item.range}</Text>
                  <Text style={[styles.rangeAction, { color: colors.foreground }]}>{item.action}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#F5F3FF", borderColor: "#A78BFA" }]}>
              <Text style={[styles.cardTitle, { color: "#5B21B6" }]}>⚡ Delayed Hypoglycemia Risk</Text>
              <Text style={[styles.cardSub, { color: "#6D28D9" }]}>
                Blood sugar can drop 4–8 hours AFTER exercise — this is called "delayed hypoglycemia"
              </Text>
              {[
                "Check glucose after PE class and after school sports",
                "Child may need a snack after vigorous activity",
                "Overnight lows are common after afternoon sports",
                "Inform parents of all physical activity so they can adjust evening insulin",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#5B21B6" }]}>• {s}</Text>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7" }]}>
              <Text style={[styles.cardTitle, { color: "#065F46" }]}>✅ Child CAN Participate In</Text>
              {[
                "All sports and physical activities with proper monitoring",
                "Field trips (with nurse or trained adult present)",
                "Swimming (waterproof CGM/pump available)",
                "School camps and overnight trips",
              ].map((s, i) => (
                <Text key={i} style={[styles.bullet, { color: "#065F46" }]}>✓ {s}</Text>
              ))}
              <Text style={[styles.cardSub, { color: "#047857", marginTop: 8 }]}>
                Children with Type 1 diabetes can participate in ALL activities with proper preparation and monitoring.
              </Text>
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
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  shareBtn: { color: "#fff", fontSize: 14, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tabBar: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabText: { fontSize: 10, fontWeight: "700" },
  scroll: { padding: 16 },
  banner: { borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 16 },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "center" },
  bannerSub: { color: "#fff", fontSize: 13, marginTop: 6, textAlign: "center", lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6 },
  cardSub: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  bullet: { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  subHead: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  infoBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  deviceRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  deviceBadge: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  deviceIcon: { fontSize: 28, marginBottom: 4 },
  deviceName: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  deviceDesc: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  scheduleRow: { paddingVertical: 10, borderBottomWidth: 0.5 },
  scheduleTime: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  scheduleAction: { fontSize: 13 },
  rangeRow: { paddingVertical: 10, borderBottomWidth: 0.5 },
  rangeValue: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  rangeAction: { fontSize: 13 },
  callBtn: { borderRadius: 12, padding: 14, alignItems: "center" },
});
