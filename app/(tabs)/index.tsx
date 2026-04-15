import { Linking, Text, View, ScrollView, Pressable, Image, type ViewStyle, Platform } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { ComplianceDashboard } from '@/components/compliance-dashboard';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OnboardingTour, DEFAULT_ONBOARDING_STEPS } from '@/components/onboarding-tour';

// ── Feature card data ─────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    emoji: '🌟',
    label: 'Brand Hub',
    sub: 'Pitch • Social • Share',
    route: '/jacs-brand-hub',
    bg: '#0A0F1E',
    border: '#D4AF3780',
    borderActive: '#D4AF37',
    text: '#D4AF37',
    haptic: 'medium',
  },
  {
    emoji: '🩸',
    label: 'Blood Sugar',
    sub: 'Log • History • Chart',
    route: '/blood-sugar-log',
    bg: '#7F1D1D',
    border: '#EF444480',
    borderActive: '#FCA5A5',
    text: '#FCA5A5',
    haptic: 'light',
  },
  {
    emoji: '🛡️',
    label: 'Guardian',
    sub: 'Wheat • Hypo • SOS',
    route: '/guardian-agent',
    bg: '#0C1B33',
    border: '#D4AF3780',
    borderActive: '#D4AF37',
    text: '#D4AF37',
    haptic: 'heavy',
  },
  {
    emoji: '🥗',
    label: 'Meal Planner',
    sub: 'Wheat-Free • Carbs',
    route: '/meal-planner',
    bg: '#14532D',
    border: '#4ADE8080',
    borderActive: '#4ADE80',
    text: '#4ADE80',
    haptic: 'light',
  },
  {
    emoji: '🌟',
    label: 'Kids World',
    sub: 'Games • Badges • Fun',
    route: '/kids-world',
    bg: '#1A0A3B',
    border: '#FFD70080',
    borderActive: '#FFD700',
    text: '#FFD700',
    haptic: 'light',
  },
  {
    emoji: '🌍',
    label: 'Learning Hub',
    sub: '6 Languages • Education',
    route: '/learning-hub',
    bg: '#0C1B33',
    border: '#60A5FA80',
    borderActive: '#60A5FA',
    text: '#60A5FA',
    haptic: 'light',
  },
  {
    emoji: '⏰',
    label: 'BG Reminders',
    sub: 'Daily alerts • Never miss',
    route: '/bg-reminders',
    bg: '#1E3A5F',
    border: '#60A5FA80',
    borderActive: '#60A5FA',
    text: '#60A5FA',
    haptic: 'light',
  },
  {
    emoji: '🎙️',
    label: 'My T1D Story',
    sub: 'Voice journal • Record',
    route: '/my-t1d-story',
    bg: '#3B0764',
    border: '#C084FC80',
    borderActive: '#C084FC',
    text: '#C084FC',
    haptic: 'light',
  },
  {
    emoji: '⚙️',
    label: 'Setup Profile',
    sub: 'Age • Devices • Rx',
    route: '/setup-wizard',
    bg: '#1E3A5F',
    border: '#38BDF880',
    borderActive: '#38BDF8',
    text: '#38BDF8',
    haptic: 'light',
  },
  {
    emoji: '📋',
    label: 'Event Log',
    sub: '"45g pizza" • "2u bolus"',
    route: '/jacs-event-log',
    bg: '#14532D',
    border: '#4ADE8080',
    borderActive: '#4ADE80',
    text: '#4ADE80',
    haptic: 'light',
  },
  {
    emoji: '👨‍👩‍👧',
    label: 'Care Team',
    sub: 'GluCrew • Live BG share',
    route: '/glucrew',
    bg: '#3B0764',
    border: '#C084FC80',
    borderActive: '#C084FC',
    text: '#C084FC',
    haptic: 'light',
  },
  {
    emoji: '📲',
    label: 'Share JACS',
    sub: 'WhatsApp • SMS • QR',
    route: '/share-app',
    bg: '#0C4A6E',
    border: '#38BDF880',
    borderActive: '#38BDF8',
    text: '#38BDF8',
    haptic: 'medium',
  },
] as const;

export default function PatientCommandCenter() {
  const router = useRouter();
  const colors = useColors();

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    alert("Emergency contact feature - calling primary contact");
  };

  const handleQuickLog = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'medication') router.push('/medication-tracker');
    else if (type === 'insulin') router.push('/medication-tracker');
    else if (type === 'meal') router.push('/food-scan');
  };

  const handleDownloadPresentation = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pdfUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/mTCKjTTSeiMtQkHN.pdf';
    try {
      if (Platform.OS === 'web') {
        Linking.openURL(pdfUrl);
      } else {
        const fileUri = FileSystem.documentDirectory + 'JACS_Platform_Presentation.pdf';
        const dl = await FileSystem.downloadAsync(pdfUrl, fileUri);
        if (dl.uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dl.uri, { mimeType: 'application/pdf', dialogTitle: 'JACS Platform Presentation' });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch { alert('Could not download presentation. Please try again.'); }
  };

  const handleDownloadHospiceEdition = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pdfUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/yPQrDHBmRfahtaLt.pdf';
    try {
      if (Platform.OS === 'web') {
        Linking.openURL(pdfUrl);
      } else {
        const fileUri = FileSystem.documentDirectory + 'JACS_Hospice_Edition.pdf';
        const dl = await FileSystem.downloadAsync(pdfUrl, fileUri);
        if (dl.uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dl.uri, { mimeType: 'application/pdf', dialogTitle: 'JACS Hospice Edition' });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch { alert('Could not download Hospice Edition. Please try again.'); }
  };

  const fireHaptic = (level: string) => {
    if (Platform.OS === 'web') return;
    if (level === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (level === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer>
      <OnboardingTour steps={DEFAULT_ONBOARDING_STEPS} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── COMPACT HEADER ─────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#9BA1A6', fontWeight: '600', letterSpacing: 0.5 }} allowFontScaling={false}>
                👋 Hello!
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#ECEDEE', lineHeight: 22 }} allowFontScaling={false}>
                Your Health Command Center
              </Text>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL('https://healthcompa-8ujrlxsn.manus.space');
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle)}
              >
                <Text style={{ fontSize: 11, color: '#38BDF8', fontWeight: '600' }} allowFontScaling={false}>🌐 Visit our website</Text>
                <Text style={{ fontSize: 10, color: '#38BDF8' }} allowFontScaling={false}>→</Text>
              </Pressable>
            </View>
            {/* Emergency SOS button */}
            <Pressable
              onPress={handleEmergency}
              style={({ pressed }) => ({
                backgroundColor: colors.error,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.93 : 1 }],
                opacity: pressed ? 0.85 : 1,
              } as ViewStyle)}
            >
              <IconSymbol name="phone.fill" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {/* ── MEDICAL ID EMERGENCY CARD ───────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.push('/medical-id-card');
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#B91C1C' : '#DC2626',
              borderRadius: 14,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text style={{ fontSize: 22, marginRight: 10 }}>🪪</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }} allowFontScaling={false}>MEDICAL ID CARD</Text>
              <Text style={{ color: '#FFB3B3', fontSize: 11, marginTop: 1 }} allowFontScaling={false}>T1D • Tap for emergency info</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>OPEN →</Text>
          </Pressable>
        </View>

        {/* ── 2-COLUMN FEATURE GRID ──────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FEATURE_CARDS.map((card) => (
              <Pressable
                key={card.route}
                onPress={() => { fireHaptic(card.haptic); router.push(card.route as any); }}
                style={({ pressed }) => ({
                  width: '48%',
                  backgroundColor: card.bg,
                  borderWidth: 1.5,
                  borderColor: pressed ? card.borderActive : card.border,
                  borderRadius: 14,
                  padding: 12,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  opacity: pressed ? 0.92 : 1,
                })}
              >
                <Text style={{ fontSize: 22, marginBottom: 6 }}>{card.emoji}</Text>
                <Text style={{ color: card.text, fontWeight: '800', fontSize: 13, lineHeight: 17 }} allowFontScaling={false}>
                  {card.label}
                </Text>
                <Text style={{ color: '#9BA1A6', fontSize: 10, marginTop: 2, lineHeight: 14 }} allowFontScaling={false}>
                  {card.sub}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── DAILY VITALS RIBBON ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={{ backgroundColor: '#1e2022', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#334155' }}>
            <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 14, marginBottom: 10 }} allowFontScaling={false}>
              Today's Vitals
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => router.push('/vitals-tracker')}
                style={({ pressed }) => ({ flex: 1, backgroundColor: '#151718', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ color: '#9BA1A6', fontSize: 10 }} allowFontScaling={false}>mg/dL</Text>
                <Text style={{ color: '#ECEDEE', fontWeight: '800', fontSize: 20 }} allowFontScaling={false}>128</Text>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }} allowFontScaling={false}>Glucose</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/vitals-tracker')}
                style={({ pressed }) => ({ flex: 1, backgroundColor: '#151718', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ color: '#9BA1A6', fontSize: 10 }} allowFontScaling={false}>mmHg</Text>
                <Text style={{ color: '#ECEDEE', fontWeight: '800', fontSize: 20 }} allowFontScaling={false}>120/80</Text>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }} allowFontScaling={false}>Blood Pressure</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/vitals-tracker')}
                style={({ pressed }) => ({ flex: 1, backgroundColor: '#151718', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ color: '#9BA1A6', fontSize: 10 }} allowFontScaling={false}>lbs</Text>
                <Text style={{ color: '#ECEDEE', fontWeight: '800', fontSize: 20 }} allowFontScaling={false}>165</Text>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }} allowFontScaling={false}>Weight</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── QUICK LOG ──────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={{ backgroundColor: '#1e2022', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#334155' }}>
            <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 14, marginBottom: 10 }} allowFontScaling={false}>
              Quick Log
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { icon: 'pills.fill', label: 'Medication', type: 'medication', color: colors.primary },
                { icon: 'syringe.fill', label: 'Insulin', type: 'insulin', color: colors.primary },
                { icon: 'fork.knife', label: 'Meal', type: 'meal', color: colors.success },
              ].map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => handleQuickLog(item.type)}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: '#151718',
                    borderRadius: 12,
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#334155',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <IconSymbol name={item.icon as any} size={22} color={item.color} />
                  <Text style={{ color: '#ECEDEE', fontSize: 11, marginTop: 4, fontWeight: '600' }} allowFontScaling={false}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ── MASTER DASHBOARD ───────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Pressable
            onPress={() => router.push('/master-dashboard')}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }} allowFontScaling={false}>Master Dashboard</Text>
              <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 2 }} allowFontScaling={false}>Complete health trends & history</Text>
            </View>
            <IconSymbol name="chart.bar.fill" size={28} color="#ffffff" />
          </Pressable>
        </View>

        {/* ── 4 HEALTH CARE PILLARS ──────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 12 }} />
          <Text style={{ color: '#9BA1A6', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }} allowFontScaling={false}>
            YOUR HEALTH CARE PILLARS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { icon: '🩸', label: 'Type 1 Diabetes', sub: 'CGM · Bolus · Kids Mode', route: '/(tabs)/diabetes-portal', bg: '#2D0A0A', border: '#F87171', text: '#FCA5A5' },
              { icon: '🍊', label: 'Type 2 Diabetes', sub: 'A1C · Oral Meds · Lifestyle', route: '/(tabs)/diabetes2-portal', bg: '#2D1A0A', border: '#FF9F43', text: '#FED7AA' },
              { icon: '💚', label: 'My General Health', sub: 'Vitals · Wellness · Family', route: '/(tabs)/my-health', bg: '#0A2D1A', border: '#4ADE80', text: '#BBF7D0' },
              { icon: '🏥', label: 'Hospice Care', sub: 'Revenue · Compliance · HQRP', route: '/(tabs)/hospice-revenue-command', bg: '#1A0A0A', border: '#FB923C', text: '#FED7AA' },
            ].map((pillar, i) => (
              <Pressable
                key={i}
                onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(pillar.route as any); }}
                style={({ pressed }) => ({
                  width: '47.5%',
                  backgroundColor: pillar.bg,
                  borderWidth: 1.5,
                  borderColor: pressed ? pillar.border : pillar.border + '88',
                  borderRadius: 16,
                  padding: 14,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{pillar.icon}</Text>
                <Text style={{ color: pillar.text, fontWeight: '800', fontSize: 13, lineHeight: 18 }} allowFontScaling={false}>{pillar.label}</Text>
                <Text style={{ color: pillar.text + 'bb', fontSize: 11, marginTop: 2 }} allowFontScaling={false}>{pillar.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {/* ── MEDICARE COMPLIANCE ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <ComplianceDashboard />
        </View>

        {/* ── HOSPICE PROFESSIONAL SUITE ─────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 12 }} />
          <Text style={{ color: '#9BA1A6', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }} allowFontScaling={false}>
            JACS PROFESSIONAL SUITE
          </Text>
          <Pressable
            onPress={handleDownloadHospiceEdition}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#78350F' : '#92400E',
              borderWidth: 2,
              borderColor: pressed ? '#FCD34D' : '#F59E0B',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ fontSize: 22, marginRight: 12 }}>🏥</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FCD34D', fontWeight: '900', fontSize: 14, marginBottom: 2 }} allowFontScaling={false}>
                Hospice Edition
              </Text>
              <Text style={{ color: '#FDE68A', fontSize: 11 }} allowFontScaling={false}>
                JACS Medical Monitoring System • Professional PDF
              </Text>
            </View>
            <Text style={{ color: '#FCD34D', fontSize: 20 }}>↓</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
