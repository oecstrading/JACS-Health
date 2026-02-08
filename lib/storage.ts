import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  MEDICATIONS: "@healthmate/medications",
  VITALS: "@healthmate/vitals",
  ACTIVITIES: "@healthmate/activities",
  SETTINGS: "@healthmate/settings",
  USER_PROFILE: "@healthmate/user_profile",
  APPOINTMENTS: "@healthmate/appointments",
  CAREGIVERS: "@healthmate/caregivers",
} as const;

// Data types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  date: string; // ISO date string
  photo?: string;
}

export interface Vital {
  id: string;
  type: "blood_pressure" | "heart_rate" | "weight" | "blood_glucose" | "temperature";
  value: string;
  unit: string;
  status: "normal" | "warning" | "error";
  date: string; // ISO date string
  notes?: string;
}

export interface Activity {
  id: string;
  type: "steps" | "walk" | "meal" | "water" | "sleep" | "mood";
  value: string | number;
  completed: boolean;
  date: string; // ISO date string
}

export interface Settings {
  voiceAssistant: boolean;
  medicationReminders: boolean;
  darkMode: boolean;
  textSize: "small" | "medium" | "large" | "extra-large";
  notificationsEnabled: boolean;
}

export interface UserProfile {
  name: string;
  age?: number;
  healthConditions: string[];
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  photo?: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  location: string;
  date: string; // ISO date string
  time: string;
  notes?: string;
  reminderSet: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  photo?: string;
  permissions: {
    viewMedications: boolean;
    viewVitals: boolean;
    viewActivity: boolean;
    receiveAlerts: boolean;
  };
}

/**
 * Generic storage functions
 */
async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
}

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

/**
 * Medications
 */
export async function saveMedications(medications: Medication[]): Promise<void> {
  return setItem(STORAGE_KEYS.MEDICATIONS, medications);
}

export async function getMedications(): Promise<Medication[]> {
  const medications = await getItem<Medication[]>(STORAGE_KEYS.MEDICATIONS);
  return medications || [];
}

export async function addMedication(medication: Medication): Promise<void> {
  const medications = await getMedications();
  medications.push(medication);
  return saveMedications(medications);
}

export async function updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
  const medications = await getMedications();
  const index = medications.findIndex(m => m.id === id);
  if (index !== -1) {
    medications[index] = { ...medications[index], ...updates };
    return saveMedications(medications);
  }
}

export async function deleteMedication(id: string): Promise<void> {
  const medications = await getMedications();
  const filtered = medications.filter(m => m.id !== id);
  return saveMedications(filtered);
}

/**
 * Vitals
 */
export async function saveVitals(vitals: Vital[]): Promise<void> {
  return setItem(STORAGE_KEYS.VITALS, vitals);
}

export async function getVitals(): Promise<Vital[]> {
  const vitals = await getItem<Vital[]>(STORAGE_KEYS.VITALS);
  return vitals || [];
}

export async function addVital(vital: Vital): Promise<void> {
  const vitals = await getVitals();
  vitals.push(vital);
  return saveVitals(vitals);
}

export async function getVitalsByType(type: Vital["type"], limit?: number): Promise<Vital[]> {
  const vitals = await getVitals();
  const filtered = vitals.filter(v => v.type === type).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Activities
 */
export async function saveActivities(activities: Activity[]): Promise<void> {
  return setItem(STORAGE_KEYS.ACTIVITIES, activities);
}

export async function getActivities(): Promise<Activity[]> {
  const activities = await getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES);
  return activities || [];
}

export async function addActivity(activity: Activity): Promise<void> {
  const activities = await getActivities();
  activities.push(activity);
  return saveActivities(activities);
}

export async function getActivitiesByDate(date: string): Promise<Activity[]> {
  const activities = await getActivities();
  return activities.filter(a => a.date === date);
}

/**
 * Settings
 */
export async function saveSettings(settings: Settings): Promise<void> {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

export async function getSettings(): Promise<Settings> {
  const settings = await getItem<Settings>(STORAGE_KEYS.SETTINGS);
  return settings || {
    voiceAssistant: true,
    medicationReminders: true,
    darkMode: false,
    textSize: "large",
    notificationsEnabled: true,
  };
}

/**
 * User Profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  return setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

/**
 * Appointments
 */
export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  return setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
}

export async function getAppointments(): Promise<Appointment[]> {
  const appointments = await getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS);
  return appointments || [];
}

export async function addAppointment(appointment: Appointment): Promise<void> {
  const appointments = await getAppointments();
  appointments.push(appointment);
  return saveAppointments(appointments);
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  const appointments = await getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    return saveAppointments(appointments);
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const appointments = await getAppointments();
  const filtered = appointments.filter(a => a.id !== id);
  return saveAppointments(filtered);
}

/**
 * Caregivers
 */
export async function saveCaregivers(caregivers: Caregiver[]): Promise<void> {
  return setItem(STORAGE_KEYS.CAREGIVERS, caregivers);
}

export async function getCaregivers(): Promise<Caregiver[]> {
  const caregivers = await getItem<Caregiver[]>(STORAGE_KEYS.CAREGIVERS);
  return caregivers || [];
}

export async function addCaregiver(caregiver: Caregiver): Promise<void> {
  const caregivers = await getCaregivers();
  caregivers.push(caregiver);
  return saveCaregivers(caregivers);
}

export async function updateCaregiver(id: string, updates: Partial<Caregiver>): Promise<void> {
  const caregivers = await getCaregivers();
  const index = caregivers.findIndex(c => c.id === id);
  if (index !== -1) {
    caregivers[index] = { ...caregivers[index], ...updates };
    return saveCaregivers(caregivers);
  }
}

export async function deleteCaregiver(id: string): Promise<void> {
  const caregivers = await getCaregivers();
  const filtered = caregivers.filter(c => c.id !== id);
  return saveCaregivers(filtered);
}

/**
 * Clear all data (for testing or logout)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
}
