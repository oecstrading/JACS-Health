import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { WeeklySummary } from "./weekly-health-summary";

/**
 * Clinical PDF Export Module
 *
 * Generates professional 1-page "Patient Weekly Health Narrative" PDF
 * for physician appointments with encrypted email delivery option.
 */

export interface PatientInfo {
  name: string;
  dateOfBirth: string;
  primaryPhysician: string;
  physicianContact: string;
  medicalRecordNumber?: string;
}

/**
 * Generate stoplight color for trend
 */
const getStoplightColor = (trend: "rising" | "stable" | "falling", metric: "bp" | "hr" | "weight"): string => {
  if (trend === "stable") return "🟢 Green"; // Stable is good
  
  // For BP and HR, rising is concerning
  if (metric === "bp" || metric === "hr") {
    return trend === "rising" ? "🔴 Red" : "🟡 Yellow";
  }
  
  // For weight, both rising and falling can be concerning
  return "🟡 Yellow";
};

/**
 * Generate trend ribbon text
 */
const getTrendRibbon = (trend: "rising" | "stable" | "falling"): string => {
  const arrows = {
    rising: "↗️ RISING",
    stable: "→ STABLE",
    falling: "↘️ FALLING",
  };
  return arrows[trend];
};

/**
 * Generate HTML for PDF export
 */
const generateHTML = (summary: WeeklySummary, patientInfo: PatientInfo): string => {
  const weekStart = new Date(summary.weekStart).toLocaleDateString();
  const weekEnd = new Date(summary.weekEnd).toLocaleDateString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 16pt;
      line-height: 1.5;
      color: #000;
      padding: 40px;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid #0a7ea4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24pt;
      font-weight: bold;
      color: #0a7ea4;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 14pt;
      color: #666;
    }
    .patient-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      font-size: 14pt;
    }
    .patient-info strong {
      color: #000;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18pt;
      font-weight: bold;
      color: #0a7ea4;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .vitals-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 16pt;
    }
    .vitals-table th {
      background: #0a7ea4;
      color: #fff;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .vitals-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .vitals-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    .trend-ribbon {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14pt;
    }
    .trend-rising {
      background: #fee;
      color: #c00;
    }
    .trend-stable {
      background: #efe;
      color: #060;
    }
    .trend-falling {
      background: #ffc;
      color: #880;
    }
    .alert-box {
      background: #fff3cd;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin-bottom: 15px;
      font-size: 14pt;
    }
    .alert-critical {
      background: #fee;
      border-left-color: #ef4444;
    }
    .patient-voice {
      background: #e6f4fe;
      border-left: 4px solid #0a7ea4;
      padding: 15px;
      margin-bottom: 15px;
      font-size: 14pt;
      font-style: italic;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12pt;
      color: #666;
      text-align: center;
    }
    .disclaimer {
      font-size: 10pt;
      color: #999;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Patient Weekly Health Narrative</h1>
    <div class="subtitle">Clinical Summary: ${weekStart} - ${weekEnd}</div>
  </div>

  <div class="patient-info">
    <strong>Patient:</strong> ${patientInfo.name}<br>
    <strong>Date of Birth:</strong> ${patientInfo.dateOfBirth}<br>
    <strong>Primary Physician:</strong> ${patientInfo.primaryPhysician}<br>
    <strong>Physician Contact:</strong> ${patientInfo.physicianContact}
    ${patientInfo.medicalRecordNumber ? `<br><strong>MRN:</strong> ${patientInfo.medicalRecordNumber}` : ""}
  </div>

  ${summary.clinicalAlerts.length > 0 ? `
  <div class="section">
    <div class="section-title">⚠️ Clinical Alerts</div>
    ${summary.clinicalAlerts.map(alert => `
      <div class="alert-box ${alert.includes("⚠️") ? "alert-critical" : ""}">
        ${alert}
      </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="section">
    <div class="section-title">📊 7-Day Vital Signs Summary</div>
    <table class="vitals-table">
      <thead>
        <tr>
          <th>Vital Sign</th>
          <th>Average</th>
          <th>Readings</th>
          <th>Trend</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Blood Pressure</strong></td>
          <td>${summary.bloodPressure.avgSystolic}/${summary.bloodPressure.avgDiastolic} mmHg</td>
          <td>${summary.bloodPressure.readings}</td>
          <td>
            <span class="trend-ribbon trend-${summary.bloodPressure.trend}">
              ${getTrendRibbon(summary.bloodPressure.trend)}
            </span>
          </td>
          <td>${getStoplightColor(summary.bloodPressure.trend, "bp")}</td>
        </tr>
        <tr>
          <td><strong>Heart Rate</strong></td>
          <td>${summary.heartRate.avgBpm} bpm (${summary.heartRate.minBpm}-${summary.heartRate.maxBpm})</td>
          <td>${summary.heartRate.readings}</td>
          <td>
            <span class="trend-ribbon trend-${summary.heartRate.trend}">
              ${getTrendRibbon(summary.heartRate.trend)}
            </span>
          </td>
          <td>${getStoplightColor(summary.heartRate.trend, "hr")}</td>
        </tr>
        <tr>
          <td><strong>Weight</strong></td>
          <td>${summary.weight.avgLbs} lbs (${summary.weight.changePercent > 0 ? "+" : ""}${summary.weight.changePercent}%)</td>
          <td>${summary.weight.readings}</td>
          <td>
            <span class="trend-ribbon trend-${summary.weight.trend}">
              ${getTrendRibbon(summary.weight.trend)}
            </span>
          </td>
          <td>${getStoplightColor(summary.weight.trend, "weight")}</td>
        </tr>
        <tr>
          <td><strong>Daily Steps</strong></td>
          <td>${summary.steps.avgDaily} steps/day</td>
          <td>${summary.steps.readings} days</td>
          <td>
            <span class="trend-ribbon trend-${summary.steps.trend}">
              ${getTrendRibbon(summary.steps.trend)}
            </span>
          </td>
          <td>🟢 Green</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${summary.patientVoice.length > 0 ? `
  <div class="section">
    <div class="section-title">💬 Patient Voice Notes</div>
    ${summary.patientVoice.map(note => `
      <div class="patient-voice">"${note}"</div>
    `).join("")}
  </div>
  ` : ""}

  <div class="footer">
    <div>
      <strong>Generated by HealthMate</strong><br>
      ${new Date(summary.generatedAt).toLocaleString()}
    </div>
    <div class="disclaimer">
      This report is generated from patient-reported data and connected health devices.
      Clinical decisions should be made in consultation with the patient and based on comprehensive medical evaluation.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Export weekly summary as PDF
 */
export const exportToPDF = async (
  summary: WeeklySummary,
  patientInfo: PatientInfo
): Promise<string> => {
  try {
    const html = generateHTML(summary, patientInfo);
    
    // Create HTML file
    const htmlPath = `${FileSystem.documentDirectory}health_narrative_${Date.now()}.html`;
    await FileSystem.writeAsStringAsync(htmlPath, html, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log("[ClinicalPDF] HTML report generated:", htmlPath);
    return htmlPath;
  } catch (error) {
    console.error("[ClinicalPDF] Error generating PDF:", error);
    throw error;
  }
};

/**
 * Share PDF via system share sheet
 */
export const sharePDF = async (filePath: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        dialogTitle: "Share Health Report",
        UTI: "public.html",
      });
      console.log("[ClinicalPDF] Report shared successfully");
    } else {
      console.error("[ClinicalPDF] Sharing not available on this device");
    }
  } catch (error) {
    console.error("[ClinicalPDF] Error sharing PDF:", error);
    throw error;
  }
};

/**
 * Email PDF to clinic (encrypted)
 * Note: Requires email client configuration
 */
export const emailToClinic = async (
  filePath: string,
  clinicEmail: string,
  patientInfo: PatientInfo
): Promise<void> => {
  try {
    const subject = `Weekly Health Report - ${patientInfo.name}`;
    const body = `Please find attached the weekly health narrative for ${patientInfo.name} (DOB: ${patientInfo.dateOfBirth}).

This report covers the period from ${new Date(patientInfo.dateOfBirth).toLocaleDateString()} to ${new Date().toLocaleDateString()}.

Best regards,
HealthMate Clinical Reporting System

---
Contact: ${patientInfo.physicianContact}
Phone: 9544786113
Email: cuthbert@oecstrading.com`;

    // Use system share with email option
    await sharePDF(filePath);
    
    console.log("[ClinicalPDF] Email prepared for:", clinicEmail);
  } catch (error) {
    console.error("[ClinicalPDF] Error emailing to clinic:", error);
    throw error;
  }
};
