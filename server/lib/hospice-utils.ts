import type {
  HospiceAssessment,
  HospicePatient,
  HospiceVisit,
  HospiceExpense,
  HospiceCaregiver,
} from "../../drizzle/schema";

/**
 * Compliance Status Calculation
 * Determines Red-Yellow-Green status based on days until submission deadline
 */
export function calculateComplianceStatus(
  assessment: HospiceAssessment
): "green" | "yellow" | "red" {
  // If already submitted or accepted, always green
  if (
    assessment.submissionStatus === "submitted" ||
    assessment.submissionStatus === "accepted"
  ) {
    return "green";
  }

  const now = new Date();
  const deadline = new Date(assessment.submissionDeadline);
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDeadline > 10) {
    return "green"; // More than 10 days remaining
  } else if (daysUntilDeadline >= 3) {
    return "yellow"; // 3-10 days remaining
  } else {
    return "red"; // Less than 3 days remaining or overdue
  }
}

/**
 * Assessment Validation
 * Validates that all seven care processes are completed
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function validateAssessment(
  assessment: HospiceAssessment
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Pain Screening
  if (!assessment.painScreeningCompleted) {
    errors.push({
      field: "painScreeningCompleted",
      message: "Pain screening is required for all patients",
    });
  }

  if (
    assessment.painScreeningCompleted &&
    (assessment.painIntensityScore === null ||
      assessment.painIntensityScore === undefined)
  ) {
    errors.push({
      field: "painIntensityScore",
      message: "Pain intensity score (0-10) is required when pain screening is completed",
    });
  }

  // 2. Dyspnea Screening
  if (!assessment.dyspneaScreeningCompleted) {
    errors.push({
      field: "dyspneaScreeningCompleted",
      message: "Dyspnea (shortness of breath) screening is required",
    });
  }

  // 3. Dyspnea Treatment
  if (!assessment.dyspneaTreatmentProvided) {
    errors.push({
      field: "dyspneaTreatmentProvided",
      message:
        "Documentation of dyspnea treatment (or reason for no treatment) is required",
    });
  }

  // 4. Treatment Preferences
  if (!assessment.treatmentPreferencesDiscussed) {
    errors.push({
      field: "treatmentPreferencesDiscussed",
      message: "Treatment preferences discussion is required (HIS CBE #3235)",
    });
  }

  // 5. Spiritual Concerns
  if (!assessment.spiritualConcernsAddressed) {
    errors.push({
      field: "spiritualConcernsAddressed",
      message: "Spiritual concerns must be addressed or documented",
    });
  }

  // 6. Emotional Support
  if (!assessment.emotionalSupportProvided) {
    errors.push({
      field: "emotionalSupportProvided",
      message: "Emotional support provision must be documented",
    });
  }

  // 7. Caregiver Education
  if (!assessment.caregiverEducationCompleted) {
    errors.push({
      field: "caregiverEducationCompleted",
      message: "Caregiver education completion is required",
    });
  }

  // 8. Advance Directives
  if (!assessment.advanceDirectivesDocumented) {
    errors.push({
      field: "advanceDirectivesDocumented",
      message: "Advance directives must be documented",
    });
  }

  return errors;
}

/**
 * Calculate submission deadline (admission date + 30 days)
 */
export function calculateSubmissionDeadline(admissionDate: Date): Date {
  const deadline = new Date(admissionDate);
  deadline.setDate(deadline.getDate() + 30);
  return deadline;
}

/**
 * Visit Gap Detection
 * Detects gaps greater than 7 days between skilled nursing visits
 */
export interface VisitGapAlert {
  type: "visit_gap";
  level: "red";
  description: string;
  patientId: string;
  daysSinceLastVisit: number;
}

export function detectVisitGaps(
  patient: HospicePatient,
  visits: HospiceVisit[]
): VisitGapAlert[] {
  const alerts: VisitGapAlert[] = [];

  // Filter for skilled nursing visits only
  const skilledNursingVisits = visits
    .filter((v) => v.visitType === "skilled_nursing")
    .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

  if (skilledNursingVisits.length === 0) {
    // No visits recorded - major red flag
    alerts.push({
      type: "visit_gap",
      level: "red",
      description: "No skilled nursing visits recorded for this patient",
      patientId: patient.id,
      daysSinceLastVisit: 999,
    });
    return alerts;
  }

  // Check gaps between consecutive visits
  for (let i = 1; i < skilledNursingVisits.length; i++) {
    const prevVisit = new Date(skilledNursingVisits[i - 1].visitDate);
    const currVisit = new Date(skilledNursingVisits[i].visitDate);
    const daysBetween = Math.ceil(
      (currVisit.getTime() - prevVisit.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysBetween > 7) {
      alerts.push({
        type: "visit_gap",
        level: "red",
        description: `${daysBetween} days between skilled nursing visits (${prevVisit.toLocaleDateString()} to ${currVisit.toLocaleDateString()})`,
        patientId: patient.id,
        daysSinceLastVisit: daysBetween,
      });
    }
  }

  // Check if no visit scheduled in next 7 days
  const lastVisit = skilledNursingVisits[skilledNursingVisits.length - 1];
  const daysSinceLastVisit = Math.ceil(
    (new Date().getTime() - new Date(lastVisit.visitDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastVisit > 7) {
    alerts.push({
      type: "visit_gap",
      level: "red",
      description: `No skilled nursing visit in ${daysSinceLastVisit} days (last visit: ${new Date(lastVisit.visitDate).toLocaleDateString()})`,
      patientId: patient.id,
      daysSinceLastVisit,
    });
  }

  return alerts;
}

/**
 * CAHPS Eligibility Check
 * Determines if a patient/caregiver is eligible for CAHPS survey
 */
export function isCAHPSEligible(
  patient: HospicePatient,
  caregiver: HospiceCaregiver | null
): boolean {
  // Must be deceased
  if (!patient.dateOfDeath) return false;

  // Must be 18+ at death (we don't have date of birth, so we'll assume this is checked elsewhere)
  // In a real implementation, you'd calculate age at death

  // Must have been in care for at least 48 hours
  const admissionTime = new Date(patient.admissionDate).getTime();
  const deathTime = new Date(patient.dateOfDeath).getTime();
  const hoursInCare = (deathTime - admissionTime) / (1000 * 60 * 60);

  if (hoursInCare < 48) return false;

  // Must have a primary caregiver of record
  if (!caregiver || !caregiver.isPrimaryCaregiver) return false;

  return true;
}

/**
 * Cost Center to CMS Worksheet Mapping
 */
export const costCenterMapping = {
  nursing: { worksheet: "A" as const, category: "Direct Patient Care" },
  therapy: { worksheet: "A" as const, category: "Direct Patient Care" },
  social_work: { worksheet: "A" as const, category: "Direct Patient Care" },
  chaplain: { worksheet: "A" as const, category: "Direct Patient Care" },
  volunteer: { worksheet: "B" as const, category: "Support Services" },
  aide: { worksheet: "A" as const, category: "Direct Patient Care" },
  medical_supplies: { worksheet: "C" as const, category: "Supplies" },
  medications: { worksheet: "C" as const, category: "Supplies" },
  dme: { worksheet: "C" as const, category: "Equipment" },
  telehealth_salaries: { worksheet: "F" as const, category: "Telehealth" },
  telehealth_equipment: { worksheet: "F" as const, category: "Telehealth" },
  administrative: { worksheet: "B" as const, category: "Administrative" },
  facility: { worksheet: "B" as const, category: "Facility" },
  other: { worksheet: "B" as const, category: "Other" },
};

/**
 * Cost Report Summary Generation
 */
export interface CostReportSummary {
  routine_home: { total: number; patient_days: number };
  continuous_home: { total: number; patient_days: number };
  inpatient_respite: { total: number; patient_days: number };
  general_inpatient: { total: number; patient_days: number };
  totalExpenses: number;
  worksheetTotals: {
    A: number;
    B: number;
    C: number;
    F: number;
  };
}

export function generateCostReportSummary(
  expenses: HospiceExpense[],
  fiscalYearStart: Date,
  fiscalYearEnd: Date
): CostReportSummary {
  const summary: CostReportSummary = {
    routine_home: { total: 0, patient_days: 0 },
    continuous_home: { total: 0, patient_days: 0 },
    inpatient_respite: { total: 0, patient_days: 0 },
    general_inpatient: { total: 0, patient_days: 0 },
    totalExpenses: 0,
    worksheetTotals: {
      A: 0,
      B: 0,
      C: 0,
      F: 0,
    },
  };

  expenses
    .filter((e) => {
      const expenseDate = new Date(e.expenseDate);
      return expenseDate >= fiscalYearStart && expenseDate <= fiscalYearEnd;
    })
    .forEach((expense) => {
      const amount = parseFloat(expense.amount as unknown as string);

      // Add to level of care totals
      if (expense.levelOfCare) {
        summary[expense.levelOfCare].total += amount;
      }

      // Add to worksheet totals
      summary.worksheetTotals[expense.cmsWorksheet] += amount;

      // Add to total expenses
      summary.totalExpenses += amount;
    });

  return summary;
}

/**
 * Generate CAHPS CSV Export Data
 */
export interface CAHPSExportRow {
  Decedent_Last_Name: string;
  Decedent_First_Name: string;
  Date_of_Death: string;
  Caregiver_Last_Name: string;
  Caregiver_First_Name: string;
  Caregiver_Address: string;
  Caregiver_City: string;
  Caregiver_State: string;
  Caregiver_Zip: string;
}

export function generateCAHPSExportData(
  patients: HospicePatient[],
  caregivers: HospiceCaregiver[]
): CAHPSExportRow[] {
  const exportData: CAHPSExportRow[] = [];

  patients.forEach((patient) => {
    const caregiver = caregivers.find(
      (c) => c.patientId === patient.id && c.isPrimaryCaregiver
    );

    if (!caregiver || !isCAHPSEligible(patient, caregiver)) {
      return; // Skip ineligible patients
    }

    // Parse patient name (assuming format "First Last")
    const patientNameParts = (patient.userId || "Unknown Patient").split(" ");
    const patientFirstName = patientNameParts[0] || "";
    const patientLastName = patientNameParts.slice(1).join(" ") || "";

    // Parse caregiver name
    const caregiverNameParts = caregiver.caregiverName.split(" ");
    const caregiverFirstName = caregiverNameParts[0] || "";
    const caregiverLastName = caregiverNameParts.slice(1).join(" ") || "";

    exportData.push({
      Decedent_Last_Name: patientLastName,
      Decedent_First_Name: patientFirstName,
      Date_of_Death: patient.dateOfDeath
        ? new Date(patient.dateOfDeath).toISOString().split("T")[0]
        : "",
      Caregiver_Last_Name: caregiverLastName,
      Caregiver_First_Name: caregiverFirstName,
      Caregiver_Address: caregiver.addressLine1,
      Caregiver_City: caregiver.city,
      Caregiver_State: caregiver.state,
      Caregiver_Zip: caregiver.zipCode,
    });
  });

  return exportData;
}

/**
 * Convert CAHPS export data to CSV string
 */
export function generateCAHPSCSV(data: CAHPSExportRow[]): string {
  const headers = [
    "Decedent_Last_Name",
    "Decedent_First_Name",
    "Date_of_Death",
    "Caregiver_Last_Name",
    "Caregiver_First_Name",
    "Caregiver_Address",
    "Caregiver_City",
    "Caregiver_State",
    "Caregiver_Zip",
  ];

  const csvRows = [headers.join(",")];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header as keyof CAHPSExportRow];
      // Escape commas and quotes in values
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}
