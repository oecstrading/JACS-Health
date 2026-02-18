/**
 * Patient Intake Form Templates Library
 * 
 * Pre-configured templates for common appointment types to reduce
 * form completion time and improve data accuracy.
 */

import type { PatientIntakeForm } from "./patientIntake";

export interface IntakeTemplate {
  id: string;
  name: string;
  description: string;
  appointmentType: string;
  icon: string;
  estimatedMinutes: number;
  requiredSections: string[];
  optionalSections: string[];
  skipLogic: Record<string, any>;
  prePopulateFields: string[];
  customQuestions?: Array<{
    id: string;
    question: string;
    type: "text" | "select" | "boolean" | "date";
    options?: string[];
    required: boolean;
  }>;
}

export const INTAKE_TEMPLATES: IntakeTemplate[] = [
  {
    id: "annual_physical",
    name: "Annual Physical Exam",
    description: "Comprehensive yearly wellness checkup for preventive care and health screening",
    appointmentType: "Annual Physical",
    icon: "heart.text.square.fill",
    estimatedMinutes: 12,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
    ],
    customQuestions: [
      {
        id: "last_physical_date",
        question: "When was your last physical exam?",
        type: "date",
        required: false,
      },
      {
        id: "health_concerns",
        question: "Do you have any specific health concerns you'd like to discuss?",
        type: "text",
        required: false,
      },
      {
        id: "screening_preferences",
        question: "Are you interested in any specific health screenings? (e.g., cholesterol, diabetes, cancer screening)",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "specialist_consultation",
    name: "Specialist Consultation",
    description: "Initial visit with a medical specialist for focused evaluation and treatment planning",
    appointmentType: "Specialist Consultation",
    icon: "stethoscope",
    estimatedMinutes: 10,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance", "familyHistory", "socialHistory"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "medicalHistory",
    ],
    customQuestions: [
      {
        id: "referring_physician",
        question: "Who referred you to this specialist?",
        type: "text",
        required: true,
      },
      {
        id: "referral_reason",
        question: "What is the reason for this referral?",
        type: "text",
        required: true,
      },
      {
        id: "symptom_duration",
        question: "How long have you been experiencing these symptoms?",
        type: "select",
        options: [
          "Less than 1 week",
          "1-4 weeks",
          "1-3 months",
          "3-6 months",
          "6-12 months",
          "More than 1 year",
        ],
        required: true,
      },
      {
        id: "previous_treatment",
        question: "Have you received any treatment for this condition? If yes, please describe.",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "surgery_preop",
    name: "Surgery Pre-Operative",
    description: "Pre-surgical evaluation and clearance for planned surgical procedures",
    appointmentType: "Pre-Op Evaluation",
    icon: "cross.case.fill",
    estimatedMinutes: 15,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    customQuestions: [
      {
        id: "planned_surgery",
        question: "What surgery are you scheduled for?",
        type: "text",
        required: true,
      },
      {
        id: "surgery_date",
        question: "What is your scheduled surgery date?",
        type: "date",
        required: true,
      },
      {
        id: "surgeon_name",
        question: "Who is your surgeon?",
        type: "text",
        required: true,
      },
      {
        id: "previous_surgeries",
        question: "Have you had any previous surgeries? If yes, please list them.",
        type: "text",
        required: true,
      },
      {
        id: "anesthesia_history",
        question: "Have you ever had problems with anesthesia?",
        type: "boolean",
        required: true,
      },
      {
        id: "anesthesia_details",
        question: "If yes, please describe the problems you experienced with anesthesia.",
        type: "text",
        required: false,
      },
      {
        id: "bleeding_disorders",
        question: "Do you have any bleeding disorders or problems with blood clotting?",
        type: "boolean",
        required: true,
      },
      {
        id: "blood_thinners",
        question: "Are you currently taking any blood thinners? (e.g., Warfarin, Plavix, Aspirin)",
        type: "boolean",
        required: true,
      },
    ],
  },
  {
    id: "new_patient",
    name: "New Patient Visit",
    description: "Comprehensive intake for first-time patients establishing care with a new provider",
    appointmentType: "New Patient",
    icon: "person.badge.plus",
    estimatedMinutes: 15,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
    ],
    customQuestions: [
      {
        id: "previous_provider",
        question: "Who was your previous primary care provider?",
        type: "text",
        required: false,
      },
      {
        id: "medical_records",
        question: "Would you like us to request your medical records from your previous provider?",
        type: "boolean",
        required: true,
      },
      {
        id: "reason_for_visit",
        question: "What is the main reason for your visit today?",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "followup_visit",
    name: "Follow-Up Visit",
    description: "Return visit for ongoing care, treatment monitoring, or test result review",
    appointmentType: "Follow-Up",
    icon: "arrow.clockwise",
    estimatedMinutes: 5,
    requiredSections: [
      "demographics",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: [
      "emergencyContacts",
      "primaryInsurance",
      "secondaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "medicalHistory",
    ],
    customQuestions: [
      {
        id: "last_visit_date",
        question: "When was your last visit?",
        type: "date",
        required: false,
      },
      {
        id: "followup_reason",
        question: "What is the reason for this follow-up visit?",
        type: "select",
        options: [
          "Medication check",
          "Test results review",
          "Treatment progress",
          "New symptoms",
          "Routine follow-up",
          "Other",
        ],
        required: true,
      },
      {
        id: "medication_changes",
        question: "Have there been any changes to your medications since your last visit?",
        type: "boolean",
        required: true,
      },
      {
        id: "new_symptoms",
        question: "Have you experienced any new symptoms or side effects?",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "urgent_care",
    name: "Urgent Care Visit",
    description: "Immediate care for non-life-threatening acute illnesses or injuries",
    appointmentType: "Urgent Care",
    icon: "bolt.fill",
    estimatedMinutes: 8,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: [
      "secondaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
    ],
    customQuestions: [
      {
        id: "chief_complaint",
        question: "What is your main complaint or reason for this urgent visit?",
        type: "text",
        required: true,
      },
      {
        id: "symptom_onset",
        question: "When did your symptoms start?",
        type: "select",
        options: [
          "Within the last hour",
          "1-6 hours ago",
          "6-24 hours ago",
          "1-3 days ago",
          "More than 3 days ago",
        ],
        required: true,
      },
      {
        id: "pain_level",
        question: "On a scale of 1-10, how would you rate your pain? (1 = minimal, 10 = severe)",
        type: "select",
        options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        required: false,
      },
      {
        id: "injury_cause",
        question: "If this is an injury, how did it happen?",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "telemedicine",
    name: "Telemedicine Visit",
    description: "Virtual consultation via video or phone for remote healthcare services",
    appointmentType: "Telemedicine",
    icon: "video.fill",
    estimatedMinutes: 7,
    requiredSections: [
      "demographics",
      "primaryInsurance",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: [
      "emergencyContacts",
      "secondaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "primaryInsurance",
      "medications",
      "allergies",
    ],
    customQuestions: [
      {
        id: "visit_reason",
        question: "What would you like to discuss during this telemedicine visit?",
        type: "text",
        required: true,
      },
      {
        id: "tech_check",
        question: "Do you have a working camera and microphone for the video call?",
        type: "boolean",
        required: true,
      },
      {
        id: "preferred_contact",
        question: "What is the best phone number to reach you if we have technical difficulties?",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "wellness_exam",
    name: "Wellness Exam",
    description: "Preventive health assessment focusing on lifestyle, nutrition, and disease prevention",
    appointmentType: "Wellness Exam",
    icon: "leaf.fill",
    estimatedMinutes: 10,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    customQuestions: [
      {
        id: "wellness_goals",
        question: "What are your main health and wellness goals?",
        type: "text",
        required: false,
      },
      {
        id: "diet_assessment",
        question: "How would you describe your current diet?",
        type: "select",
        options: [
          "Very healthy",
          "Mostly healthy",
          "Somewhat healthy",
          "Needs improvement",
          "Poor",
        ],
        required: false,
      },
      {
        id: "exercise_frequency",
        question: "How many days per week do you exercise?",
        type: "select",
        options: ["0", "1-2", "3-4", "5-6", "7"],
        required: false,
      },
      {
        id: "stress_level",
        question: "How would you rate your current stress level?",
        type: "select",
        options: ["Low", "Moderate", "High", "Very High"],
        required: false,
      },
      {
        id: "sleep_hours",
        question: "How many hours of sleep do you typically get per night?",
        type: "select",
        options: ["Less than 5", "5-6", "7-8", "9 or more"],
        required: false,
      },
    ],
  },
  {
    id: "chronic_disease",
    name: "Chronic Disease Management",
    description: "Ongoing care coordination for chronic conditions like diabetes, hypertension, or heart disease",
    appointmentType: "Chronic Disease Management",
    icon: "heart.text.square",
    estimatedMinutes: 12,
    requiredSections: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
      "medications",
      "allergies",
      "hipaaAuthorization",
    ],
    optionalSections: ["secondaryInsurance"],
    skipLogic: {},
    prePopulateFields: [
      "demographics",
      "emergencyContacts",
      "primaryInsurance",
      "medications",
      "allergies",
      "medicalHistory",
      "familyHistory",
      "socialHistory",
    ],
    customQuestions: [
      {
        id: "primary_condition",
        question: "What is the primary chronic condition you are managing?",
        type: "select",
        options: [
          "Diabetes",
          "Hypertension",
          "Heart Disease",
          "COPD",
          "Asthma",
          "Arthritis",
          "Kidney Disease",
          "Other",
        ],
        required: true,
      },
      {
        id: "condition_duration",
        question: "How long have you been managing this condition?",
        type: "select",
        options: [
          "Less than 1 year",
          "1-5 years",
          "5-10 years",
          "More than 10 years",
        ],
        required: true,
      },
      {
        id: "home_monitoring",
        question: "Do you monitor any vital signs at home? (e.g., blood pressure, blood sugar)",
        type: "boolean",
        required: true,
      },
      {
        id: "recent_readings",
        question: "If yes, what are your most recent readings?",
        type: "text",
        required: false,
      },
      {
        id: "medication_adherence",
        question: "How often do you take your medications as prescribed?",
        type: "select",
        options: [
          "Always",
          "Most of the time",
          "Sometimes",
          "Rarely",
          "Never",
        ],
        required: true,
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): IntakeTemplate | undefined {
  return INTAKE_TEMPLATES.find((t) => t.id === templateId);
}

/**
 * Get all templates
 */
export function getAllTemplates(): IntakeTemplate[] {
  return INTAKE_TEMPLATES;
}

/**
 * Apply template to intake form
 * Pre-fills form structure based on template configuration
 */
export function applyTemplateToForm(
  form: PatientIntakeForm,
  template: IntakeTemplate
): PatientIntakeForm {
  // Update form metadata
  form.forProvider = template.appointmentType;
  
  // Mark sections as required or optional based on template
  // This would be used by the UI to show/hide sections
  
  // Add custom questions to form
  // This would extend the form with template-specific questions
  
  return form;
}

/**
 * Recommend template based on appointment type
 */
export function recommendTemplate(appointmentType: string): IntakeTemplate | undefined {
  const lowerType = appointmentType.toLowerCase();
  
  // Exact match
  let template = INTAKE_TEMPLATES.find((t) => 
    t.appointmentType.toLowerCase() === lowerType
  );
  
  if (template) return template;
  
  // Partial match
  template = INTAKE_TEMPLATES.find((t) => 
    t.appointmentType.toLowerCase().includes(lowerType) ||
    lowerType.includes(t.appointmentType.toLowerCase())
  );
  
  if (template) return template;
  
  // Default to new patient template
  return getTemplateById("new_patient");
}
