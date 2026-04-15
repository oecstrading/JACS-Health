import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

export default function ScanMedicationScreen() {
  const router = useRouter();

  const handleScan = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/medication-barcode-scanner');
  };

  const OPTIONS = [
    { icon: '📷', title: 'Scan Barcode', desc: 'Point camera at medication barcode', action: handleScan, color: '#38BDF8' },
    { icon: '🔍', title: 'Pill Identifier', desc: 'Identify pills by shape, color, imprint', action: () => router.push('/pill-identifier'), color: '#A78BFA' },
    { icon: '📸', title: 'Photo Recognition', desc: 'Take a photo of your medication label', action: () => router.push('/medication-photo-recognition'), color: '#4ADE80' },
    { icon: '💊', title: 'Manual Entry', desc: 'Type in medication name manually', action: () => router.push('/medication-tracker'), color: '#FBBF24' },
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Scan Medication</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 28 }}>Choose how you'd like to identify your medication.</Text>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.title}
            onPress={o.action}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#1a2a3a' : '#0F1A2A', borderRadius: 18, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1.5, borderColor: o.color + '55', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: o.color + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 26 }}>{o.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16 }}>{o.title}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 13, marginTop: 3 }}>{o.desc}</Text>
            </View>
            <Text style={{ color: o.color, fontSize: 20 }}>→</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
