import { ScrollView, Text, View, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';

function randomInRange(min: number, max: number, dec = 0) {
  const v = Math.random() * (max - min) + min;
  return dec > 0 ? parseFloat(v.toFixed(dec)) : Math.round(v);
}

export default function LiveVitalsScreen() {
  const router = useRouter();
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98, bp: '118/76', temp: 98.6, glucose: 105, rr: 16 });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals({
        hr: randomInRange(60, 100),
        spo2: randomInRange(95, 100),
        bp: `${randomInRange(110, 135)}/${randomInRange(70, 90)}`,
        temp: randomInRange(97.5, 99.5, 1),
        glucose: randomInRange(80, 140),
        rr: randomInRange(12, 20),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CARDS = [
    { icon: '❤️', label: 'Heart Rate', value: `${vitals.hr}`, unit: 'bpm', color: '#F87171' },
    { icon: '🫁', label: 'SpO₂', value: `${vitals.spo2}`, unit: '%', color: '#38BDF8' },
    { icon: '🩸', label: 'Blood Pressure', value: vitals.bp, unit: 'mmHg', color: '#A78BFA' },
    { icon: '🌡️', label: 'Temperature', value: `${vitals.temp}`, unit: '°F', color: '#FB923C' },
    { icon: '🍬', label: 'Glucose', value: `${vitals.glucose}`, unit: 'mg/dL', color: '#4ADE80' },
    { icon: '💨', label: 'Resp. Rate', value: `${vitals.rr}`, unit: '/min', color: '#FBBF24' },
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ECEDEE', marginBottom: 4 }}>Live Vitals</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' }} />
          <Text style={{ color: '#4ADE80', fontSize: 13, fontWeight: '600' }}>Updating every 3 seconds</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {CARDS.map((c) => (
            <View key={c.label} style={{ width: '47%', backgroundColor: '#0F1A2A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.color + '44' }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</Text>
              <Text style={{ color: c.color, fontSize: 28, fontWeight: '800' }}>{c.value}</Text>
              <Text style={{ color: '#9BA1A6', fontSize: 11, marginTop: 2 }}>{c.unit}</Text>
              <Text style={{ color: '#ECEDEE', fontSize: 12, fontWeight: '600', marginTop: 4 }}>{c.label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: '#9BA1A6', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
          Simulated readings for demo. Connect a CGM or wearable for real-time data.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
