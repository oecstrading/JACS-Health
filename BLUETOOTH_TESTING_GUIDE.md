# Bluetooth Device Testing Guide

Complete guide for testing HealthMate's Bluetooth device pairing and data syncing with your Omron 3550, Samsung Galaxy Watch 7, and iHome scale.

---

## Prerequisites

1. **Install Expo Go** on your smartphone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Enable Bluetooth** on your smartphone

3. **Charge your devices**:
   - Omron 3550 Blood Pressure Monitor
   - Samsung Galaxy Watch 7
   - iHome Smart Scale

4. **Have devices nearby** (within 10 feet / 3 meters)

---

## Step 1: Open HealthMate in Expo Go

1. Open Expo Go on your smartphone
2. Scan the QR code from the development server:
   - QR code URL: `exps://8081-im19ugknqfh3tdx4o8uhh-7f943398.us2.manus.computer`
   - Or manually enter the URL in Expo Go

3. Wait for HealthMate to load (may take 30-60 seconds on first launch)

---

## Step 2: Navigate to Bluetooth Devices

1. Tap the **Settings** tab (bottom navigation)
2. Scroll down to the **Health Settings** section
3. Tap **Bluetooth Devices** (🔵 Bluetooth icon)

---

## Step 3: Pair Your Omron 3550 Blood Pressure Monitor

### Prepare the Device
1. Turn on your Omron 3550
2. Put it in **pairing mode** (consult your Omron manual - usually involves holding a button for 3-5 seconds)
3. The device should show a Bluetooth icon or "PAIR" on the display

### Pair in HealthMate
1. In the Bluetooth Devices screen, tap **Scan for Devices**
2. Wait 10 seconds for the scan to complete
3. Look for your Omron device in the **Discovered Devices** list
   - Device name may appear as "HEM-xxxx", "BP-xxxx", or "Omron"
4. Tap **Pair** next to your Omron device
5. Confirm the pairing dialog
6. ✅ Success! Your Omron 3550 should now appear in **Paired Devices**

### Test Data Sync
1. Take a blood pressure reading with your Omron 3550
2. After the reading completes, the device should automatically sync to HealthMate
3. You should receive a notification: "Blood Pressure Synced: XXX/YY mmHg, Pulse: ZZ bpm"
4. Tap the notification to view your reading in HealthMate

---

## Step 4: Pair Your Samsung Galaxy Watch 7

### Prepare the Device
1. On your Samsung Watch, open **Settings** → **Connections** → **Bluetooth**
2. Enable **Bluetooth** if not already on
3. Make the watch **discoverable** (may be automatic)

### Pair in HealthMate
1. In the Bluetooth Devices screen, tap **Scan for Devices**
2. Wait 10 seconds for the scan to complete
3. Look for your Samsung Watch in the **Discovered Devices** list
   - Device name may appear as "Galaxy Watch7", "SM-xxxx", or your custom watch name
4. Tap **Pair** next to your Samsung Watch
5. Confirm the pairing dialog
6. ✅ Success! Your Samsung Watch should now appear in **Paired Devices**

### Test Data Sync
1. On your Samsung Watch, start a heart rate measurement or take some steps
2. The watch should automatically sync heart rate and step data to HealthMate
3. You should receive notifications:
   - "Heart Rate Synced: XX bpm"
   - "Steps Synced: X,XXX steps"
4. Tap the notifications to view your data in HealthMate

---

## Step 5: Pair Your iHome Smart Scale

### Prepare the Device
1. Turn on your iHome scale (step on it briefly or press the power button)
2. Put it in **pairing mode** (consult your iHome manual - usually automatic when powered on)
3. The scale should show a Bluetooth icon on the display

### Pair in HealthMate
1. In the Bluetooth Devices screen, tap **Scan for Devices**
2. Wait 10 seconds for the scan to complete
3. Look for your iHome scale in the **Discovered Devices** list
   - Device name may appear as "iHome", "Scale", or a model number
4. Tap **Pair** next to your iHome scale
5. Confirm the pairing dialog
6. ✅ Success! Your iHome scale should now appear in **Paired Devices**

### Test Data Sync
1. Step on your iHome scale and wait for a weight reading
2. After the reading completes, the scale should automatically sync to HealthMate
3. You should receive a notification: "Weight Synced: XXX lb (or kg), BMI: XX.X"
4. Tap the notification to view your weight data in HealthMate

---

## Troubleshooting

### Device Not Appearing in Scan

**Problem**: Your device doesn't show up in the Discovered Devices list after scanning.

**Solutions**:
1. **Check Bluetooth is ON**: Ensure Bluetooth is enabled on your smartphone
2. **Check device is in pairing mode**: Consult your device manual to confirm pairing mode
3. **Move closer**: Ensure device is within 10 feet (3 meters) of your smartphone
4. **Restart device**: Turn off and turn on your health device
5. **Restart Bluetooth**: Toggle Bluetooth off and on in your smartphone settings
6. **Scan again**: Tap "Scan for Devices" again in HealthMate

### Device Paired But Not Syncing

**Problem**: Device is paired but data isn't syncing automatically.

**Solutions**:
1. **Check device battery**: Low battery can prevent Bluetooth transmission
2. **Check smartphone permissions**: Ensure HealthMate has Bluetooth permissions
   - iOS: Settings → HealthMate → Bluetooth → Allow
   - Android: Settings → Apps → HealthMate → Permissions → Bluetooth → Allow
3. **Unpair and re-pair**: Tap "Unpair" in HealthMate, then pair again
4. **Restart HealthMate**: Close Expo Go and reopen HealthMate

### Notification Not Appearing

**Problem**: Data syncs but you don't receive notifications.

**Solutions**:
1. **Check notification permissions**: Ensure HealthMate has notification permissions
   - iOS: Settings → Notifications → Expo Go → Allow Notifications
   - Android: Settings → Apps → Expo Go → Notifications → Allow
2. **Check Do Not Disturb**: Ensure your smartphone isn't in Do Not Disturb mode
3. **Restart HealthMate**: Close Expo Go and reopen HealthMate

### Data Format Issues

**Problem**: Data syncs but values look incorrect or unusual.

**Solutions**:
1. **Report to developer**: Take a screenshot of the incorrect data and send it to the development team
2. **Include device details**: Provide your device model number and firmware version
3. **Describe the issue**: Explain what you expected vs. what you saw

---

## Providing Feedback

After testing, please provide feedback on:

1. **Pairing Success**: Were you able to pair all three devices successfully?
2. **Data Sync**: Did data sync automatically after taking readings?
3. **Notifications**: Did you receive notifications for synced data?
4. **Data Accuracy**: Were the synced values correct?
5. **User Experience**: Was the pairing process easy to understand?
6. **Issues Encountered**: Any errors, crashes, or unexpected behavior?

### How to Provide Feedback

Send your feedback via email or chat, including:
- Device models and firmware versions
- Screenshots of any errors or issues
- Description of what worked and what didn't
- Suggestions for improvements

---

## Technical Details (For Developers)

### Bluetooth Protocols Used

**Omron 3550**:
- Service: Blood Pressure Service (UUID: `0x1810`)
- Characteristic: Blood Pressure Measurement (UUID: `0x2A35`)
- Protocol: IEEE 11073-10407 (Health Device Profile)

**Samsung Galaxy Watch 7**:
- Service: Heart Rate Service (UUID: `0x180D`)
- Characteristic: Heart Rate Measurement (UUID: `0x2A37`)
- Protocol: Bluetooth SIG Heart Rate Profile

**iHome Smart Scale**:
- Service: Weight Scale Service (UUID: `0x181D`)
- Characteristic: Weight Measurement (UUID: `0x2A9D`)
- Protocol: Bluetooth SIG Weight Scale Profile

### Data Storage

All synced data is stored locally in AsyncStorage:
- Blood Pressure: `vitals_blood_pressure` (last 100 readings)
- Heart Rate: `vitals_heart_rate` (last 100 readings)
- Steps: `activity_steps` (last 30 days)
- Weight: `vitals_weight` (last 100 readings)
- Sync History: `bluetooth_sync_history` (last 50 events)

---

## Next Steps After Testing

Once you've successfully tested device pairing and data syncing:

1. **Review synced data** in the HealthMate app (Vitals, Activity screens)
2. **Test unpair functionality** by unpairing a device and re-pairing it
3. **Test manual sync** by using the manual sync button (if available)
4. **Provide feedback** on the overall experience

Thank you for testing HealthMate's Bluetooth device integration!
