import { ScrollView, Text, View, Pressable, TextInput, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';

const QUICK_FOODS = [
  { name: 'Breakfast', icon: '🌅', cal: 0 },
  { name: 'Lunch', icon: '☀️', cal: 0 },
  { name: 'Dinner', icon: '🌙', cal: 0 },
  { name: 'Snack', icon: '🍎', cal: 0 },
];

export default function NutritionTrackerScreen() {
  const router = useRouter();
  const [carbs, setCarbs] = useState('');
  const [calories, setCalories] = useState('');
  const [meal, setMeal] = useState('Breakfast');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!carbs && !calories) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry = { meal, carbs: Number(carbs), calories: Number(calories), date: new Date().toISOString() };
    const existing = JSON.parse(await AsyncStorage.getItem('@nutrition_log') || '[]');
    await AsyncStorage.setItem('@nutrition_log', JSON.stringify([entry, ...existing].slice(0, 180)));
    setSaved(true);
    setTimeout(() => { setSaved(false); setCarbs(''); setCalories(''); }, 1500);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Nutrition Tracker</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 20 }}>Log carbs and calories to manage blood glucose.</Text>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15, marginBottom: 10 }}>Meal Type</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {QUICK_FOODS.map(f => (
            <Pressable
              key={f.name}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMeal(f.name); }}
              style={({ pressed }) => ({ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: meal === f.name ? '#38BDF833' : '#0F1A2A', borderWidth: meal === f.name ? 1.5 : 1, borderColor: meal === f.name ? '#38BDF8' : '#1e3a5f', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
            >
              <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              <Text style={{ color: meal === f.name ? '#38BDF8' : '#9BA1A6', fontSize: 11, fontWeight: '600', marginTop: 4 }}>{f.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15, marginBottom: 8 }}>Carbohydrates (g)</Text>
        <TextInput
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
          placeholder="e.g. 45"
          placeholderTextColor="#687076"
          style={{ backgroundColor: '#0F1A2A', borderRadius: 12, padding: 14, color: '#ECEDEE', fontSize: 16, borderWidth: 1, borderColor: '#1e3a5f', marginBottom: 16 }}
        />

        <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15, marginBottom: 8 }}>Calories (kcal)</Text>
        <TextInput
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="e.g. 520"
          placeholderTextColor="#687076"
          style={{ backgroundColor: '#0F1A2A', borderRadius: 12, padding: 14, color: '#ECEDEE', fontSize: 16, borderWidth: 1, borderColor: '#1e3a5f', marginBottom: 20 }}
        />

        {carbs ? (
          <View style={{ backgroundColor: '#0F1A2A', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#38BDF833' }}>
            <Text style={{ color: '#9BA1A6', fontSize: 13 }}>
              {Number(carbs) <= 45 ? '✅ Low-carb meal — good for glucose control' :
               Number(carbs) <= 60 ? '⚠️ Moderate carbs — monitor glucose after eating' :
               '🔴 High-carb meal — consider adjusting insulin dose'}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({ backgroundColor: saved ? '#4ADE80' : '#38BDF8', borderRadius: 16, padding: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
        >
          <Text style={{ color: '#0F0F1A', fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Logged!' : `Log ${meal}`}</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/nutrition-scan' as any)} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '600' }}>🔍 Scan food for nutrition info →</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
