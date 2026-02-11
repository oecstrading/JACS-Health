import { pgTable, text, timestamp, boolean, integer, decimal, json, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Enums
export const levelOfCareEnum = pgEnum("level_of_care", [
  "routine_home",
  "continuous_home",
  "inpatient_respite",
  "general_inpatient",
]);

export const patientStatusEnum = pgEnum("patient_status", [
  "active",
  "discharged",
  "deceased",
]);

export const assessmentTypeEnum = pgEnum("assessment_type", [
  "admission",
  "discharge",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "ready",
  "submitted",
  "accepted",
  "rejected",
]);

export const visitTypeEnum = pgEnum("visit_type", [
  "skilled_nursing",
  "social_work",
  "chaplain",
  "volunteer",
  "aide",
]);

export const costCenterEnum = pgEnum("cost_center", [
  "nursing",
  "therapy",
  "social_work",
  "chaplain",
  "volunteer",
  "aide",
  "medical_supplies",
  "medications",
  "dme",
  "telehealth_salaries",
  "telehealth_equipment",
  "administrative",
  "facility",
  "other",
]);

export const cmsWorksheetEnum = pgEnum("cms_worksheet", ["A", "B", "C", "F"]);

export const alertTypeEnum = pgEnum("alert_type", [
  "his_submission_due",
  "hope_submission_due",
  "visit_gap",
  "cahps_export_due",
  "cost_report_due",
]);

export const alertLevelEnum = pgEnum("alert_level", ["green", "yellow", "red"]);

export const alertStatusEnum = pgEnum("alert_status", [
  "active",
  "resolved",
  "dismissed",
]);

// Tables
export const hospicePatients = pgTable("hospice_patients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(), // Reference to users table
  admissionDate: timestamp("admission_date").notNull(),
  dischargeDate: timestamp("discharge_date"),
  levelOfCare: levelOfCareEnum("level_of_care").notNull(),
  primaryDiagnosis: text("primary_diagnosis").notNull(),
  secondaryDiagnoses: json("secondary_diagnoses").$type<string[]>().default([]),
  attendingPhysician: text("attending_physician").notNull(),
  hospicePhysician: text("hospice_physician").notNull(),
  status: patientStatusEnum("status").notNull().default("active"),
  dateOfDeath: timestamp("date_of_death"),
  locationOfDeath: text("location_of_death"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hospiceAssessments = pgTable("hospice_assessments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => hospicePatients.id, { onDelete: "cascade" }),
  assessmentType: assessmentTypeEnum("assessment_type").notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),

  // Seven Care Processes (HIS CBE #3235)
  painScreeningCompleted: boolean("pain_screening_completed")
    .notNull()
    .default(false),
  painIntensityScore: integer("pain_intensity_score"), // 0-10 scale
  dyspneaScreeningCompleted: boolean("dyspnea_screening_completed")
    .notNull()
    .default(false),
  dyspneaTreatmentProvided: boolean("dyspnea_treatment_provided")
    .notNull()
    .default(false),
  treatmentPreferencesDiscussed: boolean("treatment_preferences_discussed")
    .notNull()
    .default(false),
  spiritualConcernsAddressed: boolean("spiritual_concerns_addressed")
    .notNull()
    .default(false),
  emotionalSupportProvided: boolean("emotional_support_provided")
    .notNull()
    .default(false),
  caregiverEducationCompleted: boolean("caregiver_education_completed")
    .notNull()
    .default(false),
  advanceDirectivesDocumented: boolean("advance_directives_documented")
    .notNull()
    .default(false),

  // Submission tracking
  submissionStatus: submissionStatusEnum("submission_status")
    .notNull()
    .default("pending"),
  submissionDate: timestamp("submission_date"),
  submissionDeadline: timestamp("submission_deadline").notNull(), // admission_date + 30 days
  iqiesConfirmationNumber: text("iqies_confirmation_number"),
  validationErrors: json("validation_errors").$type<
    Array<{ field: string; message: string }>
  >(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hospiceVisits = pgTable("hospice_visits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => hospicePatients.id, { onDelete: "cascade" }),
  visitType: visitTypeEnum("visit_type").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  clinicianName: text("clinician_name").notNull(),
  clinicianRole: text("clinician_role").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  visitNotes: text("visit_notes"),
  servicesProvided: json("services_provided").$type<string[]>().default([]),
  nextVisitScheduled: timestamp("next_visit_scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hospiceExpenses = pgTable("hospice_expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id").references(() => hospicePatients.id, {
    onDelete: "set null",
  }),
  expenseDate: timestamp("expense_date").notNull(),
  costCenter: costCenterEnum("cost_center").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  levelOfCare: levelOfCareEnum("level_of_care"),
  cmsWorksheet: cmsWorksheetEnum("cms_worksheet").notNull(),
  description: text("description").notNull(),
  vendor: text("vendor"),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hospiceCaregivers = pgTable("hospice_caregivers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => hospicePatients.id, { onDelete: "cascade" }),
  caregiverName: text("caregiver_name").notNull(),
  relationship: text("relationship").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  isPrimaryCaregiver: boolean("is_primary_caregiver").notNull().default(false),
  cahpsEligible: boolean("cahps_eligible").notNull().default(false),
  cahpsSurveySent: boolean("cahps_survey_sent").notNull().default(false),
  cahpsSurveySentDate: timestamp("cahps_survey_sent_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hospiceComplianceAlerts = pgTable("hospice_compliance_alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .notNull()
    .references(() => hospicePatients.id, { onDelete: "cascade" }),
  alertType: alertTypeEnum("alert_type").notNull(),
  alertLevel: alertLevelEnum("alert_level").notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  status: alertStatusEnum("status").notNull().default("active"),
  resolvedDate: timestamp("resolved_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type HospicePatient = typeof hospicePatients.$inferSelect;
export type NewHospicePatient = typeof hospicePatients.$inferInsert;

export type HospiceAssessment = typeof hospiceAssessments.$inferSelect;
export type NewHospiceAssessment = typeof hospiceAssessments.$inferInsert;

export type HospiceVisit = typeof hospiceVisits.$inferSelect;
export type NewHospiceVisit = typeof hospiceVisits.$inferInsert;

export type HospiceExpense = typeof hospiceExpenses.$inferSelect;
export type NewHospiceExpense = typeof hospiceExpenses.$inferInsert;

export type HospiceCaregiver = typeof hospiceCaregivers.$inferSelect;
export type NewHospiceCaregiver = typeof hospiceCaregivers.$inferInsert;

export type HospiceComplianceAlert = typeof hospiceComplianceAlerts.$inferSelect;
export type NewHospiceComplianceAlert =
  typeof hospiceComplianceAlerts.$inferInsert;
