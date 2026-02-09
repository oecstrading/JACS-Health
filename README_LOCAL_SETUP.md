# HealthMate - AI Health Companion for Seniors

A comprehensive mobile health application designed for older adults and their caregivers, featuring AI-powered health assistance, medication management, vital signs monitoring, and family care coordination.

## 🌟 Features

### Core Health Management
- **AI Health Assistant**: Voice-enabled conversational AI for health questions and guidance
- **Medication Management**: Smart reminders with voice alerts, one-tap logging, and adherence tracking
- **Vital Signs Monitoring**: Real-time tracking of blood pressure, heart rate, oxygen saturation
- **Omron Device Integration**: Automatic data sync via Bluetooth and WiFi from Omron health devices

### Advanced Features
- **Health Milestone Celebrations**: Animated achievements for 30-day medication adherence, 10,000 steps, and more
- **Telemedicine Integration**: Video consultations with healthcare providers
- **Caregiver Dashboard**: Family members can monitor health status and receive alerts
- **Symptom Diary**: Track symptoms and share with doctors
- **Exercise Library**: Senior-friendly exercises with video demonstrations
- **Nutrition Tracking**: Meal logging and dietary recommendations
- **Fall Detection & Stability Monitoring**: Safety features for seniors
- **Cognitive Health Checks**: Memory and brain health assessments

## 📋 Prerequisites

Before running this project locally, ensure you have:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **pnpm**: Package manager (install via `npm install -g pnpm`)
- **Git**: Version control ([Download](https://git-scm.com/))
- **Expo Go App** (for mobile testing):
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd health_companion

# Or download and extract the ZIP file from Management UI
```

### 2. Install Dependencies

```bash
# Install all required packages
pnpm install
```

### 3. Start Development Server

```bash
# Start both backend server and Expo Metro bundler
pnpm dev

# Or start them separately:
pnpm dev:server    # Backend API server (port 3000)
pnpm dev:metro     # Expo Metro bundler (port 8081)
```

### 4. Access the App

**Web Browser:**
- Open http://localhost:8081 in your browser
- Works on desktop and mobile browsers

**Mobile Device (via Expo Go):**
1. Install Expo Go app on your phone
2. Scan the QR code displayed in terminal
3. Or run `pnpm qr` to generate QR code

**iOS Simulator:**
```bash
pnpm ios
```

**Android Emulator:**
```bash
pnpm android
```

## 📁 Project Structure

```
health_companion/
├── app/                          # Application screens and routes
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen (main dashboard)
│   │   └── _layout.tsx          # Tab bar configuration
│   ├── _layout.tsx              # Root layout with providers
│   ├── assistant.tsx            # AI health assistant screen
│   ├── health.tsx               # Health tracking screen
│   ├── omron-devices.tsx        # Omron device management
│   ├── realtime-vitals.tsx      # Live vitals monitoring
│   ├── milestones.tsx           # Achievement celebrations
│   ├── telemedicine.tsx         # Video consultation
│   ├── caregiver-dashboard.tsx  # Family caregiver view
│   └── ... (30+ other screens)
│
├── services/                     # Business logic and integrations
│   ├── omronService.ts          # Omron device Bluetooth/WiFi integration
│   ├── medicationReminderService.ts  # Medication scheduling & voice reminders
│   ├── milestoneService.ts      # Achievement tracking and celebrations
│   └── ... (other services)
│
├── components/                   # Reusable UI components
│   ├── screen-container.tsx     # Safe area wrapper for all screens
│   ├── action-card.tsx          # Quick action button component
│   ├── themed-view.tsx          # Theme-aware view component
│   └── ui/                      # UI primitives
│       └── icon-symbol.tsx      # Icon mapping (SF Symbols → Material Icons)
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication state
│   ├── use-colors.ts            # Theme colors
│   └── use-color-scheme.ts      # Dark/light mode detection
│
├── lib/                          # Utilities and configurations
│   ├── trpc.ts                  # API client
│   ├── utils.ts                 # Helper functions (cn, etc.)
│   └── theme-provider.tsx       # Global theme context
│
├── constants/                    # App constants
│   └── theme.ts                 # Color palette
│
├── server/                       # Backend API (optional)
│   ├── _core/                   # Server core
│   ├── routers/                 # API routes
│   └── db/                      # Database schemas
│
├── assets/                       # Static assets
│   └── images/                  # App icons, splash screens
│
├── app.config.ts                # Expo configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── theme.config.js              # Theme color tokens
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── todo.md                      # Feature tracking checklist
```

## 🎨 Customization

### Update App Branding

Edit `app.config.ts`:

```typescript
const env = {
  appName: "Your App Name",
  appSlug: "your-app-slug",
  logoUrl: "https://your-logo-url.png",
  // ...
};
```

### Customize Theme Colors

Edit `theme.config.js`:

```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  background: { light: '#ffffff', dark: '#151718' },
  // ... customize all colors
};
```

### Modify Home Screen

Edit `app/(tabs)/index.tsx` to change the main dashboard layout and quick actions.

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start full development environment
pnpm dev:server       # Start backend server only
pnpm dev:metro        # Start Expo Metro bundler only

# Testing
pnpm test             # Run unit tests
pnpm check            # TypeScript type checking
pnpm lint             # Run ESLint

# Building
pnpm build            # Build backend server
pnpm start            # Start production server

# Mobile
pnpm android          # Open in Android emulator
pnpm ios              # Open in iOS simulator
pnpm qr               # Generate QR code for Expo Go

# Database
pnpm db:push          # Push database schema changes

# Code Quality
pnpm format           # Format code with Prettier
```

## 🗄️ Database Setup (Optional)

The app includes optional backend features (user accounts, cloud sync). To use them:

1. **Set up database connection** in `.env`:
```env
DATABASE_URL=mysql://user:password@host:port/database
```

2. **Push database schema**:
```bash
pnpm db:push
```

3. **Access database UI** in Management UI → Database tab

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Backend API (optional)
DATABASE_URL=mysql://user:password@localhost:3306/healthmate

# External APIs (if needed)
OPENAI_API_KEY=your_openai_key_here
```

## 📱 Building for Production

### Web Deployment
```bash
# Build static web version
npx expo export:web

# Output in web-build/ directory
```

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Build Android app
eas build --platform android --profile production
```

### iOS App
```bash
# Build iOS app (requires Apple Developer account)
eas build --platform ios --profile production
```

## 🧪 Testing

The app uses Vitest for unit testing:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test services/medicationReminderService.test.ts
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start -c
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Check for type errors
pnpm check
```

### Port Already in Use
```bash
# Kill process on port 8081
npx kill-port 8081

# Or specify different port
EXPO_PORT=8082 pnpm dev:metro
```

## 📚 Key Technologies

- **Expo SDK 54**: React Native framework
- **React 19**: UI library
- **TypeScript 5.9**: Type safety
- **NativeWind 4**: Tailwind CSS for React Native
- **Expo Router 6**: File-based routing
- **tRPC**: Type-safe API
- **Drizzle ORM**: Database toolkit
- **React Query**: Server state management
- **Expo Audio**: Voice reminders
- **Expo Notifications**: Push notifications
- **Expo Speech**: Text-to-speech
- **React Native Reanimated**: Animations

## 🔒 Privacy & Security

- All health data stored locally by default (AsyncStorage)
- Optional cloud sync with end-to-end encryption
- HIPAA-compliant architecture (when using backend)
- Secure credential storage (Expo SecureStore)
- No third-party analytics or tracking

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For questions or issues:
- Review the `todo.md` file for feature status
- Check the inline code comments
- Refer to [Expo Documentation](https://docs.expo.dev/)

## 🎯 Next Steps

1. **Customize branding**: Update app name, logo, and colors
2. **Test on devices**: Use Expo Go to test on real phones
3. **Add content**: Customize health tips, exercise videos, etc.
4. **Deploy**: Publish to web or build native apps
5. **Launch**: Submit to App Store and Google Play

---

**Built with ❤️ for seniors and their caregivers**
