import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';

const QUALITY = [
  { label: 'Excellent', emoji: '😴', color: '#4ADE80', score: 5 },
  { label: 'Good', emoji: '🙂', color: '#38BDF8', score: 4 },
  { label: 'Fair', emoji: '😐', color: '#FBBF24', score: 3 },
  { label: 'Poor', emoji: '😔', color: '#FB923C', score: 2 },
  { label: 'Terrible', emoji: '😫', color: '#F87171', score: 1 },
];

const HOURS = [4, 5, 6, 7, 8, 9, 10];

export default function SleepTrackerScreen() {
  const router = useRouter();
  const [hours, setHours] = useState<number | null>(null);
  const [quality, setQuality] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!hours || !quality) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry = { hours, quality, date: new Date().toISOString() };
    const existing = JSON.parse(await AsyncStorage.getItem('@sleep_log') || '[]');
    await AsyncStorage.setItem('@sleep_log', JSON.stringify([entry, ...existing].slice(0, 90)));
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Sleep Tracker</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 24 }}>Poor sleep raises blood glucose. Track your rest nightly.</Text>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Hours slept last night</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {HOURS.map(h => (
            <Pressable
              key={h}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHours(h); }}
              style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 14, backgroundColor: hours === h ? '#38BDF833' : '#0F1A2A', borderWidth: hours === h ? 2 : 1, borderColor: hours === h ? '#38BDF8' : '#1e3a5f', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
            >
              <Text style={{ color: hours === h ? '#38BDF8' : '#ECEDEE', fontWeight: '700', fontSize: 18 }}>{h}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Sleep quality</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          {QUALITY.map(q => (
            <Pressable
              key={q.score}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuality(q.score); }}
              style={({ pressed }) => ({ alignItems: 'center', padding: 8, borderRadius: 14, backgroundColor: quality === q.score ? q.color + '33' : 'transparent', borderWidth: quality === q.score ? 2 : 1, borderColor: quality === q.score ? q.color : '#1e3a5f', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
            >
              <Text style={{ fontSize: 28 }}>{q.emoji}</Text>
              <Text style={{ color: quality === q.score ? q.color : '#9BA1A6', fontSize: 10, fontWeight: '600', marginTop: 4 }}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {hours && quality && (
          <View style={{ backgroundColor: '#0F1A2A', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#38BDF833' }}>
            <Text style={{ color: '#9BA1A6', fontSize: 13 }}>
              {hours >= 7 ? '✅ Good sleep duration for diabetes management' : '⚠️ Less than 7 hours may raise blood glucose'}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({ backgroundColor: saved ? '#4ADE80' : (hours && quality ? '#38BDF8' : '#1e3a5f'), borderRadius: 16, padding: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
        >
          <Text style={{ color: '#0F0F1A', fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Saved!' : 'Save Sleep Entry'}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
