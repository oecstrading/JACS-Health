/**
 * Health Report PDF Export
 * 
 * Generates comprehensive health reports for doctor appointments.
 * Includes vitals, medications, activities, and trends.
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { getMedications, getVitals, getActivities, getUserProfile } from "./storage";

export interface HealthReportData {
  userName: string;
  dateRange: { start: Date; end: Date };
  medications: any[];
  vitals: any[];
  activities: any[];
  healthConditions: string[];
  emergencyContacts: any[];
}

export interface ReportOptions {
  includeMedications: boolean;
  includeVitals: boolean;
  includeActivities: boolean;
  includeCharts: boolean;
  dateRange: "week" | "month" | "3months" | "year";
}

const DEFAULT_OPTIONS: ReportOptions = {
  includeMedications: true,
  includeVitals: true,
  includeActivities: true,
  includeCharts: true,
  dateRange: "month",
};

/**
 * Get date range for report
 */
function getDateRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "3months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  
  return { start, end };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate HTML for health report
 */
function generateReportHTML(data: HealthReportData, options: ReportOptions): string {
  const { userName, dateRange, medications, vitals, activities, healthConditions, emergencyContacts } = data;
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Report - ${userName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0a7ea4;
    }
    
    .header h1 {
      font-size: 28px;
      color: #0a7ea4;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #666;
    }
    
    .patient-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    
    .patient-info h2 {
      font-size: 16px;
      color: #0a7ea4;
      margin-bottom: 10px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .info-label {
      font-weight: 600;
      color: #555;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      color: #0a7ea4;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0a7ea4;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th {
      background: #0a7ea4;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
    }
    
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
    }
    
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    
    .badge-active {
      background: #22C55E;
      color: white;
    }
    
    .badge-inactive {
      background: #9CA3AF;
      color: white;
    }
    
    .badge-high {
      background: #EF4444;
      color: white;
    }
    
    .badge-normal {
      background: #22C55E;
      color: white;
    }
    
    .badge-low {
      background: #F59E0B;
      color: white;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .summary-card {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #0a7ea4;
      margin-bottom: 5px;
    }
    
    .summary-card .label {
      font-size: 11px;
      color: #666;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    
    .disclaimer {
      background: #FFF3CD;
      border: 1px solid #FFC107;
      padding: 12px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 10px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Health Report</h1>
    <div class="subtitle">Generated from HealthMate App</div>
  </div>
  
  <div class="patient-info">
    <h2>Patient Information</h2>
    <div class="info-row">
      <span class="info-label">Name:</span>
      <span>${userName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Report Period:</span>
      <span>${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Generated:</span>
      <span>${formatDate(new Date())}</span>
    </div>
    ${healthConditions.length > 0 ? `
    <div class="info-row">
      <span class="info-label">Health Conditions:</span>
      <span>${healthConditions.join(", ")}</span>
    </div>
    ` : ""}
  </div>
`;

  // Medications Section
  if (options.includeMedications && medications.length > 0) {
    html += `
  <div class="section">
    <h2 class="section-title">💊 Current Medications</h2>
    <table>
      <thead>
        <tr>
          <th>Medication</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${medications.map(med => `
        <tr>
          <td><strong>${med.name}</strong></td>
          <td>${med.dosage || "N/A"}</td>
          <td>${med.frequency || "N/A"}</td>
          <td><span class="badge ${med.taken ? "badge-active" : "badge-inactive"}">${med.taken ? "Taken" : "Pending"}</span></td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
`;
  }

  // Vitals Section
  if (options.includeVitals && vitals.length > 0) {
    // Calculate averages
    const avgBP = vitals.reduce((sum, v) => sum + (v.bloodPressure?.systolic || 0), 0) / vitals.length;
    const avgHR = vitals.reduce((sum, v) => sum + (v.heartRate || 0), 0) / vitals.length;
    const avgWeight = vitals.reduce((sum, v) => sum + (v.weight || 0), 0) / vitals.length;
    
    html += `
  <div class="section">
    <h2 class="section-title">❤️ Vital Signs Summary</h2>
    
    <div class="summary-grid">
      <div class="summary-card">
        <div class="value">${avgBP.toFixed(0)}</div>
        <div class="label">Avg Systolic BP (mmHg)</div>
      </div>
      <div class="summary-card">
        <div class="value">${avgHR.toFixed(0)}</div>
        <div class="label">Avg Heart Rate (bpm)</div>
      </div>
      <div class="summary-card">
        <div class="value">${avgWeight.toFixed(1)}</div>
        <div class="label">Avg Weight (lbs)</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Blood Pressure</th>
          <th>Heart Rate</th>
          <th>Weight</th>
          <th>Blood Glucose</th>
        </tr>
      </thead>
      <tbody>
        ${vitals.slice(0, 20).map(vital => `
        <tr>
          <td>${new Date(vital.date).toLocaleDateString()}</td>
          <td>${vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : "—"}</td>
          <td>${vital.heartRate || "—"} ${vital.heartRate ? "bpm" : ""}</td>
          <td>${vital.weight || "—"} ${vital.weight ? "lbs" : ""}</td>
          <td>${vital.bloodGlucose || "—"} ${vital.bloodGlucose ? "mg/dL" : ""}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
`;
  }

  // Activities Section
  if (options.includeActivities && activities.length > 0) {
    const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
    const avgSteps = totalSteps / activities.length;
    const daysWithWalk = activities.filter(a => a.walk).length;
    const daysWithExercise = activities.filter(a => a.exercise).length;
    
    html += `
  <div class="section">
    <h2 class="section-title">🏃 Activity Summary</h2>
    
    <div class="summary-grid">
      <div class="summary-card">
        <div class="value">${avgSteps.toFixed(0)}</div>
        <div class="label">Avg Daily Steps</div>
      </div>
      <div class="summary-card">
        <div class="value">${daysWithWalk}</div>
        <div class="label">Days Walked</div>
      </div>
      <div class="summary-card">
        <div class="value">${daysWithExercise}</div>
        <div class="label">Days Exercised</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Steps</th>
          <th>Walk</th>
          <th>Exercise</th>
          <th>Water Intake</th>
          <th>Sleep Quality</th>
        </tr>
      </thead>
      <tbody>
        ${activities.slice(0, 20).map(activity => `
        <tr>
          <td>${new Date(activity.date).toLocaleDateString()}</td>
          <td>${activity.steps || 0}</td>
          <td>${activity.walk ? "✓" : "—"}</td>
          <td>${activity.exercise ? "✓" : "—"}</td>
          <td>${activity.water || 0} glasses</td>
          <td>${activity.sleep || "—"}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
`;
  }

  // Emergency Contacts Section
  if (emergencyContacts.length > 0) {
    html += `
  <div class="section">
    <h2 class="section-title">📞 Emergency Contacts</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Relationship</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        ${emergencyContacts.map(contact => `
        <tr>
          <td><strong>${contact.name}</strong></td>
          <td>${contact.relationship}</td>
          <td>${contact.phone}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
`;
  }

  // Footer
  html += `
  <div class="disclaimer">
    <strong>⚠️ Medical Disclaimer:</strong> This report is generated from self-reported data and is intended for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Please share this report with your healthcare provider for proper medical evaluation.
  </div>
  
  <div class="footer">
    <p>Generated by HealthMate - AI Health Companion</p>
    <p>Report Date: ${formatDate(new Date())}</p>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Collect health data for report
 */
async function collectHealthData(dateRange: { start: Date; end: Date }): Promise<HealthReportData> {
  try {
    const profile = await getUserProfile();
    const medications = await getMedications();
    const vitals = await getVitals();
    const activities = await getActivities();
    
    // Filter data by date range
    const filteredVitals = vitals.filter(v => {
      const date = new Date(v.date);
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    const filteredActivities = activities.filter(a => {
      const date = new Date(a.date);
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    return {
      userName: profile?.name || "Patient",
      dateRange,
      medications,
      vitals: filteredVitals,
      activities: filteredActivities,
      healthConditions: profile?.healthConditions || [],
      emergencyContacts: profile?.emergencyContacts || [],
    };
  } catch (error) {
    console.error("Error collecting health data:", error);
    throw error;
  }
}

/**
 * Generate and export health report as PDF
 */
export async function generateHealthReport(options: Partial<ReportOptions> = {}): Promise<string | null> {
  try {
    const reportOptions = { ...DEFAULT_OPTIONS, ...options };
    const dateRange = getDateRange(reportOptions.dateRange);
    
    // Collect data
    const data = await collectHealthData(dateRange);
    
    // Generate HTML
    const html = generateReportHTML(data, reportOptions);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    
    console.log("Health report generated:", uri);
    return uri;
  } catch (error) {
    console.error("Error generating health report:", error);
    return null;
  }
}

/**
 * Generate and share health report
 */
export async function generateAndShareHealthReport(options: Partial<ReportOptions> = {}): Promise<boolean> {
  try {
    const uri = await generateHealthReport(options);
    
    if (!uri) {
      console.error("Failed to generate report");
      return false;
    }
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn("Sharing not available on this platform");
      return false;
    }
    
    // Share the PDF
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Health Report",
      UTI: "com.adobe.pdf",
    });
    
    return true;
  } catch (error) {
    console.error("Error sharing health report:", error);
    return false;
  }
}

/**
 * Get report date range label
 */
export function getDateRangeLabel(range: string): string {
  switch (range) {
    case "week":
      return "Past Week";
    case "month":
      return "Past Month";
    case "3months":
      return "Past 3 Months";
    case "year":
      return "Past Year";
    default:
      return "Past Month";
  }
}

/**
 * Preview health report (open in browser/viewer)
 */
export async function previewHealthReport(options: Partial<ReportOptions> = {}): Promise<void> {
  try {
    const reportOptions = { ...DEFAULT_OPTIONS, ...options };
    const dateRange = getDateRange(reportOptions.dateRange);
    
    // Collect data
    const data = await collectHealthData(dateRange);
    
    // Generate HTML
    const html = generateReportHTML(data, reportOptions);
    
    // Print/preview
    await Print.printAsync({ html });
  } catch (error) {
    console.error("Error previewing health report:", error);
  }
}
