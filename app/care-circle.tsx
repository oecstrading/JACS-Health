import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type CaregiverRole = "primary" | "secondary" | "viewer";

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: CaregiverRole;
  avatar: string;
  lastActive: Date;
}

interface CareTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  claimedBy: string | null;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "open" | "claimed" | "completed";
  category: "medication" | "appointment" | "errand" | "checkup";
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "appointment" | "medication" | "checkup";
  notes: string;
  syncedFromAI: boolean;
}

export default function CareCircleScreen() {
  const colors = useColors();
  
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: "1",
      name: "Sarah (You)",
      email: "sarah@example.com",
      phone: "(555) 123-4567",
      role: "primary",
      avatar: "👩",
      lastActive: new Date(),
    },
    {
      id: "2",
      name: "Michael",
      email: "michael@example.com",
      phone: "(555) 234-5678",
      role: "secondary",
      avatar: "👨",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Lisa",
      email: "lisa@example.com",
      phone: "(555) 345-6789",
      role: "viewer",
      avatar: "👩‍⚕️",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  const [tasks, setTasks] = useState<CareTask[]>([
    {
      id: "1",
      title: "Refill hypertension medication",
      description: "Pick up prescription from CVS Pharmacy",
      assignedTo: null,
      claimedBy: null,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "open",
      category: "medication",
    },
    {
      id: "2",
      title: "Take Mom to cardiology appointment",
      description: "Dr. Johnson at 2:30 PM",
      assignedTo: null,
      claimedBy: "2",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "claimed",
      category: "appointment",
    },
    {
      id: "3",
      title: "Weekly grocery shopping",
      description: "Get items from Mom's list",
      assignedTo: null,
      claimedBy: null,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "medium",
      status: "open",
      category: "errand",
    },
  ]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Cardiology Appointment",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: "appointment",
      notes: "Dr. Johnson - Follow-up on blood pressure",
      syncedFromAI: true,
    },
    {
      id: "2",
      title: "Blood Pressure Medication",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: "medication",
      notes: "Refill needed",
      syncedFromAI: true,
    },
  ]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [selectedTab, setSelectedTab] = useState<"team" | "tasks" | "calendar" | "messages">("team");

  function handleClaimTask(taskId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, claimedBy: "1", status: "claimed" }
          : task
      )
    );
    Alert.alert("✓ Task Claimed", "You've claimed this task");
  }

  function handleCompleteTask(taskId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
    Alert.alert("🎉 Task Completed", "Great work!");
  }

  function handleInviteCaregiver() {
    if (!newInviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "✓ Invitation Sent",
      `An invitation has been sent to ${newInviteEmail}`,
      [{ text: "OK", onPress: () => {
        setShowInviteForm(false);
        setNewInviteEmail("");
      }}]
    );
  }

  function getPriorityColor(priority: string): string {
    if (priority === "high") return colors.error;
    if (priority === "medium") return "#F59E0B";
    return colors.success;
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case "medication": return "💊";
      case "appointment": return "🏥";
      case "errand": return "🛒";
      case "checkup": return "❤️";
      default: return "📋";
    }
  }

  function formatDate(date: Date): string {
    const days = Math.floor((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString();
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Care Circle</Text>
          <View className="w-12" />
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-surface rounded-xl p-2 mb-6">
          {(["team", "tasks", "calendar", "messages"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab(tab);
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flex: 1 })}
              className={`py-3 rounded-lg items-center ${selectedTab === tab ? "bg-primary" : ""}`}
            >
              <Text className={`text-base font-bold ${selectedTab === tab ? "text-white" : "text-muted"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Care Team Tab */}
        {selectedTab === "team" && (
          <View className="gap-6">
            {/* Team Members */}
            <View className="bg-surface p-6 rounded-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">Team Members</Text>
                <Pressable
                  onPress={() => setShowInviteForm(true)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-lg text-primary">+ Invite</Text>
                </Pressable>
              </View>

              <View className="gap-4">
                {caregivers.map((caregiver) => (
                  <View key={caregiver.id} className="flex-row items-center gap-4 p-4 bg-background rounded-xl">
                    <Text className="text-4xl">{caregiver.avatar}</Text>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-lg font-bold text-foreground">{caregiver.name}</Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: caregiver.role === "primary" ? colors.primary + "20" : colors.muted + "20" }}
                        >
                          <Text className="text-xs font-bold" style={{ color: caregiver.role === "primary" ? colors.primary : colors.muted }}>
                            {caregiver.role.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-muted">{caregiver.email}</Text>
                      <Text className="text-sm text-muted">{caregiver.phone}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Invite Form */}
            {showInviteForm && (
              <View className="bg-primary/10 border-2 border-primary p-6 rounded-2xl">
                <Text className="text-xl font-bold text-foreground mb-4">Invite Caregiver</Text>
                <TextInput
                  className="bg-white border-2 border-border p-4 rounded-xl text-base text-foreground mb-4"
                  placeholder="Enter email address"
                  value={newInviteEmail}
                  onChangeText={setNewInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleInviteCaregiver}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, flex: 1 })}
                    className="bg-primary py-3 rounded-xl items-center"
                  >
                    <Text className="text-white text-base font-bold">Send Invitation</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowInviteForm(false);
                      setNewInviteEmail("");
                    }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, flex: 1 })}
                    className="bg-surface border border-border py-3 rounded-xl items-center"
                  >
                    <Text className="text-foreground text-base font-bold">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tasks Tab */}
        {selectedTab === "tasks" && (
          <View className="gap-6">
            {/* Help Wanted List */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">🙋 Help Wanted</Text>
              <View className="gap-4">
                {tasks.filter((t) => t.status !== "completed").map((task) => (
                  <View key={task.id} className="p-4 bg-background rounded-xl border-2" style={{ borderColor: getPriorityColor(task.priority) }}>
                    <View className="flex-row items-start gap-3 mb-3">
                      <Text className="text-3xl">{getCategoryIcon(task.category)}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground mb-1">{task.title}</Text>
                        <Text className="text-sm text-muted mb-2">{task.description}</Text>
                        <View className="flex-row items-center gap-3">
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: getPriorityColor(task.priority) + "20" }}
                          >
                            <Text className="text-xs font-bold" style={{ color: getPriorityColor(task.priority) }}>
                              {task.priority.toUpperCase()}
                            </Text>
                          </View>
                          <Text className="text-sm text-muted">{formatDate(task.dueDate)}</Text>
                        </View>
                      </View>
                    </View>

                    {task.status === "open" && (
                      <Pressable
                        onPress={() => handleClaimTask(task.id)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        className="bg-primary py-3 rounded-xl items-center"
                      >
                        <Text className="text-white text-base font-bold">✋ I'll Do This</Text>
                      </Pressable>
                    )}

                    {task.status === "claimed" && (
                      <View>
                        <View className="flex-row items-center gap-2 mb-3">
                          <Text className="text-sm text-muted">Claimed by:</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {caregivers.find((c) => c.id === task.claimedBy)?.name || "Unknown"}
                          </Text>
                        </View>
                        {task.claimedBy === "1" && (
                          <Pressable
                            onPress={() => handleCompleteTask(task.id)}
                            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                            className="bg-success py-3 rounded-xl items-center"
                          >
                            <Text className="text-white text-base font-bold">✓ Mark Complete</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Add Task Button */}
            <Pressable
              onPress={() => Alert.alert("Add Task", "Task creation coming soon")}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">+ Add New Task</Text>
            </Pressable>
          </View>
        )}

        {/* Calendar Tab */}
        {selectedTab === "calendar" && (
          <View className="gap-6">
            {/* Shared Medical Calendar */}
            <View className="bg-surface p-6 rounded-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">📅 Shared Calendar</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-primary" />
                  <Text className="text-sm text-muted">Synced with AI Coach</Text>
                </View>
              </View>

              <View className="gap-4">
                {calendarEvents.map((event) => (
                  <View key={event.id} className="p-4 bg-background rounded-xl">
                    <View className="flex-row items-start gap-3">
                      <Text className="text-3xl">
                        {event.type === "appointment" ? "🏥" : event.type === "medication" ? "💊" : "❤️"}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground mb-1">{event.title}</Text>
                        <Text className="text-base text-primary font-semibold mb-2">
                          {formatDate(event.date)}
                        </Text>
                        <Text className="text-sm text-muted mb-2">{event.notes}</Text>
                        {event.syncedFromAI && (
                          <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-primary" />
                            <Text className="text-xs text-muted">Auto-synced from AI Appointment Coach</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Messages Tab */}
        {selectedTab === "messages" && (
          <View className="gap-6">
            {/* Secure Care Team Messaging */}
            <View className="bg-surface p-6 rounded-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">💬 Care Team Chat</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-success" />
                  <Text className="text-sm text-muted">Encrypted</Text>
                </View>
              </View>

              {/* Mock Messages */}
              <View className="gap-4 mb-4">
                <View className="p-4 bg-background rounded-xl">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-2xl">👨</Text>
                    <Text className="text-sm font-bold text-foreground">Michael</Text>
                    <Text className="text-xs text-muted">2h ago</Text>
                  </View>
                  <Text className="text-base text-foreground">
                    I'll take Mom to her cardiology appointment on Tuesday. Should I ask about adjusting her BP meds?
                  </Text>
                </View>

                <View className="p-4 bg-primary/10 rounded-xl">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-2xl">👩</Text>
                    <Text className="text-sm font-bold text-foreground">You</Text>
                    <Text className="text-xs text-muted">1h ago</Text>
                  </View>
                  <Text className="text-base text-foreground">
                    Yes! Her BP has been elevated this week. I'll send you the report from the BP Dashboard.
                  </Text>
                </View>
              </View>

              {/* Message Input */}
              <TextInput
                className="bg-white border-2 border-border p-4 rounded-xl text-base text-foreground"
                placeholder="Type a message to the care team..."
                multiline
              />
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
