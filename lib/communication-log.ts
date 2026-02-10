/**
 * Doctor Communication Log Module
 * 
 * Implements 2026 Medicare "Interactive Communication" requirement tracking.
 * Records real-time interactions (phone/video) for CPT 99470/99457 billing audit trail.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type CommunicationMode = 'phone' | 'video' | 'portal';

export interface CommunicationEntry {
  id: string;
  date: Date;
  mode: CommunicationMode;
  duration: number; // in minutes
  notes: string;
  doctorName?: string;
  clinicName?: string;
  createdAt: Date;
}

const STORAGE_KEY = '@healthmate_communication_log';

/**
 * Get all communication log entries
 */
export async function getCommunicationLog(): Promise<CommunicationEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    
    const entries = JSON.parse(json);
    return entries.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt),
    }));
  } catch (error) {
    console.error('Error loading communication log:', error);
    return [];
  }
}

/**
 * Add a new communication log entry
 */
export async function addCommunicationEntry(
  entry: Omit<CommunicationEntry, 'id' | 'createdAt'>
): Promise<CommunicationEntry> {
  try {
    const entries = await getCommunicationLog();
    
    const newEntry: CommunicationEntry = {
      ...entry,
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    
    entries.unshift(newEntry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    return newEntry;
  } catch (error) {
    console.error('Error adding communication entry:', error);
    throw error;
  }
}

/**
 * Get communication entries for a specific date range
 */
export async function getCommunicationsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<CommunicationEntry[]> {
  const entries = await getCommunicationLog();
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get communication entries for current billing cycle (current month)
 */
export async function getCurrentBillingCycleCommunications(): Promise<CommunicationEntry[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return getCommunicationsByDateRange(startOfMonth, endOfMonth);
}

/**
 * Check if Interactive Communication requirement is met for current billing cycle
 * (At least 1 real-time interaction per month)
 */
export async function isInteractiveCommunicationMet(): Promise<boolean> {
  const entries = await getCurrentBillingCycleCommunications();
  
  // Count phone and video interactions (not portal messages)
  const realTimeInteractions = entries.filter(
    entry => entry.mode === 'phone' || entry.mode === 'video'
  );
  
  return realTimeInteractions.length >= 1;
}

/**
 * Get total communication time for current billing cycle
 */
export async function getTotalCommunicationTime(): Promise<number> {
  const entries = await getCurrentBillingCycleCommunications();
  return entries.reduce((total, entry) => total + entry.duration, 0);
}

/**
 * Generate Monthly Billing Support Statement
 */
export interface BillingSupportStatement {
  month: string;
  year: number;
  totalCommunications: number;
  realTimeInteractions: number;
  totalDuration: number;
  eligibleForCPT99470: boolean; // 10+ minutes
  eligibleForCPT99457: boolean; // 20+ minutes
  entries: CommunicationEntry[];
}

export async function generateBillingSupportStatement(
  month: number,
  year: number
): Promise<BillingSupportStatement> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const entries = await getCommunicationsByDateRange(startDate, endDate);
  const realTimeInteractions = entries.filter(
    entry => entry.mode === 'phone' || entry.mode === 'video'
  );
  
  const totalDuration = entries.reduce((total, entry) => total + entry.duration, 0);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: monthNames[month],
    year,
    totalCommunications: entries.length,
    realTimeInteractions: realTimeInteractions.length,
    totalDuration,
    eligibleForCPT99470: totalDuration >= 10,
    eligibleForCPT99457: totalDuration >= 20,
    entries,
  };
}

/**
 * Delete a communication entry
 */
export async function deleteCommunicationEntry(id: string): Promise<void> {
  try {
    const entries = await getCommunicationLog();
    const filtered = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting communication entry:', error);
    throw error;
  }
}

/**
 * Update a communication entry
 */
export async function updateCommunicationEntry(
  id: string,
  updates: Partial<Omit<CommunicationEntry, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const entries = await getCommunicationLog();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      throw new Error('Communication entry not found');
    }
    
    entries[index] = {
      ...entries[index],
      ...updates,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error updating communication entry:', error);
    throw error;
  }
}
