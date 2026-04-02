/**
 * JACS Share Screen — Seamless, instant sharing like Google Play Store
 *
 * One-tap WhatsApp, Email, SMS, Copy Link, and native Share Sheet.
 * Beautiful QR code that anyone can scan to download the app instantly.
 * No pauses, no friction, no file downloads — pure URL sharing.
 */
import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Share,
  Linking,
  Clipboard,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";

// ─── App Download Links ────────────────────────────────────────────────────────
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=space.manus.jacs.health.companion";
const AMAZON_URL = "https://www.amazon.com/dp/JACS-Health-Companion";
const SHARE_URL = GOOGLE_PLAY_URL; // Primary share URL

const SHARE_MESSAGE = `💙 JACS Health Companion — FREE app for Type 1 Diabetes families!

✅ Real-time CGM monitoring
✅ Overnight safety alerts
✅ Free insulin finder (saves $300+/month)
✅ Kids mode for children
✅ School nurse portal

Download FREE 👇
${SHARE_URL}

#T1DParents #Type1Diabetes #JACShealthapp`;

const WHATSAPP_MESSAGE = encodeURIComponent(SHARE_MESSAGE);
const EMAIL_SUBJECT = encodeURIComponent("FREE App for T1D Families — JACS Health Companion");
const EMAIL_BODY = encodeURIComponent(SHARE_MESSAGE);
const SMS_BODY = encodeURIComponent(`💙 FREE T1D app for families! JACS Health Companion has CGM monitoring, overnight alerts & free insulin finder. Download: ${SHARE_URL}`);

// ─── Share Channels ────────────────────────────────────────────────────────────
const SHARE_CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    emoji: "💬",
    color: "#25D366",
    darkColor: "#128C7E",
    url: `whatsapp://send?text=${WHATSAPP_MESSAGE}`,
    webUrl: `https://wa.me/?text=${WHATSAPP_MESSAGE}`,
  },
  {
    key: "email",
    label: "Email",
    emoji: "📧",
    color: "#3B82F6",
    darkColor: "#1D4ED8",
    url: `mailto:?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`,
    webUrl: `mailto:?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`,
  },
  {
    key: "sms",
    label: "SMS / Text",
    emoji: "💬",
    color: "#8B5CF6",
    darkColor: "#6D28D9",
    url: Platform.OS === "ios" ? `sms:&body=${SMS_BODY}` : `sms:?body=${SMS_BODY}`,
    webUrl: `sms:?body=${SMS_BODY}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    emoji: "📘",
    color: "#1877F2",
    darkColor: "#1565C0",
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
    webUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
  },
  {
    key: "twitter",
    label: "X / Twitter",
    emoji: "🐦",
    color: "#000000",
    darkColor: "#1a1a1a",
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent("💙 FREE app for T1D families! JACS Health Companion — CGM monitoring, overnight alerts & free insulin finder. " + SHARE_URL + " #T1DParents #Type1Diabetes")}`,
    webUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent("💙 FREE app for T1D families! JACS Health Companion — CGM monitoring, overnight alerts & free insulin finder. " + SHARE_URL + " #T1DParents #Type1Diabetes")}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    emoji: "🎵",
    color: "#FF0050",
    darkColor: "#CC0040",
    url: `https://www.tiktok.com/`,
    webUrl: `https://www.tiktok.com/`,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ShareAppScreen() {
  const svgRef = useRef<any>(null);

  const handleChannel = async (channel: typeof SHARE_CHANNELS[0]) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = Platform.OS === "web" ? channel.webUrl : channel.url;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback: open web URL
        await Linking.openURL(channel.webUrl);
      }
    } catch {
      // Final fallback: native share sheet
      await Share.share({ message: SHARE_MESSAGE, url: SHARE_URL });
    }
  };

  const handleNativeShare = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { message: SHARE_MESSAGE, url: SHARE_URL }
          : { message: `${SHARE_MESSAGE}` },
        { dialogTitle: "Share JACS Health Companion" }
      );
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  const handleCopyLink = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(SHARE_URL);
      } else {
        Clipboard.setString(SHARE_URL);
      }
      Alert.alert("✅ Copied!", "Link copied to clipboard. Paste it anywhere to share.");
    } catch {
      Alert.alert("Link", SHARE_URL);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share JACS</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>💙</Text>
          <Text style={styles.heroTitle}>Share with Every{"\n"}T1D Family</Text>
          <Text style={styles.heroSub}>
            Every share could save a child's life.{"\n"}Help us reach 500 million people worldwide.
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>📱 Scan to Download</Text>
          <Text style={styles.qrSub}>Anyone can scan this with their phone camera</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={SHARE_URL}
              size={200}
              color="#0A0F1E"
              backgroundColor="#FFFFFF"
              getRef={(ref) => { svgRef.current = ref; }}
              logo={undefined}
              logoBorderRadius={0}
              quietZone={12}
            />
          </View>
          <Text style={styles.qrHint}>Point your camera at this code → tap the link → FREE download</Text>
        </View>

        {/* One-tap Share Channels */}
        <Text style={styles.sectionTitle}>One-Tap Share</Text>
        <View style={styles.channelGrid}>
          {SHARE_CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch.key}
              style={[styles.channelBtn, { backgroundColor: ch.color }]}
              onPress={() => handleChannel(ch)}
              activeOpacity={0.82}
            >
              <Text style={styles.channelEmoji}>{ch.emoji}</Text>
              <Text style={styles.channelLabel} allowFontScaling={false}>{ch.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Big Native Share Button */}
        <TouchableOpacity
          style={styles.bigShareBtn}
          onPress={handleNativeShare}
          activeOpacity={0.85}
        >
          <Text style={styles.bigShareEmoji}>🚀</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigShareTitle} allowFontScaling={false}>Share via Any App</Text>
            <Text style={styles.bigShareSub} allowFontScaling={false}>Opens your phone's share sheet instantly</Text>
          </View>
          <Text style={styles.bigShareArrow}>→</Text>
        </TouchableOpacity>

        {/* Copy Link */}
        <TouchableOpacity
          style={styles.copyLinkBtn}
          onPress={handleCopyLink}
          activeOpacity={0.85}
        >
          <Text style={styles.copyLinkEmoji}>🔗</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.copyLinkTitle} allowFontScaling={false}>Copy Link</Text>
            <Text style={styles.copyLinkSub} numberOfLines={1} allowFontScaling={false}>{SHARE_URL}</Text>
          </View>
          <Text style={styles.copyLinkAction} allowFontScaling={false}>Copy</Text>
        </TouchableOpacity>

        {/* Store Badges */}
        <Text style={styles.sectionTitle}>Download Links</Text>
        <TouchableOpacity
          style={[styles.storeBtn, { backgroundColor: "#1A1A2E" }]}
          onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}
          activeOpacity={0.85}
        >
          <Text style={styles.storeEmoji}>▶</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeLabel} allowFontScaling={false}>GET IT ON</Text>
            <Text style={styles.storeName} allowFontScaling={false}>Google Play</Text>
          </View>
          <Text style={styles.storeFree} allowFontScaling={false}>FREE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.storeBtn, { backgroundColor: "#1A2E1A" }]}
          onPress={() => Linking.openURL(AMAZON_URL)}
          activeOpacity={0.85}
        >
          <Text style={styles.storeEmoji}>🛒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeLabel} allowFontScaling={false}>AVAILABLE ON</Text>
            <Text style={styles.storeName} allowFontScaling={false}>Amazon Appstore</Text>
          </View>
          <Text style={styles.storeFree} allowFontScaling={false}>FREE</Text>
        </TouchableOpacity>

        {/* Ready-to-copy message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>📋 Ready-to-Copy Message</Text>
          <Text style={styles.messageText}>{SHARE_MESSAGE}</Text>
          <TouchableOpacity
            style={styles.copyMsgBtn}
            onPress={async () => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (Platform.OS === "web") {
                await navigator.clipboard.writeText(SHARE_MESSAGE);
              } else {
                Clipboard.setString(SHARE_MESSAGE);
              }
              Alert.alert("✅ Copied!", "Message copied. Paste into WhatsApp, Facebook, or any app.");
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.copyMsgBtnText} allowFontScaling={false}>Copy This Message</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0F1E" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backBtnText: { color: "#D4AF37", fontSize: 15, fontWeight: "700" },
  headerTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },

  hero: { alignItems: "center", marginBottom: 28 },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: {
    color: "#F8FAFC", fontSize: 26, fontWeight: "900",
    textAlign: "center", lineHeight: 32, marginBottom: 10,
  },
  heroSub: {
    color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 22,
  },

  qrCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: "#D4AF3740",
  },
  qrTitle: { color: "#D4AF37", fontSize: 18, fontWeight: "900", marginBottom: 4 },
  qrSub: { color: "#94A3B8", fontSize: 13, marginBottom: 20, textAlign: "center" },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrHint: {
    color: "#64748B", fontSize: 12, textAlign: "center",
    marginTop: 16, lineHeight: 18,
  },

  sectionTitle: {
    color: "#F8FAFC", fontSize: 17, fontWeight: "800",
    marginBottom: 14, marginTop: 4,
  },

  channelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  channelBtn: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 90,
  },
  channelEmoji: { fontSize: 26 },
  channelLabel: {
    color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "center",
  },

  bigShareBtn: {
    backgroundColor: "#1E3A5F",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#3B82F6",
  },
  bigShareEmoji: { fontSize: 28 },
  bigShareTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  bigShareSub: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  bigShareArrow: { color: "#3B82F6", fontSize: 20, fontWeight: "700" },

  copyLinkBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  copyLinkEmoji: { fontSize: 22 },
  copyLinkTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  copyLinkSub: { color: "#64748B", fontSize: 11, marginTop: 2 },
  copyLinkAction: {
    color: "#D4AF37", fontSize: 14, fontWeight: "800",
    backgroundColor: "#D4AF3720",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  storeBtn: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  storeEmoji: { fontSize: 26, color: "#FFFFFF" },
  storeLabel: { color: "#94A3B8", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  storeName: { color: "#F8FAFC", fontSize: 17, fontWeight: "900" },
  storeFree: {
    color: "#22C55E", fontSize: 14, fontWeight: "900",
    backgroundColor: "#14532D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  messageCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 8,
  },
  messageTitle: { color: "#D4AF37", fontSize: 15, fontWeight: "800", marginBottom: 12 },
  messageText: { color: "#94A3B8", fontSize: 13, lineHeight: 20, marginBottom: 16 },
  copyMsgBtn: {
    backgroundColor: "#D4AF37",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  copyMsgBtnText: { color: "#0A0F1E", fontSize: 15, fontWeight: "900" },
});
