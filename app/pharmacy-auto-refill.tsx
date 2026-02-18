import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import PharmacyAutoRefillService, {
  type MedicationSupply,
  type RefillOrder,
} from "@/services/pharmacyAutoRefillService";

export default function PharmacyAutoRefillScreen() {
  const colors = useColors();
  const [supplies, setSupplies] = useState<MedicationSupply[]>([]);
  const [orders, setOrders] = useState<RefillOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Initialize service
    PharmacyAutoRefillService.initialize();

    return () => {
      PharmacyAutoRefillService.cleanup();
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [suppliesData, ordersData] = await Promise.all([
        PharmacyAutoRefillService.getAllSupplies(),
        PharmacyAutoRefillService.getAllRefillOrders(),
      ]);
      setSupplies(suppliesData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoRefill = async (medicationId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await PharmacyAutoRefillService.enableAutoRefill(medicationId);
      } else {
        await PharmacyAutoRefillService.disableAutoRefill(medicationId);
      }
      await loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to update auto-refill setting");
    }
  };

  const getSupplyStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 3) return colors.error;
    if (daysRemaining <= 7) return colors.warning;
    return colors.success;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return colors.success;
      case "processing":
        return colors.warning;
      case "cancelled":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Auto-Refill</Text>
            <Text className="text-base text-muted mt-1">
              Automatic medication refill management
            </Text>
          </View>

          {/* Medication Supplies */}
          <View>
            <Text className="text-2xl font-bold text-foreground mb-3">
              Medication Supply
            </Text>

            {supplies.length === 0 ? (
              <View
                className="rounded-2xl p-6 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-base text-muted">No medications found</Text>
              </View>
            ) : (
              <View className="gap-3">
                {supplies.map((supply) => (
                  <View
                    key={supply.medicationId}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-foreground">
                          {supply.medicationName}
                        </Text>
                        <Text className="text-base text-muted mt-1">
                          {supply.currentQuantity} pills remaining
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getSupplyStatusColor(supply.daysRemaining)}20`,
                        }}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: getSupplyStatusColor(supply.daysRemaining) }}
                        >
                          {supply.daysRemaining} days
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-base text-muted">
                        {supply.dailyDoses} dose{supply.dailyDoses > 1 ? "s" : ""} per day
                      </Text>
                      <Text className="text-base text-muted">
                        Refill at {supply.refillThreshold} days
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderColor: colors.border }}>
                      <Text className="text-base font-semibold text-foreground">
                        Auto-Refill
                      </Text>
                      <Switch
                        value={supply.autoRefillEnabled}
                        onValueChange={(value) =>
                          handleToggleAutoRefill(supply.medicationId, value)
                        }
                        trackColor={{ false: colors.border, true: colors.primary }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Recent Orders */}
          {orders.length > 0 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-3">
                Recent Orders
              </Text>

              <View className="gap-3">
                {orders.slice(0, 5).map((order) => (
                  <View
                    key={order.id}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">
                          {order.medicationName}
                        </Text>
                        <Text className="text-base text-muted mt-1">
                          {order.pharmacyName}
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getOrderStatusColor(order.status)}20`,
                        }}
                      >
                        <Text
                          className="text-sm font-semibold capitalize"
                          style={{ color: getOrderStatusColor(order.status) }}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted">Order Date</Text>
                        <Text className="text-sm text-foreground">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </Text>
                      </View>

                      {order.pickupDate && (
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Pickup Date</Text>
                          <Text className="text-sm text-foreground">
                            {new Date(order.pickupDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      {order.deliveryDate && (
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Delivery Date</Text>
                          <Text className="text-sm text-foreground">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted">Insurance</Text>
                        <Text className="text-sm text-foreground">
                          {order.insuranceCovered ? "Covered" : "Not Covered"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* How It Works */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-bold text-foreground mb-3">
              How Auto-Refill Works
            </Text>
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-2xl">📊</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Supply Tracking
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    We monitor your medication supply based on your daily doses
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">🔔</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Automatic Ordering
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    When you have 7 days left, we automatically order a refill
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">✅</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Pickup Notification
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    You'll be notified when your prescription is ready
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
