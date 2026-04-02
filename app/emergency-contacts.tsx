import { ScrollView, Text, View, TouchableOpacity, TextInput, Linking, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
type Contact = { id: string; name: string; role: string; phone: string; priority: number };
const INITIAL: Contact[] = [
  { id: "1", name: "Mom", role: "Primary Caregiver", phone: "+15551234567", priority: 1 },
  { id: "2", name: "Grandma Janice", role: "Emergency Caregiver", phone: "+15559876543", priority: 2 },
  { id: "3", name: "Dr. Martinez", role: "Endocrinologist", phone: "+15552223333", priority: 3 },
  { id: "4", name: "School Nurse", role: "School Contact", phone: "+15554445555", priority: 4 },
  { id: "5", name: "Poison Control", role: "Medical Emergency", phone: "+18002221222", priority: 5 },
];
export default function EmergencyContactsScreen() {
  const colors = useColors();
  const [contacts, setContacts] = useState<Contact[]>(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [phone, setPhone] = useState("");
  const call = (p: string) => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); Linking.openURL("tel:" + p); };
  const add = () => {
    if (!name || !phone) { Alert.alert("Enter name and phone"); return; }
    setContacts(prev => [...prev, { id: Date.now().toString(), name, role, phone, priority: prev.length + 1 }]);
    setName(""); setRole(""); setPhone(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Emergency Contacts</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => call("911")} style={{ backgroundColor: colors.error, borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>🚨 CALL 911</Text>
        </TouchableOpacity>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <TextInput value={name} onChangeText={setName} placeholder="Name *" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={role} onChangeText={setRole} placeholder="Role (e.g. Grandparent)" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number *" keyboardType="phone-pad" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: colors.muted }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={add} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        )}
        {contacts.map((c) => (
          <View key={c.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 16 }}>{c.priority}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{c.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{c.role} · {c.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => call(c.phone)} style={{ backgroundColor: colors.success + "20", borderRadius: 12, width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
