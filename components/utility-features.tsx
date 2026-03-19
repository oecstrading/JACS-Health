/**
 * Utility Feature Components
 * Migration-aligned: DocumentationStreak, GuidedWalkthrough, TrialBanner, SupportCenter
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

// ─── DocumentationStreak ──────────────────────────────────────────────────────

const STREAK_KEY = "jacs_documentation_streak";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  totalDaysLogged: number;
  weekHistory: boolean[]; // last 7 days, index 0 = today
}

export function DocumentationStreak() {
  const colors = useColors();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
    totalDaysLogged: 0,
    weekHistory: [false, false, false, false, false, false, false],
  });

  useEffect(() => {
    AsyncStorage.getItem(STREAK_KEY).then((val) => {
      if (val) {
        try {
          const saved: StreakData = JSON.parse(val);
          // Check if streak is still active (logged yesterday or today)
          const today = new Date().toISOString().split("T")[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          if (saved.lastLogDate !== today && saved.lastLogDate !== yesterday) {
            saved.currentStreak = 0;
          }
          setStreak(saved);
        } catch { /* ignore */ }
      }
    });
  }, []);

  const logToday = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    setStreak((prev) => {
      if (prev.lastLogDate === today) return prev; // already logged today

      const newStreak = prev.lastLogDate === yesterday ? prev.currentStreak + 1 : 1;
      const newHistory = [true, ...prev.weekHistory.slice(0, 6)];
      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastLogDate: today,
        totalDaysLogged: prev.totalDaysLogged + 1,
        weekHistory: newHistory,
      };
      AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const loggedToday = streak.lastLogDate === today;

  const DAY_LABELS = ["T", "Y", "2d", "3d", "4d", "5d", "6d"];

  return (
    <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.streakHeader}>
        <Text style={[styles.streakTitle, { color: colors.foreground }]}>📊 Documentation Streak</Text>
        {loggedToday && (
          <View style={[styles.loggedBadge, { backgroundColor: colors.success + "20" }]}>
            <Text style={[styles.loggedBadgeText, { color: colors.success }]}>✓ Logged Today</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.streakStats}>
        {[
          { value: streak.currentStreak, label: "Current\nStreak", suffix: "🔥" },
          { value: streak.longestStreak, label: "Best\nStreak", suffix: "🏆" },
          { value: streak.totalDaysLogged, label: "Total\nDays", suffix: "📅" },
        ].map((stat, i) => (
          <View key={i} style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
            <Text style={styles.statSuffix}>{stat.suffix}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Weekly history */}
      <View style={styles.weekRow}>
        {streak.weekHistory.map((logged, i) => (
          <View key={i} style={styles.dayItem}>
            <View
              style={[
                styles.dayDot,
                {
                  backgroundColor: logged
                    ? colors.success
                    : i === 0
                    ? colors.border
                    : colors.border + "60",
                },
              ]}
            />
            <Text style={[styles.dayLabel, { color: colors.muted }]}>{DAY_LABELS[i]}</Text>
          </View>
        ))}
      </View>

      {!loggedToday && (
        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: colors.primary }]}
          onPress={logToday}
        >
          <Text style={styles.logBtnText}>Log Today's Health Data</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── TrialBanner ──────────────────────────────────────────────────────────────

export interface TrialInfo {
  daysRemaining: number;
  planName: string;
  isExpired: boolean;
  onUpgrade: () => void;
  onDismiss?: () => void;
}

export function TrialBanner({ daysRemaining, planName, isExpired, onUpgrade, onDismiss }: TrialInfo) {
  const colors = useColors();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const bgColor = isExpired ? colors.error : isUrgent ? colors.warning : colors.primary;

  return (
    <View style={[styles.trialBanner, { backgroundColor: bgColor + "15", borderColor: bgColor }]}>
      <View style={styles.trialContent}>
        <Text style={styles.trialIcon}>{isExpired ? "⚠️" : isUrgent ? "⏰" : "🎁"}</Text>
        <View style={styles.trialInfo}>
          <Text style={[styles.trialTitle, { color: bgColor }]}>
            {isExpired
              ? "Trial Expired"
              : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left in ${planName}`}
          </Text>
          <Text style={[styles.trialSubtitle, { color: colors.muted }]}>
            {isExpired
              ? "Upgrade to continue accessing all features"
              : "Upgrade now to keep all your health data"}
          </Text>
        </View>
      </View>
      <View style={styles.trialActions}>
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: bgColor }]}
          onPress={onUpgrade}
        >
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </TouchableOpacity>
        {onDismiss && !isExpired && (
          <TouchableOpacity
            onPress={() => { setDismissed(true); onDismiss(); }}
          >
            <Text style={[styles.dismissText, { color: colors.muted }]}>Later</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── GuidedWalkthrough ────────────────────────────────────────────────────────

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  actionRoute?: string;
}

const DEFAULT_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to JACS Health Monitor",
    description: "Your personal AI-powered health companion. Let's set up your profile in just a few steps.",
    icon: "👋",
  },
  {
    id: "conditions",
    title: "Select Your Conditions",
    description: "Tell us about your health conditions so we can personalize your care plan, alerts, and daily tasks.",
    icon: "🏥",
    action: "Set Up Conditions",
    actionRoute: "/medical-conditions-picker",
  },
  {
    id: "doctors",
    title: "Add Your Care Team",
    description: "Add your doctors and specialists so you can quickly contact them and track upcoming visits.",
    icon: "👨‍⚕️",
    action: "Add Doctors",
    actionRoute: "/my-doctors-list",
  },
  {
    id: "thresholds",
    title: "Configure Alert Thresholds",
    description: "Set the blood pressure, glucose, and heart rate levels at which you want to receive health alerts.",
    icon: "⚠️",
    action: "Set Thresholds",
    actionRoute: "/danger-zone-settings",
  },
  {
    id: "insurance",
    title: "Add Insurance Cards",
    description: "Store your insurance information digitally for quick access during medical appointments.",
    icon: "💳",
    action: "Add Insurance",
    actionRoute: "/insurance-card-section",
  },
  {
    id: "family",
    title: "Invite Family Circle",
    description: "Add up to 5 trusted family members or caregivers who can monitor your health and receive alerts.",
    icon: "👨‍👩‍👧‍👦",
    action: "Set Up Family Circle",
    actionRoute: "/family-circle-management",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your health monitoring system is ready. Start logging your daily vitals to build your health history.",
    icon: "🎉",
  },
];

const WALKTHROUGH_KEY = "jacs_walkthrough_completed";

export function GuidedWalkthrough({ onComplete }: { onComplete: () => void }) {
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const step = DEFAULT_STEPS[currentStep];
  const isLast = currentStep === DEFAULT_STEPS.length - 1;
  const progress = (currentStep + 1) / DEFAULT_STEPS.length;

  const handleNext = useCallback(async () => {
    if (isLast) {
      await AsyncStorage.setItem(WALKTHROUGH_KEY, "true");
      setVisible(false);
      onComplete();
    } else {
      setCurrentStep((p) => p + 1);
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isLast, onComplete]);

  const handleSkip = useCallback(async () => {
    await AsyncStorage.setItem(WALKTHROUGH_KEY, "true");
    setVisible(false);
    onComplete();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.walkthroughOverlay}>
        <View style={[styles.walkthroughCard, { backgroundColor: colors.surface }]}>
          {/* Progress */}
          <View style={[styles.walkthroughTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.walkthroughFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.walkthroughStep, { color: colors.muted }]}>
            Step {currentStep + 1} of {DEFAULT_STEPS.length}
          </Text>

          {/* Content */}
          <Text style={styles.walkthroughIcon}>{step.icon}</Text>
          <Text style={[styles.walkthroughTitle, { color: colors.foreground }]}>{step.title}</Text>
          <Text style={[styles.walkthroughDesc, { color: colors.muted }]}>{step.description}</Text>

          {/* Actions */}
          <View style={styles.walkthroughButtons}>
            {!isLast && (
              <TouchableOpacity onPress={handleSkip}>
                <Text style={[styles.skipText, { color: colors.muted }]}>Skip Setup</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>{isLast ? "Get Started!" : "Next →"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── SupportCenter ────────────────────────────────────────────────────────────

const SUPPORT_TOPICS = [
  {
    id: "faq",
    title: "Frequently Asked Questions",
    icon: "❓",
    items: [
      { q: "How do I add a new health reading?", a: "Tap the '+' button on the Home screen or navigate to the specific metric screen (e.g., Blood Pressure) and tap 'Log Reading'." },
      { q: "How do I invite family members?", a: "Go to Profile → Family Circle Management. Tap 'Invite Member' and enter their email address. They will receive an invitation to join your care circle." },
      { q: "Can I export my health data?", a: "Yes. Go to Settings → Data Export. You can export your data as PDF or CSV for sharing with your doctor." },
      { q: "How do I set up medication reminders?", a: "Navigate to Medications → Add Medication. Set your dosage schedule and enable reminders. Notifications will appear at the scheduled times." },
      { q: "What are virtual devices?", a: "Virtual devices simulate real medical devices (CGM, blood pressure monitor) using manual data entry. They are free and available to all users." },
    ],
  },
  {
    id: "contact",
    title: "Contact Support",
    icon: "📞",
    items: [
      { label: "Email Support", value: "support@jacshealth.com", action: "mailto:support@jacshealth.com" },
      { label: "Phone (Mon-Fri 8am-6pm EST)", value: "1-800-JACS-MED", action: "tel:18005227633" },
      { label: "Live Chat", value: "Available in app", action: null },
    ],
  },
  {
    id: "emergency",
    title: "Medical Emergency",
    icon: "🚨",
    items: [
      { label: "Emergency Services", value: "Call 911", action: "tel:911" },
      { label: "Poison Control", value: "1-800-222-1222", action: "tel:18002221222" },
      { label: "Crisis Line", value: "988", action: "tel:988" },
    ],
  },
];

export function SupportCenter() {
  const colors = useColors();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>("faq");

  return (
    <ScrollView contentContainerStyle={styles.supportContainer}>
      <Text style={[styles.supportTitle, { color: colors.foreground }]}>Support Center</Text>

      {SUPPORT_TOPICS.map((topic) => (
        <View key={topic.id} style={[styles.supportSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.supportSectionHeader}
            onPress={() => setExpandedSection(expandedSection === topic.id ? "" : topic.id)}
          >
            <Text style={styles.supportSectionIcon}>{topic.icon}</Text>
            <Text style={[styles.supportSectionTitle, { color: colors.foreground }]}>{topic.title}</Text>
            <Text style={[styles.supportChevron, { color: colors.muted }]}>
              {expandedSection === topic.id ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSection === topic.id && (
            <View style={[styles.supportSectionBody, { borderTopColor: colors.border }]}>
              {topic.id === "faq" &&
                topic.items.map((item: any) => (
                  <TouchableOpacity
                    key={item.q}
                    style={[styles.faqItem, { borderBottomColor: colors.border }]}
                    onPress={() => setExpandedFaq(expandedFaq === item.q ? null : item.q)}
                  >
                    <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{item.q}</Text>
                    {expandedFaq === item.q && (
                      <Text style={[styles.faqAnswer, { color: colors.muted }]}>{item.a}</Text>
                    )}
                  </TouchableOpacity>
                ))}

              {(topic.id === "contact" || topic.id === "emergency") &&
                topic.items.map((item: any) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.contactItem, { borderBottomColor: colors.border }]}
                    onPress={() => item.action && Linking.openURL(item.action)}
                    disabled={!item.action}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactLabel, { color: colors.muted }]}>{item.label}</Text>
                      <Text style={[styles.contactValue, { color: item.action ? colors.primary : colors.foreground }]}>
                        {item.value}
                      </Text>
                    </View>
                    {item.action && <Text style={[styles.contactArrow, { color: colors.primary }]}>›</Text>}
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      ))}

      <View style={[styles.versionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.versionText, { color: colors.muted }]}>JACS Health Monitor v1.0.33</Text>
        <Text style={[styles.versionText, { color: colors.muted }]}>© 2026 JACS Medical Systems</Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // DocumentationStreak
  streakCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  streakHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  streakTitle: { fontSize: 16, fontWeight: "700" },
  loggedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  loggedBadgeText: { fontSize: 12, fontWeight: "700" },
  streakStats: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statSuffix: { fontSize: 16 },
  statLabel: { fontSize: 10, textAlign: "center" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayItem: { alignItems: "center", gap: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14 },
  dayLabel: { fontSize: 11 },
  logBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  logBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // TrialBanner
  trialBanner: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  trialContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  trialIcon: { fontSize: 24 },
  trialInfo: { flex: 1, gap: 2 },
  trialTitle: { fontSize: 15, fontWeight: "700" },
  trialSubtitle: { fontSize: 12 },
  trialActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  upgradeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  upgradeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  dismissText: { fontSize: 13 },

  // GuidedWalkthrough
  walkthroughOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  walkthroughCard: { width: "100%", maxWidth: 380, borderRadius: 20, padding: 24, gap: 12 },
  walkthroughTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  walkthroughFill: { height: "100%", borderRadius: 2 },
  walkthroughStep: { fontSize: 12, fontWeight: "600" },
  walkthroughIcon: { fontSize: 56, textAlign: "center" },
  walkthroughTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  walkthroughDesc: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  walkthroughButtons: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  skipText: { fontSize: 14 },
  nextBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // SupportCenter
  supportContainer: { padding: 16, gap: 10 },
  supportTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  supportSection: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  supportSectionHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  supportSectionIcon: { fontSize: 20 },
  supportSectionTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  supportChevron: { fontSize: 12 },
  supportSectionBody: { borderTopWidth: 0.5 },
  faqItem: { padding: 14, borderBottomWidth: 0.5, gap: 6 },
  faqQuestion: { fontSize: 14, fontWeight: "600" },
  faqAnswer: { fontSize: 13, lineHeight: 20 },
  contactItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 0.5 },
  contactInfo: { flex: 1, gap: 2 },
  contactLabel: { fontSize: 12 },
  contactValue: { fontSize: 15, fontWeight: "600" },
  contactArrow: { fontSize: 22 },
  versionBox: { padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 4 },
  versionText: { fontSize: 12 },
});
