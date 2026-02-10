import AsyncStorage from "@react-native-async-storage/async-storage";
import CGMService from "./cgmService";

/**
 * Diabetes Medicare Compliance Service
 * 
 * Tracks Medicare billing compliance for diabetes remote monitoring:
 * - CPT 95250: Professional CGM monitoring (72+ hours of data per 30 days)
 * - CPT 95251: CGM data analysis and report generation
 * - CPT 99091: Remote monitoring data collection (30+ minutes physician review)
 * - CPT 99454: Device supply and patient education (16+ days of data)
 * 
 * Ensures clinics can bill Medicare for diabetes remote patient monitoring services.
 */

export interface DiabetesComplianceStatus {
  monthStart: Date;
  monthEnd: Date;
  cgmDataDays: number; // Days with CGM data
  cgmDataHours: number; // Total hours of CGM data
  analysisReports: number; // Number of reports generated
  physicianReviewMinutes: number; // Minutes of physician review
  deviceDataDays: number; // Days with any device data (CGM + Omnipod)
  cptEligibility: {
    cpt95250: boolean; // 72+ hours CGM data
    cpt95251: boolean; // Analysis report generated
    cpt99091: boolean; // 30+ minutes physician review
    cpt99454: boolean; // 16+ days device data
  };
}

class DiabetesComplianceService {
  private static instance: DiabetesComplianceService;
  private complianceHistory: DiabetesComplianceStatus[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): DiabetesComplianceService {
    if (!DiabetesComplianceService.instance) {
      DiabetesComplianceService.instance = new DiabetesComplianceService();
    }
    return DiabetesComplianceService.instance;
  }

  private async loadData() {
    try {
      const data = await AsyncStorage.getItem("diabetes_compliance");
      if (data) {
        this.complianceHistory = JSON.parse(data).map((status: any) => ({
          ...status,
          monthStart: new Date(status.monthStart),
          monthEnd: new Date(status.monthEnd),
        }));
      }
    } catch (error) {
      console.error("Error loading diabetes compliance data:", error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem("diabetes_compliance", JSON.stringify(this.complianceHistory));
    } catch (error) {
      console.error("Error saving diabetes compliance data:", error);
    }
  }

  /**
   * Calculate current month's compliance status
   */
  async calculateCurrentCompliance(): Promise<DiabetesComplianceStatus> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get CGM readings for the month
    const cgmReadings = CGMService.getReadingsByDateRange(monthStart, monthEnd);

    // Calculate days with CGM data
    const daysWithData = new Set(
      cgmReadings.map((r) => r.timestamp.toDateString())
    ).size;

    // Calculate total hours of CGM data (readings are every 5 minutes)
    const cgmDataHours = (cgmReadings.length * 5) / 60;

    // Get analysis reports count (from AsyncStorage)
    const reportsData = await AsyncStorage.getItem("diabetes_analysis_reports");
    const reports = reportsData ? JSON.parse(reportsData) : [];
    const monthReports = reports.filter((r: any) => {
      const reportDate = new Date(r.timestamp);
      return reportDate >= monthStart && reportDate <= monthEnd;
    });

    // Get physician review time (from AsyncStorage)
    const reviewData = await AsyncStorage.getItem("physician_review_sessions");
    const reviewSessions = reviewData ? JSON.parse(reviewData) : [];
    const monthReviewMinutes = reviewSessions
      .filter((s: any) => {
        const sessionDate = new Date(s.timestamp);
        return sessionDate >= monthStart && sessionDate <= monthEnd;
      })
      .reduce((sum: number, s: any) => sum + s.duration, 0);

    // Device data days includes both CGM and Omnipod data
    const deviceDataDays = daysWithData; // Simplified - in production, would include Omnipod days

    // Determine CPT code eligibility
    const cptEligibility = {
      cpt95250: cgmDataHours >= 72, // 72+ hours of CGM data
      cpt95251: monthReports.length > 0, // At least one analysis report
      cpt99091: monthReviewMinutes >= 30, // 30+ minutes physician review
      cpt99454: deviceDataDays >= 16, // 16+ days of device data
    };

    const status: DiabetesComplianceStatus = {
      monthStart,
      monthEnd,
      cgmDataDays: daysWithData,
      cgmDataHours: Math.round(cgmDataHours * 10) / 10,
      analysisReports: monthReports.length,
      physicianReviewMinutes: monthReviewMinutes,
      deviceDataDays,
      cptEligibility,
    };

    // Update compliance history
    const existingIndex = this.complianceHistory.findIndex(
      (s) => s.monthStart.getMonth() === monthStart.getMonth() &&
            s.monthStart.getFullYear() === monthStart.getFullYear()
    );

    if (existingIndex >= 0) {
      this.complianceHistory[existingIndex] = status;
    } else {
      this.complianceHistory.push(status);
    }

    // Keep only last 12 months
    if (this.complianceHistory.length > 12) {
      this.complianceHistory = this.complianceHistory.slice(-12);
    }

    await this.saveData();

    return status;
  }

  /**
   * Get compliance status for a specific month
   */
  getComplianceForMonth(year: number, month: number): DiabetesComplianceStatus | null {
    return this.complianceHistory.find(
      (s) => s.monthStart.getFullYear() === year && s.monthStart.getMonth() === month
    ) || null;
  }

  /**
   * Get all compliance history
   */
  getComplianceHistory(): DiabetesComplianceStatus[] {
    return this.complianceHistory;
  }

  /**
   * Log analysis report generation
   */
  async logAnalysisReport(reportType: "weekly" | "monthly" | "agp") {
    try {
      const reportsData = await AsyncStorage.getItem("diabetes_analysis_reports");
      const reports = reportsData ? JSON.parse(reportsData) : [];
      
      reports.push({
        id: `report_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: reportType,
      });

      // Keep only last 100 reports
      if (reports.length > 100) {
        reports.shift();
      }

      await AsyncStorage.setItem("diabetes_analysis_reports", JSON.stringify(reports));
      
      // Recalculate compliance
      await this.calculateCurrentCompliance();
    } catch (error) {
      console.error("Error logging analysis report:", error);
    }
  }

  /**
   * Log physician review session
   */
  async logPhysicianReview(durationMinutes: number) {
    try {
      const reviewData = await AsyncStorage.getItem("physician_review_sessions");
      const sessions = reviewData ? JSON.parse(reviewData) : [];
      
      sessions.push({
        id: `review_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: durationMinutes,
      });

      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.shift();
      }

      await AsyncStorage.setItem("physician_review_sessions", JSON.stringify(sessions));
      
      // Recalculate compliance
      await this.calculateCurrentCompliance();
    } catch (error) {
      console.error("Error logging physician review:", error);
    }
  }

  /**
   * Generate billing report for Medicare submission
   */
  async generateBillingReport(month: Date): Promise<string> {
    const status = this.getComplianceForMonth(month.getFullYear(), month.getMonth());
    
    if (!status) {
      await this.calculateCurrentCompliance();
      return this.generateBillingReport(month);
    }

    const monthName = status.monthStart.toLocaleString("default", { month: "long", year: "numeric" });

    let report = `DIABETES REMOTE MONITORING - MEDICARE BILLING REPORT\n`;
    report += `Period: ${monthName}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    report += `=== DATA COLLECTION SUMMARY ===\n`;
    report += `CGM Data Days: ${status.cgmDataDays} days\n`;
    report += `CGM Data Hours: ${status.cgmDataHours} hours\n`;
    report += `Device Data Days: ${status.deviceDataDays} days\n`;
    report += `Analysis Reports: ${status.analysisReports}\n`;
    report += `Physician Review Time: ${status.physicianReviewMinutes} minutes\n\n`;
    
    report += `=== CPT CODE ELIGIBILITY ===\n`;
    report += `CPT 95250 (Professional CGM, 72+ hrs): ${status.cptEligibility.cpt95250 ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}\n`;
    report += `  Current: ${status.cgmDataHours} hours | Required: 72 hours\n\n`;
    
    report += `CPT 95251 (CGM Analysis & Report): ${status.cptEligibility.cpt95251 ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}\n`;
    report += `  Current: ${status.analysisReports} reports | Required: 1 report\n\n`;
    
    report += `CPT 99091 (Remote Monitoring Review): ${status.cptEligibility.cpt99091 ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}\n`;
    report += `  Current: ${status.physicianReviewMinutes} minutes | Required: 30 minutes\n\n`;
    
    report += `CPT 99454 (Device Supply & Education): ${status.cptEligibility.cpt99454 ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}\n`;
    report += `  Current: ${status.deviceDataDays} days | Required: 16 days\n\n`;
    
    // Calculate potential revenue
    const revenue = this.calculatePotentialRevenue(status);
    report += `=== POTENTIAL REVENUE ===\n`;
    report += `CPT 95250: ${status.cptEligibility.cpt95250 ? "$85" : "$0"}\n`;
    report += `CPT 95251: ${status.cptEligibility.cpt95251 ? "$45" : "$0"}\n`;
    report += `CPT 99091: ${status.cptEligibility.cpt99091 ? "$60" : "$0"}\n`;
    report += `CPT 99454: ${status.cptEligibility.cpt99454 ? "$60" : "$0"}\n`;
    report += `TOTAL: $${revenue}\n\n`;
    
    report += `Note: This report is for billing support only. Verify with current Medicare fee schedules.\n`;

    return report;
  }

  /**
   * Calculate potential Medicare revenue
   */
  private calculatePotentialRevenue(status: DiabetesComplianceStatus): number {
    let revenue = 0;
    
    if (status.cptEligibility.cpt95250) revenue += 85; // Professional CGM
    if (status.cptEligibility.cpt95251) revenue += 45; // CGM analysis
    if (status.cptEligibility.cpt99091) revenue += 60; // Remote monitoring review
    if (status.cptEligibility.cpt99454) revenue += 60; // Device supply
    
    return revenue;
  }

  /**
   * Get days remaining to meet compliance thresholds
   */
  getDaysToCompliance(): {
    cgmDataDaysNeeded: number;
    deviceDataDaysNeeded: number;
    daysLeftInMonth: number;
  } {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeftInMonth = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cgmReadings = CGMService.getReadingsByDateRange(monthStart, now);
    const currentDataDays = new Set(cgmReadings.map((r) => r.timestamp.toDateString())).size;

    const cgmDataDaysNeeded = Math.max(0, 16 - currentDataDays);
    const deviceDataDaysNeeded = Math.max(0, 16 - currentDataDays);

    return {
      cgmDataDaysNeeded,
      deviceDataDaysNeeded,
      daysLeftInMonth,
    };
  }
}

export default DiabetesComplianceService.getInstance();
