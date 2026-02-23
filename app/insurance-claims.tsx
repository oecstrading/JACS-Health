import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { FileText, Camera, DollarSign, CheckCircle, Clock, XCircle, Plus } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

export default function InsuranceClaimsScreen() {
  const colors = useColors();

  const claims = [
    {
      id: "1",
      claimNumber: "CLM-2026-0123",
      provider: "City Medical Center",
      serviceDate: "2026-02-15",
      claimedAmount: 1250.00,
      approvedAmount: 1100.00,
      paidAmount: 880.00,
      outOfPocket: 220.00,
      status: "paid",
      insuranceProvider: "Blue Cross Blue Shield",
    },
    {
      id: "2",
      claimNumber: "CLM-2026-0089",
      provider: "Dr. Sarah Johnson",
      serviceDate: "2026-01-28",
      claimedAmount: 350.00,
      approvedAmount: 0,
      paidAmount: 0,
      outOfPocket: 0,
      status: "pending",
      insuranceProvider: "Blue Cross Blue Shield",
    },
  ];

  const totalOutOfPocket = claims.reduce((sum, claim) => sum + claim.outOfPocket, 0);

  const handleSubmitClaim = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert("Claim Submitted", "Your insurance claim has been submitted for processing.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return colors.success;
      case "approved": return colors.success;
      case "pending": return colors.warning;
      case "denied": return colors.error;
      default: return colors.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "denied": return XCircle;
      default: return FileText;
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <FileText size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Insurance Claims</Text>
          </View>
          <Text className="text-base text-muted">Track claims and reimbursements</Text>
        </View>

        {/* Submit New Claim Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={handleSubmitClaim}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Camera size={20} color="#ffffff" />
            <Text className="text-white font-semibold">Submit New Claim</Text>
          </Pressable>
        </View>

        {/* Out-of-Pocket Summary */}
        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
            <View className="flex-row items-center gap-2 mb-2">
              <DollarSign size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-primary">YEAR-TO-DATE</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground mb-1">
              ${totalOutOfPocket.toFixed(2)}
            </Text>
            <Text className="text-sm text-muted">Total out-of-pocket expenses</Text>
          </View>
        </View>

        {/* Claims List */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Recent Claims</Text>
          {claims.map((claim) => {
            const StatusIcon = getStatusIcon(claim.status);
            const statusColor = getStatusColor(claim.status);

            return (
              <View key={claim.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {claim.provider}
                    </Text>
                    <Text className="text-xs text-muted mb-1">
                      Claim #{claim.claimNumber}
                    </Text>
                    <Text className="text-xs text-muted">
                      Service Date: {claim.serviceDate}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: `${statusColor}20` }} className="px-3 py-1 rounded-full flex-row items-center gap-1">
                    <StatusIcon size={12} color={statusColor} />
                    <Text style={{ color: statusColor }} className="text-xs font-semibold uppercase">
                      {claim.status}
                    </Text>
                  </View>
                </View>

                {/* Financial Details */}
                <View className="pt-3 border-t border-border gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Claimed Amount</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      ${claim.claimedAmount.toFixed(2)}
                    </Text>
                  </View>
                  
                  {claim.status !== "pending" && (
                    <>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted">Approved Amount</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          ${claim.approvedAmount.toFixed(2)}
                        </Text>
                      </View>
                      
                      {claim.status === "paid" && (
                        <>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-muted">Insurance Paid</Text>
                            <Text className="text-sm font-semibold text-success">
                              ${claim.paidAmount.toFixed(2)}
                            </Text>
                          </View>
                          
                          <View className="flex-row items-center justify-between pt-2 border-t border-border">
                            <Text className="text-sm font-semibold text-foreground">Your Responsibility</Text>
                            <Text className="text-base font-bold text-error">
                              ${claim.outOfPocket.toFixed(2)}
                            </Text>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </View>

                {/* Insurance Provider */}
                <View className="mt-3 pt-3 border-t border-border">
                  <Text className="text-xs text-muted">
                    {claim.insuranceProvider}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Insurance Info */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Insurance Information</Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Provider</Text>
                <Text className="text-sm font-semibold text-foreground">Blue Cross Blue Shield</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Policy Number</Text>
                <Text className="text-sm font-semibold text-foreground">BCBS-123456789</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Group Number</Text>
                <Text className="text-sm font-semibold text-foreground">GRP-987654</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
