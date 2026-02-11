import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Module IV: Provider & Compliance (Care Team Tab)
 * 
 * Healthcare provider coordination and regulatory compliance dashboard.
 * Features organized into three sub-menus:
 * 1. Provider Coordination (Appointments, Doctor Communication, Telehealth)
 * 2. Compliance (Medicare Compliance, Hospice Portal)
 * 3. Medical Records (Medical Records, Imaging Analysis)
 */
export default function ProviderCompliance() {
  const router = useRouter();
  const colors = useColors();

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Care Team
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Connect with your healthcare providers
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Provider Coordination Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Provider Coordination
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/appointments')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="calendar.badge.clock" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Appointments</Text>
                <Text className="text-sm text-muted">Schedule and manage visits</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/communication-log')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Doctor Communication</Text>
                <Text className="text-sm text-muted">Message your care team</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/telehealth')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="video.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Telehealth</Text>
                <Text className="text-sm text-muted">Virtual doctor visits</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/specialist-booking')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="person.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Book Specialist</Text>
                <Text className="text-sm text-muted">Find and schedule specialists</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Compliance Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Compliance
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/medicare-compliance')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark.shield.fill" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Medicare Compliance</Text>
                <Text className="text-sm text-muted">Track required screenings</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/hospices')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="cross.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Hospice Portal</Text>
                <Text className="text-sm text-muted">End-of-life care coordination</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/hospice-revenue-command')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-success/20"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name={"shield.checkmark.fill" as any} size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Revenue Command</Text>
                <Text className="text-sm text-muted">APU tracking & compliance dashboard</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Medical Records Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Medical Records
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/medical-records')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Medical Records</Text>
                <Text className="text-sm text-muted">Upload and view documents</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/imaging-analysis')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="sparkles" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Imaging Analysis</Text>
                <Text className="text-sm text-muted">AI-powered radiology reports</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
