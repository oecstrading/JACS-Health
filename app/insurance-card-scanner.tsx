import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Linking } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
type Card = { id: string; insurer: string; memberId: string; group: string; phone: string; type: string };
const INITIAL: Card[] = [
  { id: "1", insurer: "BlueCross BlueShield", memberId: "XYZ123456789", group: "GRP-54321", phone: "+18002621000", type: "Primary Medical" },
  { id: "2", insurer: "Delta Dental", memberId: "DD-987654321", group: "DEN-11111", phone: "+18003352222", type: "Dental" },
  { id: "3", insurer: "VSP Vision", memberId: "VSP-456789", group: "VSP-99999", phone: "+18007777336", type: "Vision" },
];
export default function InsuranceCardScannerScreen() {
  const colors = useColors();
  const [cards, setCards] = useState<Card[]>(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [insurer, setInsurer] = useState(""); const [memberId, setMemberId] = useState(""); const [phone, setPhone] = useState("");
  const add = () => {
    if (!insurer || !memberId) { Alert.alert("Enter insurer and member ID"); return; }
    setCards(prev => [...prev, { id: Date.now().toString(), insurer, memberId, group: "", phone, type: "Medical" }]);
    setInsurer(""); setMemberId(""); setPhone(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const call = (p: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("tel:" + p); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Insurance Cards</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <TextInput value={insurer} onChangeText={setInsurer} placeholder="Insurance company name *" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={memberId} onChangeText={setMemberId} placeholder="Member ID *" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="Customer service phone" keyboardType="phone-pad" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: colors.muted }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={add} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        )}
        {cards.map((c) => (
          <View key={c.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{c.insurer}</Text>
              <View style={{ backgroundColor: colors.primary + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{c.type}</Text></View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Member ID: <Text style={{ color: colors.foreground, fontWeight: "700" }}>{c.memberId}</Text></Text>
            {c.group ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>Group: {c.group}</Text> : null}
            {c.phone ? <TouchableOpacity onPress={() => call(c.phone)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, marginTop: 10, alignItems: "center" }}><Text style={{ color: colors.primary, fontWeight: "700" }}>📞 Call {c.phone}</Text></TouchableOpacity> : null}
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
