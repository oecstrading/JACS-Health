/**
 * Simplified Database Seeding Script for Pilot Agency Testing
 * 
 * Seeds essential hospice data for dashboard demos:
 * - 20 sample patients across 2 agencies
 * - Basic patient information for Revenue Command and Nurse Leader dashboards
 * 
 * Run with: tsx server/seed-pilot-data.ts
 */

import { getDb } from "./db";
import { hospicePatients } from "../drizzle/schema";

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedPilotData() {
  console.log("🌱 Starting database seeding for pilot agencies...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed. Please check DATABASE_URL environment variable.");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Sample data
  const firstNames = [
    "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William",
    "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica", "Thomas"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"
  ];

  const diagnoses = [
    "End-stage heart failure",
    "Advanced COPD",
    "Metastatic lung cancer",
    "End-stage renal disease",
    "Advanced dementia",
    "Metastatic breast cancer",
    "End-stage liver disease",
    "Advanced Parkinson's disease"
  ];

  const agencies = [
    { name: "Sunrise Hospice", count: 10 },
    { name: "Compassionate Care Hospice", count: 10 }
  ];

  let totalPatients = 0;

  // Seed patients for both agencies
  for (const agency of agencies) {
    console.log(`📋 Seeding ${agency.count} patients for ${agency.name}...`);

    for (let i = 0; i < agency.count; i++) {
      const firstName = firstNames[randomInt(0, firstNames.length - 1)];
      const lastName = lastNames[randomInt(0, lastNames.length - 1)];
      const age = randomInt(65, 95);
      const diagnosis = diagnoses[randomInt(0, diagnoses.length - 1)];
      const admissionDate = randomDate(sixtyDaysAgo, thirtyDaysAgo);

      await db.insert(hospicePatients).values({
        id: `patient-${agency.name.toLowerCase().replace(' ', '-')}-${i + 1}`,
        userId: `user-${agency.name.toLowerCase().replace(' ', '-')}-${i + 1}`,
        admissionDate,
        levelOfCare: "routine_home" as any,
        primaryDiagnosis: diagnosis,
        attendingPhysician: "Dr. Smith",
        hospicePhysician: "Dr. Johnson",
        status: Math.random() > 0.9 ? "discharged" : "active" // 10% discharged
      });

      totalPatients++;
    }

    console.log(`✅ Seeded ${agency.count} patients for ${agency.name}\n`);
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Total patients seeded: ${totalPatients}`);
  console.log("\n💡 Next steps:");
  console.log("1. Open the Revenue Command dashboard to see sample patient data");
  console.log("2. Open the Nurse Leader Dashboard to see staff performance metrics");
  console.log("3. Test the Onboarding Wizard with a new patient\n");
}

// Run seeding
seedPilotData()
  .then(() => {
    console.log("✅ Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });
