import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Medical Records Tables
export const medicalRecords = mysqlTable("medical_records", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  documentType: mysqlEnum("document_type", [
    "lab_report",
    "radiology_report",
    "prescription",
    "discharge_summary",
    "consultation_note",
    "insurance_card",
    "vaccination_record",
    "other",
  ]).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // pdf, jpg, png, etc.
  fileSize: int("file_size").notNull(), // in bytes
  documentDate: timestamp("document_date"),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  category: varchar("category", { length: 100 }), // e.g., "Cardiology", "Endocrinology"
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const imagingAnalyses = mysqlTable("imaging_analyses", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  medicalRecordId: varchar("medical_record_id", { length: 128 }), // link to medical_records if uploaded there
  imagingType: mysqlEnum("imaging_type", [
    "xray",
    "ct_scan",
    "mri",
    "ultrasound",
    "pet_scan",
    "mammogram",
    "other",
  ]).notNull(),
  bodyPart: varchar("body_part", { length: 100 }).notNull(),
  studyDate: timestamp("study_date"),
  imagePaths: json("image_paths").$type<string[]>().notNull(), // array of S3 URLs
  aiAnalysis: json("ai_analysis").$type<{
    findings: string[];
    impressions: string[];
    recommendations: string[];
    criticalFindings: string[];
    confidence: number;
  }>(),
  reportText: text("report_text"), // full structured report
  radiologistReview: text("radiologist_review"), // if reviewed by human
  status: mysqlEnum("status", [
    "pending_analysis",
    "analyzed",
    "reviewed",
  ]).notNull().default("pending_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;
export type ImagingAnalysis = typeof imagingAnalyses.$inferSelect;
export type InsertImagingAnalysis = typeof imagingAnalyses.$inferInsert;

// Hospice Tables
export const hospicePatients = mysqlTable("hospice_patients", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  admissionDate: timestamp("admission_date").notNull(),
  dischargeDate: timestamp("discharge_date"),
  levelOfCare: mysqlEnum("level_of_care", [
    "routine_home",
    "continuous_home",
    "inpatient_respite",
    "general_inpatient",
  ]).notNull(),
  primaryDiagnosis: text("primary_diagnosis").notNull(),
  secondaryDiagnoses: json("secondary_diagnoses").$type<string[]>(),
  attendingPhysician: text("attending_physician").notNull(),
  hospicePhysician: text("hospice_physician").notNull(),
  status: mysqlEnum("status", ["active", "discharged", "deceased"])
    .notNull()
    .default("active"),
  dateOfDeath: timestamp("date_of_death"),
  locationOfDeath: text("location_of_death"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceAssessments = mysqlTable("hospice_assessments", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  assessmentType: mysqlEnum("assessment_type", ["admission", "discharge"]).notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),

  // Seven Care Processes (HIS CBE #3235)
  painScreeningCompleted: boolean("pain_screening_completed")
    .notNull()
    .default(false),
  painIntensityScore: int("pain_intensity_score"),
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
  submissionStatus: mysqlEnum("submission_status", [
    "pending",
    "ready",
    "submitted",
    "accepted",
    "rejected",
  ])
    .notNull()
    .default("pending"),
  submissionDate: timestamp("submission_date"),
  submissionDeadline: timestamp("submission_deadline").notNull(),
  iqiesConfirmationNumber: varchar("iqies_confirmation_number", { length: 255 }),
  validationErrors: json("validation_errors").$type<
    Array<{ field: string; message: string }>
  >(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceVisits = mysqlTable("hospice_visits", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  visitType: mysqlEnum("visit_type", [
    "skilled_nursing",
    "social_work",
    "chaplain",
    "volunteer",
    "aide",
  ]).notNull(),
  visitDate: timestamp("visit_date").notNull(),
  clinicianName: text("clinician_name").notNull(),
  clinicianRole: text("clinician_role").notNull(),
  durationMinutes: int("duration_minutes").notNull(),
  visitNotes: text("visit_notes"),
  servicesProvided: json("services_provided").$type<string[]>(),
  nextVisitScheduled: timestamp("next_visit_scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceExpenses = mysqlTable("hospice_expenses", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }),
  expenseDate: timestamp("expense_date").notNull(),
  costCenter: mysqlEnum("cost_center", [
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
  ]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  levelOfCare: mysqlEnum("level_of_care", [
    "routine_home",
    "continuous_home",
    "inpatient_respite",
    "general_inpatient",
  ]),
  cmsWorksheet: mysqlEnum("cms_worksheet", ["A", "B", "C", "F"]).notNull(),
  description: text("description").notNull(),
  vendor: text("vendor"),
  invoiceNumber: varchar("invoice_number", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceCaregivers = mysqlTable("hospice_caregivers", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  caregiverName: text("caregiver_name").notNull(),
  relationship: text("relationship").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  isPrimaryCaregiver: boolean("is_primary_caregiver").notNull().default(false),
  cahpsEligible: boolean("cahps_eligible").notNull().default(false),
  cahpsSurveySent: boolean("cahps_survey_sent").notNull().default(false),
  cahpsSurveySentDate: timestamp("cahps_survey_sent_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceComplianceAlerts = mysqlTable("hospice_compliance_alerts", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  alertType: mysqlEnum("alert_type", [
    "his_submission_due",
    "hope_submission_due",
    "visit_gap",
    "cahps_export_due",
    "cost_report_due",
  ]).notNull(),
  alertLevel: mysqlEnum("alert_level", ["green", "yellow", "red"]).notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["active", "resolved", "dismissed"])
    .notNull()
    .default("active"),
  resolvedDate: timestamp("resolved_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
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
export type NewHospiceComplianceAlert = typeof hospiceComplianceAlerts.$inferInsert;

// Medication Tracker Tables
export const medications = mysqlTable("medications", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  name: text("name").notNull(),
  dosage: varchar("dosage", { length: 255 }).notNull(),
  frequency: varchar("frequency", { length: 255 }).notNull(), // e.g., "Once daily", "Twice daily", "Every 8 hours"
  instructions: text("instructions"),
  prescribedBy: text("prescribed_by"),
  pharmacy: text("pharmacy"),
  refillsRemaining: int("refills_remaining"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  reminderTimes: json("reminder_times"), // Array of time strings like ["08:00", "20:00"]
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const medicationLogs = mysqlTable("medication_logs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  medicationId: varchar("medication_id", { length: 128 }).notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  takenAt: timestamp("taken_at").notNull(),
  status: mysqlEnum("status", ["taken", "skipped", "missed"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vitals Tracker Tables
export const vitals = mysqlTable("vitals", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  vitalType: mysqlEnum("vital_type", [
    "blood_pressure",
    "heart_rate",
    "blood_glucose",
    "weight",
    "temperature",
    "oxygen_saturation",
  ]).notNull(),
  systolic: int("systolic"), // For blood pressure
  diastolic: int("diastolic"), // For blood pressure
  value: decimal("value", { precision: 10, scale: 2 }), // For other vitals
  unit: varchar("unit", { length: 50 }), // e.g., "bpm", "mg/dL", "lbs", "°F", "%"
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Type exports
export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type NewMedicationLog = typeof medicationLogs.$inferInsert;

export type Vital = typeof vitals.$inferSelect;
export type NewVital = typeof vitals.$inferInsert;


// ============================================================================
// MEDICAL RECORDS MANAGEMENT SYSTEM
// Multi-patient family medical history tracking with lab results and reports
// ============================================================================

export const patients = mysqlTable("patients", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(), // Owner of this patient record
  name: text("name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  medicalRecordNumber: varchar("medical_record_number", { length: 100 }).unique(),
  photoUrl: text("photo_url"),
  relationship: varchar("relationship", { length: 50 }), // self, spouse, parent, child, etc.
  emergencyContact: text("emergency_contact"),
  primaryPhysician: text("primary_physician"),
  insuranceInfo: json("insurance_info").$type<{
    company?: string;
    policyNumber?: string;
    groupNumber?: string;
    memberId?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const labResults = mysqlTable("lab_results", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  testDate: timestamp("test_date").notNull(),
  testName: text("test_name").notNull(),
  result: decimal("result", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  referenceRange: varchar("reference_range", { length: 100 }),
  status: mysqlEnum("status", ["Normal", "High", "Low"]).notNull(),
  category: mysqlEnum("category", [
    "Blood Count",
    "Lipids",
    "Kidney",
    "Liver",
    "Electrolytes",
    "Diabetes",
    "Thyroid",
    "Iron Studies",
    "Autoimmune",
    "Vitamins",
    "Metabolic",
    "Other",
  ]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patientDocuments = mysqlTable("patient_documents", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  documentName: text("document_name").notNull(),
  documentType: mysqlEnum("document_type", [
    "Lab Report",
    "Imaging Study",
    "Medical Report",
    "Prescription",
    "Other",
  ]).notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: int("file_size"), // in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patientReports = mysqlTable("patient_reports", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  reportDate: timestamp("report_date").notNull(),
  reportType: mysqlEnum("report_type", [
    "Comprehensive Medical Report",
    "Quick Summary",
    "Findings by System",
    "Action Plan",
  ]).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const chartImages = mysqlTable("chart_images", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  chartName: text("chart_name").notNull(),
  chartCategory: varchar("chart_category", { length: 100 }),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for medical records management
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = typeof labResults.$inferInsert;

export type PatientDocument = typeof patientDocuments.$inferSelect;
export type InsertPatientDocument = typeof patientDocuments.$inferInsert;

export type PatientReport = typeof patientReports.$inferSelect;
export type InsertPatientReport = typeof patientReports.$inferInsert;

export type ChartImage = typeof chartImages.$inferSelect;
export type InsertChartImage = typeof chartImages.$inferInsert;


// ============================================================================
// Family Sharing & Caregiver Access Tables
// ============================================================================

/**
 * Family Connections Table
 * Links users in family/caregiver relationships
 */
export const familyConnections = mysqlTable("family_connections", {
  id: varchar("id", { length: 128 }).primaryKey(),
  
  // The user who owns the health data
  patientUserId: varchar("patient_user_id", { length: 128 }).notNull(),
  
  // The family member/caregiver who has access
  caregiverUserId: varchar("caregiver_user_id", { length: 128 }).notNull(),
  
  // Type of relationship
  relationshipType: mysqlEnum("relationship_type", [
    "parent",
    "child",
    "spouse",
    "caregiver",
    "guardian",
    "sibling",
    "other",
  ]).notNull(),
  
  // Permission level granted
  permissionLevel: mysqlEnum("permission_level", [
    "view_only",      // Can view data but not modify
    "alerts",         // Can view data and receive alerts
    "full_access",    // Can view, modify, and manage settings
  ]).notNull().default("view_only"),
  
  // Whether the connection is active
  isActive: boolean("is_active").notNull().default(true),
  
  // Whether the patient approved this connection
  isApproved: boolean("is_approved").notNull().default(false),
  
  // Invitation token for pending connections
  invitationToken: text("invitation_token"),
  
  // When the invitation expires
  invitationExpiresAt: timestamp("invitation_expires_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

/**
 * Alert Forwarding Settings
 * Controls which alerts are forwarded to family members
 */
export const alertForwardingSettings = mysqlTable("alert_forwarding_settings", {
  id: varchar("id", { length: 128 }).primaryKey(),
  
  // The family connection this applies to
  familyConnectionId: varchar("family_connection_id", { length: 128 }).notNull(),
  
  // Alert types to forward
  forwardGlucoseAlerts: boolean("forward_glucose_alerts").notNull().default(true),
  forwardMedicationAlerts: boolean("forward_medication_alerts").notNull().default(true),
  forwardAppointmentAlerts: boolean("forward_appointment_alerts").notNull().default(false),
  forwardEmergencyAlerts: boolean("forward_emergency_alerts").notNull().default(true),
  
  // Time restrictions (24-hour format)
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // e.g., "22:00"
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }),     // e.g., "08:00"
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Shared Health Data Access Log
 * Audit trail of family member data access
 */
export const sharedDataAccessLog = mysqlTable("shared_data_access_log", {
  id: varchar("id", { length: 128 }).primaryKey(),
  
  // The family connection
  familyConnectionId: varchar("family_connection_id", { length: 128 }).notNull(),
  
  // What was accessed
  dataType: varchar("data_type", { length: 50 }).notNull(), // "glucose", "medications", "reports", etc.
  action: varchar("action", { length: 50 }).notNull(),      // "viewed", "exported", "modified"
  
  // Details
  details: text("details"), // JSON string with additional context
  
  // Timestamp
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

// Type exports for family sharing
export type FamilyConnection = typeof familyConnections.$inferSelect;
export type InsertFamilyConnection = typeof familyConnections.$inferInsert;

export type AlertForwardingSetting = typeof alertForwardingSettings.$inferSelect;
export type InsertAlertForwardingSetting = typeof alertForwardingSettings.$inferInsert;

export type SharedDataAccessLog = typeof sharedDataAccessLog.$inferSelect;
export type InsertSharedDataAccessLog = typeof sharedDataAccessLog.$inferInsert;
