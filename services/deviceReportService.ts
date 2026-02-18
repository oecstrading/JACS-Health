import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import DeviceSyncService, { type DeviceReading, type StatisticsPeriod } from "./deviceSyncService";

export interface ReportOptions {
  deviceId: string;
  deviceName: string;
  startDate: Date;
  endDate: Date;
  includeStatistics: boolean;
  includeReadings: boolean;
}

class DeviceReportService {
  // Generate PDF report
  async generatePDFReport(options: ReportOptions): Promise<string> {
    try {
      // Get readings and statistics
      const readings = await DeviceSyncService.getReadings({
        deviceId: options.deviceId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      const dailyStats = await DeviceSyncService.calculateStatistics(options.deviceId, "daily");
      const weeklyStats = await DeviceSyncService.calculateStatistics(options.deviceId, "weekly");
      const monthlyStats = await DeviceSyncService.calculateStatistics(options.deviceId, "monthly");

      // Generate HTML content
      const htmlContent = this.generateHTMLReport(
        options,
        readings,
        dailyStats,
        weeklyStats,
        monthlyStats
      );

      // Save HTML to file
      const htmlPath = `${FileSystem.documentDirectory || ""}health_report_${Date.now()}.html`;
      await FileSystem.writeAsStringAsync(htmlPath, htmlContent);

      return htmlPath;
    } catch (error) {
      console.error("Error generating PDF report:", error);
      throw error;
    }
  }

  // Generate HTML report content
  private generateHTMLReport(
    options: ReportOptions,
    readings: DeviceReading[],
    dailyStats: StatisticsPeriod[],
    weeklyStats: StatisticsPeriod[],
    monthlyStats: StatisticsPeriod[]
  ): string {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    const formatTimestamp = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    };

    const formatValue = (reading: DeviceReading) => {
      if (reading.metadata?.systolic && reading.metadata?.diastolic) {
        return `${Math.round(reading.metadata.systolic)}/${Math.round(reading.metadata.diastolic)} mmHg`;
      }
      return `${Math.round(reading.value * 10) / 10} ${reading.unit}`;
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthMate Device Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0a7ea4;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #0a7ea4;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 28px;
      color: #11181C;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 22px;
      color: #11181C;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #E5E7EB;
    }
    .meta-info {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .meta-label {
      font-weight: 600;
      color: #687076;
    }
    .meta-value {
      color: #11181C;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background: #0a7ea4;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #0a7ea4;
    }
    .stat-label {
      font-size: 12px;
      color: #687076;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #11181C;
    }
    .trend-improving {
      color: #22C55E;
    }
    .trend-declining {
      color: #EF4444;
    }
    .trend-stable {
      color: #687076;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #687076;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .header {
        page-break-after: avoid;
      }
      h2 {
        page-break-after: avoid;
      }
      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HealthMate</div>
    <h1>Device Health Report</h1>
    <p>Comprehensive health data analysis</p>
  </div>

  <div class="meta-info">
    <div class="meta-row">
      <span class="meta-label">Device:</span>
      <span class="meta-value">${options.deviceName}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Report Period:</span>
      <span class="meta-value">${formatDate(options.startDate)} - ${formatDate(options.endDate)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Total Readings:</span>
      <span class="meta-value">${readings.length}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Generated:</span>
      <span class="meta-value">${formatTimestamp(new Date())}</span>
    </div>
  </div>

  ${
    options.includeStatistics && dailyStats.length > 0
      ? `
  <h2>Daily Statistics (Last 30 Days)</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Average</th>
        <th>Min</th>
        <th>Max</th>
        <th>Readings</th>
        <th>Trend</th>
      </tr>
    </thead>
    <tbody>
      ${dailyStats
        .slice(0, 30)
        .map(
          (stat) => `
        <tr>
          <td>${formatDate(stat.startDate)}</td>
          <td><strong>${stat.average}</strong></td>
          <td>${stat.min}</td>
          <td>${stat.max}</td>
          <td>${stat.count}</td>
          <td class="trend-${stat.trend}">${stat.trend}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <h2>Weekly Statistics (Last 12 Weeks)</h2>
  <div class="stats-grid">
    ${weeklyStats
      .slice(0, 12)
      .map(
        (stat) => `
      <div class="stat-card">
        <div class="stat-label">${formatDate(stat.startDate)} - ${formatDate(stat.endDate)}</div>
        <div class="stat-value">${stat.average}</div>
        <div class="stat-label">Min: ${stat.min} | Max: ${stat.max}</div>
        <div class="stat-label trend-${stat.trend}">${stat.trend}</div>
      </div>
    `
      )
      .join("")}
  </div>

  <h2>Monthly Statistics (Last 12 Months)</h2>
  <table>
    <thead>
      <tr>
        <th>Month</th>
        <th>Average</th>
        <th>Min</th>
        <th>Max</th>
        <th>Readings</th>
        <th>Std Dev</th>
      </tr>
    </thead>
    <tbody>
      ${monthlyStats
        .slice(0, 12)
        .map(
          (stat) => `
        <tr>
          <td>${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(stat.startDate)}</td>
          <td><strong>${stat.average}</strong></td>
          <td>${stat.min}</td>
          <td>${stat.max}</td>
          <td>${stat.count}</td>
          <td>${stat.standardDeviation}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  `
      : ""
  }

  ${
    options.includeReadings && readings.length > 0
      ? `
  <h2>Reading History</h2>
  <table>
    <thead>
      <tr>
        <th>Date & Time</th>
        <th>Value</th>
        ${readings[0].metadata?.pulse ? "<th>Pulse</th>" : ""}
      </tr>
    </thead>
    <tbody>
      ${readings
        .slice(0, 100)
        .map(
          (reading) => `
        <tr>
          <td>${formatTimestamp(reading.timestamp)}</td>
          <td><strong>${formatValue(reading)}</strong></td>
          ${reading.metadata?.pulse ? `<td>${Math.round(reading.metadata.pulse)} bpm</td>` : ""}
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  `
      : ""
  }

  <div class="footer">
    <p><strong>HealthMate</strong> - Your Personal Health Companion</p>
    <p>This report is for informational purposes only and should not replace professional medical advice.</p>
    <p>Generated on ${formatTimestamp(new Date())}</p>
  </div>
</body>
</html>
    `;
  }

  // Share report via system share sheet
  async shareReport(filePath: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Sharing is not available on this device");
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        dialogTitle: "Share Health Report",
      });
    } catch (error) {
      console.error("Error sharing report:", error);
      throw error;
    }
  }

  // Export report to specific format
  async exportReport(
    options: ReportOptions,
    format: "html" | "pdf" = "html"
  ): Promise<string> {
    const filePath = await this.generatePDFReport(options);

    if (format === "pdf") {
      // In production, convert HTML to PDF using a library like react-native-html-to-pdf
      // For now, return HTML path
      return filePath;
    }

    return filePath;
  }
}

export default new DeviceReportService();
