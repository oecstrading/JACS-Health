/**
 * Tests for:
 * 1. Type 2 Diabetes portal helper functions
 * 2. Meds badge counter AsyncStorage parsing logic
 */
import { describe, it, expect } from "vitest";

// ── Helpers copied from diabetes2-portal.tsx ──────────────────────────────────
function mgToMmol(mg: number): number {
  return Math.round((mg / 18.018) * 10) / 10;
}

function getGlucoseColor(value: number): string {
  if (value < 54)  return "severelow";
  if (value < 70)  return "low";
  if (value <= 180) return "inrange";
  if (value <= 250) return "high";
  return "veryhigh";
}

function getGlucoseLabel(value: number): string {
  if (value < 54)  return "SEVERE LOW";
  if (value < 70)  return "LOW";
  if (value <= 130) return "IN RANGE";
  if (value <= 180) return "SLIGHTLY HIGH";
  if (value <= 250) return "HIGH";
  return "VERY HIGH";
}

function estimateA1c(readings: { value: number }[]): number | null {
  if (readings.length < 5) return null;
  const avg = readings.reduce((s, r) => s + r.value, 0) / readings.length;
  return Math.round(((avg + 46.7) / 28.7) * 10) / 10;
}

function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

// ── Meds badge counter logic (from _layout.tsx useMedsDueToday) ───────────────
function countMedsDueToday(medsArray: any[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return medsArray.filter((m: any) => {
    const isDue = !m.taken && !m.takenAt;
    const isToday = !m.scheduledTime || (
      new Date(m.scheduledTime) >= todayStart &&
      new Date(m.scheduledTime) <= todayEnd
    );
    return isDue && isToday;
  }).length;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("T2D Portal — glucose helpers", () => {
  it("converts mg/dL to mmol/L correctly", () => {
    expect(mgToMmol(180)).toBe(10.0);
    expect(mgToMmol(126)).toBe(7.0);
    expect(mgToMmol(72)).toBe(4.0);
  });

  it("classifies glucose ranges correctly", () => {
    expect(getGlucoseColor(40)).toBe("severelow");
    expect(getGlucoseColor(65)).toBe("low");
    expect(getGlucoseColor(110)).toBe("inrange");
    expect(getGlucoseColor(200)).toBe("high");
    expect(getGlucoseColor(300)).toBe("veryhigh");
  });

  it("returns correct glucose labels", () => {
    expect(getGlucoseLabel(50)).toBe("SEVERE LOW");
    expect(getGlucoseLabel(68)).toBe("LOW");
    expect(getGlucoseLabel(100)).toBe("IN RANGE");
    expect(getGlucoseLabel(160)).toBe("SLIGHTLY HIGH");
    expect(getGlucoseLabel(220)).toBe("HIGH");
    expect(getGlucoseLabel(280)).toBe("VERY HIGH");
  });

  it("returns null for A1C estimate with fewer than 5 readings", () => {
    expect(estimateA1c([{ value: 120 }, { value: 130 }])).toBeNull();
  });

  it("estimates A1C from 5+ readings (ADA formula)", () => {
    // avg = 154 → A1C = (154 + 46.7) / 28.7 ≈ 7.0
    const readings = Array(10).fill({ value: 154 });
    const a1c = estimateA1c(readings);
    expect(a1c).toBeGreaterThan(6.5);
    expect(a1c).toBeLessThan(7.5);
  });

  it("calculates BMI correctly", () => {
    // 85kg, 170cm → BMI = 85 / (1.7^2) = 29.4
    expect(calcBMI(85, 170)).toBe(29.4);
    // 70kg, 175cm → BMI = 70 / (1.75^2) = 22.9
    expect(calcBMI(70, 175)).toBe(22.9);
  });
});

describe("Meds badge counter", () => {
  it("counts untaken meds with no scheduledTime as due today", () => {
    const meds = [
      { taken: false },
      { taken: false },
      { taken: true },
    ];
    expect(countMedsDueToday(meds)).toBe(2);
  });

  it("counts untaken meds scheduled for today", () => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const meds = [
      { taken: false, scheduledTime: today.toISOString() },
      { taken: false, scheduledTime: today.toISOString() },
      { taken: true,  scheduledTime: today.toISOString() },
    ];
    expect(countMedsDueToday(meds)).toBe(2);
  });

  it("does not count meds scheduled for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(9, 0, 0, 0);
    const meds = [
      { taken: false, scheduledTime: yesterday.toISOString() },
    ];
    expect(countMedsDueToday(meds)).toBe(0);
  });

  it("does not count meds with takenAt set", () => {
    const meds = [
      { taken: false, takenAt: new Date().toISOString() },
    ];
    expect(countMedsDueToday(meds)).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(countMedsDueToday([])).toBe(0);
  });
});
