import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpecialtyType = "rheumatologist" | "endocrinologist" | "primary_care" | "cardiologist" | "neurologist";

export interface Specialist {
  id: string;
  name: string;
  specialty: SpecialtyType;
  address: string;
  phone: string;
  distance: number; // miles
  rating: number; // 0-5
  reviewCount: number;
  acceptingNewPatients: boolean;
  inNetwork: boolean;
  telehealth: boolean;
  nextAvailableDate: Date;
}

export interface Appointment {
  id: string;
  specialistId: string;
  specialistName: string;
  specialty: SpecialtyType;
  date: Date;
  time: string;
  type: "in_person" | "telehealth";
  address?: string;
  phone: string;
  copay: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

class SpecialistBookingService {
  private static instance: SpecialistBookingService;
  private appointments: Appointment[] = [];
  private insuranceInfo: {
    provider: string;
    memberId: string;
    groupNumber: string;
  } | null = null;

  private constructor() {
    this.loadData();
  }

  static getInstance(): SpecialistBookingService {
    if (!SpecialistBookingService.instance) {
      SpecialistBookingService.instance = new SpecialistBookingService();
    }
    return SpecialistBookingService.instance;
  }

  private async loadData() {
    try {
      const [appointmentsData, insuranceData] = await Promise.all([
        AsyncStorage.getItem("specialist_appointments"),
        AsyncStorage.getItem("insurance_info"),
      ]);

      if (appointmentsData) {
        this.appointments = JSON.parse(appointmentsData).map((a: any) => ({
          ...a,
          date: new Date(a.date),
        }));
      }

      if (insuranceData) {
        this.insuranceInfo = JSON.parse(insuranceData);
      }
    } catch (error) {
      console.error("Error loading specialist booking data:", error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          "specialist_appointments",
          JSON.stringify(this.appointments)
        ),
        AsyncStorage.setItem(
          "insurance_info",
          JSON.stringify(this.insuranceInfo)
        ),
      ]);
    } catch (error) {
      console.error("Error saving specialist booking data:", error);
    }
  }

  // Search Specialists
  async searchSpecialists(
    specialty: SpecialtyType,
    zipCode: string,
    maxDistance: number = 25
  ): Promise<Specialist[]> {
    // In production, this would call a healthcare provider directory API
    // For now, we'll return mock data
    const mockSpecialists: Specialist[] = [
      {
        id: "spec_1",
        name: "Dr. Sarah Johnson",
        specialty,
        address: "123 Medical Plaza, Suite 200",
        phone: "(555) 123-4567",
        distance: 2.5,
        rating: 4.8,
        reviewCount: 127,
        acceptingNewPatients: true,
        inNetwork: true,
        telehealth: true,
        nextAvailableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        id: "spec_2",
        name: "Dr. Michael Chen",
        specialty,
        address: "456 Health Center Dr, Building B",
        phone: "(555) 234-5678",
        distance: 5.1,
        rating: 4.9,
        reviewCount: 203,
        acceptingNewPatients: true,
        inNetwork: true,
        telehealth: false,
        nextAvailableDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        id: "spec_3",
        name: "Dr. Emily Rodriguez",
        specialty,
        address: "789 Wellness Blvd",
        phone: "(555) 345-6789",
        distance: 8.3,
        rating: 4.7,
        reviewCount: 89,
        acceptingNewPatients: true,
        inNetwork: false,
        telehealth: true,
        nextAvailableDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    ];

    return mockSpecialists.filter((s) => s.distance <= maxDistance);
  }

  // Insurance Verification
  async verifyInsurance(specialistId: string): Promise<{
    inNetwork: boolean;
    copay: number;
    deductible: number;
    deductibleMet: number;
    coverageDetails: string;
  }> {
    // In production, this would call insurance verification API
    // For now, we'll return mock data
    return {
      inNetwork: true,
      copay: 35,
      deductible: 1500,
      deductibleMet: 800,
      coverageDetails: "Specialist visits covered at 80% after deductible",
    };
  }

  // Book Appointment
  async bookAppointment(
    specialist: Specialist,
    date: Date,
    time: string,
    type: "in_person" | "telehealth",
    notes?: string
  ): Promise<Appointment> {
    const verification = await this.verifyInsurance(specialist.id);

    const appointment: Appointment = {
      id: `appt_${Date.now()}`,
      specialistId: specialist.id,
      specialistName: specialist.name,
      specialty: specialist.specialty,
      date,
      time,
      type,
      address: type === "in_person" ? specialist.address : undefined,
      phone: specialist.phone,
      copay: verification.copay,
      status: "scheduled",
      notes,
    };

    this.appointments.push(appointment);
    await this.saveData();

    return appointment;
  }

  // Get Appointments
  getAppointments(status?: Appointment["status"]): Appointment[] {
    const filtered = status
      ? this.appointments.filter((a) => a.status === status)
      : this.appointments;

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments
      .filter((a) => a.status === "scheduled" && a.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Cancel Appointment
  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = this.appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      appointment.status = "cancelled";
      await this.saveData();
    }
  }

  // Reschedule Appointment
  async rescheduleAppointment(
    appointmentId: string,
    newDate: Date,
    newTime: string
  ): Promise<void> {
    const appointment = this.appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      appointment.date = newDate;
      appointment.time = newTime;
      await this.saveData();
    }
  }

  // Insurance Management
  async setInsuranceInfo(info: {
    provider: string;
    memberId: string;
    groupNumber: string;
  }): Promise<void> {
    this.insuranceInfo = info;
    await this.saveData();
  }

  getInsuranceInfo(): {
    provider: string;
    memberId: string;
    groupNumber: string;
  } | null {
    return this.insuranceInfo;
  }

  // Estimate Copay
  estimateCopay(specialty: SpecialtyType, inNetwork: boolean): number {
    // Mock copay estimation
    const baseCopay = {
      primary_care: 25,
      rheumatologist: 50,
      endocrinologist: 50,
      cardiologist: 50,
      neurologist: 50,
    };

    const copay = baseCopay[specialty] || 40;
    return inNetwork ? copay : copay * 2;
  }
}

export default SpecialistBookingService.getInstance();
