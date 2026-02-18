/**
 * Import Janice John's medical data into the database
 * This script imports:
 * - Patient profile
 * - 96 lab results from CSV
 * - Chart images
 * - Medical reports
 */

import { getDb } from "../server/db";
import { patients, labResults, chartImages, patientReports } from "../drizzle/schema";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";

// Simple CSV parser
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() || '';
    });
    records.push(record);
  }
  
  return records;
}

async function importJaniceData() {
  console.log("Starting Janice John medical data import...\n");
  
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 1. Create patient profile
  console.log("1. Creating patient profile...");
  const patientId = nanoid();
  const userId = "system"; // System user for demo purposes

  await db.insert(patients).values({
    id: patientId,
    userId: userId,
    name: "Janice John",
    dateOfBirth: new Date("1956-09-09"),
    gender: "female",
    medicalRecordNumber: "JJ-195609-001",
    relationship: "self",
    emergencyContact: "Dr. Monique Edwards",
    primaryPhysician: "Dr. Monique Edwards",
    insuranceInfo: {
      company: "Medicare",
      memberId: "JJ-1956-09-09",
    },
  });

  console.log(`✓ Patient created with ID: ${patientId}\n`);

  // 2. Import lab results from CSV
  console.log("2. Importing lab results from CSV...");
  const csvPath = "/home/ubuntu/janice_complete_lab_database.csv";
  const csvContent = readFileSync(csvPath, "utf-8");
  const records = parseCSV(csvContent);

  console.log(`Found ${records.length} lab results to import`);

  let imported = 0;
  for (const record of records) {
    try {
      await db.insert(labResults).values({
        id: nanoid(),
        patientId: patientId,
        testDate: new Date(record.Test_Date),
        testName: record.Test_Name,
        result: record.Result,
        unit: record.Unit,
        referenceRange: record.Reference_Range || null,
        status: record.Status as "Normal" | "High" | "Low",
        category: record.Category as any,
        notes: null,
      });
      imported++;
    } catch (error) {
      console.error(`Error importing ${record.Test_Name}:`, error);
    }
  }

  console.log(`✓ Imported ${imported}/${records.length} lab results\n`);

  // 3. Import chart images
  console.log("3. Importing chart images...");
  const charts = [
    {
      name: "Master Lab Trends (5-Year)",
      category: "Comprehensive",
      path: "/home/ubuntu/MASTER_All_Lab_Trends_5Year.png",
    },
    {
      name: "Blood Count Trends",
      category: "Blood Count",
      path: "/home/ubuntu/Trends_Blood_Count.png",
    },
    {
      name: "Lipids Trends",
      category: "Lipids",
      path: "/home/ubuntu/Trends_Lipids.png",
    },
    {
      name: "Kidney Function Trends",
      category: "Kidney",
      path: "/home/ubuntu/Trends_Kidney.png",
    },
    {
      name: "Liver Function Trends",
      category: "Liver",
      path: "/home/ubuntu/Trends_Liver.png",
    },
    {
      name: "Electrolytes Trends",
      category: "Electrolytes",
      path: "/home/ubuntu/Trends_Electrolytes.png",
    },
    {
      name: "Diabetes Monitoring",
      category: "Diabetes",
      path: "/home/ubuntu/Trends_Diabetes.png",
    },
    {
      name: "Thyroid Function",
      category: "Thyroid",
      path: "/home/ubuntu/Trends_Thyroid.png",
    },
    {
      name: "Iron Studies",
      category: "Iron Studies",
      path: "/home/ubuntu/Trends_Iron_Studies.png",
    },
    {
      name: "Autoimmune Markers",
      category: "Autoimmune",
      path: "/home/ubuntu/Trends_Autoimmune.png",
    },
    {
      name: "Vitamin Levels",
      category: "Vitamins",
      path: "/home/ubuntu/Trends_Vitamins.png",
    },
    {
      name: "5-Year Anemia Progression",
      category: "Blood Count",
      path: "/home/ubuntu/Anemia_5Year_Progression_Chart.png",
    },
    {
      name: "Diabetes Risk Progression",
      category: "Diabetes",
      path: "/home/ubuntu/Diabetes_Risk_Progression_Chart.png",
    },
  ];

  let chartsImported = 0;
  for (const chart of charts) {
    try {
      // In production, upload to S3 and get URL
      // For now, use file path as URL
      await db.insert(chartImages).values({
        id: nanoid(),
        patientId: patientId,
        chartName: chart.name,
        chartCategory: chart.category,
        imageUrl: chart.path,
        description: `${chart.category} trend visualization for Janice John`,
      });
      chartsImported++;
    } catch (error) {
      console.error(`Error importing chart ${chart.name}:`, error);
    }
  }

  console.log(`✓ Imported ${chartsImported}/${charts.length} chart images\n`);

  // 4. Import medical reports
  console.log("4. Importing medical reports...");
  const reports = [
    {
      type: "Comprehensive Medical Report",
      title: "Comprehensive Medical Analysis (5-Year Longitudinal Study)",
      path: "/home/ubuntu/Janice_John_UPDATED_Comprehensive_Medical_Report_2026.md",
    },
    {
      type: "Quick Summary",
      title: "Quick Medical Records Summary (5-Year Perspective)",
      path: "/home/ubuntu/Janice_John_UPDATED_Quick_Summary_5Year.md",
    },
  ];

  let reportsImported = 0;
  for (const report of reports) {
    try {
      const content = readFileSync(report.path, "utf-8");
      await db.insert(patientReports).values({
        id: nanoid(),
        patientId: patientId,
        reportDate: new Date("2026-02-18"),
        reportType: report.type as any,
        title: report.title,
        content: content,
      });
      reportsImported++;
    } catch (error) {
      console.error(`Error importing report ${report.title}:`, error);
    }
  }

  console.log(`✓ Imported ${reportsImported}/${reports.length} medical reports\n`);

  // Summary
  console.log("=" + "=".repeat(79));
  console.log("IMPORT SUMMARY");
  console.log("=" + "=".repeat(79));
  console.log(`Patient ID: ${patientId}`);
  console.log(`Lab Results: ${imported}`);
  console.log(`Chart Images: ${chartsImported}`);
  console.log(`Medical Reports: ${reportsImported}`);
  console.log("\n✅ Janice John's medical data import complete!");
}

// Run import
importJaniceData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });
