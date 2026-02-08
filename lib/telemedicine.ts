/**
 * Telemedicine Video Calling
 * 
 * Provides video calling functionality for remote healthcare consultations.
 * Uses Expo AV for video/audio or can integrate with third-party services.
 */

export interface HealthcareProvider {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  photo?: string;
  rating: number;
  availability: ProviderAvailability[];
  acceptsInsurance: string[];
  consultationFee: number;
}

export interface ProviderAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface VideoAppointment {
  id: string;
  providerId: string;
  providerName: string;
  patientId: string;
  patientName: string;
  scheduledTime: Date;
  duration: number; // minutes
  reason: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  callUrl?: string;
  notes?: string;
  prescription?: string[];
}

export interface CallSession {
  appointmentId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
}

/**
 * Sample healthcare providers
 * In production, fetch from backend API
 */
const SAMPLE_PROVIDERS: HealthcareProvider[] = [
  {
    id: "dr-smith",
    name: "Dr. Sarah Smith",
    specialty: "Primary Care",
    credentials: "MD, Board Certified Internal Medicine",
    rating: 4.9,
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" },
    ],
    acceptsInsurance: ["Medicare", "Blue Cross", "Aetna", "UnitedHealthcare"],
    consultationFee: 75,
  },
  {
    id: "dr-johnson",
    name: "Dr. Michael Johnson",
    specialty: "Cardiology",
    credentials: "MD, FACC, Board Certified Cardiologist",
    rating: 4.8,
    availability: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "16:00" },
      { dayOfWeek: 3, startTime: "10:00", endTime: "16:00" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "16:00" },
    ],
    acceptsInsurance: ["Medicare", "Cigna", "Humana"],
    consultationFee: 150,
  },
  {
    id: "dr-williams",
    name: "Dr. Emily Williams",
    specialty: "Geriatrics",
    credentials: "MD, Board Certified Geriatric Medicine",
    rating: 5.0,
    availability: [
      { dayOfWeek: 2, startTime: "08:00", endTime: "14:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "14:00" },
    ],
    acceptsInsurance: ["Medicare", "Medicaid", "Blue Cross"],
    consultationFee: 100,
  },
  {
    id: "dr-brown",
    name: "Dr. Robert Brown",
    specialty: "Endocrinology",
    credentials: "MD, Board Certified Endocrinology",
    rating: 4.7,
    availability: [
      { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "13:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "13:00", endTime: "18:00" },
    ],
    acceptsInsurance: ["Medicare", "Aetna", "UnitedHealthcare"],
    consultationFee: 125,
  },
];

/**
 * Get all healthcare providers
 */
export async function getHealthcareProviders(): Promise<HealthcareProvider[]> {
  // In production, fetch from backend API
  return SAMPLE_PROVIDERS;
}

/**
 * Get provider by ID
 */
export async function getProviderById(providerId: string): Promise<HealthcareProvider | null> {
  const providers = await getHealthcareProviders();
  return providers.find(p => p.id === providerId) || null;
}

/**
 * Search providers by specialty
 */
export async function searchProvidersBySpecialty(specialty: string): Promise<HealthcareProvider[]> {
  const providers = await getHealthcareProviders();
  return providers.filter(p => 
    p.specialty.toLowerCase().includes(specialty.toLowerCase())
  );
}

/**
 * Get available time slots for a provider
 */
export function getAvailableTimeSlots(
  provider: HealthcareProvider,
  date: Date
): string[] {
  const dayOfWeek = date.getDay();
  const availability = provider.availability.find(a => a.dayOfWeek === dayOfWeek);
  
  if (!availability) {
    return [];
  }
  
  // Generate 30-minute time slots
  const slots: string[] = [];
  const [startHour, startMinute] = availability.startTime.split(":").map(Number);
  const [endHour, endMinute] = availability.endTime.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    slots.push(timeString);
    
    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  
  return slots;
}

/**
 * Schedule video appointment
 */
export async function scheduleVideoAppointment(
  providerId: string,
  patientName: string,
  scheduledTime: Date,
  reason: string
): Promise<VideoAppointment> {
  const provider = await getProviderById(providerId);
  
  if (!provider) {
    throw new Error("Provider not found");
  }
  
  const appointment: VideoAppointment = {
    id: `appt-${Date.now()}`,
    providerId,
    providerName: provider.name,
    patientId: "current-user",
    patientName,
    scheduledTime,
    duration: 30,
    reason,
    status: "scheduled",
    callUrl: `https://telemedicine.healthmate.app/call/${Date.now()}`,
  };
  
  // In production, save to backend
  console.log("Appointment scheduled:", appointment);
  
  return appointment;
}

/**
 * Get upcoming appointments
 */
export async function getUpcomingAppointments(): Promise<VideoAppointment[]> {
  // In production, fetch from backend
  // Mock data for demonstration
  return [];
}

/**
 * Join video call
 */
export async function joinVideoCall(appointmentId: string): Promise<string> {
  // In production, generate/fetch actual video call URL
  // This could integrate with services like:
  // - Twilio Video
  // - Agora
  // - Daily.co
  // - Zoom
  
  const callUrl = `https://telemedicine.healthmate.app/call/${appointmentId}`;
  console.log("Joining video call:", callUrl);
  
  return callUrl;
}

/**
 * End video call and save session data
 */
export async function endVideoCall(
  appointmentId: string,
  startTime: Date,
  notes?: string
): Promise<CallSession> {
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
  
  const session: CallSession = {
    appointmentId,
    startTime,
    endTime,
    duration,
  };
  
  // In production, save session data and notes to backend
  console.log("Call ended:", session);
  
  return session;
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  // In production, update appointment status in backend
  console.log("Appointment cancelled:", appointmentId);
  return true;
}

/**
 * Reschedule appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newTime: Date
): Promise<VideoAppointment> {
  // In production, update appointment in backend
  console.log("Appointment rescheduled:", appointmentId, newTime);
  
  // Return updated appointment
  return {
    id: appointmentId,
    providerId: "dr-smith",
    providerName: "Dr. Sarah Smith",
    patientId: "current-user",
    patientName: "Patient",
    scheduledTime: newTime,
    duration: 30,
    reason: "Follow-up consultation",
    status: "scheduled",
  };
}

/**
 * Get call history
 */
export async function getCallHistory(): Promise<CallSession[]> {
  // In production, fetch from backend
  return [];
}

/**
 * Share health data with provider during call
 */
export async function shareHealthDataWithProvider(
  appointmentId: string,
  dataType: "vitals" | "medications" | "activities" | "all"
): Promise<boolean> {
  // In production, send data to provider through secure channel
  console.log("Sharing health data:", appointmentId, dataType);
  return true;
}

/**
 * Get specialty icon
 */
export function getSpecialtyIcon(specialty: string): string {
  const icons: Record<string, string> = {
    "Primary Care": "🏥",
    "Cardiology": "❤️",
    "Geriatrics": "👴",
    "Endocrinology": "🩺",
    "Neurology": "🧠",
    "Orthopedics": "🦴",
    "Dermatology": "🧴",
    "Psychiatry": "🧘",
  };
  
  return icons[specialty] || "👨‍⚕️";
}

/**
 * Format appointment time
 */
export function formatAppointmentTime(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Check if appointment is starting soon (within 15 minutes)
 */
export function isAppointmentStartingSoon(scheduledTime: Date): boolean {
  const now = new Date();
  const diff = scheduledTime.getTime() - now.getTime();
  const minutesUntil = diff / 1000 / 60;
  
  return minutesUntil > 0 && minutesUntil <= 15;
}

/**
 * Get appointment status color
 */
export function getAppointmentStatusColor(status: VideoAppointment["status"]): string {
  switch (status) {
    case "scheduled":
      return "#0a7ea4";
    case "in-progress":
      return "#22C55E";
    case "completed":
      return "#9CA3AF";
    case "cancelled":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}
