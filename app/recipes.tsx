import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const CATEGORIES = ['All', 'Low-GI', 'High Protein', 'Heart Healthy', 'Diabetic-Friendly'];

const RECIPES = [
  { name: 'Grilled Salmon with Quinoa', cat: 'Heart Healthy', time: '25 min', cal: 420, gi: 'Low', tags: ['Omega-3', 'Protein'] },
  { name: 'Cauliflower Rice Stir-Fry', cat: 'Low-GI', time: '20 min', cal: 180, gi: 'Very Low', tags: ['Vegan', 'Low-Carb'] },
  { name: 'Greek Yogurt Parfait', cat: 'Diabetic-Friendly', time: '5 min', cal: 220, gi: 'Low', tags: ['Probiotic', 'Quick'] },
  { name: 'Lentil Vegetable Soup', cat: 'Heart Healthy', time: '40 min', cal: 290, gi: 'Low', tags: ['Fiber', 'Iron'] },
  { name: 'Egg White Omelette', cat: 'High Protein', time: '10 min', cal: 150, gi: 'None', tags: ['Protein', 'Quick'] },
  { name: 'Berry Chia Smoothie', cat: 'Diabetic-Friendly', time: '5 min', cal: 195, gi: 'Low', tags: ['Antioxidants', 'Fiber'] },
  { name: 'Baked Chicken Thighs', cat: 'High Protein', time: '35 min', cal: 310, gi: 'None', tags: ['Protein', 'Keto'] },
  { name: 'Avocado Toast (Whole Grain)', cat: 'Heart Healthy', time: '8 min', cal: 280, gi: 'Medium', tags: ['Healthy Fats', 'Fiber'] },
];

export default function RecipesScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? RECIPES : RECIPES.filter(r => r.cat === cat);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Healthy Recipes</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 16 }}>Diabetes-friendly meals curated by dietitians.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CATEGORIES.map(c => (
              <Pressable
                key={c}
                onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCat(c); }}
                style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: cat === c ? '#38BDF8' : '#0F1A2A', borderWidth: 1, borderColor: cat === c ? '#38BDF8' : '#1e3a5f', opacity: pressed ? 0.8 : 1 } as ViewStyle)}
              >
                <Text style={{ color: cat === c ? '#0F0F1A' : '#9BA1A6', fontWeight: '700', fontSize: 13 }}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {filtered.map((r) => (
          <Pressable
            key={r.name}
            onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#1a2a3a' : '#0F1A2A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e3a5f', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 }}>{r.name}</Text>
              <Text style={{ color: '#FBBF24', fontWeight: '700', fontSize: 13 }}>{r.cal} cal</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Text style={{ color: '#9BA1A6', fontSize: 12 }}>⏱ {r.time}</Text>
              <Text style={{ color: '#4ADE80', fontSize: 12 }}>GI: {r.gi}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {r.tags.map(t => (
                <View key={t} style={{ backgroundColor: '#38BDF811', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 11 }}>{t}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
