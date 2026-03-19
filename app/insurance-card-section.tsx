import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const INSURANCE_KEY = "jacs_insurance_cards";

interface InsuranceCard {
  id: string;
  type: "primary" | "secondary" | "dental" | "vision" | "medicare" | "medicaid";
  provider: string;
  memberId: string;
  groupNumber: string;
  planName: string;
  phone: string;
  copay: string;
  deductible: string;
  effectiveDate: string;
}

const CARD_TYPE_COLORS: Record<InsuranceCard["type"], string> = {
  primary: "#0a7ea4",
  secondary: "#6366F1",
  dental: "#22C55E",
  vision: "#F59E0B",
  medicare: "#EF4444",
  medicaid: "#8B5CF6",
};

export default function InsuranceCardSectionScreen() {
  const colors = useColors();
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editCard, setEditCard] = useState<Partial<InsuranceCard>>({ type: "primary" });

  useEffect(() => {
    AsyncStorage.getItem(INSURANCE_KEY).then((val) => {
      if (val) try { setCards(JSON.parse(val)); } catch { /* ignore */ }
    });
  }, []);

  const saveCard = useCallback(async () => {
    if (!editCard.provider?.trim() || !editCard.memberId?.trim()) {
      Alert.alert("Missing Info", "Provider name and Member ID are required.");
      return;
    }
    const newCard: InsuranceCard = {
      id: editCard.id || `ins_${Date.now()}`,
      type: editCard.type || "primary",
      provider: editCard.provider || "",
      memberId: editCard.memberId || "",
      groupNumber: editCard.groupNumber || "",
      planName: editCard.planName || "",
      phone: editCard.phone || "",
      copay: editCard.copay || "",
      deductible: editCard.deductible || "",
      effectiveDate: editCard.effectiveDate || "",
    };
    const updated = editCard.id
      ? cards.map((c) => (c.id === editCard.id ? newCard : c))
      : [...cards, newCard];
    setCards(updated);
    await AsyncStorage.setItem(INSURANCE_KEY, JSON.stringify(updated));
    setShowForm(false);
    setEditCard({ type: "primary" });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editCard, cards]);

  const deleteCard = useCallback(async (cardId: string, provider: string) => {
    Alert.alert("Delete Card", `Remove ${provider} insurance card?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = cards.filter((c) => c.id !== cardId);
          setCards(updated);
          await AsyncStorage.setItem(INSURANCE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  }, [cards]);

  const cardColor = CARD_TYPE_COLORS[editCard.type || "primary"];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Insurance Cards</Text>
        </View>

        {cards.map((card) => (
          <View key={card.id} style={[styles.insuranceCard, { backgroundColor: CARD_TYPE_COLORS[card.type] }]}>
            <View style={styles.cardTop}>
              <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
              <Text style={styles.cardProvider}>{card.provider}</Text>
            </View>
            <Text style={styles.cardPlan}>{card.planName}</Text>
            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardDetailLabel}>MEMBER ID</Text>
                <Text style={styles.cardDetailValue}>{card.memberId}</Text>
              </View>
              {card.groupNumber ? (
                <View>
                  <Text style={styles.cardDetailLabel}>GROUP</Text>
                  <Text style={styles.cardDetailValue}>{card.groupNumber}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.cardFooter}>
              {card.copay ? <Text style={styles.cardFooterText}>Copay: ${card.copay}</Text> : null}
              {card.phone ? <Text style={styles.cardFooterText}>📞 {card.phone}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => { setEditCard(card); setShowForm(true); }}>
                <Text style={styles.cardActionEdit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCard(card.id, card.provider)}>
                <Text style={styles.cardActionDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showForm ? (
          <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              {editCard.id ? "Edit Card" : "Add Insurance Card"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {(["primary", "secondary", "dental", "vision", "medicare", "medicaid"] as InsuranceCard["type"][]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, { backgroundColor: editCard.type === t ? CARD_TYPE_COLORS[t] : colors.background, borderColor: CARD_TYPE_COLORS[t] }]}
                  onPress={() => setEditCard((p) => ({ ...p, type: t }))}
                >
                  <Text style={[styles.typeChipText, { color: editCard.type === t ? "#fff" : CARD_TYPE_COLORS[t] }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {[
              { key: "provider", label: "Insurance Provider *", placeholder: "e.g. Blue Cross Blue Shield" },
              { key: "memberId", label: "Member ID *", placeholder: "e.g. XYZ123456789" },
              { key: "groupNumber", label: "Group Number", placeholder: "e.g. 12345" },
              { key: "planName", label: "Plan Name", placeholder: "e.g. PPO Gold 500" },
              { key: "phone", label: "Customer Service Phone", placeholder: "e.g. 1-800-555-0100" },
              { key: "copay", label: "Copay ($)", placeholder: "e.g. 25" },
              { key: "deductible", label: "Annual Deductible ($)", placeholder: "e.g. 1500" },
              { key: "effectiveDate", label: "Effective Date", placeholder: "e.g. 01/01/2026" },
            ].map((f) => (
              <View key={f.key}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  value={(editCard as any)[f.key] || ""}
                  onChangeText={(v) => setEditCard((p) => ({ ...p, [f.key]: v }))}
                />
              </View>
            ))}
            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowForm(false); setEditCard({ type: "primary" }); }}>
                <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveCard}>
                <Text style={styles.saveBtnText}>Save Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ Add Insurance Card</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  insuranceCard: { borderRadius: 16, padding: 18, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardType: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  cardProvider: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cardPlan: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  cardDetails: { flexDirection: "row", gap: 24, marginTop: 4 },
  cardDetailLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  cardDetailValue: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cardFooter: { flexDirection: "row", gap: 16, marginTop: 4 },
  cardFooterText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  cardActions: { flexDirection: "row", gap: 16, marginTop: 4, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 8 },
  cardActionEdit: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cardActionDelete: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  form: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  formTitle: { fontSize: 18, fontWeight: "700" },
  typeRow: { flexDirection: "row" },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, marginRight: 8 },
  typeChipText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 2 },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelBtnText: { fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
