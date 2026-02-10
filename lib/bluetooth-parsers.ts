/**
 * Bluetooth Data Parsers for Health Devices
 * 
 * Parses Bluetooth Low Energy (BLE) data from:
 * - Omron 3550 Blood Pressure Monitor
 * - Samsung Galaxy Watch 7
 * - iHome Smart Scale
 * 
 * Based on Bluetooth Health Device Profile (HDP) and device-specific protocols
 */

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: string;
  unit: "mmHg";
}

export interface HeartRateReading {
  heartRate: number;
  timestamp: string;
  unit: "bpm";
}

export interface StepsReading {
  steps: number;
  timestamp: string;
}

export interface WeightReading {
  weight: number;
  bmi?: number;
  bodyFat?: number;
  timestamp: string;
  unit: "kg" | "lb";
}

/**
 * Parse Omron 3550 Blood Pressure Monitor Data
 * 
 * Omron devices use Bluetooth Health Device Profile (HDP) with IEEE 11073-10407 standard
 * Data format: Systolic (2 bytes) + Diastolic (2 bytes) + Pulse (2 bytes) + Timestamp (7 bytes)
 */
export function parseOmronBPData(data: ArrayBuffer): BloodPressureReading | null {
  try {
    const view = new DataView(data);
    
    // Check if data length is sufficient (minimum 13 bytes)
    if (view.byteLength < 13) {
      console.warn("Omron BP data too short:", view.byteLength);
      return null;
    }

    // Parse blood pressure values (IEEE 11073-10407 format)
    // Bytes 0-1: Systolic (16-bit unsigned integer, little-endian)
    const systolic = view.getUint16(0, true);
    
    // Bytes 2-3: Diastolic (16-bit unsigned integer, little-endian)
    const diastolic = view.getUint16(2, true);
    
    // Bytes 4-5: Pulse (16-bit unsigned integer, little-endian)
    const pulse = view.getUint16(4, true);
    
    // Bytes 6-12: Timestamp (year, month, day, hour, minute, second)
    const year = view.getUint16(6, true);
    const month = view.getUint8(8);
    const day = view.getUint8(9);
    const hour = view.getUint8(10);
    const minute = view.getUint8(11);
    const second = view.getUint8(12);
    
    const timestamp = new Date(year, month - 1, day, hour, minute, second).toISOString();

    // Validate readings (reasonable ranges)
    if (systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150 || pulse < 30 || pulse > 200) {
      console.warn("Omron BP readings out of range:", { systolic, diastolic, pulse });
      return null;
    }

    return {
      systolic,
      diastolic,
      pulse,
      timestamp,
      unit: "mmHg",
    };
  } catch (error) {
    console.error("Error parsing Omron BP data:", error);
    return null;
  }
}

/**
 * Parse Samsung Galaxy Watch 7 Heart Rate Data
 * 
 * Samsung watches use Bluetooth Heart Rate Service (UUID: 0x180D)
 * Characteristic: Heart Rate Measurement (UUID: 0x2A37)
 */
export function parseSamsungHeartRateData(data: ArrayBuffer): HeartRateReading | null {
  try {
    const view = new DataView(data);
    
    if (view.byteLength < 2) {
      console.warn("Samsung heart rate data too short:", view.byteLength);
      return null;
    }

    // Byte 0: Flags
    const flags = view.getUint8(0);
    
    // Bit 0: Heart Rate Value Format (0 = UINT8, 1 = UINT16)
    const isUint16 = (flags & 0x01) === 1;
    
    // Parse heart rate value
    const heartRate = isUint16 ? view.getUint16(1, true) : view.getUint8(1);
    
    // Validate heart rate (30-220 bpm is reasonable)
    if (heartRate < 30 || heartRate > 220) {
      console.warn("Samsung heart rate out of range:", heartRate);
      return null;
    }

    return {
      heartRate,
      timestamp: new Date().toISOString(),
      unit: "bpm",
    };
  } catch (error) {
    console.error("Error parsing Samsung heart rate data:", error);
    return null;
  }
}

/**
 * Parse Samsung Galaxy Watch 7 Steps Data
 * 
 * Samsung Health uses proprietary protocol, but step count is typically
 * transmitted as a 32-bit unsigned integer
 */
export function parseSamsungStepsData(data: ArrayBuffer): StepsReading | null {
  try {
    const view = new DataView(data);
    
    if (view.byteLength < 4) {
      console.warn("Samsung steps data too short:", view.byteLength);
      return null;
    }

    // Parse steps as 32-bit unsigned integer (little-endian)
    const steps = view.getUint32(0, true);
    
    // Validate steps (0-100,000 is reasonable for a day)
    if (steps < 0 || steps > 100000) {
      console.warn("Samsung steps out of range:", steps);
      return null;
    }

    return {
      steps,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing Samsung steps data:", error);
    return null;
  }
}

/**
 * Parse iHome Smart Scale Weight Data
 * 
 * iHome scales use Bluetooth Weight Scale Service (UUID: 0x181D)
 * Characteristic: Weight Measurement (UUID: 0x2A9D)
 */
export function parseIHomeWeightData(data: ArrayBuffer): WeightReading | null {
  try {
    const view = new DataView(data);
    
    if (view.byteLength < 3) {
      console.warn("iHome weight data too short:", view.byteLength);
      return null;
    }

    // Byte 0: Flags
    const flags = view.getUint8(0);
    
    // Bit 0: Weight unit (0 = kg, 1 = lb)
    const isLbs = (flags & 0x01) === 1;
    const unit = isLbs ? "lb" : "kg";
    
    // Bytes 1-2: Weight (16-bit unsigned integer, little-endian)
    // Value is in 0.01 kg or 0.01 lb units
    const weightRaw = view.getUint16(1, true);
    const weight = weightRaw / 100; // Convert to kg or lb
    
    // Optional: BMI and body fat (if available)
    let bmi: number | undefined;
    let bodyFat: number | undefined;
    
    if (view.byteLength >= 5) {
      // Bytes 3-4: BMI (16-bit unsigned integer, 0.1 units)
      bmi = view.getUint16(3, true) / 10;
    }
    
    if (view.byteLength >= 7) {
      // Bytes 5-6: Body fat percentage (16-bit unsigned integer, 0.1% units)
      bodyFat = view.getUint16(5, true) / 10;
    }

    // Validate weight (20-300 kg or 44-660 lb is reasonable)
    const minWeight = isLbs ? 44 : 20;
    const maxWeight = isLbs ? 660 : 300;
    if (weight < minWeight || weight > maxWeight) {
      console.warn("iHome weight out of range:", weight, unit);
      return null;
    }

    return {
      weight,
      bmi,
      bodyFat,
      timestamp: new Date().toISOString(),
      unit,
    };
  } catch (error) {
    console.error("Error parsing iHome weight data:", error);
    return null;
  }
}

/**
 * Identify device type from Bluetooth device name
 */
export function identifyDeviceType(deviceName: string | null): "bp_monitor" | "watch" | "scale" | null {
  if (!deviceName) return null;

  const name = deviceName.toLowerCase();
  
  if (name.includes("hem") || name.includes("bp") || name.includes("omron")) {
    return "bp_monitor";
  }
  
  if (name.includes("galaxy") || name.includes("sm-") || name.includes("watch")) {
    return "watch";
  }
  
  if (name.includes("ihome") || name.includes("scale")) {
    return "scale";
  }
  
  return null;
}

/**
 * Get Bluetooth service UUID for device type
 */
export function getServiceUUID(deviceType: "bp_monitor" | "watch" | "scale"): string {
  switch (deviceType) {
    case "bp_monitor":
      return "00001810-0000-1000-8000-00805f9b34fb"; // Blood Pressure Service
    case "watch":
      return "0000180d-0000-1000-8000-00805f9b34fb"; // Heart Rate Service
    case "scale":
      return "0000181d-0000-1000-8000-00805f9b34fb"; // Weight Scale Service
  }
}

/**
 * Get Bluetooth characteristic UUID for device type
 */
export function getCharacteristicUUID(deviceType: "bp_monitor" | "watch" | "scale"): string {
  switch (deviceType) {
    case "bp_monitor":
      return "00002a35-0000-1000-8000-00805f9b34fb"; // Blood Pressure Measurement
    case "watch":
      return "00002a37-0000-1000-8000-00805f9b34fb"; // Heart Rate Measurement
    case "scale":
      return "00002a9d-0000-1000-8000-00805f9b34fb"; // Weight Measurement
  }
}
