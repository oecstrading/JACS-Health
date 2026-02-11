import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const MOCK_EXPENSES = [
  { category: "Nursing Services", routine: 125000, continuous: 45000, respite: 12000, inpatient: 68000, total: 250000 },
  { category: "Medical Supplies", routine: 35000, continuous: 15000, respite: 4000, inpatient: 21000, total: 75000 },
  { category: "Medications", routine: 42000, continuous: 18000, respite: 5000, inpatient: 25000, total: 90000 },
  { category: "Social Services", routine: 28000, continuous: 8000, respite: 3000, inpatient: 11000, total: 50000 },
  { category: "Chaplain Services", routine: 15000, continuous: 4000, respite: 2000, inpatient: 4000, total: 25000 },
  { category: "Bereavement", routine: 12000, continuous: 0, respite: 0, inpatient: 0, total: 12000 },
  { category: "Administrative", routine: 45000, continuous: 15000, respite: 5000, inpatient: 20000, total: 85000 },
];

export default function HospiceCostReportScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "previous" | "ytd">("current");

  const totalExpenses = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.total, 0);
  const routineTotal = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.routine, 0);
  const continuousTotal = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.continuous, 0);
  const respiteTotal = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.respite, 0);
  const inpatientTotal = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.inpatient, 0);

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getPercentage = (amount: number) => {
    return ((amount / totalExpenses) * 100).toFixed(1);
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <BackButton />
        <View className="flex-1 ml-3">
          <Text className="text-2xl font-bold text-foreground">Cost Report</Text>
          <Text className="text-sm text-muted mt-1">Medicare Cost Report Dashboard</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Period Selector */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-2">Reporting Period</Text>
          <View className="flex-row gap-2">
            {[
              { value: "current" as const, label: "Current Month" },
              { value: "previous" as const, label: "Previous Month" },
              { value: "ytd" as const, label: "Year to Date" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedPeriod(option.value)}
                style={{
                  backgroundColor: selectedPeriod === option.value ? colors.primary : colors.surface,
                  opacity: selectedPeriod === option.value ? 1 : 0.7,
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-border"
              >
                <Text
                  style={{
                    color: selectedPeriod === option.value ? "#FFFFFF" : colors.foreground,
                  }}
                  className="text-sm font-medium text-center"
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Expenses Card */}
        <View className="px-4 pt-4">
          <View className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6" style={{ backgroundColor: colors.primary }}>
            <Text className="text-white text-sm font-semibold mb-2">Total Expenses</Text>
            <Text className="text-white text-4xl font-bold">${(totalExpenses / 1000).toFixed(0)}K</Text>
            <Text className="text-white/80 text-sm mt-2">February 2026</Text>
          </View>
        </View>

        {/* Level of Care Breakdown */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-muted mb-3">Expenses by Level of Care</Text>
          <View className="gap-3">
            {[
              { label: "Routine Home Care", amount: routineTotal, color: "#3B82F6" },
              { label: "Continuous Home Care", amount: continuousTotal, color: "#8B5CF6" },
              { label: "Respite Care", amount: respiteTotal, color: "#10B981" },
              { label: "Inpatient Care", amount: inpatientTotal, color: "#F59E0B" },
            ].map((item) => (
              <View key={item.label} className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-foreground">{item.label}</Text>
                  <Text className="text-lg font-bold text-foreground">{formatCurrency(item.amount)}</Text>
                </View>
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View
                    style={{ width: `${getPercentage(item.amount)}%` as any, backgroundColor: item.color }}
                    className="h-full"
                  />
                </View>
                <Text className="text-xs text-muted mt-1">{getPercentage(item.amount)}% of total</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expense Categories */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">Expense Categories</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            {/* Table Header */}
            <View className="flex-row bg-muted/10 p-3 border-b border-border">
              <Text className="flex-1 text-xs font-bold text-muted">Category</Text>
              <Text className="w-20 text-xs font-bold text-muted text-right">Amount</Text>
              <Text className="w-16 text-xs font-bold text-muted text-right">%</Text>
            </View>

            {/* Table Rows */}
            {MOCK_EXPENSES.map((expense, index) => (
              <View
                key={expense.category}
                className={`flex-row p-3 ${index < MOCK_EXPENSES.length - 1 ? "border-b border-border" : ""}`}
              >
                <Text className="flex-1 text-sm text-foreground">{expense.category}</Text>
                <Text className="w-20 text-sm font-semibold text-foreground text-right">
                  {formatCurrency(expense.total)}
                </Text>
                <Text className="w-16 text-sm text-muted text-right">
                  {getPercentage(expense.total)}%
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View className="flex-row bg-primary/10 p-3 border-t-2 border-primary">
              <Text className="flex-1 text-sm font-bold text-foreground">TOTAL</Text>
              <Text className="w-20 text-sm font-bold text-foreground text-right">
                {formatCurrency(totalExpenses)}
              </Text>
              <Text className="w-16 text-sm font-bold text-foreground text-right">100%</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={() => alert("Exporting Cost Report to CMS Worksheet format...")}
            style={{ backgroundColor: colors.primary }}
            className="py-4 rounded-xl items-center flex-row justify-center"
          >
            <IconSymbol name="arrow.down.doc.fill" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">Export to CMS Worksheet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
