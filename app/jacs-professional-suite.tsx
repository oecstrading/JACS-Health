import {
  ScrollView,
  Text,
  View,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const FEATURES = [
  {
    emoji: "📊",
    title: "Revenue Command Center",
    desc: "Real-time census tracking, daily revenue projections, and payer mix analytics.",
  },
  {
    emoji: "✅",
    title: "Compliance & HQRP",
    desc: "Automated CAHPS survey scheduling, HOPE HIS form builder, and regulatory alerts.",
  },
  {
    emoji: "📋",
    title: "Patient Management",
    desc: "Full hospice patient list, visit logs, care-plan documentation, and discharge workflows.",
  },
  {
    emoji: "👩‍⚕️",
    title: "Clinical Leadership Tools",
    desc: "Nurse leader dashboard, IDG meeting prep, and staff performance metrics.",
  },
  {
    emoji: "💵",
    title: "Cost & Billing Reports",
    desc: "Hospice cost reports, per-diem billing summaries, and Medicare cap monitoring.",
  },
  {
    emoji: "🏫",
    title: "School Nurse Portal",
    desc: "Pediatric hospice coordination with school health teams for continuity of care.",
  },
  {
    emoji: "🩺",
    title: "Surgeon & Specialist Comms",
    desc: "Secure messaging with surgeons and specialists for palliative care coordination.",
  },
  {
    emoji: "🌍",
    title: "8-Language Support",
    desc: "Full UI in English, Spanish, French, Portuguese, Haitian Creole, Chinese, Arabic, Hindi.",
  },
];

export default function JacsProfessionalSuiteScreen() {
  const router = useRouter();
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openHospiceCommand = () => {
    handlePress();
    router.push("/(tabs)/hospice-revenue-command" as any);
  };

  const openPDF = () => {
    handlePress();
    // Opens the sponsorship/outreach PDF in the device browser
    Linking.openURL(
      "https://healthcompa-8ujrlxsn.manus.space"
    ).catch(() => {});
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#1a0a2e",
            paddingTop: 20,
            paddingBottom: 28,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <IconSymbol name="chevron.left" size={20} color="#a78bfa" />
            <Text style={{ color: "#a78bfa", fontSize: 15, fontWeight: "600" }}>My Health</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                backgroundColor: "#7c3aed22",
                borderWidth: 1.5,
                borderColor: "#7c3aed",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30 }}>🏥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: "#a78bfa", fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" }}>
                JACS PROFESSIONAL SUITE
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#ffffff", lineHeight: 28 }}>
                Hospice Edition
              </Text>
              <Text style={{ fontSize: 13, color: "#c4b5fd", marginTop: 2 }}>
                Enterprise-grade hospice management platform
              </Text>
            </View>
          </View>

          {/* Tagline */}
          <View
            style={{
              backgroundColor: "#7c3aed22",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#7c3aed55",
              padding: 14,
              marginTop: 4,
            }}
          >
            <Text style={{ color: "#e9d5ff", fontSize: 14, lineHeight: 21, fontStyle: "italic" }}>
              "Built for hospice professionals who need real-time revenue intelligence, regulatory compliance, and compassionate patient care — all in one platform."
            </Text>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.muted,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            What's Included
          </Text>

          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 14,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 26, lineHeight: 34 }}>{f.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, marginBottom: 3 }}>
                  {f.title}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 19 }}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing / Sponsorship Note */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            backgroundColor: "#0a2d1a",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#16a34a55",
            padding: 18,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#4ade80", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            💚 Free for All Users
          </Text>
          <Text style={{ fontSize: 14, color: "#bbf7d0", lineHeight: 21 }}>
            JACS is funded by pharmaceutical and healthcare sponsorships so every family — regardless of income — can access professional-grade health management tools at no cost.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 12 }}>
          <Pressable
            onPress={openHospiceCommand}
            style={({ pressed }) => ({
              backgroundColor: "#7c3aed",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#ffffff" }}>
              🏥  Open Hospice Command Center
            </Text>
          </Pressable>

          <Pressable
            onPress={openPDF}
            style={({ pressed }) => ({
              backgroundColor: "transparent",
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1.5,
              borderColor: "#7c3aed",
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#a78bfa" }}>
              📄  View Sponsorship Overview
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
