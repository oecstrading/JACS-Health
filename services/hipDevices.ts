/**
 * Hip-Specific Device Integration Service
 * 
 * Manages integration with hip health monitoring devices:
 * - Gait sensors (step count, gait symmetry, cadence, stride length)
 * - Smart walkers (weight distribution, distance, support level)
 * - Pressure-sensing insoles (weight-bearing %, left/right balance)
 */

export interface GaitSensorData {
  timestamp: string;
  stepCount: number;
  gaitSymmetry: number; // 0-100%, 100% = perfect symmetry
  cadence: number; // steps per minute
  strideLength: number; // inches
  leftStepTime: number; // milliseconds
  rightStepTime: number; // milliseconds
}

export interface SmartWalkerData {
  timestamp: string;
  distanceTraveled: number; // feet
  weightDistribution: {
    walker: number; // percentage of body weight on walker
    legs: number; // percentage on legs
  };
  supportLevel: "High" | "Medium" | "Low";
  sessionDuration: number; // minutes
}

export interface PressureInsoleData {
  timestamp: string;
  weightBearingPercentage: number; // 0-100%
  leftFootPressure: number; // pounds
  rightFootPressure: number; // pounds
  balance: number; // -100 to +100, 0 = perfect balance
  heelStrike: boolean;
  toeOff: boolean;
}

export interface HipDevice {
  id: string;
  name: string;
  type: "gait_sensor" | "smart_walker" | "pressure_insole";
  connected: boolean;
  batteryLevel: number;
  lastSync: string;
}

// Mock device data generators
export const generateMockGaitData = (): GaitSensorData => {
  const baseStepCount = 1500 + Math.floor(Math.random() * 500);
  const symmetry = 75 + Math.floor(Math.random() * 20); // 75-95%
  
  return {
    timestamp: new Date().toISOString(),
    stepCount: baseStepCount,
    gaitSymmetry: symmetry,
    cadence: 90 + Math.floor(Math.random() * 20), // 90-110 steps/min
    strideLength: 20 + Math.floor(Math.random() * 8), // 20-28 inches
    leftStepTime: 600 + Math.floor(Math.random() * 100),
    rightStepTime: 650 + Math.floor(Math.random() * 100),
  };
};

export const generateMockWalkerData = (): SmartWalkerData => {
  const walkerSupport = 30 + Math.floor(Math.random() * 30); // 30-60%
  
  return {
    timestamp: new Date().toISOString(),
    distanceTraveled: 200 + Math.floor(Math.random() * 300), // 200-500 feet
    weightDistribution: {
      walker: walkerSupport,
      legs: 100 - walkerSupport,
    },
    supportLevel: walkerSupport > 50 ? "High" : walkerSupport > 35 ? "Medium" : "Low",
    sessionDuration: 15 + Math.floor(Math.random() * 20), // 15-35 minutes
  };
};

export const generateMockInsoleData = (): PressureInsoleData => {
  const weightBearing = 50 + Math.floor(Math.random() * 40); // 50-90%
  const leftPressure = 60 + Math.floor(Math.random() * 30);
  const rightPressure = 65 + Math.floor(Math.random() * 25);
  
  return {
    timestamp: new Date().toISOString(),
    weightBearingPercentage: weightBearing,
    leftFootPressure: leftPressure,
    rightFootPressure: rightPressure,
    balance: Math.round(((rightPressure - leftPressure) / leftPressure) * 100),
    heelStrike: true,
    toeOff: true,
  };
};

export const getHipDevices = (): HipDevice[] => {
  return [
    {
      id: "gait-sensor-1",
      name: "Gait Sensor Pro",
      type: "gait_sensor",
      connected: true,
      batteryLevel: 85,
      lastSync: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: "smart-walker-1",
      name: "SmartWalk 3000",
      type: "smart_walker",
      connected: true,
      batteryLevel: 92,
      lastSync: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
      id: "pressure-insole-1",
      name: "StepSense Insoles",
      type: "pressure_insole",
      connected: true,
      batteryLevel: 78,
      lastSync: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    },
  ];
};

export const calculateGaitSymmetryImprovement = (
  currentSymmetry: number,
  baselineSymmetry: number
): { improvement: number; status: string } => {
  const improvement = currentSymmetry - baselineSymmetry;
  let status = "Stable";
  
  if (improvement > 10) status = "Excellent Progress";
  else if (improvement > 5) status = "Good Progress";
  else if (improvement < -5) status = "Needs Attention";
  
  return { improvement, status };
};

export const calculateWeightBearingProgress = (
  currentPercentage: number,
  weekPostOp: number
): { status: string; onTrack: boolean } => {
  // Expected weight-bearing progression by week
  const expectedByWeek: { [key: number]: number } = {
    1: 25,  // 25% weight-bearing Week 1
    2: 50,  // 50% Week 2
    4: 75,  // 75% Week 4
    6: 90,  // 90% Week 6
    8: 100, // Full weight-bearing Week 8+
  };
  
  const expected = expectedByWeek[weekPostOp] || 100;
  const onTrack = currentPercentage >= expected - 10; // Within 10% is acceptable
  
  let status = "On Track";
  if (currentPercentage > expected + 10) status = "Ahead of Schedule";
  else if (!onTrack) status = "Behind Schedule";
  
  return { status, onTrack };
};
