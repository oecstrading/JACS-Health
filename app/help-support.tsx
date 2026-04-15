import { ScrollView, Text, View, Pressable, Linking, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const TOPICS = [
  { icon: '📖', title: 'User Guide', desc: 'Step-by-step instructions for every feature', url: 'https://healthcompa-8ujrlxsn.manus.space' },
  { icon: '🎥', title: 'Video Tutorials', desc: 'Watch how to use JACS effectively', url: 'https://healthcompa-8ujrlxsn.manus.space' },
  { icon: '❓', title: 'FAQs', desc: 'Answers to the most common questions', url: 'https://healthcompa-8ujrlxsn.manus.space' },
  { icon: '🐛', title: 'Report a Bug', desc: 'Let us know if something is not working', url: 'mailto:support@jacsmedical.com' },
  { icon: '💡', title: 'Feature Request', desc: 'Suggest improvements or new features', url: 'mailto:support@jacsmedical.com' },
  { icon: '📞', title: 'Contact Support', desc: 'Reach our clinical support team', url: 'tel:+18005551234' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Help & Support</Text>
        <Text style={{ fontSize: 14, color: '#9BA1A6', marginBottom: 24 }}>We're here to help you get the most out of JACS.</Text>
        {TOPICS.map((t) => (
          <Pressable
            key={t.title}
            onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(t.url); }}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#1a2a3a' : '#0F1A2A', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#1e3a5f', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <Text style={{ fontSize: 28 }}>{t.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15 }}>{t.title}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 12, marginTop: 2 }}>{t.desc}</Text>
            </View>
            <Text style={{ color: '#38BDF8', fontSize: 18 }}>→</Text>
          </Pressable>
        ))}
        <View style={{ marginTop: 24, backgroundColor: '#0F1A2A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#38BDF833' }}>
          <Text style={{ color: '#38BDF8', fontWeight: '700', fontSize: 15, marginBottom: 6 }}>📧 Email Support</Text>
          <Text style={{ color: '#9BA1A6', fontSize: 13 }}>support@jacsmedical.com</Text>
          <Text style={{ color: '#38BDF8', fontWeight: '700', fontSize: 15, marginTop: 12, marginBottom: 6 }}>⏰ Response Time</Text>
          <Text style={{ color: '#9BA1A6', fontSize: 13 }}>Within 24 hours on business days</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
