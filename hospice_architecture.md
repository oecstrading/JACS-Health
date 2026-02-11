# Hospice Tab Architecture & Data Models

## Overview

The Hospice tab provides comprehensive end-of-life care coordination tools for hospice agencies, focusing on three regulatory pillars:
1. **Hospice Quality Reporting Program (HQRP)** compliance
2. **CAHPS Hospice Survey** data collection
3. **Medicare Cost Reporting** financial tracking

Failure to meet these requirements results in a 4% reduction in the Annual Payment Update (APU).

---

## Database Schema

### hospice_patients

Tracks all patients enrolled in hospice care.

```typescript
{
  id: string (UUID)
  user_id: string (reference to users table)
  admission_date: timestamp
  discharge_date: timestamp | null
  level_of_care: enum ('routine_home', 'continuous_home', 'inpatient_respite', 'general_inpatient')
  primary_diagnosis: string
  secondary_diagnoses: string[]
  attending_physician: string
  hospice_physician: string
  status: enum ('active', 'discharged', 'deceased')
  date_of_death: timestamp | null
  location_of_death: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

### hospice_assessments

Stores HIS/HOPE assessment data for admissions and discharges.

```typescript
{
  id: string (UUID)
  patient_id: string (reference to hospice_patients)
  assessment_type: enum ('admission', 'discharge')
  assessment_date: timestamp
  
  // Seven Care Processes (HIS CBE #3235)
  pain_screening_completed: boolean
  pain_intensity_score: number (0-10) | null
  dyspnea_screening_completed: boolean
  dyspnea_treatment_provided: boolean
  treatment_preferences_discussed: boolean
  spiritual_concerns_addressed: boolean
  emotional_support_provided: boolean
  caregiver_education_completed: boolean
  advance_directives_documented: boolean
  
  // Submission tracking
  submission_status: enum ('pending', 'ready', 'submitted', 'accepted', 'rejected')
  submission_date: timestamp | null
  submission_deadline: timestamp (admission_date + 30 days)
  iqies_confirmation_number: string | null
  validation_errors: json | null
  
  created_at: timestamp
  updated_at: timestamp
}
```

### hospice_visits

Tracks skilled nursing and other clinical visits.

```typescript
{
  id: string (UUID)
  patient_id: string (reference to hospice_patients)
  visit_type: enum ('skilled_nursing', 'social_work', 'chaplain', 'volunteer', 'aide')
  visit_date: timestamp
  clinician_name: string
  clinician_role: string
  duration_minutes: number
  visit_notes: text
  services_provided: string[]
  next_visit_scheduled: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

### hospice_expenses

Tracks financial data for Medicare Cost Report.

```typescript
{
  id: string (UUID)
  patient_id: string (reference to hospice_patients) | null
  expense_date: timestamp
  cost_center: enum ('nursing', 'therapy', 'social_work', 'chaplain', 'volunteer', 'aide', 'medical_supplies', 'medications', 'dme', 'telehealth_salaries', 'telehealth_equipment', 'administrative', 'facility', 'other')
  amount: decimal
  level_of_care: enum ('routine_home', 'continuous_home', 'inpatient_respite', 'general_inpatient') | null
  cms_worksheet: enum ('A', 'B', 'C', 'F')
  description: text
  vendor: string | null
  invoice_number: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

### hospice_caregivers

Stores caregiver information for CAHPS survey eligibility.

```typescript
{
  id: string (UUID)
  patient_id: string (reference to hospice_patients)
  caregiver_name: string
  relationship: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  zip_code: string
  phone: string | null
  email: string | null
  is_primary_caregiver: boolean
  cahps_eligible: boolean
  cahps_survey_sent: boolean
  cahps_survey_sent_date: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

### hospice_compliance_alerts

Tracks compliance deadlines and alerts.

```typescript
{
  id: string (UUID)
  patient_id: string (reference to hospice_patients)
  alert_type: enum ('his_submission_due', 'hope_submission_due', 'visit_gap', 'cahps_export_due', 'cost_report_due')
  alert_level: enum ('green', 'yellow', 'red')
  due_date: timestamp
  description: text
  status: enum ('active', 'resolved', 'dismissed')
  resolved_date: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

---

## UI Component Architecture

### Tab Navigation

Add "Hospices" tab to `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="hospices"
  options={{
    title: "Hospices",
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
  }}
/>
```

### Screen Hierarchy

```
app/(tabs)/hospices.tsx (Main Dashboard)
├── app/hospice-patients.tsx (Patient List)
├── app/hospice-patient-detail.tsx (Patient Detail with route param)
├── app/hospice-compliance.tsx (Compliance Tracker)
├── app/hospice-assessment.tsx (HOPE/HIS Data Entry)
├── app/hospice-visits.tsx (Visit Log)
├── app/hospice-cost-report.tsx (Cost Report Dashboard)
├── app/hospice-cahps-export.tsx (CAHPS Export)
└── app/hospice-clinical-gaps.tsx (Clinical Gaps Report)
```

### Component Structure

```
components/hospice/
├── ComplianceCard.tsx (Red-Yellow-Green status indicator)
├── PatientStatusBadge.tsx (Active/Discharged/Deceased badge)
├── AssessmentChecklist.tsx (Seven care processes checklist)
├── VisitGapAlert.tsx (7-day visit gap warning)
├── CostCenterChart.tsx (Expense breakdown by cost center)
├── CAHPSEligibilityIndicator.tsx (Caregiver CAHPS eligibility)
└── SubmissionTimeline.tsx (30-day submission countdown)
```

---

## Feature Implementation Plan

### 1. HQRP Compliance Tracking

**Logic Gate for 30-Day Submission Window:**

```typescript
function calculateComplianceStatus(assessment: HospiceAssessment): 'green' | 'yellow' | 'red' {
  const daysUntilDeadline = daysBetween(new Date(), assessment.submission_deadline);
  
  if (assessment.submission_status === 'submitted' || assessment.submission_status === 'accepted') {
    return 'green';
  }
  
  if (daysUntilDeadline > 10) {
    return 'green'; // More than 10 days remaining
  } else if (daysUntilDeadline >= 3) {
    return 'yellow'; // 3-10 days remaining
  } else {
    return 'red'; // Less than 3 days remaining or overdue
  }
}
```

**Validation Rules for Seven Care Processes:**

```typescript
function validateAssessment(assessment: HospiceAssessment): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!assessment.pain_screening_completed) {
    errors.push({ field: 'pain_screening', message: 'Pain screening is required' });
  }
  
  if (!assessment.dyspnea_screening_completed) {
    errors.push({ field: 'dyspnea_screening', message: 'Dyspnea screening is required' });
  }
  
  if (!assessment.treatment_preferences_discussed) {
    errors.push({ field: 'treatment_preferences', message: 'Treatment preferences discussion is required' });
  }
  
  // Additional validations for other care processes...
  
  return errors;
}
```

### 2. HOPE/HIS Automated Validator

**Real-Time Validation UI:**

- As clinician fills out assessment form, show green checkmarks for completed required fields
- Show red error messages for missing or invalid data
- Display "Ready for Submission" button only when all validation passes
- Provide inline help text explaining each care process requirement

### 3. CAHPS Hospice Survey Integration

**Eligibility Filter:**

```typescript
function isCAHPSEligible(patient: HospicePatient, caregiver: HospiceCaregiver): boolean {
  if (!patient.date_of_death) return false;
  
  const ageAtDeath = calculateAge(patient.date_of_birth, patient.date_of_death);
  if (ageAtDeath < 18) return false;
  
  const hoursInCare = hoursBetween(patient.admission_date, patient.date_of_death);
  if (hoursInCare < 48) return false;
  
  if (!caregiver || !caregiver.is_primary_caregiver) return false;
  
  return true;
}
```

**Monthly CSV Export Format:**

```csv
Decedent_Last_Name,Decedent_First_Name,Date_of_Death,Caregiver_Last_Name,Caregiver_First_Name,Caregiver_Address,Caregiver_City,Caregiver_State,Caregiver_Zip
Smith,John,2026-01-15,Smith,Mary,123 Main St,Springfield,IL,62701
```

### 4. Medicare Cost Report Tools

**Cost Center Categorization:**

```typescript
const costCenterMapping = {
  nursing: { worksheet: 'A', category: 'Direct Patient Care' },
  therapy: { worksheet: 'A', category: 'Direct Patient Care' },
  social_work: { worksheet: 'A', category: 'Direct Patient Care' },
  chaplain: { worksheet: 'A', category: 'Direct Patient Care' },
  volunteer: { worksheet: 'B', category: 'Support Services' },
  aide: { worksheet: 'A', category: 'Direct Patient Care' },
  medical_supplies: { worksheet: 'C', category: 'Supplies' },
  medications: { worksheet: 'C', category: 'Supplies' },
  dme: { worksheet: 'C', category: 'Equipment' },
  telehealth_salaries: { worksheet: 'F', category: 'Telehealth' },
  telehealth_equipment: { worksheet: 'F', category: 'Telehealth' },
  administrative: { worksheet: 'B', category: 'Administrative' },
  facility: { worksheet: 'B', category: 'Facility' },
};
```

**Level of Care Aggregation:**

```typescript
function generateCostReportSummary(expenses: HospiceExpense[], fiscalYearStart: Date, fiscalYearEnd: Date) {
  const summary = {
    routine_home: { total: 0, patient_days: 0 },
    continuous_home: { total: 0, patient_days: 0 },
    inpatient_respite: { total: 0, patient_days: 0 },
    general_inpatient: { total: 0, patient_days: 0 },
  };
  
  expenses
    .filter(e => e.expense_date >= fiscalYearStart && e.expense_date <= fiscalYearEnd)
    .forEach(expense => {
      if (expense.level_of_care) {
        summary[expense.level_of_care].total += expense.amount;
      }
    });
  
  return summary;
}
```

### 5. Clinical Gap Alerts

**Visit Gap Detection:**

```typescript
function detectVisitGaps(patient: HospicePatient, visits: HospiceVisit[]): Alert[] {
  const alerts: Alert[] = [];
  const skilledNursingVisits = visits
    .filter(v => v.visit_type === 'skilled_nursing')
    .sort((a, b) => a.visit_date.getTime() - b.visit_date.getTime());
  
  for (let i = 1; i < skilledNursingVisits.length; i++) {
    const daysBetweenVisits = daysBetween(
      skilledNursingVisits[i - 1].visit_date,
      skilledNursingVisits[i].visit_date
    );
    
    if (daysBetweenVisits > 7) {
      alerts.push({
        type: 'visit_gap',
        level: 'red',
        description: `${daysBetweenVisits} days between skilled nursing visits`,
        patient_id: patient.id,
      });
    }
  }
  
  // Check if no visit scheduled in next 7 days
  const lastVisit = skilledNursingVisits[skilledNursingVisits.length - 1];
  const daysSinceLastVisit = daysBetween(lastVisit.visit_date, new Date());
  
  if (daysSinceLastVisit > 7) {
    alerts.push({
      type: 'visit_gap',
      level: 'red',
      description: `No skilled nursing visit in ${daysSinceLastVisit} days`,
      patient_id: patient.id,
    });
  }
  
  return alerts;
}
```

---

## Revenue Feature Implementation

### Subscription Tiers

```typescript
enum SubscriptionTier {
  BASIC = 'basic',           // Free - basic patient tracking
  PROFESSIONAL = 'professional', // $49/month - HOPE/HIS validator + clinical gaps
  ADMIN = 'admin',           // $99/month - Compliance dashboard + CAHPS export
  ENTERPRISE = 'enterprise'  // $199/month - Full cost reporting + analytics
}
```

### Feature Access Control

```typescript
const featureAccess = {
  [SubscriptionTier.BASIC]: ['patient_list', 'patient_detail', 'visit_log'],
  [SubscriptionTier.PROFESSIONAL]: ['hope_validator', 'clinical_gaps', ...BASIC],
  [SubscriptionTier.ADMIN]: ['compliance_dashboard', 'cahps_export', ...PROFESSIONAL],
  [SubscriptionTier.ENTERPRISE]: ['cost_report', 'analytics', 'api_access', ...ADMIN],
};
```

### Usage Tracking

```typescript
interface UsageMetrics {
  patient_records_processed: number;
  assessments_validated: number;
  cahps_exports_generated: number;
  cost_reports_generated: number;
  billing_period_start: Date;
  billing_period_end: Date;
}
```

---

## Icon Mapping

Add to `components/ui/icon-symbol.tsx`:

```typescript
const MAPPING = {
  // ... existing mappings
  "heart.fill": "favorite",
  "doc.text.fill": "description",
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
  "chart.bar.fill": "bar-chart",
  "calendar.badge.clock": "event",
  "person.2.fill": "people",
  "dollarsign.circle.fill": "attach-money",
} as IconMapping;
```

---

## API Endpoints (tRPC)

```typescript
// server/routers/hospice.ts

export const hospiceRouter = router({
  // Patients
  getPatients: publicProcedure.query(async () => { /* ... */ }),
  getPatient: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => { /* ... */ }),
  createPatient: publicProcedure.input(hospicePatientSchema).mutation(async ({ input }) => { /* ... */ }),
  updatePatient: publicProcedure.input(hospicePatientSchema).mutation(async ({ input }) => { /* ... */ }),
  
  // Assessments
  getAssessments: publicProcedure.input(z.object({ patientId: z.string() })).query(async ({ input }) => { /* ... */ }),
  createAssessment: publicProcedure.input(hospiceAssessmentSchema).mutation(async ({ input }) => { /* ... */ }),
  validateAssessment: publicProcedure.input(z.object({ assessmentId: z.string() })).mutation(async ({ input }) => { /* ... */ }),
  submitAssessment: publicProcedure.input(z.object({ assessmentId: z.string() })).mutation(async ({ input }) => { /* ... */ }),
  
  // Compliance
  getComplianceAlerts: publicProcedure.query(async () => { /* ... */ }),
  getComplianceStatus: publicProcedure.query(async () => { /* ... */ }),
  
  // Visits
  getVisits: publicProcedure.input(z.object({ patientId: z.string() })).query(async ({ input }) => { /* ... */ }),
  createVisit: publicProcedure.input(hospiceVisitSchema).mutation(async ({ input }) => { /* ... */ }),
  detectVisitGaps: publicProcedure.query(async () => { /* ... */ }),
  
  // CAHPS
  getCAHPSEligibleCaregivers: publicProcedure.query(async () => { /* ... */ }),
  exportCAHPSData: publicProcedure.mutation(async () => { /* ... */ }),
  
  // Cost Report
  getExpenses: publicProcedure.input(z.object({ fiscalYearStart: z.date(), fiscalYearEnd: z.date() })).query(async ({ input }) => { /* ... */ }),
  createExpense: publicProcedure.input(hospiceExpenseSchema).mutation(async ({ input }) => { /* ... */ }),
  generateCostReport: publicProcedure.input(z.object({ fiscalYearStart: z.date(), fiscalYearEnd: z.date() })).mutation(async ({ input }) => { /* ... */ }),
});
```

---

## Next Steps

1. Create database migration files for all hospice tables
2. Implement tRPC API endpoints
3. Build UI components for hospice screens
4. Add hospice tab to navigation
5. Implement compliance tracking logic
6. Build HOPE/HIS validator
7. Create CAHPS export functionality
8. Implement cost reporting tools
9. Add clinical gap alerts
10. Test all features end-to-end
