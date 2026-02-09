/**
 * Clinical-Grade PDF Generator
 * 
 * Generates professional, clinic-ready PDF exports of patient intake forms
 * matching Texas Medical Association standards.
 */

import type { PatientIntakeForm } from "./patientIntake";
import { generatePDF, type PDFOptions } from "react-native-html-to-pdf";
import * as FileSystem from "expo-file-system";
import MedicationReconciliationService from "./medicationReconciliation";

export interface PDFGenerationOptions {
  includeVoiceConsentQR?: boolean;
  includeMedicationReconciliation?: boolean;
  watermark?: "draft" | "final" | "none";
  clinicLogo?: string; // Base64 or URL
  language?: "en" | "es";
}

export interface PDFGenerationResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

class ClinicalPDFGeneratorService {
  /**
   * Generate clinical-grade PDF from intake form
   */
  async generatePDF(
    form: PatientIntakeForm,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      const html = this.generateHTML(form, options);

      const pdfOptions: PDFOptions = {
        html,
        fileName: `intake_${form.id}_${Date.now()}`,
        directory: "Documents",
        base64: false,
      };

      const file = await generatePDF(pdfOptions);

      return {
        success: true,
        filePath: file.filePath,
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate HTML for PDF
   */
  private generateHTML(
    form: PatientIntakeForm,
    options: PDFGenerationOptions
  ): string {
    const { language = "en", watermark = "none" } = options;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Patient Intake Form</title>
  <style>
    ${this.getStyles(watermark)}
  </style>
</head>
<body>
  ${this.generateHeader(form, options)}
  ${this.generateDemographics(form, language)}
  ${this.generateEmergencyContacts(form, language)}
  ${this.generateInsurance(form, language)}
  ${this.generateMedicalHistory(form, language)}
  ${this.generateFamilyHistory(form, language)}
  ${this.generateSocialHistory(form, language)}
  ${options.includeMedicationReconciliation 
    ? this.generateMedicationReconciliation(form, language)
    : this.generateMedications(form, language)}
  ${this.generateAllergies(form, language)}
  ${this.generateConsents(form, language)}
  ${this.generateSignature(form, language)}
  ${this.generateFooter(form)}
</body>
</html>
    `;
  }

  /**
   * Get PDF styles
   */
  private getStyles(watermark: PDFGenerationOptions["watermark"]): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 10pt;
        line-height: 1.4;
        color: #000;
        padding: 0.75in;
        position: relative;
      }
      
      ${watermark && watermark !== "none" ? `
      body::before {
        content: "${watermark.toUpperCase()}";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120pt;
        font-weight: bold;
        color: rgba(200, 200, 200, 0.3);
        z-index: -1;
        pointer-events: none;
      }
      ` : ""}
      
      .header {
        border-bottom: 3px solid #0066cc;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      
      .header-title {
        font-size: 18pt;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 5px;
      }
      
      .header-subtitle {
        font-size: 9pt;
        color: #666;
        font-style: italic;
      }
      
      .patient-info {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
      }
      
      .patient-info-item {
        font-size: 10pt;
      }
      
      .patient-info-label {
        font-weight: bold;
        color: #333;
      }
      
      .section {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .section-title {
        font-size: 12pt;
        font-weight: bold;
        color: #0066cc;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 5px;
        margin-bottom: 10px;
      }
      
      .two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .field {
        margin-bottom: 8px;
      }
      
      .field-label {
        font-weight: bold;
        font-size: 9pt;
        color: #333;
        display: inline-block;
        min-width: 120px;
      }
      
      .field-value {
        font-size: 10pt;
        color: #000;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      
      th {
        background: #0066cc;
        color: white;
        font-weight: bold;
        padding: 8px;
        text-align: left;
        font-size: 9pt;
      }
      
      td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        font-size: 9pt;
      }
      
      tr:nth-child(even) {
        background: #f9f9f9;
      }
      
      .signature-box {
        border: 2px solid #333;
        padding: 15px;
        margin-top: 20px;
        min-height: 80px;
      }
      
      .signature-line {
        border-top: 1px solid #000;
        margin-top: 50px;
        padding-top: 5px;
        font-size: 9pt;
      }
      
      .footer {
        position: fixed;
        bottom: 0.5in;
        left: 0.75in;
        right: 0.75in;
        text-align: center;
        font-size: 8pt;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 5px;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      @media print {
        body {
          padding: 0.5in;
        }
      }
    `;
  }

  /**
   * Generate header section
   */
  private generateHeader(
    form: PatientIntakeForm,
    options: PDFGenerationOptions
  ): string {
    const demo = form.demographics;
    const fullName = `${demo.firstName} ${demo.middleName || ""} ${demo.lastName}`.trim();

    return `
      <div class="header">
        <div class="header-title">PATIENT INTAKE FORM</div>
        <div class="header-subtitle">Self-Reported via HealthMate AI | Texas Medical Association Standard Format</div>
        
        <div class="patient-info">
          <div class="patient-info-item">
            <span class="patient-info-label">Patient Name:</span> ${fullName}
          </div>
          <div class="patient-info-item">
            <span class="patient-info-label">Date of Birth:</span> ${new Date(demo.dateOfBirth).toLocaleDateString()}
          </div>
          <div class="patient-info-item">
            <span class="patient-info-label">Form Date:</span> ${new Date(form.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate demographics section
   */
  private generateDemographics(form: PatientIntakeForm, language: string): string {
    const demo = form.demographics;
    const fullName = `${demo.firstName} ${demo.middleName || ""} ${demo.lastName}`.trim();

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "INFORMACIÓN DEMOGRÁFICA" : "DEMOGRAPHICS"}</div>
        <div class="two-column">
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Nombre Completo:" : "Full Name:"}</span>
              <span class="field-value">${fullName}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Fecha de Nacimiento:" : "Date of Birth:"}</span>
              <span class="field-value">${new Date(demo.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Género:" : "Gender:"}</span>
              <span class="field-value">${demo.gender}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Estado Civil:" : "Marital Status:"}</span>
              <span class="field-value">${demo.maritalStatus || "Not provided"}</span>
            </div>
          </div>
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Teléfono:" : "Phone:"}</span>
              <span class="field-value">${demo.phone}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Correo Electrónico:" : "Email:"}</span>
              <span class="field-value">${demo.email || "Not provided"}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Dirección:" : "Address:"}</span>
              <span class="field-value">${demo.address.street}, ${demo.address.city}, ${demo.address.state} ${demo.address.zipCode}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate emergency contacts section
   */
  private generateEmergencyContacts(form: PatientIntakeForm, language: string): string {
    if (form.emergencyContacts.length === 0) {
      return "";
    }

    const contactsHTML = form.emergencyContacts
      .map(
        (contact) => `
        <tr>
          <td>${contact.name}</td>
          <td>${contact.relationship}</td>
          <td>${contact.phone}</td>
          <td>${contact.alternatePhone || "—"}</td>
        </tr>
      `
      )
      .join("");

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "CONTACTOS DE EMERGENCIA" : "EMERGENCY CONTACTS"}</div>
        <table>
          <thead>
            <tr>
              <th>${language === "es" ? "Nombre" : "Name"}</th>
              <th>${language === "es" ? "Relación" : "Relationship"}</th>
              <th>${language === "es" ? "Teléfono" : "Phone"}</th>
              <th>${language === "es" ? "Teléfono Alternativo" : "Alternate Phone"}</th>
            </tr>
          </thead>
          <tbody>
            ${contactsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate insurance section
   */
  private generateInsurance(form: PatientIntakeForm, language: string): string {
    if (!form.primaryInsurance) {
      return "";
    }

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "INFORMACIÓN DE SEGURO" : "INSURANCE INFORMATION"}</div>
        <div class="two-column">
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Proveedor:" : "Provider:"}</span>
              <span class="field-value">${form.primaryInsurance.provider}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Número de Póliza:" : "Policy Number:"}</span>
              <span class="field-value">${form.primaryInsurance.policyNumber}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Número de Grupo:" : "Group Number:"}</span>
              <span class="field-value">${form.primaryInsurance.groupNumber || "Not provided"}</span>
            </div>
          </div>
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Titular:" : "Subscriber:"}</span>
              <span class="field-value">${form.primaryInsurance.subscriberName}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Relación con Titular:" : "Relationship:"}</span>
              <span class="field-value">${form.primaryInsurance.relationshipToSubscriber}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate medical history section
   */
  private generateMedicalHistory(form: PatientIntakeForm, language: string): string {
    const history = form.medicalHistory;

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "HISTORIAL MÉDICO" : "MEDICAL HISTORY"}</div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Condiciones Crónicas:" : "Chronic Conditions:"}</span>
          <span class="field-value">${history.chronicConditions.length > 0 ? history.chronicConditions.join(", ") : "None reported"}</span>
        </div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Cirugías:" : "Surgeries:"}</span>
          <span class="field-value">${history.surgeries.length > 0 ? history.surgeries.map(s => `${s.procedure} (${s.date})`).join("; ") : "None reported"}</span>
        </div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Hospitalizaciones:" : "Hospitalizations:"}</span>
          <span class="field-value">${history.hospitalizations.length > 0 ? history.hospitalizations.map(h => `${h.reason} (${h.date})`).join("; ") : "None reported"}</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate family history section
   */
  private generateFamilyHistory(form: PatientIntakeForm, language: string): string {
    const family = form.familyHistory;
    const hasHistory =
      (family.cancer && family.cancer.length > 0) ||
      (family.heartDisease && family.heartDisease.length > 0) ||
      (family.stroke && family.stroke.length > 0) ||
      (family.diabetes && family.diabetes.length > 0);

    if (!hasHistory) {
      return `
        <div class="section">
          <div class="section-title">${language === "es" ? "HISTORIAL FAMILIAR" : "FAMILY HISTORY"}</div>
          <div class="field-value">No significant family history reported</div>
        </div>
      `;
    }

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "HISTORIAL FAMILIAR" : "FAMILY HISTORY"}</div>
        ${family.cancer && family.cancer.length > 0 ? `
          <div class="field">
            <span class="field-label">${language === "es" ? "Cáncer:" : "Cancer:"}</span>
            <span class="field-value">${family.cancer.map(c => `${c.relative} - ${c.type}`).join("; ")}</span>
          </div>
        ` : ""}
        ${family.heartDisease && family.heartDisease.length > 0 ? `
          <div class="field">
            <span class="field-label">${language === "es" ? "Enfermedad Cardíaca:" : "Heart Disease:"}</span>
            <span class="field-value">${family.heartDisease.map(h => `${h.relative} - ${h.type}`).join("; ")}</span>
          </div>
        ` : ""}
        ${family.diabetes && family.diabetes.length > 0 ? `
          <div class="field">
            <span class="field-label">${language === "es" ? "Diabetes:" : "Diabetes:"}</span>
            <span class="field-value">${family.diabetes.map(d => `${d.relative} - Type ${d.type}`).join("; ")}</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  /**
   * Generate social history section
   */
  private generateSocialHistory(form: PatientIntakeForm, language: string): string {
    const social = form.socialHistory;

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "HISTORIAL SOCIAL" : "SOCIAL HISTORY"}</div>
        <div class="two-column">
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Tabaquismo:" : "Smoking:"}</span>
              <span class="field-value">${social.smokingStatus}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Alcohol:" : "Alcohol:"}</span>
              <span class="field-value">${social.alcoholUse}</span>
            </div>
          </div>
          <div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Ejercicio:" : "Exercise:"}</span>
              <span class="field-value">${social.exerciseFrequency}</span>
            </div>
            <div class="field">
              <span class="field-label">${language === "es" ? "Ocupación:" : "Occupation:"}</span>
              <span class="field-value">${social.occupation || "Not provided"}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate medications section
   */
  private generateMedications(form: PatientIntakeForm, language: string): string {
    if (form.medications.length === 0) {
      return `
        <div class="section">
          <div class="section-title">${language === "es" ? "MEDICAMENTOS ACTUALES" : "CURRENT MEDICATIONS"}</div>
          <div class="field-value">No medications reported</div>
        </div>
      `;
    }

    const medsHTML = form.medications
      .map(
        (med) => `
        <tr>
          <td>${med.name}</td>
          <td>${med.dosage}</td>
          <td>${med.frequency}</td>
          <td>${med.route}</td>
        </tr>
      `
      )
      .join("");

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "MEDICAMENTOS ACTUALES" : "CURRENT MEDICATIONS"}</div>
        <table>
          <thead>
            <tr>
              <th>${language === "es" ? "Medicamento" : "Medication"}</th>
              <th>${language === "es" ? "Dosis" : "Dosage"}</th>
              <th>${language === "es" ? "Frecuencia" : "Frequency"}</th>
              <th>${language === "es" ? "Vía" : "Route"}</th>
            </tr>
          </thead>
          <tbody>
            ${medsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate medication reconciliation table with drug class lookup
   */
  private async generateMedicationReconciliation(form: PatientIntakeForm, language: string): Promise<string> {
    if (form.medications.length === 0) {
      return this.generateMedications(form, language);
    }

    // Reconcile medications with drug class lookup
    const reconciled = await MedicationReconciliationService.reconcileMedications(form.medications);
    
    const medsHTML = reconciled
      .map(
        (med) => `
        <tr>
          <td><strong>${med.name}</strong></td>
          <td>${med.dosage}</td>
          <td>${med.frequency}</td>
          <td>${med.route}</td>
          <td>${med.reason || med.drugClass?.commonIndications[0] || "—"}</td>
          <td>${med.drugClass?.class || "—"}</td>
          <td style="font-size: 8pt;">${med.drugClass?.commonIndications.join(", ") || "—"}</td>
        </tr>
        ${med.interactions && med.interactions.length > 0 ? `
        <tr style="background: #fff3cd;">
          <td colspan="7" style="font-size: 8pt; padding: 4px 8px;">
            <strong>⚠️ Interactions:</strong> ${med.interactions.join("; ")}
          </td>
        </tr>
        ` : ""}
      `
      )
      .join("");

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "RECONCILIACIÓN DE MEDICAMENTOS" : "MEDICATION RECONCILIATION"}</div>
        <table>
          <thead>
            <tr>
              <th>${language === "es" ? "Medicamento" : "Medication"}</th>
              <th>${language === "es" ? "Dosis" : "Dosage"}</th>
              <th>${language === "es" ? "Frecuencia" : "Frequency"}</th>
              <th>${language === "es" ? "Vía" : "Route"}</th>
              <th>${language === "es" ? "Indicación" : "Indication"}</th>
              <th>${language === "es" ? "Clase de Medicamento" : "Drug Class"}</th>
              <th>${language === "es" ? "Indicaciones Comunes" : "Common Indications"}</th>
            </tr>
          </thead>
          <tbody>
            ${medsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate allergies section
   */
  private generateAllergies(form: PatientIntakeForm, language: string): string {
    if (form.allergies.length === 0) {
      return `
        <div class="section">
          <div class="section-title">${language === "es" ? "ALERGIAS" : "ALLERGIES"}</div>
          <div class="field-value">No known allergies</div>
        </div>
      `;
    }

    const allergiesHTML = form.allergies
      .map(
        (allergy) => `
        <tr>
          <td>${allergy.allergen}</td>
          <td>${allergy.type}</td>
          <td>${allergy.reaction}</td>
          <td>${allergy.severity}</td>
        </tr>
      `
      )
      .join("");

    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "ALERGIAS" : "ALLERGIES"}</div>
        <table>
          <thead>
            <tr>
              <th>${language === "es" ? "Alérgeno" : "Allergen"}</th>
              <th>${language === "es" ? "Tipo" : "Type"}</th>
              <th>${language === "es" ? "Reacción" : "Reaction"}</th>
              <th>${language === "es" ? "Gravedad" : "Severity"}</th>
            </tr>
          </thead>
          <tbody>
            ${allergiesHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate consents section
   */
  private generateConsents(form: PatientIntakeForm, language: string): string {
    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "CONSENTIMIENTOS Y AUTORIZACIONES" : "CONSENTS & AUTHORIZATIONS"}</div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Consentimiento para Tratamiento:" : "Consent to Treat:"}</span>
          <span class="field-value">${form.hipaaConsent.consentToTreat ? "✓ Yes" : "✗ No"}</span>
        </div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Consentimiento para Compartir Datos:" : "Consent to Share Data:"}</span>
          <span class="field-value">${form.hipaaConsent.consentToShareData ? "✓ Yes" : "✗ No"}</span>
        </div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Aviso de Prácticas de Privacidad:" : "Notice of Privacy Practices:"}</span>
          <span class="field-value">Acknowledged (Version ${form.nppVersion || "1.0"})</span>
        </div>
        <div class="field">
          <span class="field-label">${language === "es" ? "Consentimiento de Voz:" : "Voice Consent:"}</span>
          <span class="field-value">${form.hipaaConsent.voiceConsentRecording ? "✓ Recorded" : "Not recorded"}</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate signature section
   */
  private generateSignature(form: PatientIntakeForm, language: string): string {
    return `
      <div class="section">
        <div class="section-title">${language === "es" ? "FIRMA DEL PACIENTE" : "PATIENT SIGNATURE"}</div>
        <div class="signature-box">
          ${form.hipaaConsent.signatureData ? `<img src="${form.hipaaConsent.signatureData}" alt="Signature" style="max-height: 60px;" />` : ""}
          <div class="signature-line">
            ${language === "es" ? "Firma del Paciente" : "Patient Signature"} | ${language === "es" ? "Fecha:" : "Date:"} ${form.hipaaConsent.signatureDate ? new Date(form.hipaaConsent.signatureDate).toLocaleDateString() : new Date(form.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <strong>${language === "es" ? "Para Uso de la Clínica:" : "For Clinic Use:"}</strong>
          <div style="margin-top: 10px;">
            <div class="signature-line" style="margin-top: 40px;">
              ${language === "es" ? "Revisado Por (Nombre y Título)" : "Reviewed By (Name and Title)"}
            </div>
            <div class="signature-line" style="margin-top: 40px;">
              ${language === "es" ? "Fecha de Revisión" : "Review Date"}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate footer
   */
  private generateFooter(form: PatientIntakeForm): string {
    return `
      <div class="footer">
        Generated by HealthMate AI | Form ID: ${form.id} | Generated: ${new Date().toLocaleString()} | Page <span class="pageNumber"></span>
      </div>
    `;
  }
}

export default new ClinicalPDFGeneratorService();
