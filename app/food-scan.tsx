import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const WHEAT = ["wheat","flour","barley","rye","malt","semolina","spelt","triticale","durum","farro","kamut","bulgur","gluten","breadcrumbs","couscous","seitan","orzo","udon","soy sauce","teriyaki"];
const SAFE = ["rice","corn","potato","quinoa","certified gf oats","almond flour","coconut flour","tapioca","arrowroot","buckwheat","millet","sorghum","teff","lentils","chickpeas"];
export default function FoodScanScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ safe: boolean; found: string[] } | null>(null);
  const scan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lower = input.toLowerCase();
    const found = WHEAT.filter(k => lower.includes(k));
    setResult({ safe: found.length === 0, found });
    if (found.length > 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">🌾 Wheat Scanner</Text>
        </View>
        <Text style={{ color: colors.muted, marginBottom: 16, fontSize: 14 }}>Paste ingredient list to check for wheat/gluten. Protects against anaphylaxis.</Text>
        <TextInput value={input} onChangeText={setInput} placeholder="Paste ingredient list here..." placeholderTextColor={colors.muted} multiline numberOfLines={5}
          style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, color: colors.foreground, borderWidth: 1, borderColor: colors.border, fontSize: 14, minHeight: 100, marginBottom: 12 }} />
        <TouchableOpacity onPress={scan} style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>🔍 Scan for Wheat</Text>
        </TouchableOpacity>
        {result && (
          <View style={{ backgroundColor: result.safe ? colors.success + "20" : colors.error + "20", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 2, borderColor: result.safe ? colors.success : colors.error }}>
            <Text style={{ color: result.safe ? colors.success : colors.error, fontWeight: "900", fontSize: 22, textAlign: "center" }}>{result.safe ? "✅ SAFE TO EAT" : "🚫 CONTAINS WHEAT!"}</Text>
            {result.found.length > 0 && <Text style={{ color: colors.error, marginTop: 8, fontSize: 14 }}>Found: {result.found.join(", ")}</Text>}
            {!result.safe && <Text style={{ color: colors.error, marginTop: 8, fontWeight: "700" }}>⚠️ Do NOT give to child. EpiPen Jr ready if exposed.</Text>}
          </View>
        )}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontWeight: "800", marginBottom: 8 }}>✅ Always Safe Foods</Text>
          {SAFE.map((f, i) => <Text key={i} style={{ color: colors.muted, fontSize: 13, marginBottom: 3 }}>• {f}</Text>)}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
