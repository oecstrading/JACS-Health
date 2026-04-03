/**
 * JACS Brand Hub — Hero Page & Social Media Marketing Center
 *
 * Nano banana quality: cinematic deep-space navy + molten gold aesthetic
 * Showcases the JACS brand, all 6 core features, and social media channels
 * Designed to inspire downloads and community engagement
 */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Dimensions,
  Share,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Social Media Links ────────────────────────────────────────────────────────
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/JACSHealthCompanion",
  tiktok: "https://www.tiktok.com/@JACSHealthApp",
  instagram: "https://www.instagram.com/JACSHealth",
  googlePlay: "https://play.google.com/store/apps/details?id=space.manus.health.companion",
  amazon: "https://www.amazon.com/appstore/jacs-health-companion",
};

// ─── Feature Cards Data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "cgm",
    title: "CGM Real-Time\nMonitor",
    emoji: "📈",
    color: "#00D4FF",
    route: "/diabetes-portal",
    description: "Live glucose trends with predictive alerts",
  },
  {
    id: "kids",
    title: "Kids Mode",
    emoji: "🧸",
    color: "#FFD700",
    route: "/diabetes-portal",
    description: "Fun, child-friendly interface for ages 2–12",
  },
  {
    id: "school",
    title: "School Nurse\nPortal",
    emoji: "🏫",
    color: "#22C55E",
    route: "/school-nurse-portal",
    description: "ADA Safe at School 2024 compliant care plans",
  },
  {
    id: "overnight",
    title: "Overnight\nSafety",
    emoji: "🌙",
    color: "#A78BFA",
    route: "/overnight-dashboard",
    description: "8-hour CGM view with Safe to Sleep status",
  },
  {
    id: "bolus",
    title: "Bolus\nCalculator",
    emoji: "💉",
    color: "#F59E0B",
    route: "/diabetes-portal",
    description: "ICR/ISF/IOB precision dosing for all families",
  },
  {
    id: "insulin",
    title: "Free Insulin\nFinder",
    emoji: "💊",
    color: "#10B981",
    route: "/insulin-resources",
    description: "15+ assistance programs — save $300+/month",
  },
];

// ─── Social Platform Cards ─────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    handle: "@JACSHealthCompanion",
    emoji: "📘",
    color: "#1877F2",
    bgColor: "#1877F215",
    url: SOCIAL_LINKS.facebook,
    cta: "Follow Us",
    stat: "100K Goal",
    image: { uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_facebook_876b4be0.png" },
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@JACSHealthApp",
    emoji: "🎵",
    color: "#FF0050",
    bgColor: "#FF005015",
    url: SOCIAL_LINKS.tiktok,
    cta: "Follow Us",
    stat: "1M Goal",
    image: { uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_tiktok_542b37e6.png" },
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@JACSHealth",
    emoji: "📸",
    color: "#E1306C",
    bgColor: "#E1306C15",
    url: SOCIAL_LINKS.instagram,
    cta: "Follow Us",
    stat: "500K Goal",
    image: { uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_instagram_story_f6c11ce1.png" },
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function JACSBrandHub() {
  const [activeTab, setActiveTab] = useState<"hero" | "features" | "pitch" | "social" | "share" | "hospice">("hero");

  const handleDownloadHospiceEdition = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const pdfUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/yPQrDHBmRfahtaLt.pdf";
      if (Platform.OS === "web") {
        Linking.openURL(pdfUrl);
      } else {
        const fileUri = (FileSystem.documentDirectory ?? "") + "JACS_Hospice_Edition.pdf";
        const dl = await FileSystem.downloadAsync(pdfUrl, fileUri);
        if (dl.uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dl.uri, { mimeType: "application/pdf", dialogTitle: "JACS Hospice Edition" });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (e) {
      console.error("Hospice download error:", e);
    }
  };

  const handleDownloadFeaturesDeck = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pdfUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/mTCKjTTSeiMtQkHN.pdf";
    try {
      Linking.openURL(pdfUrl);
    } catch { /* ignore */ }
  };

  const handleOpenConsumerPitch = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/pitch-deck-consumer" as any);
  };

  const handleLink = (url: string, platform?: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(url).catch(() => {
      // If app not installed, open web version
      Linking.openURL(url.replace("tiktok://", "https://www.tiktok.com/"));
    });
  };

  const handleFeaturePress = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(route as any);
  };

  const handleShare = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/share-app' as any);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0F1E]" safeAreaClassName="bg-[#0A0F1E]">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_hero_c6ff4cac.png" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />
          {/* Hero text */}
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>TYPE 1 DIABETES</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "#22C55E20", borderColor: "#22C55E" }]}>
                <Text style={[styles.badgeText, { color: "#22C55E" }]}>FREE FOREVER</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>JACS Health{"\n"}Companion</Text>
            <Text style={styles.heroSubtitle}>
              Every Child Deserves Perfect{"\n"}Health Management
            </Text>
            <Text style={styles.heroTagline}>500 Million Lives. One App.</Text>
          </View>
        </View>

        {/* ── Tab Navigation (5 tabs, horizontally scrollable) ────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
          style={{ marginBottom: 4 }}
        >
          {([
            { key: "hero",     label: "🌟 Features" },
            { key: "features", label: "📋 Features Deck" },
            { key: "pitch",    label: "🎯 Consumer Pitch" },
            { key: "hospice",  label: "🏥 Hospice" },
            { key: "social",   label: "📱 Social" },
            { key: "share",    label: "🚀 Share" },
          ] as const).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive, { minWidth: 110 }]}
              onPress={() => {
                setActiveTab(key as any);
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Features Tab ────────────────────────────────────────────────── */}
        {activeTab === "hero" && (
          <View style={styles.section}>
            {/* Features Card Image */}
            <Image
              source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_features_card_92a292dd.png" }}
              style={styles.featuresCardImage}
              resizeMode="contain"
            />

            {/* Feature Grid */}
            <Text style={styles.sectionTitle}>Tap Any Feature to Open</Text>
            <View style={styles.featureGrid}>
              {FEATURES.map((feat) => (
                <TouchableOpacity
                  key={feat.id}
                  style={[styles.featureCard, { borderColor: feat.color + "60" }]}
                  onPress={() => handleFeaturePress(feat.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconBg, { backgroundColor: feat.color + "20" }]}>
                    <Text style={styles.featureEmoji}>{feat.emoji}</Text>
                  </View>
                  <Text style={[styles.featureTitle, { color: feat.color }]}>{feat.title}</Text>
                  <Text style={styles.featureDesc}>{feat.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Download Buttons */}
            <Text style={styles.sectionTitle}>Download FREE</Text>
            <View style={styles.downloadRow}>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleLink(SOCIAL_LINKS.googlePlay)}
                activeOpacity={0.8}
              >
                <Text style={styles.downloadEmoji}>▶</Text>
                <View>
                  <Text style={styles.downloadSmall}>GET IT ON</Text>
                  <Text style={styles.downloadBig}>Google Play</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.downloadBtn, { borderColor: "#FF9900" }]}
                onPress={() => handleLink(SOCIAL_LINKS.amazon)}
                activeOpacity={0.8}
              >
                <Text style={styles.downloadEmoji}>📦</Text>
                <View>
                  <Text style={styles.downloadSmall}>AVAILABLE ON</Text>
                  <Text style={[styles.downloadBig, { color: "#FF9900" }]}>Amazon Appstore</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {[
                { value: "8.4M", label: "Children\nwith T1D" },
                { value: "537M", label: "Total\nDiabetics" },
                { value: "FREE", label: "Always\nFree" },
              ].map((stat) => (
                <View key={stat.value} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Social Media Tab ─────────────────────────────────────────────── */}
        {activeTab === "social" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow JACS Worldwide</Text>
            <Text style={styles.sectionSubtitle}>
              Join our mission to reach 500 million people with free T1D support
            </Text>

            {SOCIAL_PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[styles.socialCard, { borderColor: platform.color + "40" }]}
                onPress={() => handleLink(platform.url, platform.id)}
                activeOpacity={0.85}
              >
                {/* Platform preview image */}
                <Image source={platform.image} style={styles.socialPreview} resizeMode="cover" />
                <View style={styles.socialCardBody}>
                  <View style={styles.socialCardHeader}>
                    <Text style={styles.socialEmoji}>{platform.emoji}</Text>
                    <View style={styles.socialCardInfo}>
                      <Text style={[styles.socialName, { color: platform.color }]}>
                        {platform.name}
                      </Text>
                      <Text style={styles.socialHandle}>{platform.handle}</Text>
                    </View>
                    <View style={[styles.socialStatBadge, { backgroundColor: platform.color + "20", borderColor: platform.color + "60" }]}>
                      <Text style={[styles.socialStatText, { color: platform.color }]}>
                        {platform.stat}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.followBtn, { backgroundColor: platform.color }]}
                    onPress={() => handleLink(platform.url)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.followBtnText}>{platform.cta} →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Social Square */}
            <Text style={styles.sectionTitle}>Our Brand Story</Text>
            <Image
              source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_social_square_3332477e.png" }}
              style={styles.socialSquareImage}
              resizeMode="contain"
            />

            {/* Hashtags */}
            <Text style={styles.sectionTitle}>Join the Conversation</Text>
            <View style={styles.hashtagGrid}>
              {[
                "#T1DParents", "#Type1Diabetes", "#DiabetesKids",
                "#JACShealthapp", "#InsulinAccess", "#CGMlife",
                "#T1Dmom", "#DiabetesAwareness", "#FreeInsulin",
                "#OvernightDiabetes", "#T1DSchool", "#KidsWithDiabetes",
              ].map((tag) => (
                <View key={tag} style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Share Tab ────────────────────────────────────────────────────── */}
        {activeTab === "share" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share JACS with Every T1D Family</Text>
            <Text style={styles.sectionSubtitle}>
              Every share could save a child's life. Help us reach 500 million people.
            </Text>

            {/* Big Share Button */}
            <TouchableOpacity style={styles.bigShareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.bigShareEmoji}>🚀</Text>
              <Text style={styles.bigShareTitle}>Share JACS Now</Text>
              <Text style={styles.bigShareSub}>Tap to share with friends & family</Text>
            </TouchableOpacity>

            {/* Features Post Image */}
            <Image
              source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_features_post_0e80f3ba.png" }}
              style={styles.sharePreviewImage}
              resizeMode="contain"
            />

            {/* Share Messages */}
            <Text style={styles.sectionTitle}>Ready-to-Copy Messages</Text>
            {[
              {
                platform: "📘 Facebook",
                message:
                  "Just found this amazing FREE app for T1D families — JACS Health Companion! It has real-time CGM monitoring, a school nurse portal, overnight safety alerts, and even finds FREE insulin programs. Every T1D family needs this! 🩸 #Type1Diabetes #T1DParents",
              },
              {
                platform: "🎵 TikTok",
                message:
                  "Insulin costs $300/month... unless you know about JACS! This FREE app finds 15+ assistance programs. Download on Google Play & Amazon. #T1Dmom #InsulinAccess #JACShealthapp",
              },
              {
                platform: "📸 Instagram",
                message:
                  "Sleeping peacefully knowing my T1D child is safe 🌙 JACS Overnight Dashboard shows 8-hour glucose trends and gives a Safe to Sleep status. FREE download ↓ #T1Dkids #OvernightDiabetes #JACShealthapp",
              },
            ].map((item) => (
              <View key={item.platform} style={styles.messageCard}>
                <Text style={styles.messagePlatform}>{item.platform}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={async () => {
                    if (Platform.OS !== "web") {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    await Share.share({ message: item.message });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyBtnText}>Share This Message →</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Mission Statement */}
            <View style={styles.missionCard}>
              <Text style={styles.missionQuote}>
                "Because no child should go without the care they deserve."
              </Text>
              <Text style={styles.missionAuthor}>— JACS Founder</Text>
            </View>
          </View>
        )}

        {/* ── Features Deck Tab ───────────────────────────────────────────────── */}
        {activeTab === "features" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 JACS Platform Presentation</Text>
            <Text style={styles.sectionSubtitle}>
              The complete JACS Medical Monitoring System feature overview. Share with investors, healthcare partners, and families.
            </Text>
            <Image
              source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_features_card_92a292dd.png" }}
              style={[styles.featuresCardImage, { marginBottom: 20 }]}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={[styles.bigShareBtn, { backgroundColor: "#1D4ED8" }]}
              onPress={handleDownloadFeaturesDeck}
              activeOpacity={0.85}
            >
              <Text style={styles.bigShareEmoji}>📥</Text>
              <Text style={styles.bigShareTitle}>Download Features Deck (PDF)</Text>
              <Text style={styles.bigShareSub}>Full platform presentation • Share with partners</Text>
            </TouchableOpacity>
            {[
              { icon: "📊", title: "CGM Real-Time Monitor", desc: "Live glucose trends, predictive alerts, 8-hour overnight view" },
              { icon: "🧸", title: "Kids Mode", desc: "Fun child-friendly interface for ages 2–12, gamified learning" },
              { icon: "🏫", title: "School Nurse Portal", desc: "ADA Safe at School 2024 compliant care plans" },
              { icon: "🌙", title: "Overnight Safety", desc: "Safe-to-Sleep status, low glucose push alerts" },
              { icon: "💉", title: "Bolus Calculator", desc: "ICR/ISF/IOB precision dosing for all insulin types" },
              { icon: "💰", title: "Free Insulin Finder", desc: "15+ assistance programs, $35/month cap, free options" },
            ].map((f) => (
              <View key={f.title} style={[styles.messageCard, { flexDirection: "row", alignItems: "flex-start", gap: 12 }]}>
                <Text style={{ fontSize: 28 }}>{f.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.messagePlatform, { marginBottom: 4 }]}>{f.title}</Text>
                  <Text style={styles.messageText}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Consumer Pitch Tab ───────────────────────────────────────────────── */}
        {activeTab === "pitch" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Consumer Pitch Deck</Text>
            <Text style={styles.sectionSubtitle}>
              The JACS story for families, caregivers, and healthcare advocates. Designed to inspire downloads and community growth.
            </Text>
            <Image
              source={{ uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663129142386/8UJRLxsNhLmxzNWs5o7Tr8/jacs_hero_c6ff4cac.png" }}
              style={[styles.featuresCardImage, { height: 200, marginBottom: 20 }]}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.bigShareBtn, { backgroundColor: "#065F46" }]}
              onPress={handleOpenConsumerPitch}
              activeOpacity={0.85}
            >
              <Text style={styles.bigShareEmoji}>🎯</Text>
              <Text style={styles.bigShareTitle}>Open Consumer Pitch Deck</Text>
              <Text style={styles.bigShareSub}>Interactive slides • Full story • Share with families</Text>
            </TouchableOpacity>
            {[
              { icon: "👶", stat: "4 Years Old", desc: "Built for the youngest T1D warriors and their families" },
              { icon: "🌍", stat: "500 Million", desc: "Target reach across Facebook, TikTok, and Instagram" },
              { icon: "💰", stat: "FREE Forever", desc: "No subscription, no paywall, no hidden costs" },
              { icon: "🏥", stat: "ADA Compliant", desc: "Meets 2024 American Diabetes Association guidelines" },
              { icon: "❤️", stat: "Built with Love", desc: "Created by a grandmother for her granddaughter" },
            ].map((s) => (
              <View key={s.stat} style={[styles.messageCard, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
                <Text style={{ fontSize: 32 }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#D4AF37", fontSize: 18, fontWeight: "900", marginBottom: 2 }}>{s.stat}</Text>
                  <Text style={styles.messageText}>{s.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.missionCard}>
              <Text style={styles.missionQuote}>
                "Because no child should go without the care they deserve."
              </Text>
              <Text style={styles.missionAuthor}>— JACS Founder</Text>
            </View>
          </View>
        )}

        {/* ── Hospice Edition Tab ───────────────────────────────────────────── */}
        {activeTab === "hospice" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 JACS Hospice Edition</Text>
            <Text style={styles.sectionSubtitle}>
              The JACS Medical Monitoring System — Professional Edition for hospice care teams, palliative nurses, and family caregivers.
            </Text>

            {/* Amber hero card */}
            <View style={{ backgroundColor: "#92400E", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 2, borderColor: "#F59E0B" }}>
              <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>🏥</Text>
              <Text style={{ color: "#FCD34D", fontSize: 20, fontWeight: "900", textAlign: "center", marginBottom: 6 }} allowFontScaling={false}>
                JACS Medical Monitoring System
              </Text>
              <Text style={{ color: "#FDE68A", fontSize: 13, textAlign: "center", lineHeight: 20 }} allowFontScaling={false}>
                Hospice & Palliative Care Edition
              </Text>
            </View>

            {/* Download button */}
            <TouchableOpacity
              style={[styles.bigShareBtn, { backgroundColor: "#92400E", borderWidth: 2, borderColor: "#F59E0B" }]}
              onPress={handleDownloadHospiceEdition}
              activeOpacity={0.85}
            >
              <Text style={styles.bigShareEmoji}>📥</Text>
              <Text style={styles.bigShareTitle}>Download Hospice Edition (PDF)</Text>
              <Text style={styles.bigShareSub}>Professional care guide • Share with your care team</Text>
            </TouchableOpacity>

            {/* Feature highlights */}
            {[
              { icon: "📊", title: "Continuous Monitoring", desc: "Real-time vitals tracking for comfort-focused care" },
              { icon: "💊", title: "Medication Management", desc: "Symptom control protocols, PRN dosing guides" },
              { icon: "👨‍👩‍👧", title: "Family Communication", desc: "Caregiver updates, condition summaries, care notes" },
              { icon: "❤️", title: "Comfort Care Protocols", desc: "Evidence-based comfort measures and pain assessment" },
              { icon: "📋", title: "ADA & CMS Compliant", desc: "Meets 2024 hospice quality reporting requirements" },
              { icon: "📞", title: "24/7 Crisis Support", desc: "Emergency escalation contacts and on-call protocols" },
            ].map((f) => (
              <View key={f.title} style={[styles.messageCard, { flexDirection: "row", alignItems: "flex-start", gap: 12 }]}>
                <Text style={{ fontSize: 28 }}>{f.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.messagePlatform, { marginBottom: 4, color: "#FCD34D" }]}>{f.title}</Text>
                  <Text style={styles.messageText}>{f.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.missionCard}>
              <Text style={styles.missionQuote}>
                "Dignity, comfort, and compassion — at every stage of life."
              </Text>
              <Text style={styles.missionAuthor}>— JACS Hospice Care Mission</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0A0F1E",
  },
  // Hero
  heroContainer: {
    width: "100%",
    height: 320,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 320,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "transparent",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#00D4FF20",
    borderWidth: 1,
    borderColor: "#00D4FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#00D4FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#D4AF37",
    lineHeight: 42,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#E2E8F0",
    marginTop: 4,
    lineHeight: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTagline: {
    fontSize: 13,
    color: "#00D4FF",
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 1,
  },
  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#0D1428",
    borderBottomWidth: 1,
    borderBottomColor: "#1E2A4A",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#D4AF37",
  },
  tabText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#D4AF37",
  },
  // Section
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#D4AF37",
    marginBottom: 6,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9BA1A6",
    lineHeight: 18,
    marginBottom: 12,
  },
  // Features Card Image
  featuresCardImage: {
    width: "100%",
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 16,
    marginBottom: 8,
  },
  // Feature Grid
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  featureIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureEmoji: {
    fontSize: 26,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 10,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 14,
  },
  // Download
  downloadRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 12,
    padding: 12,
  },
  downloadEmoji: {
    fontSize: 22,
    color: "#22C55E",
  },
  downloadSmall: {
    fontSize: 9,
    color: "#9BA1A6",
    letterSpacing: 1,
  },
  downloadBig: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22C55E",
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#D4AF37",
  },
  statLabel: {
    fontSize: 10,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 14,
    marginTop: 2,
  },
  // Social Cards
  socialCard: {
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  socialPreview: {
    width: "100%",
    height: 160,
  },
  socialCardBody: {
    padding: 14,
  },
  socialCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  socialEmoji: {
    fontSize: 28,
  },
  socialCardInfo: {
    flex: 1,
  },
  socialName: {
    fontSize: 16,
    fontWeight: "800",
  },
  socialHandle: {
    fontSize: 12,
    color: "#9BA1A6",
  },
  socialStatBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  socialStatText: {
    fontSize: 11,
    fontWeight: "700",
  },
  followBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  followBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  // Social Square
  socialSquareImage: {
    width: "100%",
    height: SCREEN_WIDTH - 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  // Hashtags
  hashtagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  hashtag: {
    backgroundColor: "#00D4FF15",
    borderWidth: 1,
    borderColor: "#00D4FF40",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hashtagText: {
    color: "#00D4FF",
    fontSize: 12,
    fontWeight: "600",
  },
  // Share Tab
  bigShareBtn: {
    backgroundColor: "#D4AF37",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  bigShareEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  bigShareTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0A0F1E",
  },
  bigShareSub: {
    fontSize: 13,
    color: "#0A0F1E",
    opacity: 0.7,
    marginTop: 4,
  },
  sharePreviewImage: {
    width: "100%",
    height: SCREEN_WIDTH * 1.1,
    borderRadius: 16,
    marginBottom: 8,
  },
  // Message Cards
  messageCard: {
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  messagePlatform: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D4AF37",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    color: "#E2E8F0",
    lineHeight: 20,
    marginBottom: 12,
  },
  copyBtn: {
    backgroundColor: "#D4AF3720",
    borderWidth: 1,
    borderColor: "#D4AF37",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  copyBtnText: {
    color: "#D4AF37",
    fontWeight: "700",
    fontSize: 13,
  },
  // Mission
  missionCard: {
    backgroundColor: "#0D1428",
    borderWidth: 1,
    borderColor: "#D4AF3740",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  missionQuote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#E2E8F0",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  missionAuthor: {
    fontSize: 13,
    color: "#D4AF37",
    fontWeight: "600",
  },
});
