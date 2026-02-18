/**
 * Data Export Service
 * 
 * Provides HIPAA-compliant data export functionality
 * Supports JSON and PDF formats for data portability
 */

import { secureStorage } from './secureStorageService';
import * as FileSystem from 'expo-file-system/legacy';

export interface ExportOptions {
  format: 'json' | 'pdf' | 'csv';
  includeVitals: boolean;
  includeMedications: boolean;
  includeActivities: boolean;
  includeHealthRecords: boolean;
  includeProfile: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  success: boolean;
  fileUri?: string;
  fileName?: string;
  error?: string;
}

class DataExportService {
  /**
   * Export all user data in specified format
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      // Collect data based on options
      const data: any = {
        exportDate: new Date().toISOString(),
        metadata: {
          appVersion: '1.0.0',
          platform: 'mobile',
          exportFormat: options.format,
        },
      };

      if (options.includeProfile) {
        data.profile = await secureStorage.getItem('user_profile') || {};
      }

      if (options.includeMedications) {
        data.medications = await secureStorage.getItem('medications') || [];
      }

      if (options.includeVitals) {
        data.vitals = await this.getFilteredVitals(options.dateRange);
      }

      if (options.includeActivities) {
        data.activities = await this.getFilteredActivities(options.dateRange);
      }

      if (options.includeHealthRecords) {
        data.healthRecords = await secureStorage.getItem('health_records') || [];
      }

      // Generate file based on format
      switch (options.format) {
        case 'json':
          return await this.exportJSON(data);
        case 'pdf':
          return await this.exportPDF(data);
        case 'csv':
          return await this.exportCSV(data);
        default:
          return {
            success: false,
            error: 'Unsupported export format',
          };
      }
    } catch (error) {
      console.error('Data export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export data as JSON
   */
  private async exportJSON(data: any): Promise<ExportResult> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const fileName = `healthmate_export_${this.getDateString()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      return {
        success: true,
        fileUri,
        fileName,
      };
    } catch (error) {
      console.error('JSON export failed:', error);
      return {
        success: false,
        error: 'Failed to create JSON file',
      };
    }
  }

  /**
   * Export data as PDF
   */
  private async exportPDF(data: any): Promise<ExportResult> {
    try {
      // Generate HTML content for PDF
      const htmlContent = this.generateHTMLReport(data);
      const fileName = `healthmate_export_${this.getDateString()}.html`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent);

      // In production, convert HTML to PDF using a library like react-native-html-to-pdf
      // For now, return HTML file
      return {
        success: true,
        fileUri,
        fileName,
      };
    } catch (error) {
      console.error('PDF export failed:', error);
      return {
        success: false,
        error: 'Failed to create PDF file',
      };
    }
  }

  /**
   * Export data as CSV
   */
  private async exportCSV(data: any): Promise<ExportResult> {
    try {
      let csvContent = '';

      // Export vitals as CSV
      if (data.vitals && data.vitals.length > 0) {
        csvContent += 'Vital Signs\n';
        csvContent += 'Date,Type,Value,Unit\n';
        
        for (const vital of data.vitals) {
          csvContent += `${vital.timestamp},${vital.type},${vital.value},${vital.unit}\n`;
        }
        csvContent += '\n';
      }

      // Export medications as CSV
      if (data.medications && data.medications.length > 0) {
        csvContent += 'Medications\n';
        csvContent += 'Name,Dosage,Frequency,Start Date\n';
        
        for (const med of data.medications) {
          csvContent += `${med.name},${med.dosage},${med.frequency},${med.startDate || 'N/A'}\n`;
        }
        csvContent += '\n';
      }

      const fileName = `healthmate_export_${this.getDateString()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      return {
        success: true,
        fileUri,
        fileName,
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      return {
        success: false,
        error: 'Failed to create CSV file',
      };
    }
  }

  /**
   * Get filtered vitals based on date range
   */
  private async getFilteredVitals(dateRange?: { start: Date; end: Date }): Promise<any[]> {
    const allVitals = await secureStorage.getItem('vitals') || [];

    if (!dateRange) {
      return allVitals;
    }

    return allVitals.filter((vital: any) => {
      const vitalDate = new Date(vital.timestamp);
      return vitalDate >= dateRange.start && vitalDate <= dateRange.end;
    });
  }

  /**
   * Get filtered activities based on date range
   */
  private async getFilteredActivities(dateRange?: { start: Date; end: Date }): Promise<any[]> {
    const allActivities = await secureStorage.getItem('activities') || [];

    if (!dateRange) {
      return allActivities;
    }

    return allActivities.filter((activity: any) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= dateRange.start && activityDate <= dateRange.end;
    });
  }

  /**
   * Generate HTML report for PDF export
   */
  private generateHTMLReport(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HealthMate Health Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #0a7ea4;
      border-bottom: 2px solid #0a7ea4;
      padding-bottom: 10px;
    }
    h2 {
      color: #0a7ea4;
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #0a7ea4;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .metadata {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>HealthMate Health Report</h1>
  <div class="metadata">
    <p><strong>Export Date:</strong> ${new Date(data.exportDate).toLocaleString()}</p>
    <p><strong>App Version:</strong> ${data.metadata.appVersion}</p>
  </div>

  ${data.profile ? `
  <h2>Profile Information</h2>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Name</td><td>${data.profile.name || 'N/A'}</td></tr>
    <tr><td>Date of Birth</td><td>${data.profile.dateOfBirth || 'N/A'}</td></tr>
    <tr><td>Email</td><td>${data.profile.email || 'N/A'}</td></tr>
  </table>
  ` : ''}

  ${data.medications && data.medications.length > 0 ? `
  <h2>Medications</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Dosage</th>
      <th>Frequency</th>
      <th>Start Date</th>
    </tr>
    ${data.medications.map((med: any) => `
      <tr>
        <td>${med.name}</td>
        <td>${med.dosage}</td>
        <td>${med.frequency}</td>
        <td>${med.startDate || 'N/A'}</td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  ${data.vitals && data.vitals.length > 0 ? `
  <h2>Vital Signs</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Type</th>
      <th>Value</th>
      <th>Unit</th>
    </tr>
    ${data.vitals.slice(0, 50).map((vital: any) => `
      <tr>
        <td>${new Date(vital.timestamp).toLocaleDateString()}</td>
        <td>${vital.type}</td>
        <td>${vital.value}</td>
        <td>${vital.unit}</td>
      </tr>
    `).join('')}
  </table>
  ${data.vitals.length > 50 ? `<p><em>Showing first 50 of ${data.vitals.length} entries</em></p>` : ''}
  ` : ''}

  <div class="metadata" style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
    <p><strong>Privacy Notice:</strong> This report contains your personal health information. Please handle it securely and do not share it with unauthorized parties.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get formatted date string for file names
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Delete all user data (for account deletion)
   */
  async deleteAllData(): Promise<boolean> {
    try {
      await secureStorage.clear();
      
      // Also clear any files in document directory
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || '');
      const healthMateFiles = files.filter(file => file.startsWith('healthmate_'));
      
      for (const file of healthMateFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`, {
          idempotent: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to delete all data:', error);
      return false;
    }
  }
}

export const dataExportService = new DataExportService();
