#!/usr/bin/env python3
import os

features = [
    {"route": "medication-tracker", "title": "Medication Tracker", "description": "Track all your medications, set reminders, and monitor adherence. Scan barcodes, check interactions, and receive refill alerts."},
    {"route": "vitals-tracker", "title": "Vitals Tracker", "description": "Log and monitor your vital signs including blood pressure, heart rate, weight, and blood glucose. View trends and receive alerts for abnormal readings."},
    {"route": "ai-assistant", "title": "AI Voice Assistant", "description": "Your personal health assistant powered by AI. Ask questions, log medications, schedule appointments, and get health advice using voice or text."},
    {"route": "health-insights", "title": "Health Insights Dashboard", "description": "Get predictive health alerts, view your wellness score, and receive personalized recommendations based on your health data."},
    {"route": "caregiver-connection", "title": "Caregiver Connection", "description": "Share your health data with family caregivers, communicate securely, and keep loved ones informed about your health status."},
    {"route": "appointments", "title": "Appointment Scheduling", "description": "Manage all your doctor appointments in one place. Set reminders, view calendar, and prepare for upcoming visits."},
    {"route": "wearables", "title": "Wearable Device Integration", "description": "Sync data from Apple Health, Google Fit, Fitbit, and other fitness trackers. Automatically import steps, heart rate, and activity data."},
    {"route": "emergency-sos", "title": "Emergency SOS", "description": "One-tap emergency calling with automatic location sharing. Alert caregivers and emergency contacts instantly when you need help."},
    {"route": "documentation-center", "title": "Health Documentation Center", "description": "Research health conditions, symptoms, treatments, and lifestyle tips. Access trusted medical information curated by healthcare professionals."},
    {"route": "medication-interaction-checker", "title": "Medication Interaction Checker", "description": "Check for dangerous drug interactions before taking new medications. View severity levels and get safety recommendations."},
    {"route": "fall-detection", "title": "Fall Detection", "description": "Automatic fall detection using your phone sensors. Instantly alerts caregivers and emergency contacts if a fall is detected."},
    {"route": "health-report-export", "title": "Health Report PDF Export", "description": "Generate comprehensive health reports for your doctors. Include vitals, medications, symptoms, and visit history in a professional PDF format."},
    {"route": "telemedicine", "title": "Telemedicine Video Calling", "description": "Connect with doctors via secure video calls. Share your screen to show health data and receive remote consultations."},
    {"route": "medication-refill", "title": "Medication Refill Reminders", "description": "Track prescription expiration dates and order refills from your pharmacy. Never run out of essential medications."},
    {"route": "social-features", "title": "Social Features", "description": "Join health challenges, earn achievement badges, participate in community forums, and message other users for support and motivation."},
    {"route": "medication-barcode-scanner", "title": "Medication Barcode Scanner", "description": "Scan medication barcodes to automatically fill in drug details, dosage, and instructions. Save time and reduce errors."},
    {"route": "health-goals", "title": "Health Goals & Progress Tracking", "description": "Set personalized health goals and track your progress over time. Visualize achievements and stay motivated."},
    {"route": "blood-pressure-dashboard", "title": "Blood Pressure Dashboard", "description": "Dedicated dashboard for blood pressure tracking with trend analysis, alerts for hypertension, and lifestyle recommendations."},
    {"route": "doctor-visit-preparation", "title": "Doctor Visit Preparation Tool", "description": "Prepare for doctor visits with AI-generated summaries of your health data and suggested questions to ask."},
    {"route": "nutrition-tracking", "title": "Nutrition Tracking", "description": "Log meals, track calories, and monitor macronutrients. Set dietary goals and receive nutritional insights."},
    {"route": "exercise-library", "title": "Exercise Library", "description": "Access 200+ senior-friendly workout videos with step-by-step instructions. Filter by difficulty, duration, and body part."},
    {"route": "symptom-diary", "title": "Symptom Diary", "description": "Track symptoms daily, identify patterns, and generate reports for your doctor. Correlate symptoms with medications and activities."},
    {"route": "medication-photo-recognition", "title": "Medication Photo Recognition", "description": "Take a photo of any pill and get instant identification using AI. Verify medications and prevent mix-ups."},
    {"route": "insurance-card-scanner", "title": "Health Insurance Card Scanner", "description": "Scan your insurance card to automatically extract policy information. Store digital copies and share with providers."},
    {"route": "wellness-score-dashboard", "title": "Wellness Score Dashboard", "description": "View your comprehensive wellness score with category breakdown. Track improvements and identify areas needing attention."},
    {"route": "ai-appointment-coach", "title": "AI Appointment Coach", "description": "Real-time transcription and note-taking during doctor visits. Never forget what your doctor said."},
    {"route": "fall-stability-alert", "title": "Predictive Fall & Stability Alert", "description": "7-day gait analysis with proactive fall risk alerts. Prevent falls before they happen with AI-powered predictions."},
    {"route": "medication-cost-optimizer", "title": "Medication Cost Optimizer", "description": "Compare medication prices across pharmacies and find cheaper generic alternatives. Save thousands on prescriptions."},
    {"route": "cgm-integration", "title": "Continuous Glucose Monitor Integration", "description": "Real-time glucose monitoring with trend analysis and alerts. Sync data from Dexcom, Freestyle Libre, and other CGM devices."},
    {"route": "food-scan", "title": "Food Scan & Instant Nutrition Analysis", "description": "Take a photo of any food and get instant nutritional information in 5 seconds. Track meals effortlessly."},
    {"route": "specialist-booking", "title": "Specialist Booking & Referral Tracker", "description": "Manage specialist appointments and track referrals. Never lose track of follow-up care."}
]

def generate_screen(title, description):
    component_name = title.replace(" ", "").replace("&", "And").replace("-", "")
    newline = '{"\\n"}'
    return f'''import {{ ScrollView, Text, View, TouchableOpacity }} from "react-native";
import {{ router }} from "expo-router";
import {{ ScreenContainer }} from "@/components/screen-container";
import {{ IconSymbol }} from "@/components/ui/icon-symbol";
import {{ useColors }} from "@/hooks/use-colors";

export default function {component_name}Screen() {{
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={{() => router.back()}}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full"
            style={{{{ backgroundColor: colors.surface }}}}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={{20}} color={{colors.primary}} />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">{title}</Text>
        </View>

        <View className="mb-6 rounded-xl bg-surface p-4">
          <Text className="text-base leading-relaxed text-foreground">
            {description}
          </Text>
        </View>

        <View className="items-center justify-center rounded-xl bg-primary/10 p-8">
          <Text className="mb-2 text-center text-xl font-bold text-primary">
            Coming Soon
          </Text>
          <Text className="text-center text-base text-muted">
            This feature is currently in development and will be available in a future update.
          </Text>
        </View>

        <View className="mt-6 space-y-4">
          <View className="rounded-xl border border-border bg-surface p-4">
            <Text className="mb-2 text-lg font-semibold text-foreground">Key Benefits</Text>
            <Text className="text-base text-muted">
              • Comprehensive tracking and monitoring{newline}
              • Real-time alerts and notifications{newline}
              • Easy-to-use interface{newline}
              • Secure data storage
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}}
'''

app_dir = '/home/ubuntu/health_companion/app'

for feature in features:
    file_path = os.path.join(app_dir, f"{feature['route']}.tsx")
    content = generate_screen(feature['title'], feature['description'])
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Created: {feature['route']}.tsx")

print(f"\nSuccessfully created {len(features)} feature screens!")
