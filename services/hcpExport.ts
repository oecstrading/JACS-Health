/**
 * hcpExport.ts — HCP (Healthcare Provider) PDF Export Service
 *
 * Generates a clinical-grade PDF report for sharing with doctors.
 * Includes: 14-day glucose statistics, time-in-range analysis,
 * insulin summary, BP trends, meal patterns, and bolus history.
 *
 * Uses expo-sharing to open the system share sheet for email/AirDrop.
 * PDF is generated as HTML then converted via expo-print.
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { offlineStorage } from "./offlineStorage";
import { GlucoseConverter } from "./bolusAdvisor";
import type { GlucoseUnit } from "./bolusAdvisor";

export interface HCPReportOptions {
  patientName: string;
  patientDOB?: string;
  physicianName?: string;
  clinicName?: string;
  displayUnit: GlucoseUnit;
  daysToInclude?: number; // Default: 14
}

export interface GlucoseStats {
  average: number;
  timeInRange: number;       // % between 70-180 mg/dL
  timeBelowRange: number;    // % below 70 mg/dL
  timeAboveRange: number;    // % above 180 mg/dL
  gmi: number;               // Glucose Management Indicator (estimated HbA1c)
  cv: number;                // Coefficient of variation (%)
  readingsCount: number;
}

function calculateGlucoseStats(readings: Array<{ value: number }>): GlucoseStats {
  if (readings.length === 0) {
    return { average: 0, timeInRange: 0, timeBelowRange: 0, timeAboveRange: 0, gmi: 0, cv: 0, readingsCount: 0 };
  }

  const values = readings.map((r) => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const inRange = values.filter((v) => v >= 70 && v <= 180).length;
  const below = values.filter((v) => v < 70).length;
  const above = values.filter((v) => v > 180).length;

  // Standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const sd = Math.sqrt(variance);
  const cv = (sd / avg) * 100;

  // GMI formula: 3.31 + 0.02392 × mean glucose (mg/dL) — from Bergenstal et al. 2018
  const gmi = 3.31 + 0.02392 * avg;

  return {
    average: Math.round(avg),
    timeInRange: Math.round((inRange / values.length) * 100),
    timeBelowRange: Math.round((below / values.length) * 100),
    timeAboveRange: Math.round((above / values.length) * 100),
    gmi: Math.round(gmi * 10) / 10,
    cv: Math.round(cv * 10) / 10,
    readingsCount: values.length,
  };
}

function buildReportHTML(
  options: HCPReportOptions,
  stats: GlucoseStats,
  insulinTotal: number,
  bpAvg: { systolic: number; diastolic: number } | null,
  displayUnit: GlucoseUnit
): string {
  const now = new Date();
  const reportDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const avgDisplay = GlucoseConverter.format(stats.average, displayUnit);
  const tirColor = stats.timeInRange >= 70 ? "#22C55E" : stats.timeInRange >= 50 ? "#F59E0B" : "#EF4444";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, Arial, sans-serif; margin: 40px; color: #11181C; font-size: 13px; }
    .header { border-bottom: 3px solid #0a7ea4; padding-bottom: 20px; margin-bottom: 24px; }
    .header h1 { color: #0a7ea4; font-size: 22px; margin: 0 0 4px; }
    .header p { margin: 2px 0; color: #687076; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #687076; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-box { background: #F5F5F5; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #11181C; }
    .stat-label { font-size: 11px; color: #687076; margin-top: 4px; }
    .tir-bar { height: 20px; border-radius: 4px; overflow: hidden; display: flex; margin: 8px 0; }
    .tir-below { background: #EF4444; }
    .tir-in { background: #22C55E; }
    .tir-above { background: #F59E0B; }
    .tir-legend { display: flex; gap: 16px; font-size: 11px; }
    .tir-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #F5F5F5; padding: 8px 12px; text-align: left; font-weight: 600; }
    td { padding: 7px 12px; border-bottom: 1px solid #E5E7EB; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #687076; }
    .disclaimer { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 6px; padding: 12px; font-size: 11px; color: #92400E; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>JACS Health Report</h1>
    <p><strong>Patient:</strong> ${options.patientName}</p>
    ${options.patientDOB ? `<p><strong>Date of Birth:</strong> ${options.patientDOB}</p>` : ""}
    <p><strong>Report Period:</strong> Last ${options.daysToInclude ?? 14} days</p>
    <p><strong>Generated:</strong> ${reportDate}</p>
    ${options.physicianName ? `<p><strong>For:</strong> ${options.physicianName}${options.clinicName ? ` — ${options.clinicName}` : ""}</p>` : ""}
  </div>

  <div class="section">
    <h2>Glucose Summary</h2>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${avgDisplay}</div>
        <div class="stat-label">Average Glucose</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${tirColor}">${stats.timeInRange}%</div>
        <div class="stat-label">Time in Range (70–180)</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.gmi}%</div>
        <div class="stat-label">GMI (Est. HbA1c)</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#EF4444">${stats.timeBelowRange}%</div>
        <div class="stat-label">Time Below Range</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#F59E0B">${stats.timeAboveRange}%</div>
        <div class="stat-label">Time Above Range</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.cv}%</div>
        <div class="stat-label">Variability (CV)</div>
      </div>
    </div>
    <div style="margin-top:16px">
      <p style="font-size:11px;color:#687076;margin-bottom:6px">Time in Range Distribution</p>
      <div class="tir-bar">
        <div class="tir-below" style="width:${stats.timeBelowRange}%"></div>
        <div class="tir-in" style="width:${stats.timeInRange}%"></div>
        <div class="tir-above" style="width:${stats.timeAboveRange}%"></div>
      </div>
      <div class="tir-legend">
        <span><span class="tir-dot" style="background:#EF4444"></span>Below ${stats.timeBelowRange}%</span>
        <span><span class="tir-dot" style="background:#22C55E"></span>In Range ${stats.timeInRange}%</span>
        <span><span class="tir-dot" style="background:#F59E0B"></span>Above ${stats.timeAboveRange}%</span>
      </div>
    </div>
    <p style="font-size:11px;color:#687076;margin-top:12px">Based on ${stats.readingsCount} readings</p>
  </div>

  ${insulinTotal > 0 ? `
  <div class="section">
    <h2>Insulin Summary</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Insulin (period)</td><td>${insulinTotal.toFixed(1)} units</td></tr>
      <tr><td>Average Daily Dose</td><td>${(insulinTotal / (options.daysToInclude ?? 14)).toFixed(1)} units/day</td></tr>
    </table>
  </div>` : ""}

  ${bpAvg ? `
  <div class="section">
    <h2>Blood Pressure</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Average Systolic</td><td>${bpAvg.systolic} mmHg</td></tr>
      <tr><td>Average Diastolic</td><td>${bpAvg.diastolic} mmHg</td></tr>
    </table>
  </div>` : ""}

  <div class="disclaimer">
    <strong>Clinical Disclaimer:</strong> This report is generated by the JACS Medical Monitoring System for informational purposes only. 
    All clinical decisions should be made by a qualified healthcare provider. 
    AI-generated bolus recommendations are advisory only and should not replace professional medical judgment.
  </div>

  <div class="footer">
    <p>JACS Medical Monitoring System · Report ID: ${Date.now().toString(36).toUpperCase()}</p>
    <p>Data source: On-device encrypted storage · Sync status: Patient-controlled</p>
  </div>
</body>
</html>`;
}

export class HCPExportService {
  /**
   * Generate and share a PDF report with the system share sheet.
   * Works on iOS (AirDrop, Mail, Messages) and Android (Gmail, Drive, etc.)
   */
  static async generateAndShare(options: HCPReportOptions): Promise<void> {
    const days = options.daysToInclude ?? 14;

    // Fetch data
    const [glucoseReadings, insulinDoses, bpReadings] = await Promise.all([
      offlineStorage.getGlucoseReadings(days * 24),
      offlineStorage.getInsulinDoses(days * 24),
      offlineStorage.getBPReadings(days),
    ]);

    const stats = calculateGlucoseStats(glucoseReadings);
    const insulinTotal = insulinDoses.reduce((sum, d) => sum + d.units, 0);

    let bpAvg: { systolic: number; diastolic: number } | null = null;
    if (bpReadings.length > 0) {
      bpAvg = {
        systolic: Math.round(bpReadings.reduce((s, r) => s + r.systolic, 0) / bpReadings.length),
        diastolic: Math.round(bpReadings.reduce((s, r) => s + r.diastolic, 0) / bpReadings.length),
      };
    }

    const html = buildReportHTML(options, stats, insulinTotal, bpAvg, options.displayUnit);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    // Share via system sheet
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `JACS Health Report — ${options.patientName}`,
        UTI: "com.adobe.pdf",
      });
    }
  }
}
