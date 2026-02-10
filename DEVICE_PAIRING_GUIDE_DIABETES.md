# Diabetes Device Pairing & Testing Guide

**HealthMate - Dexcom G7 CGM & Omnipod 5 Insulin Pump Integration**

This guide provides step-by-step instructions for pairing your Dexcom G7 Continuous Glucose Monitor (CGM) and Omnipod 5 insulin pump with the HealthMate app, validating data sync, and troubleshooting common issues.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Dexcom G7 CGM Pairing](#dexcom-g7-cgm-pairing)
3. [Omnipod 5 Insulin Pump Pairing](#omnipod-5-insulin-pump-pairing)
4. [Validating Data Sync](#validating-data-sync)
5. [Troubleshooting](#troubleshooting)
6. [Medicare Compliance Verification](#medicare-compliance-verification)

---

## Prerequisites

### Device Requirements
- **Dexcom G7 CGM**: Active sensor with transmitter
- **Omnipod 5 Insulin Pump**: Active pod with controller
- **Smartphone**: iOS 15+ or Android 10+ with Bluetooth 5.0+
- **HealthMate App**: Latest version installed

### Before You Start
1. **Ensure devices are active and functioning**
   - Dexcom G7 sensor should be applied and transmitting
   - Omnipod 5 pod should be activated and delivering insulin
   - Both devices should be within 20 feet of your phone

2. **Enable Bluetooth on your phone**
   - iOS: Settings → Bluetooth → ON
   - Android: Settings → Connected Devices → Bluetooth → ON

3. **Grant HealthMate necessary permissions**
   - Bluetooth: Required for device communication
   - Notifications: Required for glucose alerts
   - Health App (iOS) / Health Connect (Android): Required for data sync

---

## Dexcom G7 CGM Pairing

### Step 1: Prepare Your Dexcom G7
1. Apply a new Dexcom G7 sensor following the manufacturer's instructions
2. Wait for the 30-minute warm-up period to complete
3. Ensure the Dexcom G7 app shows active glucose readings

### Step 2: Enable Health App Integration (iOS)
1. Open **Settings** → **Health** → **Data Access & Devices**
2. Find **Dexcom G7** in the list
3. Enable **Blood Glucose** read permission
4. Find **HealthMate** in the list
5. Enable **Blood Glucose** read permission

### Step 3: Enable Health Connect Integration (Android)
1. Open **Settings** → **Apps** → **Health Connect**
2. Find **Dexcom G7** and grant **Blood glucose** write permission
3. Find **HealthMate** and grant **Blood glucose** read permission

### Step 4: Pair in HealthMate
1. Open **HealthMate** app
2. Navigate to **Settings** → **Connected Devices**
3. Tap **Add Device** → **Dexcom G7 CGM**
4. Follow the on-screen pairing instructions:
   - Enable Bluetooth if prompted
   - Allow HealthMate to access Health data
   - Wait for automatic device discovery (30-60 seconds)
5. When "Dexcom G7 Found" appears, tap **Connect**
6. Confirm pairing on your phone's Bluetooth prompt

### Step 5: Verify Connection
1. In **Connected Devices**, you should see:
   - **Dexcom G7 CGM** with status **Connected** (green)
   - **Last Sync**: Within the last 5 minutes
   - **Latest Reading**: Current glucose value with trend arrow

2. Navigate to **Diabetes Dashboard**
3. Verify the **Current Glucose** card displays:
   - Your current glucose reading (mg/dL)
   - Trend arrow (↑↗→↘↓)
   - Timestamp (within last 5 minutes)

---

## Omnipod 5 Insulin Pump Pairing

### Step 1: Prepare Your Omnipod 5
1. Activate a new Omnipod 5 pod using your controller
2. Complete the pod fill and cannula insertion
3. Ensure the pod is delivering basal insulin normally
4. Verify the Omnipod 5 controller shows active insulin delivery

### Step 2: Enable Health App Integration (iOS)
1. Open **Settings** → **Health** → **Data Access & Devices**
2. Find **Omnipod 5** in the list
3. Enable **Insulin Delivery** read permission
4. Find **HealthMate** in the list
5. Enable **Insulin Delivery** read permission

### Step 3: Enable Health Connect Integration (Android)
1. Open **Settings** → **Apps** → **Health Connect**
2. Find **Omnipod 5** and grant **Insulin delivery** write permission
3. Find **HealthMate** and grant **Insulin delivery** read permission

### Step 4: Pair in HealthMate
1. Open **HealthMate** app
2. Navigate to **Settings** → **Connected Devices**
3. Tap **Add Device** → **Omnipod 5 Insulin Pump**
4. Follow the on-screen pairing instructions:
   - Enable Bluetooth if prompted
   - Allow HealthMate to access Health data
   - Wait for automatic device discovery (30-60 seconds)
5. When "Omnipod 5 Found" appears, tap **Connect**
6. Confirm pairing on your phone's Bluetooth prompt

### Step 5: Verify Connection
1. In **Connected Devices**, you should see:
   - **Omnipod 5 Insulin Pump** with status **Connected** (green)
   - **Last Sync**: Within the last 5 minutes
   - **Latest Data**: Current basal rate and reservoir level

2. Navigate to **Diabetes Dashboard**
3. Verify the **Omnipod Status** card displays:
   - **Insulin on Board (IOB)**: Current IOB value
   - **Reservoir Level**: Remaining insulin units
   - **Current Basal Rate**: Active basal rate (U/hr)
   - **Pod Expires**: Date/time when pod needs replacement

---

## Validating Data Sync

### Real-Time Glucose Monitoring Test
1. **Wait for a new glucose reading** (Dexcom G7 updates every 5 minutes)
2. **Check the Dexcom G7 app** and note the latest reading
3. **Open HealthMate** → **Diabetes Dashboard**
4. **Tap the refresh button** (↻ icon in top-right)
5. **Verify the glucose value matches** the Dexcom G7 app (within 1-2 mg/dL)
6. **Check the trend arrow** matches (↑↗→↘↓)
7. **Verify the timestamp** is within the last 5 minutes

### Insulin Delivery Tracking Test
1. **Deliver a bolus** using your Omnipod 5 controller (e.g., 1.0 unit test bolus)
2. **Wait 1-2 minutes** for the delivery to complete
3. **Open HealthMate** → **Diabetes Dashboard**
4. **Tap the refresh button** (↻ icon in top-right)
5. **Verify "Today's Insulin" card shows**:
   - **Bolus**: Increased by the test bolus amount
   - **Total**: Increased accordingly
6. **Check "Omnipod Status" card**:
   - **IOB**: Increased by the bolus amount
   - **Reservoir Level**: Decreased by the bolus amount

### 24-Hour Trend Chart Test
1. **Wait 24 hours** after initial pairing for sufficient data
2. **Open HealthMate** → **Diabetes Dashboard**
3. **Scroll to "Glucose Trend (24 Hours)" chart**
4. **Verify the chart displays**:
   - Glucose readings plotted over time
   - Green shaded area for target range (70-180 mg/dL)
   - Meal markers (if meals were logged)
   - Note markers (if notes were added)
5. **Compare with Dexcom G7 app** Clarity report to ensure data accuracy

### Time-in-Range Validation
1. **After 24 hours of data collection**
2. **Open HealthMate** → **Diabetes Dashboard**
3. **Check "Time in Range" card**:
   - **Very Low (<54)**: Should match Dexcom G7 app
   - **Low (54-69)**: Should match Dexcom G7 app
   - **In Range (70-180)**: Should match Dexcom G7 app (±2%)
   - **High (181-250)**: Should match Dexcom G7 app
   - **Very High (>250)**: Should match Dexcom G7 app

---

## Troubleshooting

### Dexcom G7 Not Connecting

**Issue**: HealthMate cannot find Dexcom G7 during pairing

**Solutions**:
1. **Ensure Dexcom G7 sensor is active**
   - Open Dexcom G7 app and verify glucose readings are displaying
   - If sensor is in warm-up, wait for completion (30 minutes)

2. **Check Bluetooth is enabled**
   - iOS: Settings → Bluetooth → ON
   - Android: Settings → Connected Devices → Bluetooth → ON

3. **Restart Bluetooth**
   - Turn Bluetooth OFF, wait 10 seconds, turn ON
   - Try pairing again

4. **Check Health App permissions** (iOS)
   - Settings → Health → Data Access & Devices
   - Verify both Dexcom G7 and HealthMate have Blood Glucose permissions

5. **Check Health Connect permissions** (Android)
   - Settings → Apps → Health Connect
   - Verify both Dexcom G7 and HealthMate have Blood glucose permissions

6. **Restart HealthMate app**
   - Force close HealthMate
   - Reopen and try pairing again

7. **Restart phone**
   - Power off phone completely
   - Power on and try pairing again

---

### Omnipod 5 Not Connecting

**Issue**: HealthMate cannot find Omnipod 5 during pairing

**Solutions**:
1. **Ensure Omnipod 5 pod is active**
   - Check Omnipod 5 controller shows active pod
   - Verify pod is delivering basal insulin

2. **Check Bluetooth is enabled**
   - iOS: Settings → Bluetooth → ON
   - Android: Settings → Connected Devices → Bluetooth → ON

3. **Restart Bluetooth**
   - Turn Bluetooth OFF, wait 10 seconds, turn ON
   - Try pairing again

4. **Check Health App permissions** (iOS)
   - Settings → Health → Data Access & Devices
   - Verify both Omnipod 5 and HealthMate have Insulin Delivery permissions

5. **Check Health Connect permissions** (Android)
   - Settings → Apps → Health Connect
   - Verify both Omnipod 5 and HealthMate have Insulin delivery permissions

6. **Move closer to pod**
   - Ensure phone is within 10 feet of the pod
   - Remove any metal objects between phone and pod

7. **Restart HealthMate app**
   - Force close HealthMate
   - Reopen and try pairing again

---

### Glucose Readings Not Updating

**Issue**: Glucose readings in HealthMate are outdated or not syncing

**Solutions**:
1. **Check Dexcom G7 app**
   - Verify readings are updating in the Dexcom G7 app
   - If not, troubleshoot Dexcom G7 sensor first

2. **Manual sync**
   - Open HealthMate → Diabetes Dashboard
   - Tap refresh button (↻ icon)
   - Wait 10-15 seconds for sync to complete

3. **Check Bluetooth connection**
   - Settings → Bluetooth
   - Verify Dexcom G7 is listed as "Connected"
   - If not, forget device and re-pair

4. **Check Health App sync** (iOS)
   - Open Health app
   - Navigate to Browse → Blood Glucose
   - Verify recent readings from Dexcom G7 are present
   - If not, check Dexcom G7 app permissions

5. **Check Health Connect sync** (Android)
   - Open Health Connect
   - Navigate to Blood glucose
   - Verify recent readings from Dexcom G7 are present
   - If not, check Dexcom G7 app permissions

6. **Background app refresh** (iOS)
   - Settings → General → Background App Refresh
   - Enable for both HealthMate and Dexcom G7

7. **Battery optimization** (Android)
   - Settings → Apps → HealthMate → Battery
   - Set to "Unrestricted" to prevent background sync interruption

---

### Insulin Data Not Syncing

**Issue**: Insulin deliveries in HealthMate are not matching Omnipod 5 controller

**Solutions**:
1. **Check Omnipod 5 controller**
   - Verify insulin deliveries are logged in the controller
   - Check pod is active and delivering normally

2. **Manual sync**
   - Open HealthMate → Diabetes Dashboard
   - Tap refresh button (↻ icon)
   - Wait 10-15 seconds for sync to complete

3. **Check Bluetooth connection**
   - Settings → Bluetooth
   - Verify Omnipod 5 is listed as "Connected"
   - If not, forget device and re-pair

4. **Check Health App sync** (iOS)
   - Open Health app
   - Navigate to Browse → Insulin Delivery
   - Verify recent deliveries from Omnipod 5 are present
   - If not, check Omnipod 5 app permissions

5. **Check Health Connect sync** (Android)
   - Open Health Connect
   - Navigate to Insulin delivery
   - Verify recent deliveries from Omnipod 5 are present
   - If not, check Omnipod 5 app permissions

6. **Wait for pod communication**
   - Omnipod 5 syncs with controller every 5 minutes
   - Wait 5-10 minutes and try manual sync again

---

### Red Flag Alerts Not Working

**Issue**: HealthMate is not sending glucose alerts for hypo/hyperglycemia

**Solutions**:
1. **Check notification permissions**
   - iOS: Settings → Notifications → HealthMate → Allow Notifications (ON)
   - Android: Settings → Apps → HealthMate → Notifications → All HealthMate notifications (ON)

2. **Check alert settings**
   - HealthMate → Settings → Health Settings → Red Flag Alerts
   - Verify "Glucose Alerts" is enabled
   - Check alert thresholds match your targets

3. **Test alert**
   - If glucose is currently in range, wait for a reading outside range
   - Or manually trigger a test alert in Settings

4. **Check Do Not Disturb**
   - iOS: Ensure Do Not Disturb is off or HealthMate is allowed
   - Android: Ensure Do Not Disturb allows HealthMate notifications

5. **Check Focus modes** (iOS)
   - Settings → Focus
   - Ensure HealthMate is allowed in active Focus modes

---

## Medicare Compliance Verification

### CPT 95250: Professional CGM (72+ hours)
1. **Open HealthMate** → **Medicare Compliance Dashboard**
2. **Check "CGM Days Active"**:
   - **Goal**: 3+ days (72+ hours) per billing cycle
   - **Status**: Green checkmark if compliant
3. **Verify in Diabetes Dashboard**:
   - Navigate to Diabetes Dashboard
   - Check "Device Compliance" card
   - **CGM Days Active**: Should show 3+ days

### CPT 95251: CGM Analysis & Report
1. **Generate diabetes PDF report**:
   - Open Diabetes Dashboard
   - Tap "Share with Doctor" button
   - Select date range (minimum 3 days)
   - Tap "Generate Report"
2. **Verify report includes**:
   - Time-in-range statistics
   - Glucose trend charts
   - Red flag alerts
   - Device compliance data

### CPT 99454: Remote Monitoring (16+ days)
1. **Open HealthMate** → **Medicare Compliance Dashboard**
2. **Check "Device Consistency"**:
   - **Goal**: 16+ days of data per 30-day billing cycle
   - **Status**: Green checkmark if compliant
3. **Track progress**:
   - Dashboard shows "X / 16 days" progress
   - Ensure daily glucose sync to maintain compliance

### CPT 99457/99470: Interactive Communication
1. **Log doctor communications**:
   - Settings → Health Settings → Doctor Communication Log
   - Tap "Add Communication"
   - Select mode (Phone, Video, Portal)
   - Enter duration and notes
2. **Verify billing eligibility**:
   - Medicare Compliance Dashboard
   - Check "Interactive Communication" status
   - **CPT 99470**: 10+ minutes logged
   - **CPT 99457**: 20+ minutes logged

---

## Support & Contact

For technical support or questions about HealthMate diabetes device integration:

- **Email**: cuthbert@oecstrading.com
- **Phone**: 954-478-6113
- **WhatsApp**: 758-488-1429

For Dexcom G7 device issues, contact Dexcom Technical Support: 1-844-607-8398

For Omnipod 5 device issues, contact Insulet Customer Care: 1-800-591-3455

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**HealthMate App Version**: Phase 44
