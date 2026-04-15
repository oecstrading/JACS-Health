import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';

const MOODS = [
  { emoji: '😄', label: 'Great', color: '#4ADE80', score: 5 },
  { emoji: '🙂', label: 'Good', color: '#38BDF8', score: 4 },
  { emoji: '😐', label: 'Okay', color: '#FBBF24', score: 3 },
  { emoji: '😔', label: 'Low', color: '#FB923C', score: 2 },
  { emoji: '😢', label: 'Rough', color: '#F87171', score: 1 },
];

const FACTORS = ['Stress', 'Sleep', 'Exercise', 'Diet', 'Medication', 'Social', 'Weather', 'Pain'];

export default function MoodTrackerScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleFactor = (f: string) => setFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSave = async () => {
    if (selected === null) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry = { score: selected, factors, date: new Date().toISOString() };
    const existing = JSON.parse(await AsyncStorage.getItem('@mood_log') || '[]');
    await AsyncStorage.setItem('@mood_log', JSON.stringify([entry, ...existing].slice(0, 90)));
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Mood Tracker</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 24 }}>How are you feeling today?</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          {MOODS.map((m) => (
            <Pressable
              key={m.score}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(m.score); }}
              style={({ pressed }) => ({ alignItems: 'center', padding: 10, borderRadius: 16, backgroundColor: selected === m.score ? m.color + '33' : 'transparent', borderWidth: selected === m.score ? 2 : 1, borderColor: selected === m.score ? m.color : '#1e3a5f', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
            >
              <Text style={{ fontSize: 32 }}>{m.emoji}</Text>
              <Text style={{ color: selected === m.score ? m.color : '#9BA1A6', fontSize: 11, fontWeight: '600', marginTop: 4 }}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Contributing factors</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {FACTORS.map((f) => (
            <Pressable
              key={f}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFactor(f); }}
              style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: factors.includes(f) ? '#38BDF833' : '#0F1A2A', borderWidth: 1, borderColor: factors.includes(f) ? '#38BDF8' : '#1e3a5f', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
            >
              <Text style={{ color: factors.includes(f) ? '#38BDF8' : '#9BA1A6', fontSize: 13, fontWeight: '600' }}>{f}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({ backgroundColor: saved ? '#4ADE80' : (selected !== null ? '#38BDF8' : '#1e3a5f'), borderRadius: 16, padding: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
        >
          <Text style={{ color: '#0F0F1A', fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Saved!' : 'Save Mood Entry'}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
