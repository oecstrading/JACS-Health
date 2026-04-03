import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * Diabetes PDF Export Service
 * 
 * Generates comprehensive PDF reports for sharing with endocrinologists
 * or Medicare billing. Includes glucose trends, time-in-range statistics,
 * insulin totals, red flag alerts, meals, and notes.
 */

export interface DiabetesReportData {
  // Date range
  startDate: Date;
  endDate: Date;
  
  // Patient info
  patientName?: string;
  patientId?: string;
  
  // Glucose data
  glucoseReadings: Array<{
    timestamp: Date;
    value: number;
    trend?: string;
  }>;
  
  // Time in range statistics
  timeInRange: {
    veryLow: number; // %
    low: number; // %
    inRange: number; // %
    high: number; // %
    veryHigh: number; // %
    averageGlucose: number; // mg/dL
    glucoseVariability: number; // CV%
  };
  
  // Insulin data
  insulinData: {
    totalBasal: number; // units
    totalBolus: number; // units
    totalDaily: number; // units
    averageDailyBasal: number; // units
    averageDailyBolus: number; // units
    averageDailyTotal: number; // units
  };
  
  // Red flag alerts
  redFlags: Array<{
    timestamp: Date;
    severity: "emergency" | "critical" | "warning";
    type: string;
    message: string;
  }>;
  
  // Meals
  meals: Array<{
    timestamp: Date;
    mealType: string;
    totalCarbs: number;
    foods: string[];
  }>;
  
  // Notes
  notes: Array<{
    timestamp: Date;
    category: string;
    text: string;
  }>;
  
  // Device compliance
  compliance: {
    cgmDaysActive: number;
    cgmCompliancePercentage: number;
    insulinPumpDaysActive: number;
    sensorChanges: number;
    podChanges: number;
  };
}

class DiabetesPDFExportService {
  private static instance: DiabetesPDFExportService;

  private constructor() {}

  static getInstance(): DiabetesPDFExportService {
    if (!DiabetesPDFExportService.instance) {
      DiabetesPDFExportService.instance = new DiabetesPDFExportService();
    }
    return DiabetesPDFExportService.instance;
  }

  // Generate HTML content for the report
  private generateHTMLReport(data: DiabetesReportData): string {
    const { startDate, endDate, patientName, patientId, glucoseReadings, timeInRange, insulinData, redFlags, meals, notes, compliance } = data;

    const formatDate = (date: Date) => date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const formatDateTime = (date: Date) => date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Calculate days in period
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diabetes Management Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; padding: 40px; }
    h1 { font-size: 24pt; color: #0a7ea4; margin-bottom: 10px; border-bottom: 3px solid #0a7ea4; padding-bottom: 10px; }
    h2 { font-size: 16pt; color: #0a7ea4; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { font-size: 13pt; color: #374151; margin-top: 20px; margin-bottom: 10px; }
    .header { margin-bottom: 30px; }
    .patient-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .patient-info p { margin: 5px 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #0a7ea4; }
    .stat-label { font-size: 9pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .stat-value { font-size: 20pt; font-weight: bold; color: #111827; }
    .stat-unit { font-size: 10pt; color: #6b7280; margin-left: 5px; }
    .tir-bar { width: 100%; height: 40px; display: flex; border-radius: 8px; overflow: hidden; margin: 15px 0; }
    .tir-segment { display: flex; align-items: center; justify-content: center; color: white; font-size: 9pt; font-weight: bold; }
    .tir-very-low { background: #dc2626; }
    .tir-low { background: #f59e0b; }
    .tir-in-range { background: #22c55e; }
    .tir-high { background: #f59e0b; }
    .tir-very-high { background: #dc2626; }
    .alert-list { margin: 15px 0; }
    .alert-item { padding: 10px; margin: 8px 0; border-radius: 6px; border-left: 4px solid; }
    .alert-emergency { background: #fee2e2; border-color: #dc2626; }
    .alert-critical { background: #fef3c7; border-color: #f59e0b; }
    .alert-warning { background: #dbeafe; border-color: #3b82f6; }
    .alert-time { font-size: 9pt; color: #6b7280; }
    .alert-message { margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 10pt; border-bottom: 2px solid #d1d5db; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10pt; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 9pt; color: #6b7280; text-align: center; }
    .compliance-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 9pt; font-weight: bold; margin-left: 10px; }
    .badge-good { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-bad { background: #fee2e2; color: #991b1b; }
    @media print {
      body { padding: 20px; }
      .stat-grid { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Diabetes Management Report</h1>
    <p style="font-size: 12pt; color: #6b7280;">HealthMate - Comprehensive Glucose & Insulin Analysis</p>
  </div>

  <div class="patient-info">
    ${patientName ? `<p><strong>Patient:</strong> ${patientName}</p>` : ""}
    ${patientId ? `<p><strong>Patient ID:</strong> ${patientId}</p>` : ""}
    <p><strong>Report Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)} (${daysDiff} days)</p>
    <p><strong>Generated:</strong> ${formatDateTime(new Date())}</p>
  </div>

  <h2>Glucose Summary</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">Average Glucose</div>
      <div class="stat-value">${timeInRange.averageGlucose}<span class="stat-unit">mg/dL</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Time in Range (70-180)</div>
      <div class="stat-value">${timeInRange.inRange}<span class="stat-unit">%</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Glucose Variability (CV)</div>
      <div class="stat-value">${timeInRange.glucoseVariability}<span class="stat-unit">%</span></div>
    </div>
  </div>

  <h3>Time in Range Distribution</h3>
  <div class="tir-bar">
    ${timeInRange.veryLow > 0 ? `<div class="tir-segment tir-very-low" style="width: ${timeInRange.veryLow}%">${timeInRange.veryLow}%</div>` : ""}
    ${timeInRange.low > 0 ? `<div class="tir-segment tir-low" style="width: ${timeInRange.low}%">${timeInRange.low}%</div>` : ""}
    <div class="tir-segment tir-in-range" style="width: ${timeInRange.inRange}%">${timeInRange.inRange}%</div>
    ${timeInRange.high > 0 ? `<div class="tir-segment tir-high" style="width: ${timeInRange.high}%">${timeInRange.high}%</div>` : ""}
    ${timeInRange.veryHigh > 0 ? `<div class="tir-segment tir-very-high" style="width: ${timeInRange.veryHigh}%">${timeInRange.veryHigh}%</div>` : ""}
  </div>
  <p style="font-size: 9pt; color: #6b7280; margin-top: 5px;">
    <span style="color: #dc2626;">■</span> Very Low (&lt;54): ${timeInRange.veryLow}% &nbsp;
    <span style="color: #f59e0b;">■</span> Low (54-69): ${timeInRange.low}% &nbsp;
    <span style="color: #22c55e;">■</span> In Range (70-180): ${timeInRange.inRange}% &nbsp;
    <span style="color: #f59e0b;">■</span> High (181-250): ${timeInRange.high}% &nbsp;
    <span style="color: #dc2626;">■</span> Very High (&gt;250): ${timeInRange.veryHigh}%
  </p>

  <h2>Insulin Summary</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">Average Daily Basal</div>
      <div class="stat-value">${insulinData.averageDailyBasal.toFixed(1)}<span class="stat-unit">U</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Daily Bolus</div>
      <div class="stat-value">${insulinData.averageDailyBolus.toFixed(1)}<span class="stat-unit">U</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Total Daily Dose</div>
      <div class="stat-value">${insulinData.averageDailyTotal.toFixed(1)}<span class="stat-unit">U</span></div>
    </div>
  </div>
  <p style="margin-top: 15px;"><strong>Period Totals:</strong> ${insulinData.totalBasal.toFixed(1)}U basal + ${insulinData.totalBolus.toFixed(1)}U bolus = ${insulinData.totalDaily.toFixed(1)}U total</p>

  ${redFlags.length > 0 ? `
  <h2>Red Flag Alerts (${redFlags.length})</h2>
  <div class="alert-list">
    ${redFlags.slice(0, 20).map((alert) => `
      <div class="alert-item alert-${alert.severity}">
        <div class="alert-time">${formatDateTime(alert.timestamp)}</div>
        <div class="alert-message"><strong>${alert.type}:</strong> ${alert.message}</div>
      </div>
    `).join("")}
    ${redFlags.length > 20 ? `<p style="margin-top: 10px; font-size: 9pt; color: #6b7280;">Showing 20 of ${redFlags.length} alerts</p>` : ""}
  </div>
  ` : ""}

  ${meals.length > 0 ? `
  <h2>Meal Log (${meals.length} meals)</h2>
  <table>
    <thead>
      <tr>
        <th>Date/Time</th>
        <th>Meal Type</th>
        <th>Carbs (g)</th>
        <th>Foods</th>
      </tr>
    </thead>
    <tbody>
      ${meals.slice(0, 30).map((meal) => `
        <tr>
          <td>${formatDateTime(meal.timestamp)}</td>
          <td style="text-transform: capitalize;">${meal.mealType}</td>
          <td>${meal.totalCarbs}g</td>
          <td>${meal.foods.join(", ")}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ${meals.length > 30 ? `<p style="font-size: 9pt; color: #6b7280;">Showing 30 of ${meals.length} meals</p>` : ""}
  ` : ""}

  ${notes.length > 0 ? `
  <h2>Activity & Notes (${notes.length} entries)</h2>
  <table>
    <thead>
      <tr>
        <th>Date/Time</th>
        <th>Category</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>
      ${notes.slice(0, 30).map((note) => `
        <tr>
          <td>${formatDateTime(note.timestamp)}</td>
          <td style="text-transform: capitalize;">${note.category}</td>
          <td>${note.text}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ${notes.length > 30 ? `<p style="font-size: 9pt; color: #6b7280;">Showing 30 of ${notes.length} notes</p>` : ""}
  ` : ""}

  <h2>Device Compliance & Medicare Billing Support</h2>
  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p><strong>CGM Days Active:</strong> ${compliance.cgmDaysActive} / ${daysDiff} days 
      <span class="compliance-badge ${compliance.cgmCompliancePercentage >= 70 ? "badge-good" : compliance.cgmCompliancePercentage >= 50 ? "badge-warning" : "badge-bad"}">
        ${compliance.cgmCompliancePercentage}% compliance
      </span>
    </p>
    <p style="margin-top: 10px;"><strong>Insulin Pump Days Active:</strong> ${compliance.insulinPumpDaysActive} / ${daysDiff} days</p>
    <p style="margin-top: 10px;"><strong>Sensor Changes:</strong> ${compliance.sensorChanges} (recommended every 10 days)</p>
    <p style="margin-top: 10px;"><strong>Pod Changes:</strong> ${compliance.podChanges} (recommended every 3 days)</p>
  </div>

  <h3>Medicare CPT Code Eligibility</h3>
  <ul style="margin: 15px 0 15px 20px; line-height: 2;">
    <li><strong>CPT 95250</strong> - Professional CGM (72+ hours): ${compliance.cgmDaysActive >= 3 ? '<span class="compliance-badge badge-good">ELIGIBLE</span>' : '<span class="compliance-badge badge-bad">NOT ELIGIBLE</span>'}</li>
    <li><strong>CPT 95251</strong> - CGM Analysis & Report: ${compliance.cgmDaysActive >= 3 ? '<span class="compliance-badge badge-good">ELIGIBLE</span>' : '<span class="compliance-badge badge-bad">NOT ELIGIBLE</span>'}</li>
    <li><strong>CPT 99454</strong> - Remote Monitoring (16+ days): ${compliance.cgmDaysActive >= 16 ? '<span class="compliance-badge badge-good">ELIGIBLE</span>' : '<span class="compliance-badge badge-warning">NEEDS ' + (16 - compliance.cgmDaysActive) + ' MORE DAYS</span>'}</li>
  </ul>

  <div class="footer">
    <p><strong>HealthMate</strong> - AI-Powered Health Companion</p>
    <p>This report is generated for informational purposes and Medicare billing support. Please consult with your healthcare provider for medical advice.</p>
    <p>Contact: cuthbert@oecstrading.com | Phone: 954-478-6113 | WhatsApp: 758-488-1429</p>
  </div>
</body>
</html>
    `;
  }

  // Export report as PDF (via HTML rendering)
  async exportToPDF(data: DiabetesReportData): Promise<string> {
    try {
      const html = this.generateHTMLReport(data);
      
      // Save HTML to temp file
      const htmlPath = `${FileSystem.documentDirectory}diabetes_report_temp.html`;
      await FileSystem.writeAsStringAsync(htmlPath, html);

      // For now, return the HTML path
      // In a real implementation, you would use a library like react-native-html-to-pdf
      // or expo-print to convert HTML to PDF
      
      console.log("[DiabetesPDFExport] HTML report generated at:", htmlPath);
      return htmlPath;
    } catch (error) {
      console.error("[DiabetesPDFExport] Error generating PDF:", error);
      throw error;
    }
  }

  // Share report
  async shareReport(filePath: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Sharing is not available on this platform");
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        dialogTitle: "Share Diabetes Report",
        UTI: "public.html",
      });
    } catch (error) {
      console.error("[DiabetesPDFExport] Error sharing report:", error);
      throw error;
    }
  }

  // Generate and share report in one step
  async generateAndShare(data: DiabetesReportData): Promise<void> {
    const filePath = await this.exportToPDF(data);
    await this.shareReport(filePath);
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: DiabetesPDFExportService | null = null;
const _lazy = new Proxy({} as DiabetesPDFExportService, {
  get(_: DiabetesPDFExportService, prop: string | symbol) {
    if (!_instance) _instance = DiabetesPDFExportService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: DiabetesPDFExportService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = DiabetesPDFExportService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
