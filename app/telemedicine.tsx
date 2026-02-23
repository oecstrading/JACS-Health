import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Video, MessageSquare, Calendar, FileText, Plus } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function TelemedicineScreen() {
  const colors = useColors();

  const upcomingConsultations = [
    {
      id: "1",
      provider: "Dr. Sarah Johnson",
      specialty: "Endocrinologist",
      date: "2026-02-25",
      time: "10:00 AM",
      type: "video",
      reason: "Diabetes follow-up",
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Video size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Telemedicine</Text>
          </View>
          <Text className="text-base text-muted">Virtual consultations and messaging</Text>
        </View>

        <View className="px-6 pb-6">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Plus size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-sm">Schedule</Text>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <FileText size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-sm">Refill Rx</Text>
            </Pressable>
          </View>
        </View>

        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-4 flex-row items-center gap-3">
            <MessageSquare size={24} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-primary mb-1">1 New Message</Text>
              <Text className="text-sm text-muted">Dr. Sarah Johnson</Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Upcoming</Text>
          {upcomingConsultations.map((consult) => (
            <View key={consult.id} className="bg-surface border border-border rounded-xl p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {consult.provider}
                  </Text>
                  <Text className="text-sm text-muted mb-1">{consult.specialty}</Text>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color={colors.muted} />
                    <Text className="text-xs text-muted">
                      {consult.date} at {consult.time}
                    </Text>
                  </View>
                </View>
                <View className="bg-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-primary uppercase">{consult.type}</Text>
                </View>
              </View>
              <View className="pt-3 border-t border-border">
                <Text className="text-sm text-muted mb-2">Reason: {consult.reason}</Text>
                <Pressable
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-primary py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Video size={18} color="#ffffff" />
                  <Text className="text-white font-semibold">Join Video Call</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
