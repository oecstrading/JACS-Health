import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const ARTICLES = [
  { title: "What is Type 1 Diabetes?", category: "Basics", summary: "T1D is an autoimmune disease where the pancreas produces no insulin. The immune system destroys beta cells. It is not caused by diet or lifestyle. Children need insulin to survive.", detail: "T1D affects 1.6 million Americans. It is managed with insulin therapy, CGM, and carb counting. There is currently no cure, but research is advancing rapidly." },
  { title: "Treating Hypoglycemia (Low BG)", category: "Emergency", summary: "Low BG (<70 mg/dL) requires immediate treatment. Use the 15-15 Rule: 15g fast carbs, wait 15 min, recheck. If unconscious, use glucagon.", detail: "Fast carbs: 4 glucose tabs, ½ cup juice, 4 oz regular soda. Do NOT give food if unconscious. Call 911 if unresponsive after glucagon." },
  { title: "Hyperglycemia Signs & Treatment", category: "Emergency", summary: "High BG (>250 mg/dL) causes thirst, frequent urination, fatigue. Check for ketones. Correct with insulin per sliding scale.", detail: "If ketones are moderate/large, call doctor immediately. Drink water. Do NOT exercise with high ketones. DKA is a medical emergency." },
  { title: "Sick Day Rules for T1D", category: "Management", summary: "Never stop insulin during illness. Check BG every 2–4 hours. Check ketones if BG >240. Stay hydrated. Call doctor if vomiting.", detail: "Illness raises BG due to stress hormones. Increase monitoring frequency. Use sick day insulin correction doses per your endo's protocol." },
  { title: "Carb Counting for Toddlers", category: "Nutrition", summary: "Count total carbohydrates, not just sugars. Use insulin-to-carb ratio (e.g., 1 unit per 20g carbs). Weigh food for accuracy.", detail: "Toddler portions are small — accuracy matters more. Use a food scale. Apps like Calorie King have carb counts for 70,000+ foods." },
  { title: "T1D + Celiac Disease", category: "Comorbidities", summary: "10% of T1D patients also have celiac disease. Wheat/gluten causes intestinal damage and worsens BG control. Gluten-free diet is essential.", detail: "Celiac + T1D is called 'double diabetes burden.' Annual celiac antibody testing (tTG-IgA) is recommended. Strict GF diet improves A1C." },
  { title: "School 504 Plan Guide", category: "School", summary: "A 504 Plan legally requires schools to accommodate T1D. It covers BG checks in class, snacks, nurse visits, and emergency protocols.", detail: "Request a 504 meeting with the school principal. Bring your endo's letter. Include: CGM alarms allowed in class, fast-acting carbs at desk, no penalization for bathroom breaks." },
  { title: "Glucagon Emergency Guide", category: "Emergency", summary: "Glucagon raises BG when the child is unconscious and cannot eat. Available as Gvoke HypoPen (auto-injector), Baqsimi (nasal spray), or Zegalogue.", detail: "Gvoke HypoPen: Remove red cap, press firmly on outer thigh for 5 sec. Baqsimi nasal: Insert tip in nostril, press plunger. Call 911 after using glucagon." },
  { title: "CGM Accuracy & Calibration", category: "Technology", summary: "CGMs measure interstitial fluid glucose, not blood glucose. There is a 5–15 min lag. Calibrate with fingerstick if symptoms don't match CGM reading.", detail: "Dexcom G7 is FDA-approved for treatment decisions without fingerstick. FreeStyle Libre 3 requires fingerstick confirmation for dosing in some protocols." },
  { title: "Insulin Storage & Handling", category: "Medications", summary: "Unopened insulin: refrigerate at 36–46°F. Opened vials: room temperature up to 28 days. Never freeze. Discard if cloudy (clear insulins) or clumped.", detail: "Humalog/Novolog: clear. Lantus/Basaglar: clear. NPH: cloudy (normal). Check expiry monthly. Insulin exposed to heat >86°F loses potency." },
];
export default function MedicalLibraryScreen() {
  const colors = useColors();
  const [expanded, setExpanded] = useState<string | null>(null);
  const cats = [...new Set(ARTICLES.map(a => a.category))];
  const catColor: Record<string, string> = { Basics: colors.primary, Emergency: colors.error, Management: colors.warning, Nutrition: colors.success, Comorbidities: colors.warning, School: colors.primary, Technology: colors.primary, Medications: colors.success };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Medical Library</Text>
        </View>
        <Text style={{ color: colors.muted, marginBottom: 16, fontSize: 14 }}>{ARTICLES.length} evidence-based articles for T1D caregivers. Tap to expand.</Text>
        {ARTICLES.map((a, i) => (
          <TouchableOpacity key={i} onPress={() => setExpanded(expanded === a.title ? null : a.title)} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ backgroundColor: (catColor[a.category] || colors.primary) + "20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 }}>
                  <Text style={{ color: catColor[a.category] || colors.primary, fontSize: 11, fontWeight: "700" }}>{a.category}</Text>
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{a.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{a.summary}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 18 }}>{expanded === a.title ? "▲" : "▼"}</Text>
            </View>
            {expanded === a.title && (
              <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{a.detail}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
