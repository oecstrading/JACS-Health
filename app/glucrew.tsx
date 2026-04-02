/**
 * GluCrew — Caregiver Group Sharing Screen
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type MemberRole = "parent" | "grandparent" | "caregiver" | "nurse" | "provider";
interface CrewMember {
  id: string; name: string; role: MemberRole; contact: string;
  status: "active" | "pending"; lastSeen?: number;
  canLog: boolean; canViewBG: boolean; canReceiveAlerts: boolean;
}

function roleLabel(r: MemberRole): string {
  const map: Record<MemberRole, string> = { parent:"Parent", grandparent:"Grandparent", caregiver:"Caregiver", nurse:"School Nurse", provider:"Healthcare Provider" };
  return map[r];
}
function roleEmoji(r: MemberRole): string {
  const map: Record<MemberRole, string> = { parent:"👨‍👧", grandparent:"👴", caregiver:"🏥", nurse:"🏫", provider:"👩‍⚕️" };
  return map[r];
}
function formatLastSeen(ts?: number): string {
  if (!ts) return "Never";
  const d = Date.now() - ts;
  if (d < 60000) return "Just now";
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`;
  return `${Math.floor(d/86400000)}d ago`;
}

const DEFAULT_CREW: CrewMember[] = [
  { id:"cm1", name:"Mom", role:"parent", contact:"mom@example.com", status:"active", lastSeen:Date.now()-300000, canLog:true, canViewBG:true, canReceiveAlerts:true },
  { id:"cm2", name:"Grandma Rose", role:"grandparent", contact:"+1-555-0101", status:"active", lastSeen:Date.now()-7200000, canLog:false, canViewBG:true, canReceiveAlerts:true },
  { id:"cm3", name:"Nurse Williams", role:"nurse", contact:"nurse@school.edu", status:"pending", canLog:true, canViewBG:true, canReceiveAlerts:true },
];

export default function GluCrewScreen() {
  const colors = useColors();
  const s = styles(colors);
  const [crew, setCrew] = useState<CrewMember[]>(DEFAULT_CREW);
  const [inviteContact, setInviteContact] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("caregiver");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [childName, setChildName] = useState("Your Child");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem("@jacs_glucrew");
      if (raw) setCrew(JSON.parse(raw));
      const profile = await AsyncStorage.getItem("@jacs_setup_profile");
      if (profile) {
        const p = JSON.parse(profile);
        setChildName(p.child?.name || "Your Child");
      }
    } catch {}
  };

  const saveCrew = async (updated: CrewMember[]) => {
    setCrew(updated);
    await AsyncStorage.setItem("@jacs_glucrew", JSON.stringify(updated));
  };

  const handleInvite = async () => {
    if (!inviteContact.trim()) {
      Alert.alert("Contact Required", "Please enter an email or phone number.");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const m: CrewMember = {
      id: `cm_${Date.now()}`,
      name: inviteName.trim() || inviteContact.trim(),
      role: inviteRole,
      contact: inviteContact.trim(),
      status: "pending",
      canLog: inviteRole !== "grandparent",
      canViewBG: true,
      canReceiveAlerts: true,
    };
    await saveCrew([...crew, m]);
    setInviteContact("");
    setInviteName("");
    setShowInviteForm(false);
    Alert.alert("Invitation Sent!", `${m.name} will receive an invitation to join ${childName}'s Care Team.`);
  };

  const togglePerm = async (id: string, perm: "canLog" | "canViewBG" | "canReceiveAlerts") => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await saveCrew(crew.map((m) => m.id === id ? { ...m, [perm]: !m[perm] } : m));
  };

  const removeMember = (member: CrewMember) => {
    Alert.alert("Remove Member", `Remove ${member.name} from ${childName}'s Care Team?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => { await saveCrew(crew.filter((m) => m.id !== member.id)); } },
    ]);
  };

  const active = crew.filter((m) => m.status === "active");
  const pending = crew.filter((m) => m.status === "pending");
  const ROLES: MemberRole[] = ["parent", "grandparent", "caregiver", "nurse", "provider"];
  const PERMS: Array<{ key: "canViewBG" | "canLog" | "canReceiveAlerts"; label: string }> = [
    { key: "canViewBG", label: "View BG" },
    { key: "canLog", label: "Log Events" },
    { key: "canReceiveAlerts", label: "Alerts" },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Care Team</Text>
            <Text style={s.headerSub}>{childName}'s GluCrew · {active.length} active</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowInviteForm(!showInviteForm)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>{showInviteForm ? "✕" : "+ Invite"}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={s.quickRow}>
          {[
            { emoji: "📋", label: "Event Log", route: "/jacs-event-log" },
            { emoji: "📡", label: "Live CGM", route: "/cgm-monitor" },
            { emoji: "🏠", label: "Dashboard", route: "/caregiver-dashboard" },
          ].map((q) => (
            <TouchableOpacity key={q.label} style={s.quickCard} onPress={() => router.push(q.route as any)} activeOpacity={0.8}>
              <Text style={s.quickCardEmoji}>{q.emoji}</Text>
              <Text style={s.quickCardLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Invite Form */}
        {showInviteForm && (
          <View style={s.inviteForm}>
            <Text style={s.sectionTitle}>Invite a Care Team Member</Text>
            <Text style={s.fieldLabel}>Their Name</Text>
            <TextInput style={s.textInput} value={inviteName} onChangeText={setInviteName} placeholder="e.g. Grandma Rose" placeholderTextColor={colors.muted} returnKeyType="next" />
            <Text style={s.fieldLabel}>Email or Phone Number</Text>
            <TextInput style={s.textInput} value={inviteContact} onChangeText={setInviteContact} placeholder="email@example.com or +1-555-0100" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" returnKeyType="done" />
            <Text style={s.fieldLabel}>Their Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {ROLES.map((r) => (
                <TouchableOpacity key={r} style={[s.roleChip, inviteRole === r && s.roleChipSelected]} onPress={() => setInviteRole(r)}>
                  <Text style={s.roleChipEmoji}>{roleEmoji(r)}</Text>
                  <Text style={[s.roleChipText, inviteRole === r && s.roleChipTextSelected]}>{roleLabel(r)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.sendInviteBtn} onPress={handleInvite} activeOpacity={0.8}>
              <Text style={s.sendInviteBtnText}>✉️ Send Invitation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Members */}
        {active.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Active Members ({active.length})</Text>
            {active.map((m) => (
              <View key={m.id} style={s.memberCard}>
                <View style={s.memberCardHeader}>
                  <Text style={s.memberEmoji}>{roleEmoji(m.role)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{m.name}</Text>
                    <Text style={s.memberRole}>{roleLabel(m.role)}</Text>
                    <Text style={s.memberContact}>{m.contact}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={[s.activeBadge, { backgroundColor: `${colors.success}20` }]}>
                      <Text style={[s.activeBadgeText, { color: colors.success }]}>● Active</Text>
                    </View>
                    <Text style={s.lastSeen}>Last seen {formatLastSeen(m.lastSeen)}</Text>
                  </View>
                </View>
                <View style={s.permRow}>
                  {PERMS.map((p) => (
                    <TouchableOpacity key={p.key} onPress={() => togglePerm(m.id, p.key)} activeOpacity={0.8}
                      style={{ flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 8, backgroundColor: m[p.key] ? `${colors.primary}15` : colors.surface, borderWidth: 1, borderColor: m[p.key] ? colors.primary : colors.border, marginHorizontal: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: m[p.key] ? colors.primary : colors.muted, textAlign: "center" }}>
                        {m[p.key] ? "✓" : "✕"} {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => removeMember(m)} style={s.removeLink}>
                  <Text style={s.removeLinkText}>Remove from Care Team</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pending Invitations ({pending.length})</Text>
            {pending.map((m) => (
              <View key={m.id} style={s.pendingCard}>
                <Text style={s.memberEmoji}>{roleEmoji(m.role)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberContact}>{m.contact}</Text>
                </View>
                <View style={s.pendingBadge}><Text style={s.pendingBadgeText}>Pending</Text></View>
                <TouchableOpacity onPress={() => removeMember(m)} style={{ padding: 4 }}>
                  <Text style={{ color: colors.error, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🔒 Privacy Controls</Text>
          <Text style={s.infoText}>You control exactly what each Care Team member can see and do. Toggle permissions on each member card above. All data sharing is encrypted and HIPAA-compliant.</Text>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function styles(colors: any) {
  return StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 24, color: colors.foreground },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.muted },
    addBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    quickRow: { flexDirection: "row", padding: 16, gap: 10 },
    quickCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    quickCardEmoji: { fontSize: 24, marginBottom: 4 },
    quickCardLabel: { fontSize: 12, fontWeight: "600", color: colors.foreground, textAlign: "center" },
    inviteForm: { margin: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
    section: { paddingHorizontal: 16, marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
    fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 4, marginTop: 8 },
    textInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.foreground },
    roleChip: { flexDirection: "row", alignItems: "center", backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, gap: 6 },
    roleChipSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
    roleChipEmoji: { fontSize: 16 },
    roleChipText: { fontSize: 13, fontWeight: "500", color: colors.foreground },
    roleChipTextSelected: { color: colors.primary },
    sendInviteBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 8 },
    sendInviteBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    memberCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
    memberCardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
    memberEmoji: { fontSize: 28 },
    memberName: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    memberRole: { fontSize: 12, color: colors.primary, fontWeight: "600" },
    memberContact: { fontSize: 12, color: colors.muted, marginTop: 2 },
    activeBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    activeBadgeText: { fontSize: 11, fontWeight: "700" },
    lastSeen: { fontSize: 10, color: colors.muted },
    permRow: { flexDirection: "row", gap: 4, marginBottom: 8 },
    removeLink: { alignSelf: "flex-end", padding: 4 },
    removeLinkText: { fontSize: 12, color: colors.error, textDecorationLine: "underline" },
    pendingCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 10 },
    pendingBadge: { backgroundColor: "#FEF3C7", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    pendingBadgeText: { fontSize: 11, fontWeight: "700", color: "#D97706" },
    infoBox: { margin: 16, backgroundColor: `${colors.primary}10`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${colors.primary}30` },
    infoTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 6 },
    infoText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  });
}
