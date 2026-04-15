import { ScrollView, Text, View, Pressable, TextInput, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

const SAMPLE_MEDS = [
  { name: 'Metformin 500mg', brand: 'Glucophage', generic: '$4', brandPrice: '$38', savings: '$34' },
  { name: 'Ozempic 0.5mg', brand: 'Ozempic', generic: 'N/A', brandPrice: '$892', savings: 'Coupon avail.' },
  { name: 'Jardiance 10mg', brand: 'Jardiance', generic: 'N/A', brandPrice: '$612', savings: 'Patient assist.' },
  { name: 'Lantus 100u/mL', brand: 'Lantus', generic: '$89', brandPrice: '$340', savings: '$251' },
  { name: 'Glipizide 5mg', brand: 'Glucotrol', generic: '$6', brandPrice: '$28', savings: '$22' },
  { name: 'Lisinopril 10mg', brand: 'Zestril', generic: '$5', brandPrice: '$42', savings: '$37' },
];

export default function MedicationCostCompareScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filtered = SAMPLE_MEDS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Medication Cost Comparison</Text>
        <Text style={{ fontSize: 13, color: '#9BA1A6', marginBottom: 20 }}>Compare brand vs. generic prices and find savings.</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search medication..."
          placeholderTextColor="#687076"
          style={{ backgroundColor: '#0F1A2A', borderRadius: 12, padding: 14, color: '#ECEDEE', fontSize: 15, borderWidth: 1, borderColor: '#1e3a5f', marginBottom: 20 }}
        />
        {filtered.map((m) => (
          <View key={m.name} style={{ backgroundColor: '#0F1A2A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e3a5f' }}>
            <Text style={{ color: '#ECEDEE', fontWeight: '700', fontSize: 15, marginBottom: 8 }}>{m.name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }}>Brand</Text>
                <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 16 }}>{m.brandPrice}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }}>Generic</Text>
                <Text style={{ color: '#4ADE80', fontWeight: '700', fontSize: 16 }}>{m.generic}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#9BA1A6', fontSize: 11 }}>Savings</Text>
                <Text style={{ color: '#FBBF24', fontWeight: '700', fontSize: 16 }}>{m.savings}</Text>
              </View>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={{ color: '#9BA1A6', textAlign: 'center', marginTop: 40 }}>No medications found for "{search}"</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
