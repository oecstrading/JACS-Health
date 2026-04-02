import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const CHECKLIST = [
  { id: "1", item: "Download CGM report (last 14 days)", critical: true },
  { id: "2", item: "Print blood sugar log (last 30 days)", critical: true },
  { id: "3", item: "List all current medications and doses", critical: true },
  { id: "4", item: "Write down 5 questions for the doctor", critical: true },
  { id: "5", item: "Bring insurance card and photo ID", critical: false },
  { id: "6", item: "Note any hypoglycemia episodes this month", critical: true },
  { id: "7", item: "Record highest and lowest BG readings", critical: false },
  { id: "8", item: "List any new symptoms or concerns", critical: false },
  { id: "9", item: "Bring EpiPen Jr to appointment", critical: true },
  { id: "10", item: "Note any changes in appetite or weight", critical: false },
  { id: "11", item: "Record school performance and energy levels", critical: false },
  { id: "12", item: "List any new foods introduced this month", critical: false },
  { id: "13", item: "Bring glucagon emergency kit", critical: true },
  { id: "14", item: "Note any skin reactions at injection sites", critical: false },
  { id: "15", item: "Confirm next appointment before leaving", critical: false },
];
export default function DoctorVisitPreparationScreen() {
  const colors = useColors();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const pct = Math.round((checked.size / CHECKLIST.length) * 100);
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Visit Prep</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: "800" }}>Readiness: {pct}%</Text>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>{checked.size}/{CHECKLIST.length} done</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
            <View style={{ width: pct + "%", height: 8, backgroundColor: pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.primary, borderRadius: 4 }} />
          </View>
        </View>
        {CHECKLIST.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => toggle(item.id)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: item.critical && !checked.has(item.id) ? colors.error + "40" : colors.border }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: checked.has(item.id) ? colors.success : item.critical ? colors.error : colors.border, backgroundColor: checked.has(item.id) ? colors.success + "20" : "transparent", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              {checked.has(item.id) && <Text style={{ color: colors.success, fontSize: 14, fontWeight: "900" }}>✓</Text>}
            </View>
            <Text style={{ color: checked.has(item.id) ? colors.muted : colors.foreground, flex: 1, fontSize: 14, textDecorationLine: checked.has(item.id) ? "line-through" : "none" }}>{item.item}</Text>
            {item.critical && !checked.has(item.id) && <View style={{ backgroundColor: colors.error + "20", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: colors.error, fontSize: 10, fontWeight: "700" }}>KEY</Text></View>}
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
