# JACS Medical Monitoring System — Store Listing Content

## App Identity

| Field | Value |
|-------|-------|
| **App Name** | JACS Medical Monitoring System |
| **Short Name** | JACS Health |
| **Package Name** | space.manus.health.companion.t20260208103805 |
| **Category** | Medical / Health & Fitness |
| **Content Rating** | Everyone (PEGI 3 / ESRB E) |
| **Version** | 1.0.33 |

---

## Google Play Store

### Short Description (80 characters max)
```
AI-powered personal health monitor for diabetes, BP, heart & family care.
```

### Full Description (4,000 characters max)
```
JACS Medical Monitoring System is your comprehensive, AI-powered personal health companion designed for individuals managing chronic conditions including diabetes, hypertension, heart disease, and more.

🩺 COMPREHENSIVE HEALTH TRACKING
Monitor blood glucose, blood pressure, heart rate, oxygen saturation, weight, and HbA1c — all in one place. Log readings manually or connect to compatible Bluetooth devices including CGM sensors, blood pressure monitors, and pulse oximeters. Virtual device mode lets users without physical devices still track all vitals through manual entry.

💊 SMART MEDICATION MANAGEMENT
Never miss a dose again. JACS tracks all your medications, sends customizable reminders, logs adherence history, and alerts you to potential drug interactions. Scan medication barcodes for instant identification and cost tracking.

👨‍👩‍👧‍👦 FAMILY CIRCLE CARE
Add up to 5 trusted family members or caregivers to your care circle. Share real-time health updates, receive alerts when a loved one's vitals go out of range, and communicate through the built-in family health chat.

🤖 AI HEALTH INSIGHTS
Powered by advanced AI, JACS analyzes your health trends, predicts potential issues before they become emergencies, and provides personalized recommendations based on your conditions and history.

⚠️ EMERGENCY ALERTS
Configurable danger zone thresholds trigger instant alerts when your blood pressure, glucose, or heart rate reaches critical levels. Emergency ID card stores your critical health information for first responders.

📊 DAILY HEALTH ROUTINE
Structured morning check-ins, mid-day vital checks, and evening reflections help you build consistent health habits. Track your documentation streak to stay motivated.

🏥 DOCTOR VISIT PREPARATION
Automatically generates health summaries, trend reports, and medication lists ready to share with your healthcare provider. Track upcoming appointments and log visit notes.

📋 CONDITION-SPECIFIC TEMPLATES
Specialized monitoring templates for Diabetes (Type 1 & 2), Hypertension, Heart Disease, Asthma, COPD, Kidney Disease, and more. Each template surfaces the metrics most relevant to your condition.

🔒 PRIVACY & SECURITY
Your health data is encrypted and stored securely. You control who sees your information. HIPAA-aligned data handling practices.

FEATURES AT A GLANCE:
• Blood glucose, blood pressure, heart rate, SpO2, weight tracking
• CGM integration (Dexcom compatible), insulin pump support
• Medication reminders with barcode scanning
• Family circle with real-time sharing (up to 5 members)
• AI-powered health insights and trend analysis
• Emergency alerts with configurable thresholds
• Emergency ID card for first responders
• Doctor visit summaries and appointment tracking
• Insurance card digital storage
• Daily morning/midday/evening health routines
• Meal planner with carb and calorie tracking
• Documentation streak motivation system
• Dark mode support
• Works offline — no internet required for core features

Download JACS today and take control of your health journey.
```

### Keywords / Tags
```
health monitor, diabetes tracker, blood pressure, glucose monitor, medication reminder, 
chronic disease management, CGM, insulin pump, family health, caregiver app, 
heart rate monitor, health diary, medical tracker, blood sugar, hypertension
```

### What's New (Release Notes v1.0.33)
```
• Added Family Circle chat with real-time health updates
• New Daily Control system: Morning Check-In, Mid-Day Vitals, Evening Reflection
• Meal Planner with carb and calorie tracking
• Documentation Streak to build consistent health habits
• Guided onboarding walkthrough for new users
• Caregiver Dashboard with multi-patient monitoring
• Condition Templates: MultiCondition switcher for users with multiple diagnoses
• Doctor Visit Tracker with appointment reminders
• Insurance Card digital storage
• Medical History Summary for doctor appointments
• Improved OTA update system with snooze option
• Bug fixes and performance improvements
```

---

## Amazon Appstore

### App Title (250 characters max)
```
JACS Medical Monitoring System - AI Health Companion for Diabetes, Blood Pressure & Family Care
```

### Short Description (1,200 characters max)
```
JACS Medical Monitoring System is your AI-powered personal health companion for managing chronic conditions. Track blood glucose, blood pressure, heart rate, medications, and more. Features Family Circle sharing with up to 5 caregivers, emergency alerts, doctor visit summaries, and condition-specific templates for diabetes, hypertension, heart disease, and more. Works offline. Virtual device mode available for users without physical monitoring equipment.
```

### Long Description (4,000 characters max)
*(Use the same full description as Google Play above)*

### Keywords (Amazon)
```
health monitor, diabetes, blood pressure, glucose, medication reminder, CGM, insulin, 
family health, caregiver, heart rate, chronic disease, medical tracker, health diary
```

---

## Privacy Policy

**Privacy Policy URL (required for both stores):**
You must host a privacy policy before submitting. Suggested content:

```
JACS Medical Monitoring System Privacy Policy

Last Updated: March 19, 2026

1. DATA COLLECTION
JACS collects health data you enter including vital signs, medications, and health history. 
This data is stored locally on your device and optionally synced to our secure servers 
if you enable cloud backup.

2. DATA USE
Your health data is used solely to provide the app's monitoring and analysis features. 
We do not sell, share, or monetize your personal health information.

3. DATA SHARING
Health data is shared only with family circle members you explicitly invite. 
Emergency alerts are sent only to contacts you designate.

4. DATA SECURITY
All data is encrypted in transit (TLS 1.3) and at rest (AES-256). 
We follow HIPAA-aligned data handling practices.

5. DATA DELETION
You may delete all your data at any time from Settings → Account → Delete All Data.

6. CONTACT
For privacy concerns: privacy@jacshealth.com
```

---

## Store Asset Checklist

| Asset | Size | Status | File |
|-------|------|--------|------|
| App Icon (Play Store) | 512×512 PNG | ✅ Ready | `store-assets/app-icon-1024.png` (resize to 512) |
| App Icon (Amazon) | 114×114 PNG | ✅ Ready | Resize from `app-icon-1024.png` |
| Feature Graphic (Play) | 1024×500 PNG | ✅ Ready | `store-assets/feature-graphic.png` |
| Screenshots (Phone) | Min 2, 320-3840px | ⏳ Needed | Capture from device/emulator |
| Screenshots (Tablet) | Optional | ⏳ Optional | Capture from tablet emulator |
| Promo Video | Optional | ⏳ Optional | 30-120 second screen recording |

### Screenshot Suggestions (capture these screens)
1. **Home Dashboard** — showing vitals overview and daily progress
2. **Blood Glucose Chart** — trend graph with AI insights
3. **Blood Pressure Log** — history with color-coded readings
4. **Medication Tracker** — medication list with reminder status
5. **Family Circle** — caregiver dashboard view
6. **Emergency ID Card** — critical health info display
7. **Morning Check-In** — daily routine screen
8. **Doctor Visit Summary** — health report ready to share

---

## Submission Checklist

### Google Play Store
- [ ] Create Google Play Console account ($25 one-time fee)
- [ ] Complete app content rating questionnaire (IARC)
- [ ] Add privacy policy URL
- [ ] Upload signed AAB (`eas build --platform android --profile production`)
- [ ] Add store listing content from this document
- [ ] Upload feature graphic and screenshots
- [ ] Set up `google-service-account.json` for automated submissions
- [ ] Submit for review (typically 3-7 days)

### Amazon Appstore
- [ ] Create Amazon Developer account (free)
- [ ] Build APK (`eas build --platform android --profile amazon`)
- [ ] Add store listing content from this document
- [ ] Upload app icon and screenshots
- [ ] Complete content rating
- [ ] Submit for review (typically 1-3 days)

### EAS Build Commands
```bash
# Google Play Store (AAB format)
bash scripts/build.sh --platform android --profile production --download

# Amazon Appstore (APK format)  
bash scripts/build.sh --platform android --profile amazon --download

# Preview APK for testing
bash scripts/build.sh --platform android --profile preview --download
```
