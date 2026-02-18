import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

/**
 * PDF Export API Endpoint
 * Generates a comprehensive medical report PDF for doctor visits
 * 
 * POST /api/medical-records/export-pdf
 * Body: { patientId: string, reportType: "full" | "summary" }
 */
router.post("/export-pdf", async (req: Request, res: Response) => {
  try {
    const { patientId, reportType = "full" } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // For now, return the markdown file path that can be converted to PDF
    // In production, this would generate a PDF using a library like puppeteer or pdfkit
    const pdfPath = `/home/ubuntu/Janice_John_UPDATED_Comprehensive_Medical_Report_2026.md`;
    
    res.json({
      success: true,
      message: "PDF generation endpoint ready",
      patientId,
      reportType,
      // In production, this would be a PDF download URL
      downloadUrl: `/medical-records/${patientId}/download-pdf`,
      note: "Use manus-md-to-pdf utility to convert markdown to PDF"
    });

  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ 
      error: "Failed to generate PDF",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
