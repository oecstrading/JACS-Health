# AI Health Companion - Design Document

## App Overview

**AI Health Companion** is a comprehensive mobile health application designed specifically for older adults (65+) and their family caregivers. The app combines intuitive health tracking with AI-powered voice interaction, predictive alerts, and personalized recommendations to improve health outcomes and independence.

## Target Users

### Primary Users: Older Adults (65+)
- May have visual impairments (reduced contrast sensitivity, color discrimination)
- May have motor challenges (reduced dexterity, tremors)
- May have cognitive changes (memory, attention)
- Often have limited tech experience
- Need confidence-building through success

### Secondary Users: Family Caregivers
- Need remote monitoring capabilities
- Want to stay informed about loved one's health
- Require quick access to critical information
- Need communication tools

## Design Principles (Based on NIH Research)

### Two Core Rules:
1. **SIMPLIFY** - Reduce complexity at every level
2. **INCREASE SIZE AND DISTANCE** - Large, well-spaced interactive controls

### Key Guidelines:
- **Large Text**: Minimum 18pt font, sans-serif (SF Pro for iOS, Roboto for Android)
- **High Contrast**: Strong contrast ratios for all text and interactive elements
- **Simple Navigation**: Maximum 2 levels deep, clear back buttons
- **Large Touch Targets**: Minimum 60x60 pixels (larger than standard 44x44)
- **No Time Limits**: No timed activities or auto-dismissing alerts
- **Clear Feedback**: Immediate visual and haptic feedback for all actions
- **Voice Alternative**: Every feature accessible via voice commands

## Screen List & Functionality

### 1. Home Screen (Dashboard)
**Purpose**: Quick overview of daily health status and easy access to main features

**Content**:
- Large greeting with user's name
- Today's health summary (medications due, vitals logged, activities completed)
- Quick action cards (large, colorful, with icons + text labels):
  - "Talk to AI Assistant" (voice icon)
  - "Log Medication" (pill icon)
  - "Record Vitals" (heart icon)
  - "View Health Insights" (chart icon)
- Emergency contact button (always visible, red, top-right)

**Layout**: Single column, large cards with 24px spacing, scrollable

### 2. AI Voice Assistant Screen
**Purpose**: Conversational health companion for questions, reminders, and support

**Content**:
- Large microphone button (center, animated when listening)
- Conversation history (large text, alternating colors for user/AI)
- Quick suggestion chips: "How am I doing?", "Remind me to...", "What should I eat?"
- Text input alternative (keyboard icon, bottom)

**Functionality**:
- Voice recognition with visual feedback
- Natural language understanding for health queries
- Medication reminders and scheduling
- Health tips and education
- Emergency detection (calls for help if user says "help" or "emergency")

### 3. Medication Tracker
**Purpose**: Track medications, set reminders, log doses

**Content**:
- Today's medications list (large cards, checkboxes)
- Each card shows: medication name, dosage, time, photo of pill
- "Add Medication" button (large, bottom)
- Medication history (calendar view, simple)

**Functionality**:
- Push notifications for medication times
- Photo recognition for pill identification (using AI)
- Missed dose alerts
- Refill reminders (predictive based on usage)

### 4. Vitals Tracker
**Purpose**: Log and monitor vital signs (blood pressure, heart rate, weight, glucose, temperature)

**Content**:
- Large input cards for each vital type
- Simple number pads (extra large buttons)
- Visual trends (simple line charts with large labels)
- Color-coded status indicators (green/yellow/red)

**Functionality**:
- Manual entry with validation
- Trend analysis (AI detects concerning patterns)
- Alerts for abnormal readings
- Share data with caregivers

### 5. Activity & Wellness
**Purpose**: Track daily activities, exercise, sleep, mood

**Content**:
- Daily checklist (large checkboxes):
  - Morning walk
  - Meals (breakfast, lunch, dinner)
  - Water intake (visual glass icons)
  - Sleep quality (emoji scale)
  - Mood (emoji scale)
- Weekly activity summary (simple bar chart)

**Functionality**:
- One-tap logging
- Pedometer integration (step count)
- Sleep pattern analysis
- Mood trends

### 6. Health Insights
**Purpose**: AI-generated personalized health recommendations and alerts

**Content**:
- Predictive alerts (large cards, color-coded):
  - "Your blood pressure has been trending up - consider reducing salt"
  - "You've been less active this week - try a short walk today"
  - "Great job! You've taken all medications on time"
- Health score (simple 0-100 with visual gauge)
- Personalized tips (based on user's conditions and data)

**Functionality**:
- Machine learning analysis of health data
- Pattern detection (fall risk, medication adherence, vital trends)
- Actionable recommendations
- Progress tracking

### 7. Caregiver Connection
**Purpose**: Allow family members to monitor and communicate

**Content**:
- Connected caregivers list (photos, names)
- Shared health summary (read-only for caregivers)
- Message center (simple, large text)
- Emergency alert history

**Functionality**:
- Invite caregivers via email/phone
- Real-time health data sharing (with user permission)
- Push notifications for caregivers (critical alerts only)
- Two-way messaging

### 8. Settings
**Purpose**: Customize app, manage account, emergency contacts

**Content**:
- Large toggle switches for:
  - Voice assistant enabled
  - Medication reminders
  - Dark mode
  - Text size (Small/Medium/Large/Extra Large)
- Emergency contacts (add/edit, with photos)
- Health conditions (diabetes, hypertension, etc.)
- Privacy settings

## Key User Flows

### Flow 1: Morning Medication Routine
1. User opens app → Home screen shows "2 medications due now" alert
2. User taps "Log Medication" card
3. Medication list appears with checkboxes
4. User taps checkbox for each medication
5. Haptic feedback + visual checkmark
6. "Great job! All morning medications logged" confirmation
7. Return to home screen

### Flow 2: Voice Interaction
1. User taps "Talk to AI Assistant" on home screen
2. Large microphone button appears with "Listening..." animation
3. User says "How is my blood pressure doing?"
4. AI responds with voice + text: "Your blood pressure has been stable this week, averaging 125/80. That's in the healthy range. Keep up the good work!"
5. Follow-up suggestions appear as chips
6. User can ask another question or return home

### Flow 3: Caregiver Alert
1. User's blood pressure reading is 160/95 (high)
2. App shows alert: "Your blood pressure is higher than usual. Would you like to notify your caregiver?"
3. User taps "Yes"
4. Caregiver receives push notification: "Mom's blood pressure is 160/95, higher than usual"
5. Caregiver opens app, sees detailed health summary
6. Caregiver sends message: "Hi Mom, I saw your BP is up. How are you feeling?"
7. User receives message notification and can respond

## Color Palette

### Primary Colors:
- **Primary Blue**: `#0a7ea4` (calm, trustworthy, medical)
- **Success Green**: `#22C55E` (positive feedback, healthy status)
- **Warning Orange**: `#F59E0B` (caution, attention needed)
- **Error Red**: `#EF4444` (urgent, critical alerts)

### Neutral Colors:
- **Background Light**: `#FFFFFF` (clean, easy to read)
- **Background Dark**: `#151718` (reduced eye strain in dark mode)
- **Text Primary**: `#11181C` (high contrast for readability)
- **Text Muted**: `#687076` (secondary information)
- **Surface**: `#F5F5F5` (cards, elevated elements)
- **Border**: `#E5E7EB` (subtle separation)

## Typography

- **Headings**: 28-32pt, Bold, SF Pro (iOS) / Roboto (Android)
- **Body Text**: 18-20pt, Regular, SF Pro / Roboto
- **Button Text**: 20pt, Semibold
- **Small Text**: 16pt minimum (for labels, captions)
- **Line Height**: 1.5x font size (for readability)

## Iconography

- Use SF Symbols (iOS) / Material Icons (Android)
- Always pair icons with text labels
- Minimum icon size: 32x32 pixels
- Use filled icons (easier to recognize)
- Color-code by function:
  - Blue: informational, navigation
  - Green: success, health positive
  - Orange: warning, attention
  - Red: error, emergency

## AI Features Implementation

### 1. Voice Interaction
- **Technology**: Server-side LLM (built-in, no API key needed)
- **Features**:
  - Speech-to-text (Expo Audio API)
  - Natural language processing (LLM)
  - Text-to-speech (Expo Speech API)
  - Context-aware responses (remembers conversation)
- **Use Cases**:
  - "What medications do I take in the morning?"
  - "Remind me to drink water every 2 hours"
  - "How am I doing this week?"
  - "What should I eat for dinner?"

### 2. Predictive Health Alerts
- **Technology**: Machine learning on health data trends
- **Algorithms**:
  - Time series analysis for vital trends
  - Pattern detection for medication adherence
  - Risk scoring for fall prevention
  - Anomaly detection for unusual readings
- **Alerts**:
  - "Your blood pressure has been trending up over the past 3 days"
  - "You haven't logged your evening medication in 2 days"
  - "Your activity level is lower than usual - consider a short walk"
  - "Your weight has increased by 5 lbs this week - monitor fluid intake"

### 3. Personalized Recommendations
- **Technology**: Rule-based + ML recommendations
- **Factors**:
  - User's health conditions (diabetes, hypertension, etc.)
  - Current vital trends
  - Medication adherence patterns
  - Activity levels
  - Age and demographic data
- **Examples**:
  - "Based on your diabetes, try to limit carbs to 45g per meal"
  - "Your heart rate is elevated - try some deep breathing exercises"
  - "You're doing great with your medications! Keep it up"

### 4. Health Data Analysis
- **Technology**: Statistical analysis + visualization
- **Features**:
  - Trend detection (improving, stable, declining)
  - Correlation analysis (sleep quality vs. blood pressure)
  - Predictive modeling (fall risk score, hospitalization risk)
  - Comparative analysis (this week vs. last week)
- **Visualizations**:
  - Simple line charts (vitals over time)
  - Bar charts (activity levels)
  - Gauges (health score, risk scores)
  - Color-coded status indicators

## Technical Architecture

### Frontend (React Native + Expo)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: React Context + AsyncStorage (local-first)
- **Data Fetching**: tRPC + TanStack Query (for server features)
- **Voice**: Expo Audio (recording) + Expo Speech (playback)
- **Notifications**: Expo Notifications

### Backend (Optional, for advanced features)
- **Server**: Express + tRPC
- **Database**: PostgreSQL + Drizzle ORM
- **AI/LLM**: Built-in multimodal AI (no API key required)
- **Auth**: OAuth (for caregiver accounts)
- **Storage**: S3-compatible (for user photos, audio)

### Data Storage Strategy
- **Local-First**: All health data stored in AsyncStorage by default
- **Cloud Sync**: Optional, only if user wants caregiver access or multi-device sync
- **Privacy**: User controls what data is shared with caregivers

## Accessibility Features

- **VoiceOver/TalkBack**: Full screen reader support
- **Dynamic Type**: Respects system font size settings
- **High Contrast Mode**: Automatic detection and adaptation
- **Reduced Motion**: Respects system animation preferences
- **Color Blind Friendly**: Don't rely solely on color for information
- **Haptic Feedback**: For users with hearing impairments
- **Voice Control**: Full app navigation via voice commands

## Privacy & Security

- **Data Encryption**: All health data encrypted at rest and in transit
- **User Control**: Users decide what data to share with caregivers
- **HIPAA Considerations**: No PHI stored on external servers without consent
- **Emergency Access**: Caregivers can access critical info in emergencies
- **Audit Log**: Track who accessed what data and when

## Success Metrics

- **Medication Adherence**: % of medications logged on time
- **User Engagement**: Daily active users, session duration
- **Health Outcomes**: Vital trends (improving, stable, declining)
- **Caregiver Satisfaction**: Response time to alerts, communication frequency
- **AI Accuracy**: Prediction accuracy for health alerts
- **User Confidence**: Self-reported confidence in managing health

## Future Enhancements (Post-MVP)

- Integration with wearables (Apple Watch, Fitbit)
- Telemedicine video calls with doctors
- Prescription refill automation
- Social features (connect with other seniors)
- Gamification (health challenges, badges)
- Multi-language support
- Integration with medical records (FHIR)
