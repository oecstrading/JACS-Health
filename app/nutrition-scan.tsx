import { ScrollView, Text, View, Pressable, TextInput, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const SAMPLE_FOODS = [
  { name: 'Apple (medium)', cal: 95, carbs: 25, protein: 0.5, fat: 0.3, gi: 36 },
  { name: 'Brown Rice (1 cup)', cal: 216, carbs: 45, protein: 5, fat: 1.8, gi: 50 },
  { name: 'Chicken Breast (3oz)', cal: 140, carbs: 0, protein: 26, fat: 3, gi: 0 },
  { name: 'Greek Yogurt (6oz)', cal: 100, carbs: 6, protein: 17, fat: 0.7, gi: 11 },
  { name: 'Oatmeal (1 cup)', cal: 154, carbs: 27, protein: 5, fat: 3, gi: 55 },
  { name: 'Banana (medium)', cal: 105, carbs: 27, protein: 1.3, fat: 0.4, gi: 51 },
];

export default function NutritionScanScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof SAMPLE_FOODS[0] | null>(null);
  const filtered = SAMPLE_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Nutrition Scanner</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 20 }}>Search foods to see nutritional info and glycemic index.</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search food..."
          placeholderTextColor="#687076"
          style={{ backgroundColor: '#0F1A2A', borderRadius: 12, padding: 14, color: '#ECEDEE', fontSize: 15, borderWidth: 1, borderColor: '#1e3a5f', marginBottom: 16 }}
        />
        {selected && (
          <View style={{ backgroundColor: '#0A2540', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1.5, borderColor: '#38BDF8' }}>
            <Text style={{ color: '#38BDF8', fontWeight: '800', fontSize: 17, marginBottom: 12 }}>{selected.name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {[['🔥', 'Calories', selected.cal, 'kcal'], ['🍞', 'Carbs', selected.carbs, 'g'], ['💪', 'Protein', selected.protein, 'g'], ['🥑', 'Fat', selected.fat, 'g'], ['📊', 'GI', selected.gi, '']].map(([icon, label, val, unit]) => (
                <View key={label as string} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                  <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 16 }}>{val}{unit}</Text>
                  <Text style={{ color: '#9BA1A6', fontSize: 10 }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {filtered.map((f) => (
          <Pressable
            key={f.name}
            onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(f); }}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#1a2a3a' : '#0F1A2A', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f', opacity: pressed ? 0.85 : 1 } as ViewStyle)}
          >
            <Text style={{ color: '#ECEDEE', fontWeight: '600', fontSize: 14 }}>{f.name}</Text>
            <Text style={{ color: '#FBBF24', fontWeight: '700', fontSize: 14 }}>{f.cal} kcal</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
