/**
 * HIPAA Compliance Validation System
 * 
 * Real-time validation of HIPAA compliance requirements for patient intake forms.
 * Ensures all legally required fields and consents are completed before submission.
 */

import type { PatientIntakeForm } from "./patientIntake";
import VoiceConsentService from "./voiceConsent";
import { hasAcknowledgedCurrentNPP } from "./noticeOfPrivacyPractices";

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: "legal" | "consent" | "data" | "security";
  status: "pending" | "complete" | "failed";
  errorMessage?: string;
}

export interface ComplianceReport {
  formId: string;
  overallStatus: "compliant" | "non_compliant" | "partial";
  completionPercentage: number;
  checks: ComplianceCheck[];
  canSubmit: boolean;
  missingRequirements: string[];
  generatedAt: string;
}

class HIPAAComplianceService {
  /**
   * Validate form for HIPAA compliance
   */
  async validateForm(form: PatientIntakeForm): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = [];

    // 1. NPP Acknowledgment
    checks.push(await this.checkNPPAcknowledgment(form));

    // 2. Voice Consent
    checks.push(await this.checkVoiceConsent(form));

    // 3. Digital Signature
    checks.push(this.checkDigitalSignature(form));

    // 4. Required Demographics
    checks.push(this.checkRequiredDemographics(form));

    // 5. Emergency Contact
    checks.push(this.checkEmergencyContact(form));

    // 6. Insurance Information
    checks.push(this.checkInsuranceInformation(form));

    // 7. Medical History
    checks.push(this.checkMedicalHistory(form));

    // 8. Medication List
    checks.push(this.checkMedicationList(form));

    // 9. Allergy List
    checks.push(this.checkAllergyList(form));

    // 10. HIPAA Authorization
    checks.push(this.checkHIPAAAuthorization(form));

    // 11. Treatment Consent
    checks.push(this.checkTreatmentConsent(form));

    // 12. Sensitive Health Records Consent
    checks.push(this.checkSensitiveHealthRecordsConsent(form));

    // Calculate compliance metrics
    const requiredChecks = checks.filter((c) => c.required);
    const completedRequiredChecks = requiredChecks.filter(
      (c) => c.status === "complete"
    );

    const completionPercentage = Math.round(
      (completedRequiredChecks.length / requiredChecks.length) * 100
    );

    const canSubmit = completedRequiredChecks.length === requiredChecks.length;

    const missingRequirements = requiredChecks
      .filter((c) => c.status !== "complete")
      .map((c) => c.name);

    const overallStatus: ComplianceReport["overallStatus"] =
      canSubmit ? "compliant" :
      completionPercentage > 50 ? "partial" :
      "non_compliant";

    return {
      formId: form.id,
      overallStatus,
      completionPercentage,
      checks,
      canSubmit,
      missingRequirements,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Check NPP acknowledgment
   */
  private async checkNPPAcknowledgment(
    form: PatientIntakeForm
  ): Promise<ComplianceCheck> {
    const hasAcknowledged = hasAcknowledgedCurrentNPP(form.nppVersion);

    return {
      id: "npp_acknowledgment",
      name: "Notice of Privacy Practices Acknowledgment",
      description: "Patient must review and acknowledge the current Notice of Privacy Practices",
      required: true,
      category: "legal",
      status: hasAcknowledged ? "complete" : "pending",
      errorMessage: hasAcknowledged
        ? undefined
        : "Please review and acknowledge the Notice of Privacy Practices",
    };
  }

  /**
   * Check voice consent
   */
  private async checkVoiceConsent(
    form: PatientIntakeForm
  ): Promise<ComplianceCheck> {
    const hasConsent = await VoiceConsentService.hasValidConsent(
      form.id,
      "hipaa_authorization"
    );

    return {
      id: "voice_consent",
      name: "Voice Consent Recording",
      description: "Patient must provide verbal consent via voice recording",
      required: true,
      category: "consent",
      status: hasConsent ? "complete" : "pending",
      errorMessage: hasConsent
        ? undefined
        : "Please record your verbal consent",
    };
  }

  /**
   * Check digital signature
   */
  private checkDigitalSignature(form: PatientIntakeForm): ComplianceCheck {
    const hasSignature = !!form.signature && form.signature.length > 0;

    return {
      id: "digital_signature",
      name: "Digital Signature",
      description: "Patient must provide a digital signature or voice-verified consent",
      required: true,
      category: "consent",
      status: hasSignature ? "complete" : "pending",
      errorMessage: hasSignature
        ? undefined
        : "Please provide your digital signature",
    };
  }

  /**
   * Check required demographics
   */
  private checkRequiredDemographics(form: PatientIntakeForm): ComplianceCheck {
    const demo = form.demographics;
    const hasRequired =
      !!demo.firstName &&
      !!demo.lastName &&
      !!demo.dateOfBirth &&
      !!demo.address &&
      !!demo.phone;

    return {
      id: "required_demographics",
      name: "Required Demographics",
      description: "Name, date of birth, address, and phone number are required",
      required: true,
      category: "data",
      status: hasRequired ? "complete" : "pending",
      errorMessage: hasRequired
        ? undefined
        : "Please complete all required demographic fields",
    };
  }

  /**
   * Check emergency contact
   */
  private checkEmergencyContact(form: PatientIntakeForm): ComplianceCheck {
    const hasContact =
      form.emergencyContacts.length > 0 &&
      !!form.emergencyContacts[0].name &&
      !!form.emergencyContacts[0].phone;

    return {
      id: "emergency_contact",
      name: "Emergency Contact",
      description: "At least one emergency contact with name and phone is required",
      required: true,
      category: "data",
      status: hasContact ? "complete" : "pending",
      errorMessage: hasContact
        ? undefined
        : "Please provide at least one emergency contact",
    };
  }

  /**
   * Check insurance information
   */
  private checkInsuranceInformation(form: PatientIntakeForm): ComplianceCheck {
    const hasInsurance =
      !!form.primaryInsurance &&
      !!form.primaryInsurance.provider &&
      !!form.primaryInsurance.policyNumber;

    return {
      id: "insurance_information",
      name: "Insurance Information",
      description: "Primary insurance provider and policy number are required",
      required: true,
      category: "data",
      status: hasInsurance ? "complete" : "pending",
      errorMessage: hasInsurance
        ? undefined
        : "Please provide your primary insurance information",
    };
  }

  /**
   * Check medical history
   */
  private checkMedicalHistory(form: PatientIntakeForm): ComplianceCheck {
    // Medical history is required but can be "None" or empty array
    const hasHistory = form.medicalHistory !== undefined;

    return {
      id: "medical_history",
      name: "Medical History",
      description: "Medical history section must be completed (can be 'None')",
      required: true,
      category: "data",
      status: hasHistory ? "complete" : "pending",
      errorMessage: hasHistory
        ? undefined
        : "Please complete the medical history section",
    };
  }

  /**
   * Check medication list
   */
  private checkMedicationList(form: PatientIntakeForm): ComplianceCheck {
    // Medication list is required but can be empty array
    const hasMedications = Array.isArray(form.medications);

    return {
      id: "medication_list",
      name: "Medication List",
      description: "Medication list must be provided (can be empty if no medications)",
      required: true,
      category: "data",
      status: hasMedications ? "complete" : "pending",
      errorMessage: hasMedications
        ? undefined
        : "Please complete the medication list section",
    };
  }

  /**
   * Check allergy list
   */
  private checkAllergyList(form: PatientIntakeForm): ComplianceCheck {
    // Allergy list is required but can be empty array
    const hasAllergies = Array.isArray(form.allergies);

    return {
      id: "allergy_list",
      name: "Allergy List",
      description: "Allergy list must be provided (can be empty if no allergies)",
      required: true,
      category: "data",
      status: hasAllergies ? "complete" : "pending",
      errorMessage: hasAllergies
        ? undefined
        : "Please complete the allergy list section",
    };
  }

  /**
   * Check HIPAA authorization
   */
  private checkHIPAAAuthorization(form: PatientIntakeForm): ComplianceCheck {
    const hasAuth = !!form.hipaaAuthorization && form.hipaaAuthorization.authorized;

    return {
      id: "hipaa_authorization",
      name: "HIPAA Authorization",
      description: "Patient must authorize use and disclosure of protected health information",
      required: true,
      category: "legal",
      status: hasAuth ? "complete" : "pending",
      errorMessage: hasAuth
        ? undefined
        : "Please authorize the use and disclosure of your health information",
    };
  }

  /**
   * Check treatment consent
   */
  private checkTreatmentConsent(form: PatientIntakeForm): ComplianceCheck {
    const hasConsent = !!form.treatmentConsent && form.treatmentConsent.consented;

    return {
      id: "treatment_consent",
      name: "Treatment Consent",
      description: "Patient must consent to treatment",
      required: true,
      category: "consent",
      status: hasConsent ? "complete" : "pending",
      errorMessage: hasConsent
        ? undefined
        : "Please provide consent for treatment",
    };
  }

  /**
   * Check sensitive health records consent
   */
  private checkSensitiveHealthRecordsConsent(
    form: PatientIntakeForm
  ): ComplianceCheck {
    // Check if form contains sensitive health information
    const hasSensitiveInfo = this.hasSensitiveHealthInformation(form);

    if (!hasSensitiveInfo) {
      return {
        id: "sensitive_health_consent",
        name: "Sensitive Health Records Consent",
        description: "Additional consent required for sensitive health records (behavioral health, substance use, etc.)",
        required: false,
        category: "consent",
        status: "complete",
      };
    }

    const hasConsent =
      !!form.sensitiveHealthConsent && form.sensitiveHealthConsent.consented;

    return {
      id: "sensitive_health_consent",
      name: "Sensitive Health Records Consent",
      description: "Additional consent required for sensitive health records (behavioral health, substance use, etc.)",
      required: true,
      category: "consent",
      status: hasConsent ? "complete" : "pending",
      errorMessage: hasConsent
        ? undefined
        : "Please provide consent for use of sensitive health records",
    };
  }

  /**
   * Check if form contains sensitive health information
   */
  private hasSensitiveHealthInformation(form: PatientIntakeForm): boolean {
    const sensitiveKeywords = [
      "mental health",
      "psychiatric",
      "depression",
      "anxiety",
      "substance",
      "alcohol",
      "drug",
      "addiction",
      "reproductive",
      "pregnancy",
      "abortion",
      "gender",
      "transgender",
      "genetic",
      "hiv",
      "std",
      "sti",
    ];

    const medicalHistoryText = JSON.stringify(form.medicalHistory || "").toLowerCase();
    const medicationsText = JSON.stringify(form.medications || []).toLowerCase();

    return sensitiveKeywords.some(
      (keyword) =>
        medicalHistoryText.includes(keyword) ||
        medicationsText.includes(keyword)
    );
  }

  /**
   * Get voice prompts for missing requirements
   */
  getVoicePromptsForMissingRequirements(report: ComplianceReport): string[] {
    const prompts: string[] = [];

    for (const check of report.checks) {
      if (check.required && check.status !== "complete" && check.errorMessage) {
        prompts.push(check.errorMessage);
      }
    }

    return prompts;
  }

  /**
   * Generate compliance status message
   */
  getComplianceStatusMessage(report: ComplianceReport): string {
    if (report.canSubmit) {
      return "✅ Your form is complete and compliant with HIPAA requirements. You may now submit.";
    }

    if (report.completionPercentage >= 75) {
      return `⚠️ Your form is ${report.completionPercentage}% complete. Please complete the remaining ${report.missingRequirements.length} requirement(s) to submit.`;
    }

    return `❌ Your form is ${report.completionPercentage}% complete. You must complete all required sections before submission.`;
  }
}

export default new HIPAAComplianceService();
