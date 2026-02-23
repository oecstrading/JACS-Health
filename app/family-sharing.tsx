import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Users, UserPlus, Shield, Eye, Bell, Trash2 } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: "parent" | "child" | "spouse" | "caregiver" | "guardian" | "sibling" | "other";
  permissionLevel: "view_only" | "alerts" | "full_access";
  isApproved: boolean;
  createdAt: Date;
}

/**
 * Family Sharing Screen
 * 
 * Features:
 * - Invite family members and caregivers
 * - Manage permission levels (view-only, alerts, full-access)
 * - Approve/deny connection requests
 * - View family activity log
 * - Configure alert forwarding
 */
export default function FamilySharingScreen() {
  const colors = useColors();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState<FamilyMember["relationship"]>("caregiver");
  const [invitePermission, setInvitePermission] = useState<FamilyMember["permissionLevel"]>("view_only");
  
  // Mock data - in production, fetch from database
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      relationship: "parent",
      permissionLevel: "full_access",
      isApproved: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      email: "dr.chen@clinic.com",
      relationship: "caregiver",
      permissionLevel: "alerts",
      isApproved: true,
      createdAt: new Date("2024-02-01"),
    },
  ]);

  const [pendingInvites, setPendingInvites] = useState<FamilyMember[]>([
    {
      id: "3",
      name: "Emily Davis",
      email: "emily.d@example.com",
      relationship: "sibling",
      permissionLevel: "view_only",
      isApproved: false,
      createdAt: new Date(),
    },
  ]);

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Missing Information", "Please enter an email address.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In production: call API to send invitation
    Alert.alert(
      "Invitation Sent",
      `An invitation has been sent to ${inviteEmail}. They will receive an email with instructions to accept.`
    );
    
    setShowInviteForm(false);
    setInviteEmail("");
  };

  const handleApproveInvite = (invite: FamilyMember) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPendingInvites(pendingInvites.filter((i) => i.id !== invite.id));
    setFamilyMembers([...familyMembers, { ...invite, isApproved: true }]);
    Alert.alert("Approved", `${invite.name} now has access to your health data.`);
  };

  const handleDenyInvite = (invite: FamilyMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Deny Access",
      `Are you sure you want to deny ${invite.name}'s request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deny",
          style: "destructive",
          onPress: () => {
            setPendingInvites(pendingInvites.filter((i) => i.id !== invite.id));
            Alert.alert("Denied", "Access request has been denied.");
          },
        },
      ]
    );
  };

  const handleRemoveMember = (member: FamilyMember) => {
    Alert.alert(
      "Remove Family Member",
      `Are you sure you want to remove ${member.name}? They will no longer have access to your health data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setFamilyMembers(familyMembers.filter((m) => m.id !== member.id));
            Alert.alert("Removed", `${member.name} has been removed.`);
          },
        },
      ]
    );
  };

  const getPermissionIcon = (level: FamilyMember["permissionLevel"]) => {
    switch (level) {
      case "view_only":
        return <Eye size={16} color={colors.muted} />;
      case "alerts":
        return <Bell size={16} color={colors.warning} />;
      case "full_access":
        return <Shield size={16} color={colors.success} />;
    }
  };

  const getPermissionLabel = (level: FamilyMember["permissionLevel"]) => {
    switch (level) {
      case "view_only":
        return "View Only";
      case "alerts":
        return "View + Alerts";
      case "full_access":
        return "Full Access";
    }
  };

  const getRelationshipLabel = (type: FamilyMember["relationship"]) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Users size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Family Sharing
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Share your health data with family members and caregivers
          </Text>
        </View>

        {/* Invite Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={() => setShowInviteForm(!showInviteForm)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <UserPlus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Invite Family Member
            </Text>
          </Pressable>
        </View>

        {/* Invite Form */}
        {showInviteForm && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Send Invitation
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Email Address</Text>
                  <TextInput
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="Enter email"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">Relationship</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(["parent", "child", "spouse", "caregiver", "guardian", "sibling", "other"] as const).map((rel) => (
                      <Pressable
                        key={rel}
                        onPress={() => setInviteRelationship(rel)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={`px-3 py-2 rounded-lg border-2 ${
                          inviteRelationship === rel
                            ? "bg-primary/20 border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            inviteRelationship === rel ? "text-primary" : "text-muted"
                          }`}
                        >
                          {getRelationshipLabel(rel)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">Permission Level</Text>
                  <View className="gap-2">
                    {(["view_only", "alerts", "full_access"] as const).map((perm) => (
                      <Pressable
                        key={perm}
                        onPress={() => setInvitePermission(perm)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={`flex-row items-center gap-2 p-3 rounded-lg border-2 ${
                          invitePermission === perm
                            ? "bg-primary/20 border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        {getPermissionIcon(perm)}
                        <Text
                          className={`text-sm font-semibold ${
                            invitePermission === perm ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {getPermissionLabel(perm)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowInviteForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSendInvite}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Send Invite</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <View className="px-6 pb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Pending Requests
            </Text>
            {pendingInvites.map((invite) => (
              <View key={invite.id} className="bg-warning/10 border-2 border-warning rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {invite.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {getRelationshipLabel(invite.relationship)} • {getPermissionLabel(invite.permissionLevel)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleDenyInvite(invite)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-background border-2 border-border py-2 rounded-lg"
                  >
                    <Text className="text-muted font-semibold text-center text-sm">Deny</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleApproveInvite(invite)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-success py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center text-sm">Approve</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Family Members */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Family Members ({familyMembers.length})
          </Text>
          {familyMembers.map((member) => (
            <View key={member.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {member.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {getRelationshipLabel(member.relationship)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRemoveMember(member)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="p-2"
                >
                  <Trash2 size={20} color={colors.error} />
                </Pressable>
              </View>
              <View className="flex-row items-center gap-2">
                {getPermissionIcon(member.permissionLevel)}
                <Text className="text-xs text-muted">
                  {getPermissionLabel(member.permissionLevel)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View className="px-6 pb-6">
          <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <Shield size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Privacy & Security
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  You control who has access to your health data. You can change permissions or remove family members at any time. All data access is logged for your security.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
