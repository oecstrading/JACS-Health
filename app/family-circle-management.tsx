import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const MAX_MEMBERS = 5;
const MEMBERS_KEY = "jacs_family_circle_members";
const INVITATIONS_KEY = "jacs_family_circle_invitations";

type MemberRole = "caregiver" | "family_member" | "patient";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  role: MemberRole;
  phone: string;
  joinedAt: string;
  isActive: boolean;
}

interface FamilyInvitation {
  id: string;
  inviteCode: string;
  recipientName: string;
  relationship: string;
  role: MemberRole;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export default function FamilyCircleManagementScreen() {
  const colors = useColors();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("caregiver");

  const loadData = useCallback(async () => {
    const [membersData, invitationsData] = await Promise.all([
      AsyncStorage.getItem(MEMBERS_KEY),
      AsyncStorage.getItem(INVITATIONS_KEY),
    ]);
    if (membersData) setMembers(JSON.parse(membersData));
    if (invitationsData) setInvitations(JSON.parse(invitationsData));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createInvitation = useCallback(async () => {
    if (!inviteName.trim() || !inviteRelationship.trim()) {
      Alert.alert("Missing Info", "Please enter the person's name and relationship.");
      return;
    }
    const activeMembers = members.filter((m) => m.isActive);
    const pendingInvites = invitations.filter((i) => i.status === "pending");
    if (activeMembers.length + pendingInvites.length >= MAX_MEMBERS) {
      Alert.alert(
        "Circle Full",
        `Your Family Circle can have a maximum of ${MAX_MEMBERS} members. Remove an existing member to add a new one.`,
      );
      return;
    }

    const newInvitation: FamilyInvitation = {
      id: `inv_${Date.now()}`,
      inviteCode: generateInviteCode(),
      recipientName: inviteName.trim(),
      relationship: inviteRelationship.trim(),
      role: inviteRole,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...invitations, newInvitation];
    setInvitations(updated);
    await AsyncStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));

    setInviteName("");
    setInviteRelationship("");
    setShowInviteForm(false);

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      "Invitation Created!",
      `Share this code with ${newInvitation.recipientName}:\n\n${newInvitation.inviteCode}\n\nThey can enter this code in their JACS app to join your Family Circle.`,
      [{ text: "OK" }],
    );
  }, [inviteName, inviteRelationship, inviteRole, members, invitations]);

  const removeMember = useCallback(
    async (memberId: string, memberName: string) => {
      Alert.alert(
        "Remove Member",
        `Remove ${memberName} from your Family Circle? They will no longer have access to your health data.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              const updated = members.map((m) =>
                m.id === memberId ? { ...m, isActive: false } : m,
              );
              setMembers(updated);
              await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(updated));
            },
          },
        ],
      );
    },
    [members],
  );

  const cancelInvitation = useCallback(
    async (invId: string) => {
      const updated = invitations.map((i) =>
        i.id === invId ? { ...i, status: "expired" as const } : i,
      );
      setInvitations(updated);
      await AsyncStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
    },
    [invitations],
  );

  const activeMembers = members.filter((m) => m.isActive);
  const pendingInvites = invitations.filter((i) => i.status === "pending");
  const totalSlots = activeMembers.length + pendingInvites.length;
  const slotsRemaining = MAX_MEMBERS - totalSlots;

  const roleColors: Record<MemberRole, string> = {
    caregiver: colors.primary,
    family_member: colors.success,
    patient: colors.warning,
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Family Circle</Text>
          <View style={[styles.slotsBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.slotsText, { color: colors.muted }]}>
              {totalSlots}/{MAX_MEMBERS}
            </Text>
          </View>
        </View>

        {/* Capacity bar */}
        <View style={[styles.capacityBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.capacityLabel, { color: colors.foreground }]}>
            Circle Capacity: {totalSlots} of {MAX_MEMBERS} slots used
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(totalSlots / MAX_MEMBERS) * 100}%`,
                  backgroundColor: totalSlots >= MAX_MEMBERS ? colors.error : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.slotsRemaining, { color: slotsRemaining > 0 ? colors.success : colors.error }]}>
            {slotsRemaining > 0 ? `${slotsRemaining} slot${slotsRemaining > 1 ? "s" : ""} available` : "Circle is full"}
          </Text>
        </View>

        {/* Active Members */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Members ({activeMembers.length})</Text>
        {activeMembers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No members yet. Invite family or caregivers below.</Text>
          </View>
        ) : (
          activeMembers.map((member) => (
            <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: roleColors[member.role] + "20" }]}>
                <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.foreground }]}>{member.name}</Text>
                <Text style={[styles.memberRelationship, { color: colors.muted }]}>{member.relationship}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleColors[member.role] + "20" }]}>
                  <Text style={[styles.roleText, { color: roleColors[member.role] }]}>{member.role.replace("_", " ")}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeMember(member.id, member.name)}
                style={[styles.removeBtn, { borderColor: colors.error }]}
              >
                <Text style={[styles.removeBtnText, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Invitations ({pendingInvites.length})</Text>
            {pendingInvites.map((inv) => (
              <View key={inv.id} style={[styles.inviteCard, { backgroundColor: colors.warning + "10", borderColor: colors.warning }]}>
                <View style={styles.inviteInfo}>
                  <Text style={[styles.memberName, { color: colors.foreground }]}>{inv.recipientName}</Text>
                  <Text style={[styles.memberRelationship, { color: colors.muted }]}>{inv.relationship}</Text>
                  <View style={[styles.codeBox, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.codeLabel, { color: colors.muted }]}>Invite Code: </Text>
                    <Text style={[styles.codeValue, { color: colors.primary }]}>{inv.inviteCode}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => cancelInvitation(inv.id)}>
                  <Text style={[styles.cancelText, { color: colors.error }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Invite Form */}
        {showInviteForm ? (
          <View style={[styles.inviteForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Invitation</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Full Name"
              placeholderTextColor={colors.muted}
              value={inviteName}
              onChangeText={setInviteName}
            />
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Relationship (e.g. Daughter, Doctor)"
              placeholderTextColor={colors.muted}
              value={inviteRelationship}
              onChangeText={setInviteRelationship}
            />
            <Text style={[styles.roleLabel, { color: colors.muted }]}>Role:</Text>
            <View style={styles.roleRow}>
              {(["caregiver", "family_member"] as MemberRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor: inviteRole === r ? colors.primary : colors.background,
                      borderColor: inviteRole === r ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setInviteRole(r)}
                >
                  <Text style={[styles.roleOptionText, { color: inviteRole === r ? "#fff" : colors.foreground }]}>
                    {r.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelFormBtn, { borderColor: colors.border }]}
                onPress={() => setShowInviteForm(false)}
              >
                <Text style={[styles.cancelFormText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={createInvitation}
              >
                <Text style={styles.createBtnText}>Create Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor: slotsRemaining > 0 ? colors.primary : colors.border,
                opacity: slotsRemaining > 0 ? 1 : 0.5,
              },
            ]}
            onPress={() => slotsRemaining > 0 && setShowInviteForm(true)}
            disabled={slotsRemaining === 0}
          >
            <Text style={styles.addBtnText}>+ Invite Family Member or Caregiver</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>About Family Circle</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Family Circle allows up to 5 trusted people to view your health data and receive alerts. Caregivers can see all vitals and medication logs. Family members receive emergency notifications only.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  slotsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  slotsText: { fontSize: 13, fontWeight: "600" },
  capacityBar: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  capacityLabel: { fontSize: 14, fontWeight: "600" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  slotsRemaining: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  emptyCard: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  memberCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "700" },
  memberInfo: { flex: 1, gap: 4 },
  memberName: { fontSize: 16, fontWeight: "700" },
  memberRelationship: { fontSize: 13 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  removeBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  removeBtnText: { fontSize: 13, fontWeight: "600" },
  inviteCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  inviteInfo: { flex: 1, gap: 4 },
  codeBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeLabel: { fontSize: 12 },
  codeValue: { fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  cancelText: { fontSize: 14, fontWeight: "600" },
  inviteForm: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 10 },
  formTitle: { fontSize: 17, fontWeight: "700" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  roleLabel: { fontSize: 14, fontWeight: "600" },
  roleRow: { flexDirection: "row", gap: 8 },
  roleOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  roleOptionText: { fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelFormBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelFormText: { fontSize: 15, fontWeight: "600" },
  createBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  infoBox: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  infoTitle: { fontSize: 14, fontWeight: "700" },
  infoText: { fontSize: 13, lineHeight: 20 },
});
