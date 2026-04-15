import { ScrollView, Text, View, Pressable, Linking, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const PROVIDERS = [
  { name: 'Teladoc Health', specialty: 'General Medicine, Diabetes, Mental Health', wait: '< 10 min', url: 'https://www.teladoc.com', color: '#38BDF8' },
  { name: 'MDLive', specialty: 'Primary Care, Endocrinology', wait: '< 15 min', url: 'https://www.mdlive.com', color: '#4ADE80' },
  { name: 'Amwell', specialty: 'Diabetes Management, Nutrition', wait: '< 20 min', url: 'https://amwell.com', color: '#A78BFA' },
  { name: 'Doctor on Demand', specialty: 'Chronic Disease Management', wait: '< 5 min', url: 'https://doctorondemand.com', color: '#FBBF24' },
];

const FEATURES = [
  { icon: '🎥', title: 'Video Consultation', desc: 'Face-to-face with your doctor' },
  { icon: '💬', title: 'Secure Messaging', desc: 'Chat with your care team anytime' },
  { icon: '📋', title: 'e-Prescriptions', desc: 'Get prescriptions sent to your pharmacy' },
  { icon: '📊', title: 'Share Vitals', desc: 'Send your JACS data to your doctor' },
];

export default function TelehealthScreen() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Telehealth</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 24 }}>Connect with certified physicians from home.</Text>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>What's Included</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {FEATURES.map(f => (
            <View key={f.title} style={{ width: '47%', backgroundColor: '#0F1A2A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1e3a5f' }}>
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</Text>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 13 }}>{f.title}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 11, marginTop: 3 }}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Available Providers</Text>
        {PROVIDERS.map(p => (
          <Pressable
            key={p.name}
            onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(p.url); }}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#1a2a3a' : '#0F1A2A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: p.color + '55', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: p.color, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
              <View style={{ backgroundColor: '#4ADE8022', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 }}>
                <Text style={{ color: '#4ADE80', fontSize: 11, fontWeight: '700' }}>⏱ {p.wait}</Text>
              </View>
            </View>
            <Text style={{ color: '#9BA1A6', fontSize: 12, marginTop: 6 }}>{p.specialty}</Text>
            <Text style={{ color: p.color, fontSize: 12, marginTop: 8, fontWeight: '600' }}>Open App →</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
