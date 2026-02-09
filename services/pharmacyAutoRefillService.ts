/**
 * Pharmacy Auto-Refill Service
 * 
 * Monitors medication supply and automatically orders refills when running low.
 * Features:
 * - Supply tracking based on daily doses
 * - Automatic refill ordering
 * - Preferred pharmacy management
 * - Insurance verification
 * - Pickup/delivery notifications
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export interface MedicationSupply {
  medicationId: string;
  medicationName: string;
  currentQuantity: number;
  dailyDoses: number;
  daysRemaining: number;
  refillThreshold: number; // Days before running out to trigger refill
  autoRefillEnabled: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  isPreferred: boolean;
  supportsAutoRefill: boolean;
  deliveryAvailable: boolean;
}

export interface RefillOrder {
  id: string;
  medicationId: string;
  medicationName: string;
  pharmacyId: string;
  pharmacyName: string;
  orderDate: Date;
  status: "pending" | "processing" | "ready" | "delivered" | "cancelled";
  pickupDate?: Date;
  deliveryDate?: Date;
  estimatedCost: number;
  insuranceCovered: boolean;
}

class PharmacyAutoRefillService {
  private static instance: PharmacyAutoRefillService;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  static getInstance(): PharmacyAutoRefillService {
    if (!PharmacyAutoRefillService.instance) {
      PharmacyAutoRefillService.instance = new PharmacyAutoRefillService();
    }
    return PharmacyAutoRefillService.instance;
  }

  /**
   * Initialize auto-refill service
   */
  async initialize(): Promise<void> {
    // Check supply daily
    this.startDailyChecks();
    
    // Perform initial check
    await this.checkAllSupplies();
  }

  /**
   * Start daily supply checks
   */
  private startDailyChecks(): void {
    // Check every 24 hours
    this.checkInterval = setInterval(async () => {
      await this.checkAllSupplies();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Check all medication supplies
   */
  async checkAllSupplies(): Promise<void> {
    try {
      const supplies = await this.getAllSupplies();
      
      for (const supply of supplies) {
        if (supply.autoRefillEnabled && supply.daysRemaining <= supply.refillThreshold) {
          await this.initiateAutoRefill(supply);
        } else if (supply.daysRemaining <= 3) {
          // Send warning notification
          await this.sendLowSupplyWarning(supply);
        }
      }
    } catch (error) {
      console.error("Error checking supplies:", error);
    }
  }

  /**
   * Get all medication supplies
   */
  async getAllSupplies(): Promise<MedicationSupply[]> {
    try {
      const medicationsStr = await AsyncStorage.getItem("medications");
      if (!medicationsStr) return [];

      const medications = JSON.parse(medicationsStr);
      const supplies: MedicationSupply[] = [];

      for (const med of medications) {
        const supply = await this.getMedicationSupply(med.id);
        supplies.push(supply);
      }

      return supplies;
    } catch (error) {
      console.error("Error getting supplies:", error);
      return [];
    }
  }

  /**
   * Get supply info for a specific medication
   */
  async getMedicationSupply(medicationId: string): Promise<MedicationSupply> {
    try {
      const medicationsStr = await AsyncStorage.getItem("medications");
      const medications = JSON.parse(medicationsStr || "[]");
      const medication = medications.find((m: any) => m.id === medicationId);

      if (!medication) {
        throw new Error("Medication not found");
      }

      const supplyStr = await AsyncStorage.getItem(`supply_${medicationId}`);
      const supply = supplyStr ? JSON.parse(supplyStr) : {
        currentQuantity: medication.quantity || 30,
        autoRefillEnabled: false,
      };

      const dailyDoses = medication.times?.length || 1;
      const daysRemaining = Math.floor(supply.currentQuantity / dailyDoses);

      return {
        medicationId,
        medicationName: medication.name,
        currentQuantity: supply.currentQuantity,
        dailyDoses,
        daysRemaining,
        refillThreshold: 7, // Default 7 days
        autoRefillEnabled: supply.autoRefillEnabled,
      };
    } catch (error) {
      console.error("Error getting medication supply:", error);
      throw error;
    }
  }

  /**
   * Update medication supply after taking a dose
   */
  async recordDoseTaken(medicationId: string): Promise<void> {
    try {
      const supply = await this.getMedicationSupply(medicationId);
      const newQuantity = Math.max(0, supply.currentQuantity - 1);

      await AsyncStorage.setItem(
        `supply_${medicationId}`,
        JSON.stringify({
          currentQuantity: newQuantity,
          autoRefillEnabled: supply.autoRefillEnabled,
        })
      );

      // Check if refill needed
      const updatedSupply = await this.getMedicationSupply(medicationId);
      if (updatedSupply.autoRefillEnabled && updatedSupply.daysRemaining <= updatedSupply.refillThreshold) {
        await this.initiateAutoRefill(updatedSupply);
      }
    } catch (error) {
      console.error("Error recording dose:", error);
    }
  }

  /**
   * Initiate automatic refill
   */
  async initiateAutoRefill(supply: MedicationSupply): Promise<void> {
    try {
      // Check if already has pending refill
      const existingOrder = await this.getActiveRefillOrder(supply.medicationId);
      if (existingOrder) {
        console.log("Refill already in progress");
        return;
      }

      // Get preferred pharmacy
      const pharmacy = await this.getPreferredPharmacy();
      if (!pharmacy) {
        await this.sendNoPharmacyAlert(supply);
        return;
      }

      // Verify insurance
      const insuranceVerified = await this.verifyInsurance(supply.medicationId);

      // Create refill order
      const order: RefillOrder = {
        id: `refill_${Date.now()}`,
        medicationId: supply.medicationId,
        medicationName: supply.medicationName,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        orderDate: new Date(),
        status: "pending",
        estimatedCost: 0, // Will be updated by pharmacy
        insuranceCovered: insuranceVerified,
      };

      // Save order
      await this.saveRefillOrder(order);

      // Send notification
      await this.sendRefillConfirmation(order);

      // Simulate pharmacy processing (in real app, this would be API call)
      setTimeout(async () => {
        order.status = "ready";
        order.pickupDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
        await this.saveRefillOrder(order);
        await this.sendRefillReadyNotification(order);
      }, 5000);
    } catch (error) {
      console.error("Error initiating auto-refill:", error);
    }
  }

  /**
   * Get active refill order for medication
   */
  private async getActiveRefillOrder(medicationId: string): Promise<RefillOrder | null> {
    try {
      const ordersStr = await AsyncStorage.getItem("refill_orders");
      if (!ordersStr) return null;

      const orders: RefillOrder[] = JSON.parse(ordersStr);
      return orders.find(
        (o) => o.medicationId === medicationId && ["pending", "processing"].includes(o.status)
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save refill order
   */
  private async saveRefillOrder(order: RefillOrder): Promise<void> {
    try {
      const ordersStr = await AsyncStorage.getItem("refill_orders");
      const orders: RefillOrder[] = ordersStr ? JSON.parse(ordersStr) : [];
      
      const existingIndex = orders.findIndex((o) => o.id === order.id);
      if (existingIndex >= 0) {
        orders[existingIndex] = order;
      } else {
        orders.push(order);
      }

      await AsyncStorage.setItem("refill_orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving refill order:", error);
    }
  }

  /**
   * Get preferred pharmacy
   */
  async getPreferredPharmacy(): Promise<Pharmacy | null> {
    try {
      const pharmaciesStr = await AsyncStorage.getItem("pharmacies");
      if (!pharmaciesStr) return null;

      const pharmacies: Pharmacy[] = JSON.parse(pharmaciesStr);
      return pharmacies.find((p) => p.isPreferred) || pharmacies[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify insurance coverage
   */
  private async verifyInsurance(medicationId: string): Promise<boolean> {
    // In real app, this would call insurance API
    return true;
  }

  /**
   * Send low supply warning
   */
  private async sendLowSupplyWarning(supply: MedicationSupply): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Low Medication Supply",
        body: `${supply.medicationName}: Only ${supply.daysRemaining} days remaining. Consider enabling auto-refill.`,
        sound: true,
      },
      trigger: null,
    });
  }

  /**
   * Send refill confirmation
   */
  private async sendRefillConfirmation(order: RefillOrder): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Refill Order Placed",
        body: `Auto-refill order placed for ${order.medicationName} at ${order.pharmacyName}`,
        sound: true,
      },
      trigger: null,
    });
  }

  /**
   * Send refill ready notification
   */
  private async sendRefillReadyNotification(order: RefillOrder): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Prescription Ready",
        body: `${order.medicationName} is ready for pickup at ${order.pharmacyName}`,
        sound: true,
      },
      trigger: null,
    });
  }

  /**
   * Send no pharmacy alert
   */
  private async sendNoPharmacyAlert(supply: MedicationSupply): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Auto-Refill Failed",
        body: `No preferred pharmacy set for ${supply.medicationName}. Please add a pharmacy.`,
        sound: true,
      },
      trigger: null,
    });
  }

  /**
   * Enable auto-refill for medication
   */
  async enableAutoRefill(medicationId: string): Promise<void> {
    try {
      const supply = await this.getMedicationSupply(medicationId);
      await AsyncStorage.setItem(
        `supply_${medicationId}`,
        JSON.stringify({
          currentQuantity: supply.currentQuantity,
          autoRefillEnabled: true,
        })
      );
    } catch (error) {
      console.error("Error enabling auto-refill:", error);
    }
  }

  /**
   * Disable auto-refill for medication
   */
  async disableAutoRefill(medicationId: string): Promise<void> {
    try {
      const supply = await this.getMedicationSupply(medicationId);
      await AsyncStorage.setItem(
        `supply_${medicationId}`,
        JSON.stringify({
          currentQuantity: supply.currentQuantity,
          autoRefillEnabled: false,
        })
      );
    } catch (error) {
      console.error("Error disabling auto-refill:", error);
    }
  }

  /**
   * Get all refill orders
   */
  async getAllRefillOrders(): Promise<RefillOrder[]> {
    try {
      const ordersStr = await AsyncStorage.getItem("refill_orders");
      return ordersStr ? JSON.parse(ordersStr) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default PharmacyAutoRefillService.getInstance();
