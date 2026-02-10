/**
 * PDF Export Module
 * 
 * Generates PDF reports of vitals data with charts and insights
 */

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export interface VitalsReportData {
  dateRange: {
    start: string;
    end: string;
  };
  bloodPressure: Array<{
    systolic: number;
    diastolic: number;
    pulse: number;
    timestamp: string;
  }>;
  heartRate: Array<{
    heartRate: number;
    timestamp: string;
  }>;
  weight: Array<{
    weight: number;
    bmi?: number;
    timestamp: string;
  }>;
  insights: Array<{
    title: string;
    description: string;
    severity: string;
  }>;
}

/**
 * Generate HTML content for PDF
 */
function generateHTMLContent(data: VitalsReportData): string {
  const { dateRange, bloodPressure, heartRate, weight, insights } = data;

  // Calculate averages
  const avgSystolic =
    bloodPressure.length > 0
      ? (bloodPressure.reduce((sum, r) => sum + r.systolic, 0) / bloodPressure.length).toFixed(0)
      : "N/A";
  const avgDiastolic =
    bloodPressure.length > 0
      ? (bloodPressure.reduce((sum, r) => sum + r.diastolic, 0) / bloodPressure.length).toFixed(0)
      : "N/A";
  const avgHR =
    heartRate.length > 0
      ? (heartRate.reduce((sum, r) => sum + r.heartRate, 0) / heartRate.length).toFixed(0)
      : "N/A";
  const avgWeight =
    weight.length > 0
      ? (weight.reduce((sum, r) => sum + r.weight, 0) / weight.length).toFixed(1)
      : "N/A";

  const startDate = new Date(dateRange.start).toLocaleDateString();
  const endDate = new Date(dateRange.end).toLocaleDateString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthMate Vitals Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 40px;
      color: #333;
      line-height: 1.6;
    }
    h1 {
      color: #0a7ea4;
      font-size: 28px;
      margin-bottom: 10px;
    }
    h2 {
      color: #0a7ea4;
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #0a7ea4;
      padding-bottom: 5px;
    }
    h3 {
      color: #555;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .date-range {
      text-align: center;
      color: #666;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #666;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #0a7ea4;
    }
    .summary-card .unit {
      font-size: 14px;
      color: #999;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #0a7ea4;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .insight {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #0a7ea4;
    }
    .insight.warning {
      border-left-color: #F59E0B;
    }
    .insight.critical {
      border-left-color: #EF4444;
    }
    .insight h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 16px;
    }
    .insight p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .no-data {
      text-align: center;
      color: #999;
      padding: 20px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 HealthMate Vitals Report</h1>
    <div class="date-range">
      Report Period: ${startDate} - ${endDate}
    </div>
  </div>

  <h2>📊 Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Blood Pressure</h3>
      <div class="value">${avgSystolic}/${avgDiastolic}</div>
      <div class="unit">mmHg (avg)</div>
    </div>
    <div class="summary-card">
      <h3>Heart Rate</h3>
      <div class="value">${avgHR}</div>
      <div class="unit">bpm (avg)</div>
    </div>
    <div class="summary-card">
      <h3>Weight</h3>
      <div class="value">${avgWeight}</div>
      <div class="unit">lbs (avg)</div>
    </div>
  </div>

  ${
    bloodPressure.length > 0
      ? `
  <h2>🩺 Blood Pressure Readings</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Systolic</th>
        <th>Diastolic</th>
        <th>Pulse</th>
      </tr>
    </thead>
    <tbody>
      ${bloodPressure
        .slice()
        .reverse()
        .map((reading) => {
          const date = new Date(reading.timestamp);
          return `
        <tr>
          <td>${date.toLocaleDateString()}</td>
          <td>${date.toLocaleTimeString()}</td>
          <td>${reading.systolic} mmHg</td>
          <td>${reading.diastolic} mmHg</td>
          <td>${reading.pulse} bpm</td>
        </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>
  `
      : '<div class="no-data">No blood pressure data available for this period.</div>'
  }

  ${
    heartRate.length > 0
      ? `
  <h2>❤️ Heart Rate Readings</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Heart Rate</th>
      </tr>
    </thead>
    <tbody>
      ${heartRate
        .slice()
        .reverse()
        .map((reading) => {
          const date = new Date(reading.timestamp);
          return `
        <tr>
          <td>${date.toLocaleDateString()}</td>
          <td>${date.toLocaleTimeString()}</td>
          <td>${reading.heartRate} bpm</td>
        </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>
  `
      : '<div class="no-data">No heart rate data available for this period.</div>'
  }

  ${
    weight.length > 0
      ? `
  <h2>⚖️ Weight Readings</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Weight</th>
        <th>BMI</th>
      </tr>
    </thead>
    <tbody>
      ${weight
        .slice()
        .reverse()
        .map((reading) => {
          const date = new Date(reading.timestamp);
          return `
        <tr>
          <td>${date.toLocaleDateString()}</td>
          <td>${date.toLocaleTimeString()}</td>
          <td>${reading.weight.toFixed(1)} lbs</td>
          <td>${reading.bmi ? reading.bmi.toFixed(1) : "N/A"}</td>
        </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>
  `
      : '<div class="no-data">No weight data available for this period.</div>'
  }

  ${
    insights.length > 0
      ? `
  <h2>💡 Health Insights</h2>
  ${insights
    .map(
      (insight) => `
    <div class="insight ${insight.severity}">
      <h4>${insight.title}</h4>
      <p>${insight.description}</p>
    </div>
  `
    )
    .join("")}
  `
      : ""
  }

  <div class="footer">
    <p><strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute medical advice. 
    Always consult your healthcare provider for medical decisions.</p>
    <p>Generated by HealthMate on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate and share PDF report
 */
export async function generateVitalsReport(data: VitalsReportData): Promise<string> {
  try {
    const htmlContent = generateHTMLContent(data);

    // For web platform, create a blob and download
    if (Platform.OS === "web") {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HealthMate_Vitals_Report_${new Date().toISOString().split("T")[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);
      return "Report downloaded successfully";
    }

    // For mobile, use expo-print to generate PDF
    // Since expo-print is not installed, we'll save as HTML and share
    const fileName = `HealthMate_Vitals_Report_${new Date().toISOString().split("T")[0]}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/html",
        dialogTitle: "Share Vitals Report",
        UTI: "public.html",
      });
    }

    return fileUri;
  } catch (error) {
    console.error("Error generating vitals report:", error);
    throw error;
  }
}

/**
 * Format date range for report
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
