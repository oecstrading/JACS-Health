/**
 * Internationalization (i18n) Service
 * 
 * Provides Spanish language support for all intake forms,
 * voice prompts, and PDF exports.
 */

export type Language = "en" | "es";

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

class I18nService {
  /**
   * Translation dictionary
   */
  private translations: Translations = {
    // App Navigation
    "nav.home": { en: "Home", es: "Inicio" },
    "nav.health": { en: "My Health", es: "Mi Salud" },
    "nav.family": { en: "Family", es: "Familia" },
    "nav.settings": { en: "Settings", es: "Configuración" },

    // Quick Actions
    "action.talk_to_ai": { en: "Talk to AI Assistant", es: "Hablar con Asistente IA" },
    "action.log_medication": { en: "Log Medication", es: "Registrar Medicamento" },
    "action.record_vitals": { en: "Record Vitals", es: "Registrar Signos Vitales" },
    "action.health_knowledge": { en: "Health Knowledge Engine", es: "Motor de Conocimiento de Salud" },
    "action.my_health_center": { en: "My Health Center", es: "Mi Centro de Salud" },
    "action.find_care": { en: "Find Care Near Me", es: "Encontrar Atención Cerca" },
    "action.pharmacy_finder": { en: "Pharmacy Finder", es: "Buscador de Farmacias" },
    "action.new_patient_forms": { en: "New Patient Forms", es: "Formularios de Nuevo Paciente" },

    // Intake Form - Demographics
    "intake.demographics": { en: "Demographics", es: "Información Demográfica" },
    "intake.first_name": { en: "First Name", es: "Nombre" },
    "intake.middle_name": { en: "Middle Name", es: "Segundo Nombre" },
    "intake.last_name": { en: "Last Name", es: "Apellido" },
    "intake.date_of_birth": { en: "Date of Birth", es: "Fecha de Nacimiento" },
    "intake.gender": { en: "Gender", es: "Género" },
    "intake.gender.male": { en: "Male", es: "Masculino" },
    "intake.gender.female": { en: "Female", es: "Femenino" },
    "intake.gender.other": { en: "Other", es: "Otro" },
    "intake.marital_status": { en: "Marital Status", es: "Estado Civil" },
    "intake.marital_status.single": { en: "Single", es: "Soltero/a" },
    "intake.marital_status.married": { en: "Married", es: "Casado/a" },
    "intake.marital_status.divorced": { en: "Divorced", es: "Divorciado/a" },
    "intake.marital_status.widowed": { en: "Viudo/a", es: "Viudo/a" },
    "intake.phone": { en: "Phone", es: "Teléfono" },
    "intake.email": { en: "Email", es: "Correo Electrónico" },
    "intake.address": { en: "Address", es: "Dirección" },
    "intake.city": { en: "City", es: "Ciudad" },
    "intake.state": { en: "State", es: "Estado" },
    "intake.zip_code": { en: "ZIP Code", es: "Código Postal" },

    // Intake Form - Emergency Contacts
    "intake.emergency_contacts": { en: "Emergency Contacts", es: "Contactos de Emergencia" },
    "intake.contact_name": { en: "Name", es: "Nombre" },
    "intake.relationship": { en: "Relationship", es: "Relación" },
    "intake.contact_phone": { en: "Phone", es: "Teléfono" },

    // Intake Form - Insurance
    "intake.insurance": { en: "Insurance Information", es: "Información de Seguro" },
    "intake.insurance_provider": { en: "Provider", es: "Proveedor" },
    "intake.policy_number": { en: "Policy Number", es: "Número de Póliza" },
    "intake.group_number": { en: "Group Number", es: "Número de Grupo" },
    "intake.subscriber_name": { en: "Subscriber Name", es: "Nombre del Titular" },
    "intake.relationship_to_subscriber": { en: "Relationship to Subscriber", es: "Relación con el Titular" },

    // Intake Form - Medical History
    "intake.medical_history": { en: "Medical History", es: "Historial Médico" },
    "intake.chronic_conditions": { en: "Chronic Conditions", es: "Condiciones Crónicas" },
    "intake.surgeries": { en: "Surgeries", es: "Cirugías" },
    "intake.hospitalizations": { en: "Hospitalizations", es: "Hospitalizaciones" },
    "intake.procedure": { en: "Procedure", es: "Procedimiento" },
    "intake.reason": { en: "Reason", es: "Motivo" },
    "intake.date": { en: "Date", es: "Fecha" },

    // Intake Form - Family History
    "intake.family_history": { en: "Family History", es: "Historial Familiar" },
    "intake.cancer": { en: "Cancer", es: "Cáncer" },
    "intake.heart_disease": { en: "Heart Disease", es: "Enfermedad Cardíaca" },
    "intake.stroke": { en: "Stroke", es: "Derrame Cerebral" },
    "intake.diabetes": { en: "Diabetes", es: "Diabetes" },
    "intake.relative": { en: "Relative", es: "Familiar" },
    "intake.type": { en: "Type", es: "Tipo" },

    // Intake Form - Social History
    "intake.social_history": { en: "Social History", es: "Historial Social" },
    "intake.smoking": { en: "Smoking", es: "Tabaquismo" },
    "intake.smoking.never": { en: "Never", es: "Nunca" },
    "intake.smoking.former": { en: "Former", es: "Ex Fumador" },
    "intake.smoking.current": { en: "Current", es: "Fumador Actual" },
    "intake.alcohol": { en: "Alcohol", es: "Alcohol" },
    "intake.alcohol.none": { en: "None", es: "Ninguno" },
    "intake.alcohol.occasional": { en: "Occasional", es: "Ocasional" },
    "intake.alcohol.moderate": { en: "Moderate", es: "Moderado" },
    "intake.alcohol.heavy": { en: "Heavy", es: "Excesivo" },
    "intake.exercise": { en: "Exercise", es: "Ejercicio" },
    "intake.exercise.none": { en: "None", es: "Ninguno" },
    "intake.exercise.occasional": { en: "Occasional", es: "Ocasional" },
    "intake.exercise.regular": { en: "Regular", es: "Regular" },
    "intake.occupation": { en: "Occupation", es: "Ocupación" },

    // Intake Form - Medications
    "intake.medications": { en: "Current Medications", es: "Medicamentos Actuales" },
    "intake.medication_name": { en: "Medication", es: "Medicamento" },
    "intake.dosage": { en: "Dosage", es: "Dosis" },
    "intake.frequency": { en: "Frequency", es: "Frecuencia" },
    "intake.route": { en: "Route", es: "Vía" },
    "intake.indication": { en: "Indication", es: "Indicación" },
    "intake.drug_class": { en: "Drug Class", es: "Clase de Medicamento" },
    "intake.common_indications": { en: "Common Indications", es: "Indicaciones Comunes" },

    // Intake Form - Allergies
    "intake.allergies": { en: "Allergies", es: "Alergias" },
    "intake.allergen": { en: "Allergen", es: "Alérgeno" },
    "intake.allergy_type": { en: "Type", es: "Tipo" },
    "intake.allergy_type.drug": { en: "Drug", es: "Medicamento" },
    "intake.allergy_type.food": { en: "Food", es: "Alimento" },
    "intake.allergy_type.environmental": { en: "Environmental", es: "Ambiental" },
    "intake.allergy_type.latex": { en: "Latex", es: "Látex" },
    "intake.reaction": { en: "Reaction", es: "Reacción" },
    "intake.severity": { en: "Severity", es: "Gravedad" },
    "intake.severity.mild": { en: "Mild", es: "Leve" },
    "intake.severity.moderate": { en: "Moderate", es: "Moderado" },
    "intake.severity.severe": { en: "Severe", es: "Grave" },

    // Intake Form - Consents
    "intake.consents": { en: "Consents & Authorizations", es: "Consentimientos y Autorizaciones" },
    "intake.consent_to_treat": { en: "Consent to Treat", es: "Consentimiento para Tratamiento" },
    "intake.consent_to_share": { en: "Consent to Share Data", es: "Consentimiento para Compartir Datos" },
    "intake.npp_acknowledgment": { en: "Notice of Privacy Practices", es: "Aviso de Prácticas de Privacidad" },
    "intake.voice_consent": { en: "Voice Consent", es: "Consentimiento de Voz" },

    // Intake Form - Signature
    "intake.signature": { en: "Patient Signature", es: "Firma del Paciente" },
    "intake.signature_date": { en: "Date", es: "Fecha" },
    "intake.for_clinic_use": { en: "For Clinic Use", es: "Para Uso de la Clínica" },
    "intake.reviewed_by": { en: "Reviewed By (Name and Title)", es: "Revisado Por (Nombre y Título)" },
    "intake.review_date": { en: "Review Date", es: "Fecha de Revisión" },

    // Voice Prompts
    "voice.welcome": { 
      en: "Welcome to the patient intake form. I'll guide you through each section. You can answer by voice or typing. Let's start with your demographics.", 
      es: "Bienvenido al formulario de admisión de pacientes. Le guiaré a través de cada sección. Puede responder por voz o escribiendo. Comencemos con su información demográfica." 
    },
    "voice.ask_first_name": { 
      en: "What is your first name?", 
      es: "¿Cuál es su nombre?" 
    },
    "voice.ask_last_name": { 
      en: "What is your last name?", 
      es: "¿Cuál es su apellido?" 
    },
    "voice.ask_date_of_birth": { 
      en: "What is your date of birth?", 
      es: "¿Cuál es su fecha de nacimiento?" 
    },
    "voice.ask_address": { 
      en: "What is your current mailing address?", 
      es: "¿Cuál es su dirección postal actual?" 
    },
    "voice.ask_phone": { 
      en: "What is your phone number?", 
      es: "¿Cuál es su número de teléfono?" 
    },
    "voice.ask_medications": { 
      en: "Please list your current medications, one at a time. Say 'none' if you don't take any medications.", 
      es: "Por favor, enumere sus medicamentos actuales, uno a la vez. Diga 'ninguno' si no toma ningún medicamento." 
    },
    "voice.ask_allergies": { 
      en: "Do you have any allergies? Please describe them.", 
      es: "¿Tiene alguna alergia? Por favor descríbalas." 
    },
    "voice.confirm": { 
      en: "I heard {value}. Is that correct?", 
      es: "Escuché {value}. ¿Es correcto?" 
    },
    "voice.yes": { en: "Yes", es: "Sí" },
    "voice.no": { en: "No", es: "No" },
    "voice.next": { en: "Next", es: "Siguiente" },
    "voice.back": { en: "Back", es: "Atrás" },
    "voice.skip": { en: "Skip", es: "Omitir" },
    "voice.complete": { 
      en: "Great! You've completed the intake form. Please review your information.", 
      es: "¡Excelente! Ha completado el formulario de admisión. Por favor revise su información." 
    },

    // HIPAA & NPP
    "hipaa.npp_title": { 
      en: "NOTICE OF PRIVACY PRACTICES", 
      es: "AVISO DE PRÁCTICAS DE PRIVACIDAD" 
    },
    "hipaa.npp_header": { 
      en: "THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.", 
      es: "ESTE AVISO DESCRIBE CÓMO SE PUEDE USAR Y DIVULGAR LA INFORMACIÓN MÉDICA SOBRE USTED Y CÓMO PUEDE OBTENER ACCESO A ESTA INFORMACIÓN. POR FAVOR REVÍSELO CUIDADOSAMENTE." 
    },
    "hipaa.consent_summary": { 
      en: "By using this app, you consent to the collection, use, and disclosure of your health information as described in our Notice of Privacy Practices. Your information will be stored securely in the United States and will only be shared with authorized healthcare providers you designate.", 
      es: "Al usar esta aplicación, usted consiente la recopilación, uso y divulgación de su información de salud como se describe en nuestro Aviso de Prácticas de Privacidad. Su información se almacenará de forma segura en los Estados Unidos y solo se compartirá con los proveedores de atención médica autorizados que usted designe." 
    },
    "hipaa.i_consent": { 
      en: "I consent", 
      es: "Consiento" 
    },
    "hipaa.i_have_read": { 
      en: "I have read and understand", 
      es: "He leído y entiendo" 
    },

    // Buttons & Actions
    "button.save": { en: "Save", es: "Guardar" },
    "button.cancel": { en: "Cancel", es: "Cancelar" },
    "button.continue": { en: "Continue", es: "Continuar" },
    "button.submit": { en: "Submit", es: "Enviar" },
    "button.edit": { en: "Edit", es: "Editar" },
    "button.delete": { en: "Delete", es: "Eliminar" },
    "button.add": { en: "Add", es: "Agregar" },
    "button.review": { en: "Review", es: "Revisar" },
    "button.send": { en: "Send", es: "Enviar" },
    "button.download": { en: "Download", es: "Descargar" },
    "button.print": { en: "Print", es: "Imprimir" },
    "button.share": { en: "Share", es: "Compartir" },

    // Status Messages
    "status.loading": { en: "Loading...", es: "Cargando..." },
    "status.saving": { en: "Saving...", es: "Guardando..." },
    "status.saved": { en: "Saved", es: "Guardado" },
    "status.error": { en: "Error", es: "Error" },
    "status.success": { en: "Success", es: "Éxito" },
    "status.complete": { en: "Complete", es: "Completo" },
    "status.incomplete": { en: "Incomplete", es: "Incompleto" },

    // Validation Messages
    "validation.required": { en: "This field is required", es: "Este campo es obligatorio" },
    "validation.invalid_email": { en: "Invalid email address", es: "Dirección de correo electrónico no válida" },
    "validation.invalid_phone": { en: "Invalid phone number", es: "Número de teléfono no válido" },
    "validation.invalid_date": { en: "Invalid date", es: "Fecha no válida" },
  };

  /**
   * Get translation
   */
  t(key: string, language: Language = "en", replacements?: Record<string, string>): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    let text = translation[language];

    // Apply replacements
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, value);
      });
    }

    return text;
  }

  /**
   * Get all translations for a prefix
   */
  getTranslations(prefix: string, language: Language = "en"): Record<string, string> {
    const result: Record<string, string> = {};

    Object.entries(this.translations).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        result[key] = value[language];
      }
    });

    return result;
  }

  /**
   * Check if translation exists
   */
  has(key: string): boolean {
    return key in this.translations;
  }
}

export default new I18nService();
