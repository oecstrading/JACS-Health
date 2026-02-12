#!/usr/bin/env node

/**
 * Generate QR codes for deep links to specific JACS Medical Monitoring System features
 * 
 * Usage: node scripts/generate-feature-qr-codes.mjs
 * 
 * Generates QR codes for:
 * - Revenue Command Dashboard
 * - Medication Tracker
 * - Vitals Tracker
 * - AI Assistant
 * - Connected Devices
 */

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deep link scheme from app.config.ts
const SCHEME = 'manus20260208103805';

// Feature routes to generate QR codes for
const FEATURES = [
  {
    name: 'Revenue Command',
    route: '/hospice-revenue-command',
    filename: 'revenue-command-qr.png',
    description: 'Track APU status, HIS/HOPE submissions, CAHPS compliance'
  },
  {
    name: 'Medication Tracker',
    route: '/medication-tracker',
    filename: 'medication-tracker-qr.png',
    description: 'Manage medications, log doses, track adherence'
  },
  {
    name: 'Vitals Tracker',
    route: '/vitals-tracker',
    filename: 'vitals-tracker-qr.png',
    description: 'Monitor BP, glucose, weight, heart rate, temp, O2'
  },
  {
    name: 'AI Assistant',
    route: '/ai-assistant',
    filename: 'ai-assistant-qr.png',
    description: 'Ask health questions, get personalized recommendations'
  },
  {
    name: 'Connected Devices',
    route: '/connected-devices',
    filename: 'connected-devices-qr.png',
    description: 'Connect Bluetooth health monitors for automatic syncing'
  },
  {
    name: 'Nurse Leader Dashboard',
    route: '/nurse-leader-dashboard',
    filename: 'nurse-leader-qr.png',
    description: 'View KPIs, staff leaderboards, gap-in-care alerts'
  },
  {
    name: 'Features List',
    route: '/(tabs)/features',
    filename: 'features-list-qr.png',
    description: 'Browse all 70+ HealthMate features'
  }
];

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'qr-codes');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateQRCode(feature) {
  const deepLink = `${SCHEME}:${feature.route}`;
  const outputPath = path.join(OUTPUT_DIR, feature.filename);
  
  try {
    await QRCode.toFile(outputPath, deepLink, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log(`✓ Generated QR code for ${feature.name}`);
    console.log(`  Deep link: ${deepLink}`);
    console.log(`  File: ${outputPath}`);
    console.log(`  Description: ${feature.description}`);
    console.log('');
  } catch (error) {
    console.error(`✗ Failed to generate QR code for ${feature.name}:`, error.message);
  }
}

async function generateAllQRCodes() {
  console.log('Generating feature-specific QR codes for JACS Medical Monitoring System...\n');
  console.log(`Deep link scheme: ${SCHEME}\n`);
  
  for (const feature of FEATURES) {
    await generateQRCode(feature);
  }
  
  console.log('Done! QR codes saved to:', OUTPUT_DIR);
  console.log('\nTo use these QR codes:');
  console.log('1. Scan with Expo Go app to open JACS Medical Monitoring System');
  console.log('2. App will automatically navigate to the specific feature');
  console.log('3. QR codes can be printed on marketing materials, posters, etc.');
}

generateAllQRCodes().catch(console.error);
