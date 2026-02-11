import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Hospices Tab - Main Dashboard
 * 
 * Provides comprehensive hospice care coordination tools focusing on:
 * - Hospice Quality Reporting Program (HQRP) compliance
 * - HOPE/HIS assessment validation
 * - CAHPS Hospice Survey data collection
 * - Medicare Cost Reporting
 * - Clinical gap alerts
 */
export default function HospicesScreen() {
  const colors = useColors();

  // Mock data for dashboard overview
  const stats = {
    activePatients: 24,
    pendingAssessments: 3,
    complianceAlerts: 2,
    visitGaps: 1,
  };

  const quickActions = [
    {
      title: "Revenue Command",
      description: "APU tracking & compliance dashboard",
      icon: "shield.checkmark.fill" as const,
      route: "/hospice-revenue-command",
      color: "#10B981", // Green
    },
    {
      title: "Patient List",
      description: "View all active hospice patients",
      icon: "person.2.fill" as const,
      route: "/hospice-patient-list",
      color: colors.primary,
    },
    {
      title: "Compliance Tracker",
      description: "Monitor HQRP submission deadlines",
      icon: "checkmark.circle.fill" as const,
      route: "/hospice-compliance-tracker",
      color: "#10B981", // Green
    },
    {
      title: "HOPE/HIS Assessments",
      description: "Complete admission & discharge forms",
      icon: "doc.text.fill" as const,
      route: "/hospice-hope-his-form",
      color: "#3B82F6", // Blue
    },
    {
      title: "Visit Log",
      description: "Track skilled nursing visits",
      icon: "calendar.badge.clock" as const,
      route: "/hospice-visit-log",
      color: "#8B5CF6", // Purple
    },
    {
      title: "CAHPS Export",
      description: "Generate monthly survey data",
      icon: "envelope.fill" as const,
      route: "/hospice-cahps-export",
      color: "#F59E0B", // Amber
    },
    {
      title: "Cost Report",
      description: "Medicare cost reporting tools",
      icon: "dollarsign.circle.fill" as const,
      route: "/hospice-cost-report",
      color: "#EF4444", // Red
    },
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${colors.primary}20`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="cross.fill" size={28} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  Hospice Care
                </Text>
                <Text className="text-base" style={{ color: colors.muted }}>
                  Compliance & Quality Reporting
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Overview */}
          <View className="gap-3">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.foreground }}
            >
              Overview
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View
                className="flex-1 min-w-[45%] p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text
                  className="text-3xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {stats.activePatients}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Active Patients
                </Text>
              </View>

              <View
                className="flex-1 min-w-[45%] p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
                  {stats.pendingAssessments}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Pending Assessments
                </Text>
              </View>

              <View
                className="flex-1 min-w-[45%] p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl font-bold" style={{ color: "#EF4444" }}>
                  {stats.complianceAlerts}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Compliance Alerts
                </Text>
              </View>

              <View
                className="flex-1 min-w-[45%] p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl font-bold" style={{ color: "#EF4444" }}>
                  {stats.visitGaps}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Visit Gaps (7+ days)
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.foreground }}
            >
              Quick Actions
            </Text>
            <View className="gap-3">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    router.push(action.route as any);
                  }}
                  className="p-4 rounded-2xl flex-row items-center gap-4"
                  style={{ backgroundColor: colors.surface }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: `${action.color}20`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: colors.foreground }}
                    >
                      {action.title}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                      {action.description}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Regulatory Information */}
          <View
            className="p-4 rounded-2xl gap-3"
            style={{ backgroundColor: `${colors.primary}10` }}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text
                className="text-base font-semibold"
                style={{ color: colors.primary }}
              >
                HQRP Compliance Requirements
              </Text>
            </View>
            <Text className="text-sm leading-6" style={{ color: colors.foreground }}>
              • <Text className="font-semibold">HIS/HOPE:</Text> 90% of records submitted within 30 days{"\n"}
              • <Text className="font-semibold">CAHPS Survey:</Text> Monthly data collection required{"\n"}
              • <Text className="font-semibold">Cost Report:</Text> Annual submission 5 months post-fiscal year{"\n"}
              • <Text className="font-semibold">Penalty:</Text> 4% reduction in APU for non-compliance
            </Text>
          </View>

          {/* Coming Soon Features */}
          <View className="gap-3 mb-6">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.foreground }}
            >
              Coming Soon
            </Text>
            <View
              className="p-4 rounded-2xl gap-2"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-sm" style={{ color: colors.muted }}>
                • Clinical gap alerts with automatic visit scheduling{"\n"}
                • Real-time HOPE/HIS validation with error highlighting{"\n"}
                • Automated CAHPS eligibility filtering{"\n"}
                • Cost report smart-folder with CMS worksheet categorization{"\n"}
                • iQIES system integration for direct submission{"\n"}
                • Multi-agency dashboard for enterprise users
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
