import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Smart Voice Intake Service
 * 
 * Digitizes the New Patient Intake Form (Patient Registration Packet)
 * with voice-guided data entry, intelligent pre-fill, and PDF generation.
 * Based on Texas Medical Association standard intake forms.
 */

// ==================== DATA MODELS ====================

export interface Demographics {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO format
  ssn?: string; // Last 4 digits only for security
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "separated";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email?: string;
  preferredLanguage?: string;
  race?: string;
  ethnicity?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

export interface Insurance {
  isPrimary: boolean;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDOB: string;
  relationshipToSubscriber: "self" | "spouse" | "child" | "other";
  effectiveDate?: string;
  copay?: number;
}

export interface MedicalHistory {
  chronicConditions: string[]; // e.g., "Type 2 Diabetes", "Hypertension"
  surgeries: Array<{
    procedure: string;
    date: string;
    hospital?: string;
  }>;
  hospitalizations: Array<{
    reason: string;
    date: string;
    hospital?: string;
    duration?: string;
  }>;
  currentSymptoms?: string[];
  disabilities?: string[];
  pregnancyStatus?: "pregnant" | "not_pregnant" | "not_applicable";
  lastPhysicalExam?: string;
}

export interface FamilyHistory {
  cancer?: Array<{
    relative: string; // "mother", "father", "sibling", etc.
    type: string;
    ageAtDiagnosis?: number;
  }>;
  heartDisease?: Array<{
    relative: string;
    type: string;
    ageAtDiagnosis?: number;
  }>;
  stroke?: Array<{
    relative: string;
    ageAtDiagnosis?: number;
  }>;
  diabetes?: Array<{
    relative: string;
    type: "type1" | "type2";
    ageAtDiagnosis?: number;
  }>;
  other?: Array<{
    condition: string;
    relative: string;
  }>;
}

export interface SocialHistory {
  smokingStatus: "never" | "former" | "current";
  smokingPackYears?: number; // If former/current smoker
  quitDate?: string; // If former smoker
  alcoholUse: "never" | "occasional" | "moderate" | "heavy";
  drinksPerWeek?: number;
  recreationalDrugs: "never" | "former" | "current";
  exerciseFrequency: "sedentary" | "light" | "moderate" | "active";
  exerciseMinutesPerWeek?: number;
  occupation?: string;
  occupationalHazards?: string[];
  livingArrangement: "alone" | "with_spouse" | "with_family" | "assisted_living" | "other";
  maritalStatus?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string; // e.g., "twice daily", "as needed"
  route: string; // e.g., "oral", "injection", "topical"
  prescribingDoctor?: string;
  startDate?: string;
  reason?: string;
}

export interface Allergy {
  allergen: string;
  type: "drug" | "food" | "environmental" | "latex" | "other";
  reaction: string; // e.g., "rash", "anaphylaxis", "nausea"
  severity: "mild" | "moderate" | "severe";
  dateDiscovered?: string;
}

export interface HIPAAConsent {
  consentToTreat: boolean;
  consentToShareData: boolean;
  authorizedPersons: string[]; // Names of people authorized to receive health info
  signatureData?: string; // Base64 encoded signature image
  signatureDate?: string;
  voiceConsentRecording?: string; // Path to audio file
}

export interface PatientIntakeForm {
  id: string;
  status: "draft" | "in_progress" | "completed" | "submitted";
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
  
  // Main sections
  demographics: Demographics;
  emergencyContacts: EmergencyContact[];
  primaryInsurance?: Insurance;
  secondaryInsurance?: Insurance;
  medicalHistory: MedicalHistory;
  familyHistory: FamilyHistory;
  socialHistory: SocialHistory;
  medications: Medication[];
  allergies: Allergy[];
  hipaaConsent: HIPAAConsent;
  
  // HIPAA Compliance (Phase 21)
  nppVersion?: string; // NPP version acknowledged
  hipaaAuthorization?: { authorized: boolean; date?: string };
  treatmentConsent?: { consented: boolean; date?: string };
  sensitiveHealthConsent?: { consented: boolean; date?: string };
  signature?: string; // Base64 encoded signature or voice consent ID
  
  // Metadata
  forProvider?: string; // Doctor/clinic name
  appointmentDate?: string;
  submittedAt?: string;
  pdfPath?: string; // Path to generated PDF
}

// ==================== INTAKE QUESTIONS ====================

export interface IntakeQuestion {
  id: string;
  section: keyof PatientIntakeForm;
  field: string;
  question: string;
  voicePrompt: string; // What the AI says
  type: "text" | "date" | "select" | "multiselect" | "number" | "boolean";
  options?: string[]; // For select/multiselect
  required: boolean;
  validation?: (value: any) => boolean;
  skipLogic?: (formData: Partial<PatientIntakeForm>) => boolean; // Skip if returns true
  helpText?: string; // "Why we need this"
  example?: string;
}

// ==================== SERVICE CLASS ====================

class PatientIntakeService {
  private readonly STORAGE_KEY_FORMS = "patient_intake_forms";
  private readonly STORAGE_KEY_CURRENT = "current_intake_form";

  /**
   * Get all intake questions in order
   */
  getIntakeQuestions(): IntakeQuestion[] {
    return [
      // DEMOGRAPHICS
      {
        id: "demo_first_name",
        section: "demographics",
        field: "firstName",
        question: "What is your first name?",
        voicePrompt: "Let's start with your personal information. What is your first name?",
        type: "text",
        required: true,
        validation: (v) => v && v.length > 0,
      },
      {
        id: "demo_last_name",
        section: "demographics",
        field: "lastName",
        question: "What is your last name?",
        voicePrompt: "And what is your last name?",
        type: "text",
        required: true,
        validation: (v) => v && v.length > 0,
      },
      {
        id: "demo_dob",
        section: "demographics",
        field: "dateOfBirth",
        question: "What is your date of birth?",
        voicePrompt: "What is your date of birth? Please say the month, day, and year.",
        type: "date",
        required: true,
        example: "January 15, 1950",
      },
      {
        id: "demo_gender",
        section: "demographics",
        field: "gender",
        question: "What is your gender?",
        voicePrompt: "What is your gender?",
        type: "select",
        options: ["male", "female", "other", "prefer_not_to_say"],
        required: true,
      },
      {
        id: "demo_address_street",
        section: "demographics",
        field: "address.street",
        question: "What is your street address?",
        voicePrompt: "What is your current mailing address? Please start with the street address.",
        type: "text",
        required: true,
        example: "123 Main Street",
      },
      {
        id: "demo_address_city",
        section: "demographics",
        field: "address.city",
        question: "What city do you live in?",
        voicePrompt: "What city?",
        type: "text",
        required: true,
      },
      {
        id: "demo_address_state",
        section: "demographics",
        field: "address.state",
        question: "What state?",
        voicePrompt: "What state?",
        type: "text",
        required: true,
        example: "Texas",
      },
      {
        id: "demo_address_zip",
        section: "demographics",
        field: "address.zipCode",
        question: "What is your ZIP code?",
        voicePrompt: "And what is your ZIP code?",
        type: "text",
        required: true,
        validation: (v) => /^\d{5}(-\d{4})?$/.test(v),
      },
      {
        id: "demo_phone",
        section: "demographics",
        field: "phone",
        question: "What is your phone number?",
        voicePrompt: "What is the best phone number to reach you?",
        type: "text",
        required: true,
        validation: (v) => /^\d{10}$/.test(v.replace(/\D/g, "")),
        example: "281-555-1234",
      },
      
      // EMERGENCY CONTACT
      {
        id: "emergency_name",
        section: "emergencyContacts",
        field: "name",
        question: "Who should we contact in case of emergency?",
        voicePrompt: "Now let's add an emergency contact. Who should we call in case of emergency?",
        type: "text",
        required: true,
        helpText: "This person will be contacted if we cannot reach you or if there is a medical emergency.",
      },
      {
        id: "emergency_relationship",
        section: "emergencyContacts",
        field: "relationship",
        question: "What is their relationship to you?",
        voicePrompt: "What is their relationship to you?",
        type: "select",
        options: ["spouse", "child", "parent", "sibling", "friend", "caregiver", "other"],
        required: true,
      },
      {
        id: "emergency_phone",
        section: "emergencyContacts",
        field: "phone",
        question: "What is their phone number?",
        voicePrompt: "What is their phone number?",
        type: "text",
        required: true,
        validation: (v) => /^\d{10}$/.test(v.replace(/\D/g, "")),
      },
      
      // INSURANCE
      {
        id: "insurance_has_primary",
        section: "primaryInsurance",
        field: "provider",
        question: "Do you have health insurance?",
        voicePrompt: "Now let's talk about your insurance. Do you have health insurance?",
        type: "boolean",
        required: true,
        helpText: "We need this to bill your insurance and determine your coverage.",
      },
      {
        id: "insurance_provider",
        section: "primaryInsurance",
        field: "provider",
        question: "Who is your insurance provider?",
        voicePrompt: "Who is your insurance provider?",
        type: "text",
        required: true,
        skipLogic: (data) => !data.primaryInsurance?.provider,
        example: "Medicare, Blue Cross Blue Shield, Aetna",
      },
      {
        id: "insurance_policy",
        section: "primaryInsurance",
        field: "policyNumber",
        question: "What is your policy number?",
        voicePrompt: "What is your policy number? You can find this on your insurance card.",
        type: "text",
        required: true,
        skipLogic: (data) => !data.primaryInsurance?.provider,
      },
      
      // MEDICAL HISTORY
      {
        id: "med_chronic_conditions",
        section: "medicalHistory",
        field: "chronicConditions",
        question: "Do you have any chronic health conditions?",
        voicePrompt: "Now let's review your medical history. Do you have any ongoing health conditions like diabetes, high blood pressure, or heart disease?",
        type: "multiselect",
        options: [
          "Type 2 Diabetes",
          "Type 1 Diabetes",
          "Hypertension",
          "Heart Disease",
          "Asthma",
          "COPD",
          "Arthritis",
          "Osteoporosis",
          "Cancer",
          "None",
        ],
        required: false,
        helpText: "This helps us provide better care and avoid medication interactions.",
      },
      {
        id: "med_surgeries",
        section: "medicalHistory",
        field: "surgeries",
        question: "Have you had any surgeries?",
        voicePrompt: "Have you had any surgeries in the past?",
        type: "boolean",
        required: false,
      },
      
      // FAMILY HISTORY
      {
        id: "family_heart_disease",
        section: "familyHistory",
        field: "heartDisease",
        question: "Does anyone in your immediate family have heart disease?",
        voicePrompt: "Now let's talk about your family health history. Does anyone in your immediate family, like parents or siblings, have heart disease?",
        type: "boolean",
        required: false,
        helpText: "Family history helps us assess your risk for certain conditions.",
      },
      {
        id: "family_diabetes",
        section: "familyHistory",
        field: "diabetes",
        question: "Does anyone in your family have diabetes?",
        voicePrompt: "Does anyone in your family have diabetes?",
        type: "boolean",
        required: false,
      },
      {
        id: "family_cancer",
        section: "familyHistory",
        field: "cancer",
        question: "Does anyone in your family have a history of cancer?",
        voicePrompt: "Does anyone in your family have a history of cancer?",
        type: "boolean",
        required: false,
      },
      
      // SOCIAL HISTORY
      {
        id: "social_smoking",
        section: "socialHistory",
        field: "smokingStatus",
        question: "Do you smoke or have you ever smoked?",
        voicePrompt: "Now some questions about your lifestyle. Do you smoke or have you ever smoked?",
        type: "select",
        options: ["never", "former", "current"],
        required: true,
      },
      {
        id: "social_alcohol",
        section: "socialHistory",
        field: "alcoholUse",
        question: "How often do you drink alcohol?",
        voicePrompt: "How often do you drink alcohol?",
        type: "select",
        options: ["never", "occasional", "moderate", "heavy"],
        required: true,
      },
      {
        id: "social_exercise",
        section: "socialHistory",
        field: "exerciseFrequency",
        question: "How often do you exercise?",
        voicePrompt: "How often do you exercise or engage in physical activity?",
        type: "select",
        options: ["sedentary", "light", "moderate", "active"],
        required: false,
      },
      
      // MEDICATIONS
      {
        id: "med_current_meds",
        section: "medications",
        field: "medications",
        question: "Are you currently taking any medications?",
        voicePrompt: "Are you currently taking any prescription medications, over-the-counter drugs, or supplements?",
        type: "boolean",
        required: true,
        helpText: "Include vitamins, supplements, and over-the-counter medications.",
      },
      
      // ALLERGIES
      {
        id: "allergy_drug",
        section: "allergies",
        field: "allergies",
        question: "Do you have any drug allergies?",
        voicePrompt: "Do you have any allergies to medications?",
        type: "boolean",
        required: true,
        helpText: "This is critical for your safety to avoid prescribing medications that could harm you.",
      },
      {
        id: "allergy_other",
        section: "allergies",
        field: "allergies",
        question: "Do you have any other allergies?",
        voicePrompt: "Do you have any other allergies, such as to latex, foods, or environmental allergens?",
        type: "boolean",
        required: false,
      },
      
      // HIPAA CONSENT
      {
        id: "hipaa_consent_treat",
        section: "hipaaConsent",
        field: "consentToTreat",
        question: "Do you consent to treatment?",
        voicePrompt: "Finally, we need your consent. Do you consent to receive medical treatment at this facility?",
        type: "boolean",
        required: true,
        helpText: "This authorizes the healthcare provider to examine and treat you.",
      },
      {
        id: "hipaa_consent_share",
        section: "hipaaConsent",
        field: "consentToShareData",
        question: "Do you consent to share your health information?",
        voicePrompt: "Do you consent to share your health information with other healthcare providers involved in your care?",
        type: "boolean",
        required: true,
        helpText: "This allows your doctors to coordinate your care and share necessary medical information.",
      },
    ];
  }

  /**
   * Intelligent pre-fill from existing health data
   */
  async preFillFromHealthData(form: PatientIntakeForm): Promise<void> {
    try {
      // Pre-fill demographics from user profile (would come from auth/profile service)
      // For now, we'll check if data exists in AsyncStorage
      const userProfile = await AsyncStorage.getItem("user_profile");
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.firstName) form.demographics.firstName = profile.firstName;
        if (profile.lastName) form.demographics.lastName = profile.lastName;
        if (profile.dateOfBirth) form.demographics.dateOfBirth = profile.dateOfBirth;
        if (profile.phone) form.demographics.phone = profile.phone;
        if (profile.email) form.demographics.email = profile.email;
        if (profile.address) form.demographics.address = profile.address;
      }

      // Pre-fill medications from medication tracking
      const medicationsData = await AsyncStorage.getItem("medications");
      if (medicationsData) {
        const medications = JSON.parse(medicationsData);
        form.medications = medications.map((med: any) => ({
          name: med.name,
          dosage: med.dosage || med.strength,
          frequency: med.frequency || med.schedule,
          route: "oral",
          reason: med.purpose,
        }));
      }

      // Pre-fill allergies from allergy list
      const allergiesData = await AsyncStorage.getItem("allergies");
      if (allergiesData) {
        const allergies = JSON.parse(allergiesData);
        form.allergies = allergies.map((allergy: any) => ({
          allergen: allergy.name,
          type: allergy.type || "drug",
          reaction: allergy.reaction || "Unknown",
          severity: allergy.severity || "moderate",
        }));
      }

      // Pre-fill chronic conditions from health knowledge saved items
      const savedHealthData = await AsyncStorage.getItem("my_health_center_items");
      if (savedHealthData) {
        const healthItems = JSON.parse(savedHealthData);
        const conditions = healthItems
          .filter((item: any) => item.folder === "Conditions" || item.type === "condition")
          .map((item: any) => item.title);
        if (conditions.length > 0) {
          form.medicalHistory.chronicConditions = conditions;
        }
      }

      // Pre-fill emergency contacts from caregiver dashboard
      const caregiversData = await AsyncStorage.getItem("caregivers");
      if (caregiversData) {
        const caregivers = JSON.parse(caregiversData);
        if (caregivers.length > 0) {
          const primaryCaregiver = caregivers[0];
          form.emergencyContacts = [
            {
              name: primaryCaregiver.name,
              relationship: primaryCaregiver.relationship || "caregiver",
              phone: primaryCaregiver.phone,
              address: primaryCaregiver.address,
            },
          ];
        }
      }

      // Pre-fill insurance from insurance scanner
      const insuranceData = await AsyncStorage.getItem("insurance_info");
      if (insuranceData) {
        const insurance = JSON.parse(insuranceData);
        form.primaryInsurance = {
          isPrimary: true,
          provider: insurance.provider || insurance.insuranceName,
          policyNumber: insurance.policyNumber || insurance.memberId,
          groupNumber: insurance.groupNumber,
          subscriberName: insurance.subscriberName || `${form.demographics.firstName} ${form.demographics.lastName}`,
          subscriberDOB: insurance.subscriberDOB || form.demographics.dateOfBirth,
          relationshipToSubscriber: "self",
        };
      }

      // Pre-fill vitals history (height, weight from wellness data)
      const vitalsData = await AsyncStorage.getItem("vitals_history");
      if (vitalsData) {
        const vitals = JSON.parse(vitalsData);
        // Store in medical history for reference
        if (vitals.length > 0) {
          const latestVitals = vitals[vitals.length - 1];
          // Could add height/weight fields to demographics if needed
        }
      }

      await this.saveIntakeForm(form);
    } catch (error) {
      console.error("Error pre-filling form:", error);
      // Don't throw - pre-fill is optional, form can still be used
    }
  }

  /**
   * Create a new intake form with intelligent pre-fill
   */
  async createIntakeForm(forProvider?: string, appointmentDate?: string): Promise<PatientIntakeForm> {
    const form: PatientIntakeForm = {
      id: `intake_${Date.now()}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionPercentage: 0,
      demographics: {} as Demographics,
      emergencyContacts: [],
      medicalHistory: {
        chronicConditions: [],
        surgeries: [],
        hospitalizations: [],
      },
      familyHistory: {},
      socialHistory: {} as SocialHistory,
      medications: [],
      allergies: [],
      hipaaConsent: {
        consentToTreat: false,
        consentToShareData: false,
        authorizedPersons: [],
      },
      forProvider,
      appointmentDate,
    };

    await this.saveIntakeForm(form);
    await AsyncStorage.setItem(this.STORAGE_KEY_CURRENT, form.id);
    
    // Intelligent pre-fill from existing health data
    await this.preFillFromHealthData(form);
    
    return form;
  }

  /**
   * Save intake form
   */
  async saveIntakeForm(form: PatientIntakeForm): Promise<void> {
    try {
      form.updatedAt = new Date().toISOString();
      form.completionPercentage = this.calculateCompletionPercentage(form);
      
      const forms = await this.getAllIntakeForms();
      const index = forms.findIndex((f) => f.id === form.id);
      
      if (index >= 0) {
        forms[index] = form;
      } else {
        forms.push(form);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY_FORMS, JSON.stringify(forms));
    } catch (error) {
      console.error("Error saving intake form:", error);
      throw new Error("Failed to save intake form");
    }
  }

  /**
   * Get all intake forms
   */
  async getAllIntakeForms(): Promise<PatientIntakeForm[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_FORMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting intake forms:", error);
      return [];
    }
  }

  /**
   * Get current intake form
   */
  async getCurrentIntakeForm(): Promise<PatientIntakeForm | null> {
    try {
      const currentId = await AsyncStorage.getItem(this.STORAGE_KEY_CURRENT);
      if (!currentId) return null;
      
      const forms = await this.getAllIntakeForms();
      return forms.find((f) => f.id === currentId) || null;
    } catch (error) {
      console.error("Error getting current intake form:", error);
      return null;
    }
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionPercentage(form: PatientIntakeForm): number {
    const questions = this.getIntakeQuestions();
    const requiredQuestions = questions.filter((q) => q.required);
    
    let completed = 0;
    for (const question of requiredQuestions) {
      const value = this.getFieldValue(form, question.field);
      if (value !== undefined && value !== null && value !== "") {
        completed++;
      }
    }
    
    return Math.round((completed / requiredQuestions.length) * 100);
  }

  /**
   * Get field value from form using dot notation
   */
  private getFieldValue(form: any, field: string): any {
    const parts = field.split(".");
    let value = form;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Update field value in form using dot notation
   */
  updateFieldValue(form: PatientIntakeForm, field: string, value: any): void {
    const parts = field.split(".");
    let obj: any = form;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) {
        obj[parts[i]] = {};
      }
      obj = obj[parts[i]];
    }
    
    obj[parts[parts.length - 1]] = value;
  }

  /**
   * Mark form as completed
   */
  async completeIntakeForm(formId: string): Promise<void> {
    const forms = await this.getAllIntakeForms();
    const form = forms.find((f) => f.id === formId);
    
    if (form) {
      form.status = "completed";
      form.updatedAt = new Date().toISOString();
      await this.saveIntakeForm(form);
    }
  }

  /**
   * Delete intake form
   */
  async deleteIntakeForm(formId: string): Promise<void> {
    try {
      const forms = await this.getAllIntakeForms();
      const filtered = forms.filter((f) => f.id !== formId);
      await AsyncStorage.setItem(this.STORAGE_KEY_FORMS, JSON.stringify(filtered));
      
      const currentId = await AsyncStorage.getItem(this.STORAGE_KEY_CURRENT);
      if (currentId === formId) {
        await AsyncStorage.removeItem(this.STORAGE_KEY_CURRENT);
      }
    } catch (error) {
      console.error("Error deleting intake form:", error);
      throw new Error("Failed to delete intake form");
    }
  }
}

export default new PatientIntakeService();
