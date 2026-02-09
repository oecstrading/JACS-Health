import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "app_language";

/**
 * Simple translations for key UI elements
 * Full translation service exists in app/services/translationService.ts
 */
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Settings
    settings: "Settings",
    preferences: "Preferences",
    voiceAssistant: "Voice Assistant",
    voiceAssistantDesc: "Enable AI voice interaction",
    medicationReminders: "Medication Reminders",
    medicationRemindersDesc: "Get notified for medications",
    darkMode: "Dark Mode",
    darkModeDesc: "Reduce eye strain at night",
    textSize: "Text Size",
    language: "Language",
    languageDesc: "Choose your preferred language",
    healthSettings: "Health Settings",
    emergencyContacts: "Emergency Contacts",
    emergencyContactsDesc: "Manage your emergency contacts",
    healthConditions: "Health Conditions",
    healthConditionsDesc: "Update your health profile",
    accountPrivacy: "Account & Privacy",
    whatsNew: "What's New",
    whatsNewDesc: "See latest features and updates",
    privacySettings: "Privacy Settings",
    privacySettingsDesc: "Control your data sharing",
    accountManagement: "Account Management",
    accountManagementDesc: "Update your profile",
    
    // Common
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    done: "Done",
    
    // Home
    hello: "Hello!",
    howFeeling: "How are you feeling today?",
    todaysSummary: "Today's Summary",
    quickActions: "Quick Actions",
    talkToAI: "Talk to AI Assistant",
    logMedication: "Log Medication",
    recordVitals: "Record Vitals",
  },
  es: {
    // Settings
    settings: "Configuración",
    preferences: "Preferencias",
    voiceAssistant: "Asistente de Voz",
    voiceAssistantDesc: "Habilitar interacción de voz con IA",
    medicationReminders: "Recordatorios de Medicamentos",
    medicationRemindersDesc: "Recibir notificaciones de medicamentos",
    darkMode: "Modo Oscuro",
    darkModeDesc: "Reducir la fatiga visual por la noche",
    textSize: "Tamaño de Texto",
    language: "Idioma",
    languageDesc: "Elija su idioma preferido",
    healthSettings: "Configuración de Salud",
    emergencyContacts: "Contactos de Emergencia",
    emergencyContactsDesc: "Administrar sus contactos de emergencia",
    healthConditions: "Condiciones de Salud",
    healthConditionsDesc: "Actualizar su perfil de salud",
    accountPrivacy: "Cuenta y Privacidad",
    whatsNew: "Novedades",
    whatsNewDesc: "Ver las últimas funciones y actualizaciones",
    privacySettings: "Configuración de Privacidad",
    privacySettingsDesc: "Controlar el intercambio de datos",
    accountManagement: "Gestión de Cuenta",
    accountManagementDesc: "Actualizar su perfil",
    
    // Common
    back: "Atrás",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    done: "Hecho",
    
    // Home
    hello: "¡Hola!",
    howFeeling: "¿Cómo te sientes hoy?",
    todaysSummary: "Resumen de Hoy",
    quickActions: "Acciones Rápidas",
    talkToAI: "Hablar con Asistente IA",
    logMedication: "Registrar Medicamento",
    recordVitals: "Registrar Signos Vitales",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === "en" || stored === "es") {
        setLanguageState(stored);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
