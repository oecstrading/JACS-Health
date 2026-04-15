import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const DEVICES = [
  { name: 'Apple Watch', icon: '⌚', status: 'Connected', color: '#4ADE80', data: ['Heart Rate', 'SpO₂', 'Steps', 'ECG'] },
  { name: 'Dexcom G7 CGM', icon: '🩸', status: 'Connected', color: '#4ADE80', data: ['Glucose', 'Trends', 'Alerts'] },
  { name: 'Omron BP Monitor', icon: '💉', status: 'Pair Now', color: '#FBBF24', data: ['Blood Pressure', 'Pulse'] },
  { name: 'Fitbit Sense 2', icon: '🏃', status: 'Pair Now', color: '#FBBF24', data: ['Steps', 'Sleep', 'Stress'] },
  { name: 'Libre 3 CGM', icon: '📡', status: 'Pair Now', color: '#FBBF24', data: ['Glucose', 'Real-time'] },
  { name: 'Garmin Venu', icon: '🎯', status: 'Pair Now', color: '#FBBF24', data: ['Fitness', 'Heart Rate', 'GPS'] },
];

export default function WearableSyncScreen() {
  const router = useRouter();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (name: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnecting(name);
    setTimeout(() => setConnecting(null), 2000);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Wearable Sync</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 24 }}>Connect your devices to sync health data automatically.</Text>
        {DEVICES.map(d => (
          <View key={d.name} style={{ backgroundColor: '#0F1A2A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e3a5f' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 26 }}>{d.icon}</Text>
                <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15 }}>{d.name}</Text>
              </View>
              <Pressable
                onPress={() => handleConnect(d.name)}
                style={({ pressed }) => ({ backgroundColor: connecting === d.name ? '#38BDF833' : (d.status === 'Connected' ? '#4ADE8022' : '#38BDF822'), borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, opacity: pressed ? 0.8 : 1 } as ViewStyle)}
              >
                <Text style={{ color: connecting === d.name ? '#38BDF8' : d.color, fontWeight: '700', fontSize: 12 }}>
                  {connecting === d.name ? 'Connecting...' : d.status}
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {d.data.map(item => (
                <View key={item} style={{ backgroundColor: '#38BDF811', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 11 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
