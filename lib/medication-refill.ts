/**
 * Medication Refill Reminders & Pharmacy Integration
 * 
 * Tracks prescription quantities and sends refill reminders.
 * Integrates with pharmacies for easy reordering.
 */

import { scheduleMedicationReminder } from "./notifications";

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  quantity: number; // Total pills/doses
  refillsRemaining: number;
  daysSupply: number;
  prescribedDate: Date;
  lastRefillDate: Date;
  pharmacyId: string;
  prescriptionNumber: string;
  cost: number;
  insuranceCovered: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  acceptsInsurance: string[];
  deliveryAvailable: boolean;
  rating: number;
}

export interface RefillReminder {
  id: string;
  prescriptionId: string;
  medicationName: string;
  daysUntilEmpty: number;
  reminderDate: Date;
  status: "pending" | "acknowledged" | "refilled";
}

export interface RefillOrder {
  id: string;
  prescriptionId: string;
  pharmacyId: string;
  orderDate: Date;
  status: "pending" | "ready" | "delivered" | "cancelled";
  pickupMethod: "pickup" | "delivery";
  estimatedReady: Date;
}

/**
 * Sample pharmacies
 */
const SAMPLE_PHARMACIES: Pharmacy[] = [
  {
    id: "cvs-main",
    name: "CVS Pharmacy",
    address: "123 Main St, Austin, TX 78701",
    phone: "(512) 555-0100",
    hours: "Mon-Fri 8AM-9PM, Sat-Sun 9AM-6PM",
    acceptsInsurance: ["Medicare", "Blue Cross", "Aetna", "UnitedHealthcare"],
    deliveryAvailable: true,
    rating: 4.5,
  },
  {
    id: "walgreens-downtown",
    name: "Walgreens",
    address: "456 Congress Ave, Austin, TX 78701",
    phone: "(512) 555-0200",
    hours: "24 Hours",
    acceptsInsurance: ["Medicare", "Cigna", "Humana", "Aetna"],
    deliveryAvailable: true,
    rating: 4.3,
  },
  {
    id: "heb-pharmacy",
    name: "H-E-B Pharmacy",
    address: "789 Riverside Dr, Austin, TX 78704",
    phone: "(512) 555-0300",
    hours: "Mon-Sat 9AM-8PM, Sun 10AM-6PM",
    acceptsInsurance: ["Medicare", "Blue Cross", "UnitedHealthcare"],
    deliveryAvailable: false,
    rating: 4.7,
  },
];

/**
 * Calculate days until prescription runs out
 */
export function calculateDaysUntilEmpty(
  prescription: Prescription,
  dailyDosage: number = 1
): number {
  const daysSinceLastRefill = Math.floor(
    (Date.now() - prescription.lastRefillDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysRemaining = prescription.daysSupply - daysSinceLastRefill;
  return Math.max(0, daysRemaining);
}

/**
 * Check if prescription needs refill soon (within 7 days)
 */
export function needsRefillSoon(prescription: Prescription): boolean {
  const daysUntilEmpty = calculateDaysUntilEmpty(prescription);
  return daysUntilEmpty <= 7 && daysUntilEmpty > 0;
}

/**
 * Check if prescription is out of stock
 */
export function isOutOfStock(prescription: Prescription): boolean {
  const daysUntilEmpty = calculateDaysUntilEmpty(prescription);
  return daysUntilEmpty <= 0;
}

/**
 * Schedule refill reminder notification
 */
export async function scheduleRefillReminder(
  prescription: Prescription
): Promise<string> {
  const daysUntilEmpty = calculateDaysUntilEmpty(prescription);
  const reminderDays = 7; // Remind 7 days before running out
  
  if (daysUntilEmpty <= reminderDays) {
    // Already within reminder window
    return "";
  }
  
  // In production, schedule actual notification
  console.log(`Refill reminder scheduled for ${prescription.medicationName}`);
  
  return `reminder-${prescription.id}`;
}

/**
 * Get all pharmacies
 */
export async function getPharmacies(): Promise<Pharmacy[]> {
  return SAMPLE_PHARMACIES;
}

/**
 * Get pharmacy by ID
 */
export async function getPharmacyById(pharmacyId: string): Promise<Pharmacy | null> {
  return SAMPLE_PHARMACIES.find(p => p.id === pharmacyId) || null;
}

/**
 * Request prescription refill
 */
export async function requestRefill(
  prescriptionId: string,
  pharmacyId: string,
  pickupMethod: "pickup" | "delivery" = "pickup"
): Promise<RefillOrder> {
  const estimatedReady = new Date();
  estimatedReady.setHours(estimatedReady.getHours() + 2); // Ready in 2 hours
  
  const order: RefillOrder = {
    id: `refill-${Date.now()}`,
    prescriptionId,
    pharmacyId,
    orderDate: new Date(),
    status: "pending",
    pickupMethod,
    estimatedReady,
  };
  
  // In production, send refill request to pharmacy API
  console.log("Refill requested:", order);
  
  return order;
}

/**
 * Get refill order status
 */
export async function getRefillStatus(orderId: string): Promise<RefillOrder | null> {
  // In production, fetch from backend
  return null;
}

/**
 * Get prescription refill history
 */
export async function getRefillHistory(prescriptionId: string): Promise<RefillOrder[]> {
  // In production, fetch from backend
  return [];
}

/**
 * Calculate monthly medication costs
 */
export function calculateMonthlyCosts(prescriptions: Prescription[]): number {
  return prescriptions.reduce((total, rx) => {
    const refillsPerMonth = 30 / rx.daysSupply;
    const monthlyCost = rx.cost * refillsPerMonth;
    return total + monthlyCost;
  }, 0);
}

/**
 * Get active refill reminders
 */
export async function getActiveReminders(): Promise<RefillReminder[]> {
  // In production, fetch from backend
  // Mock data for demonstration
  return [];
}

/**
 * Mark reminder as acknowledged
 */
export async function acknowledgeReminder(reminderId: string): Promise<boolean> {
  // In production, update in backend
  console.log("Reminder acknowledged:", reminderId);
  return true;
}

/**
 * Mark reminder as refilled
 */
export async function markAsRefilled(reminderId: string): Promise<boolean> {
  // In production, update in backend
  console.log("Marked as refilled:", reminderId);
  return true;
}

/**
 * Get pharmacy icon
 */
export function getPharmacyIcon(pharmacyName: string): string {
  if (pharmacyName.includes("CVS")) return "🏪";
  if (pharmacyName.includes("Walgreens")) return "🏬";
  if (pharmacyName.includes("H-E-B")) return "🛒";
  return "💊";
}

/**
 * Format refill status
 */
export function formatRefillStatus(status: RefillOrder["status"]): string {
  switch (status) {
    case "pending":
      return "Processing";
    case "ready":
      return "Ready for Pickup";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
}

/**
 * Get refill status color
 */
export function getRefillStatusColor(status: RefillOrder["status"]): string {
  switch (status) {
    case "pending":
      return "#F59E0B";
    case "ready":
      return "#22C55E";
    case "delivered":
      return "#0a7ea4";
    case "cancelled":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

/**
 * Calculate insurance savings
 */
export function calculateInsuranceSavings(
  fullPrice: number,
  insurancePrice: number
): number {
  return fullPrice - insurancePrice;
}

/**
 * Format prescription number
 */
export function formatPrescriptionNumber(rxNumber: string): string {
  // Format as XXX-XXXX-XXXX
  const cleaned = rxNumber.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return rxNumber;
}

/**
 * Check if pharmacy accepts insurance
 */
export function pharmacyAcceptsInsurance(
  pharmacy: Pharmacy,
  insuranceName: string
): boolean {
  return pharmacy.acceptsInsurance.some(ins =>
    ins.toLowerCase().includes(insuranceName.toLowerCase())
  );
}

/**
 * Get nearest pharmacy (mock implementation)
 */
export async function getNearestPharmacy(): Promise<Pharmacy | null> {
  const pharmacies = await getPharmacies();
  return pharmacies[0] || null;
}

/**
 * Send refill reminder SMS
 */
export async function sendRefillReminderSMS(
  phone: string,
  medicationName: string,
  daysLeft: number
): Promise<boolean> {
  // In production, integrate with SMS service
  console.log(`SMS reminder sent to ${phone}: ${medicationName} - ${daysLeft} days left`);
  return true;
}

/**
 * Auto-refill prescription (if enabled)
 */
export async function autoRefillPrescription(
  prescriptionId: string
): Promise<RefillOrder | null> {
  // In production, check if auto-refill is enabled and process
  console.log("Auto-refill triggered:", prescriptionId);
  return null;
}
