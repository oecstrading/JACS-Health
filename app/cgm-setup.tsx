import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const DEVICES = [
  { name: 'Dexcom G7', icon: '📡', desc: '10-day wear, no fingerstick calibration', color: '#38BDF8' },
  { name: 'Dexcom G6', icon: '📡', desc: '10-day wear, factory calibrated', color: '#38BDF8' },
  { name: 'Abbott Libre 3', icon: '🔵', desc: '14-day wear, real-time readings', color: '#60A5FA' },
  { name: 'Abbott Libre 2', icon: '🔵', desc: '14-day wear, optional alarms', color: '#60A5FA' },
  { name: 'Medtronic Guardian 4', icon: '🟣', desc: 'Integrated with insulin pumps', color: '#A78BFA' },
  { name: 'Eversense E3', icon: '🟢', desc: '180-day implantable sensor', color: '#4ADE80' },
];

const STEPS = [
  { step: '1', title: 'Choose your CGM device', desc: 'Select from the list below' },
  { step: '2', title: 'Download the companion app', desc: 'Install the manufacturer app on your phone' },
  { step: '3', title: 'Apply the sensor', desc: 'Follow the insertion guide for your device' },
  { step: '4', title: 'Pair with JACS', desc: 'Enable CGM sharing in your device app settings' },
];

export default function CgmSetupScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>CGM Setup</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 20 }}>Connect your Continuous Glucose Monitor to JACS.</Text>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Setup Steps</Text>
        {STEPS.map(s => (
          <View key={s.step} style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#38BDF822', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#38BDF8' }}>
              <Text style={{ color: '#38BDF8', fontWeight: '800', fontSize: 14 }}>{s.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 14 }}>{s.title}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 12, marginTop: 2 }}>{s.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginTop: 8, marginBottom: 12 }}>Select Your Device</Text>
        {DEVICES.map(d => (
          <Pressable
            key={d.name}
            onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(d.name); }}
            style={({ pressed }) => ({ backgroundColor: selected === d.name ? d.color + '22' : '#0F1A2A', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: selected === d.name ? 1.5 : 1, borderColor: selected === d.name ? d.color : '#1e3a5f', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <Text style={{ fontSize: 24 }}>{d.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 14 }}>{d.name}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 12, marginTop: 2 }}>{d.desc}</Text>
            </View>
            {selected === d.name && <Text style={{ color: d.color, fontSize: 18 }}>✓</Text>}
          </Pressable>
        ))}

        {selected && (
          <Pressable
            onPress={() => { if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
            style={({ pressed }) => ({ backgroundColor: '#38BDF8', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <Text style={{ color: '#0F0F1A', fontWeight: '800', fontSize: 16 }}>Connect {selected}</Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
