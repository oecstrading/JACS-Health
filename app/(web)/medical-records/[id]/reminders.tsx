import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface TestReminder {
  id: string;
  testName: string;
  dueDate: string;
  frequency: string;
  lastCompleted?: string;
  status: "upcoming" | "overdue" | "completed";
  priority: "high" | "medium" | "low";
  notes?: string;
  physician?: string;
}

// Sample reminders based on Janice's medical needs
const SAMPLE_REMINDERS: TestReminder[] = [
  {
    id: "1",
    testName: "Iron Studies Panel",
    dueDate: "2026-03-15",
    frequency: "Every 3 months",
    lastCompleted: "2026-01-20",
    status: "upcoming",
    priority: "high",
    notes: "Monitor anemia treatment effectiveness. Check ferritin, iron, TIBC.",
    physician: "Dr. Smith (Hematology)",
  },
  {
    id: "2",
    testName: "Lipid Panel",
    dueDate: "2026-02-25",
    frequency: "Every 6 months",
    lastCompleted: "2025-06-03",
    status: "overdue",
    priority: "high",
    notes: "Monitor statin therapy effectiveness. Target LDL <100 mg/dL.",
    physician: "Dr. Johnson (Cardiology)",
  },
  {
    id: "3",
    testName: "HbA1c (Diabetes Screening)",
    dueDate: "2026-04-01",
    frequency: "Every 6 months",
    lastCompleted: "2026-02-04",
    status: "upcoming",
    priority: "medium",
    notes: "Monitor prediabetes. Continue metformin and lifestyle modifications.",
    physician: "Dr. Williams (Endocrinology)",
  },
  {
    id: "4",
    testName: "Anti-CCP Antibody Test",
    dueDate: "2026-03-01",
    frequency: "One-time",
    status: "upcoming",
    priority: "high",
    notes: "Rule out rheumatoid arthritis. Elevated RF (52) requires follow-up.",
    physician: "Dr. Brown (Rheumatology)",
  },
  {
    id: "5",
    testName: "Complete Blood Count (CBC)",
    dueDate: "2026-04-20",
    frequency: "Every 3 months",
    lastCompleted: "2026-01-20",
    status: "upcoming",
    priority: "medium",
    notes: "Monitor hemoglobin, neutrophils, and overall blood health.",
  },
  {
    id: "6",
    testName: "Comprehensive Metabolic Panel",
    dueDate: "2026-05-15",
    frequency: "Every 6 months",
    lastCompleted: "2025-06-03",
    status: "upcoming",
    priority: "low",
    notes: "Monitor kidney function (eGFR), liver enzymes, electrolytes.",
  },
  {
    id: "7",
    testName: "DEXA Bone Density Scan",
    dueDate: "2027-10-01",
    frequency: "Every 2 years",
    lastCompleted: "2024-10-24",
    status: "upcoming",
    priority: "low",
    notes: "Monitor osteopenia progression. Continue calcium + Vitamin D.",
    physician: "Dr. Davis (Orthopedics)",
  },
];

export default function RemindersPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [reminders, setReminders] = useState<TestReminder[]>(SAMPLE_REMINDERS);
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "overdue">("all");

  const filteredReminders = reminders
    .filter((reminder) => {
      if (filterStatus === "all") return true;
      return reminder.status === filterStatus;
    })
    .sort((a, b) => {
      // Sort by priority (high first), then by due date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const upcomingCount = reminders.filter((r) => r.status === "upcoming").length;
  const overdueCount = reminders.filter((r) => r.status === "overdue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "#F44336";
      case "upcoming":
        return "#FF9800";
      case "completed":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderReminder = ({ item }: { item: TestReminder }) => {
    const daysUntil = getDaysUntilDue(item.dueDate);
    const isOverdue = daysUntil < 0;

    return (
      <View className="bg-white border border-border rounded-xl p-5 mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground mb-1">
              {item.testName}
            </Text>
            <Text className="text-sm text-muted">{item.frequency}</Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: getPriorityColor(item.priority) + "20" }}
          >
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: getPriorityColor(item.priority) }}
            >
              {item.priority}
            </Text>
          </View>
        </View>

        {/* Due Date */}
        <View
          className="rounded-lg p-3 mb-3"
          style={{ backgroundColor: getStatusColor(item.status) + "10" }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted mb-1">Due Date</Text>
              <Text
                className="text-base font-bold"
                style={{ color: getStatusColor(item.status) }}
              >
                {new Date(item.dueDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-xl font-bold"
                style={{ color: getStatusColor(item.status) }}
              >
                {isOverdue ? `${Math.abs(daysUntil)} days` : `${daysUntil} days`}
              </Text>
              <Text className="text-xs text-muted">
                {isOverdue ? "overdue" : "remaining"}
              </Text>
            </View>
          </View>
        </View>

        {/* Last Completed */}
        {item.lastCompleted && (
          <View className="flex-row items-center mb-2">
            <Text className="text-xs text-muted">Last completed: </Text>
            <Text className="text-xs text-foreground font-semibold">
              {new Date(item.lastCompleted).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Physician */}
        {item.physician && (
          <View className="flex-row items-center mb-3">
            <Text className="text-xs text-muted">Physician: </Text>
            <Text className="text-xs text-foreground font-semibold">
              {item.physician}
            </Text>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <View className="bg-surface/50 rounded-lg p-3 mb-3">
            <Text className="text-xs font-semibold text-foreground mb-1">
              📝 Notes
            </Text>
            <Text className="text-xs text-muted">{item.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row pt-3 border-t border-border">
          <Pressable
            className="flex-1 bg-success py-3 rounded-lg mr-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="text-white font-semibold text-center text-sm">
              ✓ Mark Completed
            </Text>
          </Pressable>
          
          <Pressable
            className="flex-1 bg-primary py-3 rounded-lg ml-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="text-white font-semibold text-center text-sm">
              📅 Reschedule
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Test Reminders
          </Text>
          <Text className="text-base text-white/90">
            {upcomingCount} upcoming • {overdueCount} overdue
          </Text>
        </View>

        {/* Alert Banner */}
        {overdueCount > 0 && (
          <View className="bg-error/10 border-l-4 border-error p-4">
            <Text className="text-error font-bold mb-1">
              ⚠️ {overdueCount} Overdue Test{overdueCount > 1 ? "s" : ""}
            </Text>
            <Text className="text-sm text-error/80">
              Please schedule these tests as soon as possible
            </Text>
          </View>
        )}

        {/* Filter Tabs */}
        <View className="bg-surface/50 border-b border-border p-4">
          <View className="flex-row">
            {(["all", "upcoming", "overdue"] as const).map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setFilterStatus(filter)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  filterStatus === filter
                    ? "bg-primary"
                    : "bg-white border border-border"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-sm font-semibold capitalize ${
                    filterStatus === filter ? "text-white" : "text-foreground"
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Reminders List */}
        <FlatList
          data={filteredReminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Pressable
              className="bg-success/10 border-2 border-dashed border-success rounded-xl p-5 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-success font-bold text-center text-base">
                + Add New Reminder
              </Text>
            </Pressable>
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-muted text-center">
                No reminders found
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}
