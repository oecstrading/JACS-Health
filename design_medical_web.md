# Medical Records Management Web Application - Design Document

## Project Overview

Transform the health_companion project into a comprehensive medical records management web application with multi-patient support, searchable database, interactive visualizations, and public-facing interface. The design is inspired by the Vertigo Disease Comprehensive Medical Report structure.

## Design Philosophy

**Professional Medical Interface** - Clean, clinical design that conveys trust and authority while remaining accessible to non-medical users. The interface should feel like a modern electronic health records (EHR) system but simplified for family use.

**Data-Driven Visualization** - Emphasize visual presentation of medical data through charts, graphs, and trend lines. Every piece of data should be contextualized with reference ranges and clinical interpretations.

**Multi-Patient Family Portal** - Support tracking medical records for multiple family members with easy switching and comparison capabilities.

## Visual Design Direction

### Aesthetic Direction
**Clinical Modern** - Clean white backgrounds with medical blue accents, professional typography, and data-focused layouts. Think modern hospital dashboard meets family health portal. Generous white space, clear hierarchy, and medical-grade precision.

### Color Palette
- **Background**: #FFFFFF (Pure White) - Clinical cleanliness
- **Primary**: #1976D2 (Medical Blue) - Trust and professionalism
- **Secondary**: #0D47A1 (Deep Blue) - Depth and authority
- **Success**: #4CAF50 (Medical Green) - Normal values, positive trends
- **Warning**: #FF9800 (Medical Orange) - Borderline values, caution
- **Error**: #F44336 (Medical Red) - Abnormal values, alerts
- **Text Primary**: #212121 (Near Black) - Maximum readability
- **Text Secondary**: #757575 (Medium Gray) - Supporting information
- **Border**: #E0E0E0 (Light Gray) - Subtle divisions
- **Surface**: #F5F5F5 (Off-White) - Cards and elevated surfaces

### Typography
- **Headings**: Inter, -apple-system, sans-serif (Clean, modern, professional)
- **Body**: Inter, -apple-system, sans-serif (Highly readable)
- **Data/Numbers**: 'Roboto Mono', monospace (Tabular data alignment)
- **Sizes**:
  - H1: 32px (Page titles)
  - H2: 24px (Section headers)
  - H3: 20px (Subsection headers)
  - Body: 16px (Standard text)
  - Small: 14px (Supporting information)
  - Data: 18px (Lab values, numbers)

## Screen Layout Structure

### 1. Home Page / Patient List
**Purpose**: Entry point showing all patients in the family medical database

**Layout**:
- Header with app title "Family Medical Records"
- Search bar (search across all patients)
- Grid of patient cards (3 columns on desktop, 1 on mobile)
- Each card shows:
  - Patient photo/avatar
  - Name, age, DOB
  - Latest test date
  - Health status indicator (color-coded)
  - Quick stats (# of tests, latest abnormal findings)
  - "View Records" button

**User Flow**: Click patient card → Patient Dashboard

### 2. Patient Dashboard
**Purpose**: Overview of individual patient's complete medical history

**Layout** (Inspired by Vertigo Disease report):
- **Header Section**:
  - Patient name, DOB, age, medical record number
  - Navigation tabs: Overview | Lab Results | Charts | Reports | Timeline
  - Search bar (search within this patient's records)
  
- **Overview Tab** (Default view):
  - **Summary Cards** (4-card grid):
    - Total Lab Tests
    - Latest Test Date
    - Abnormal Findings Count
    - Health Score/Status
  
  - **Critical Findings Panel** (Red alert box):
    - List of current abnormal findings
    - Each with severity indicator
    - Click to view details
  
  - **Recent Test Results Table**:
    - Last 10 lab results
    - Columns: Date, Test Name, Result, Status, Trend
    - Color-coded status indicators
    - Click row to see full details
  
  - **Trend Preview Charts** (2-column grid):
    - Mini versions of key charts (Hemoglobin, Cholesterol, eGFR, HbA1c)
    - Click to view full-size interactive chart

**User Flow**: 
- Click tab → Switch view
- Click chart → Full-screen interactive chart
- Click test result → Detailed test view

### 3. Lab Results Page
**Purpose**: Searchable, filterable table of all lab results

**Layout**:
- **Filter Panel** (Left sidebar):
  - Date range picker
  - Category filter (Blood Count, Lipids, Kidney, etc.)
  - Status filter (Normal, High, Low)
  - Test name search
  - Clear filters button

- **Results Table** (Main area):
  - Sortable columns: Date, Test Name, Result, Unit, Reference Range, Status, Category
  - Color-coded status cells
  - Pagination (50 results per page)
  - Export to CSV button
  - Print button

- **Quick Stats** (Top bar):
  - Total results: 96
  - Abnormal: 12
  - Date range: Sept 2021 - Feb 2026

**User Flow**:
- Apply filters → Table updates
- Click column header → Sort
- Click row → Detailed test view with historical trend

### 4. Charts & Visualizations Page
**Purpose**: Interactive visual analysis of all lab trends

**Layout**:
- **Category Selector** (Top):
  - Tabs: All | Blood Count | Lipids | Kidney | Liver | Electrolytes | Diabetes | Thyroid | Other
  
- **Master Dashboard View** (Default):
  - Large multi-panel chart (23 panels)
  - Zoom controls
  - Download as PNG button
  
- **Category View** (When tab selected):
  - Individual charts for each test in category
  - 2-3 column grid
  - Each chart interactive (hover for values, zoom, pan)
  
- **Chart Features**:
  - Reference range shading
  - Trend lines
  - Data point annotations
  - Color-coded status indicators
  - Date range selector
  - Export individual charts

**User Flow**:
- Select category → View category charts
- Hover over chart → See exact values
- Click chart → Expand to full screen
- Download → Save as PNG

### 5. Medical Reports Page
**Purpose**: Comprehensive physician-ready medical analysis

**Layout** (Modeled after Vertigo Disease report):
- **Report Navigation** (Left sidebar):
  - Table of contents with jump links:
    - Executive Summary
    - Critical Findings
    - Findings by System
    - Laboratory Trends
    - Action Plan
    - Recommendations
    - Follow-up Schedule
  
- **Report Content** (Main area):
  - **Executive Summary**:
    - Patient demographics
    - Observation period
    - Total tests analyzed
    - Key findings (bullet points)
  
  - **Critical Findings** (Red alert section):
    - Chronic Anemia (5+ years)
    - Persistent Prediabetes
    - Hyperlipidemia
    - Elevated Rheumatoid Factor
    - Each with clinical significance and action required
  
  - **Findings by System** (Accordion sections):
    - Hematologic System
    - Endocrine System
    - Cardiovascular System
    - Renal System
    - Rheumatologic System
    - Gastrointestinal System
    - Musculoskeletal System
    - Thyroid Function
    - Each section expandable with:
      - Current status
      - 5-year trend
      - Clinical interpretation
      - Recommendations
  
  - **Laboratory Trends** (Embedded charts):
    - Key trend charts inline
    - Summary statistics table
  
  - **Action Plan** (3-priority system):
    - Priority 1: Urgent (This Week)
    - Priority 2: Important (Within 1 Month)
    - Priority 3: Routine (Within 3-6 Months)
    - Each with checkboxes
  
  - **Follow-up Schedule** (Calendar view):
    - Recommended tests and appointments
    - Dates and frequencies

- **Report Actions** (Top right):
  - Print Report button
  - Export to PDF button
  - Share with Doctor button
  - Email Report button

**User Flow**:
- Click TOC link → Jump to section
- Click accordion → Expand/collapse
- Click Export PDF → Download physician-ready report

### 6. Timeline View
**Purpose**: Chronological visualization of medical history

**Layout**:
- **Vertical Timeline** (Center):
  - Date markers (monthly/yearly depending on zoom)
  - Event cards on timeline:
    - Lab tests (grouped by date)
    - Medical documents
    - Reports generated
    - Imaging studies
  
- **Filters** (Top):
  - Date range slider
  - Event type checkboxes (Labs, Documents, Reports, Imaging)
  
- **Event Details** (Click to expand):
  - Full details of tests/documents
  - Inline chart previews
  - Download links

**User Flow**:
- Scroll timeline → See chronological history
- Click event → Expand details
- Adjust filters → Update timeline

### 7. Add/Edit Patient Page
**Purpose**: Manage patient profiles

**Layout**:
- **Patient Information Form**:
  - Full Name
  - Date of Birth
  - Gender
  - Medical Record Number
  - Photo upload
  - Relationship (Self, Spouse, Parent, Child, etc.)
  - Emergency Contact
  - Primary Physician
  - Insurance Information
  
- **Actions**:
  - Save button
  - Cancel button
  - Delete Patient button (with confirmation)

### 8. Upload Medical Data Page
**Purpose**: Import lab results and documents

**Layout**:
- **Upload Methods** (Tabs):
  - CSV Upload (for lab results)
  - PDF Upload (for documents)
  - Manual Entry (single test)
  
- **CSV Upload**:
  - Drag-and-drop zone
  - Column mapping interface
  - Preview table
  - Import button
  
- **PDF Upload**:
  - Drag-and-drop zone
  - Document type selector
  - Date picker
  - Upload button
  
- **Manual Entry**:
  - Test date picker
  - Test name input (autocomplete)
  - Result input
  - Unit input
  - Reference range input
  - Status selector (Normal/High/Low)
  - Category selector
  - Save button

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   └── User Menu
├── Sidebar (Patient List)
│   └── PatientCard[]
├── Main Content Area
│   ├── PatientDashboard
│   │   ├── PatientHeader
│   │   ├── SummaryCards
│   │   ├── CriticalFindings
│   │   ├── RecentResults Table
│   │   └── TrendPreviews
│   ├── LabResultsPage
│   │   ├── FilterPanel
│   │   └── ResultsTable
│   ├── ChartsPage
│   │   ├── CategorySelector
│   │   └── ChartGrid
│   ├── ReportsPage
│   │   ├── ReportNav
│   │   └── ReportContent
│   ├── TimelinePage
│   │   └── Timeline
│   └── UploadPage
│       └── UploadForm
└── Footer
```

## Key Interactions

### Search Functionality
- **Global Search** (Home page):
  - Search across all patients
  - Results show patient name + matching test/finding
  - Click result → Navigate to patient dashboard
  
- **Patient Search** (Dashboard):
  - Search within patient's records
  - Filter by test name, date, value, category
  - Real-time filtering

### Data Visualization
- **Interactive Charts**:
  - Hover → Show tooltip with exact values
  - Click data point → Show test details
  - Zoom → Pinch or scroll
  - Pan → Drag
  - Export → Download PNG/PDF

### Multi-Patient Comparison
- **Comparison View** (Future feature):
  - Select 2+ patients
  - Side-by-side dashboards
  - Aligned timelines
  - Comparative charts

## Responsive Design

### Desktop (>1200px)
- 3-column patient card grid
- Side-by-side filter panel + results table
- Multi-panel chart layouts
- Full sidebar navigation

### Tablet (768px - 1200px)
- 2-column patient card grid
- Collapsible filter panel
- 2-column chart layouts
- Hamburger menu for navigation

### Mobile (<768px)
- 1-column patient card list
- Bottom sheet filter panel
- 1-column chart layouts (stack vertically)
- Bottom navigation bar
- Simplified tables (horizontal scroll)

## Technical Implementation

### Database Schema (Drizzle ORM)

```typescript
// patients table
{
  id: serial primary key
  name: text not null
  date_of_birth: date not null
  gender: text
  medical_record_number: text unique
  photo_url: text
  relationship: text
  emergency_contact: text
  primary_physician: text
  insurance_info: jsonb
  created_at: timestamp
  updated_at: timestamp
}

// lab_results table
{
  id: serial primary key
  patient_id: integer references patients(id)
  test_date: date not null
  test_name: text not null
  result: decimal not null
  unit: text not null
  reference_range: text
  status: text (Normal/High/Low)
  category: text (Blood Count/Lipids/etc)
  created_at: timestamp
}

// medical_documents table
{
  id: serial primary key
  patient_id: integer references patients(id)
  document_name: text not null
  document_type: text (PDF/Image/Report)
  upload_date: date not null
  file_url: text not null
  created_at: timestamp
}

// medical_reports table
{
  id: serial primary key
  patient_id: integer references patients(id)
  report_date: date not null
  report_type: text (Comprehensive/Quick Summary)
  content: text not null (markdown)
  created_at: timestamp
}

// chart_images table
{
  id: serial primary key
  patient_id: integer references patients(id)
  chart_name: text not null
  chart_category: text
  image_url: text not null
  created_at: timestamp
}
```

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS)
- **Charts**: react-native-chart-kit or recharts
- **Database**: PostgreSQL + Drizzle ORM
- **Backend**: tRPC API
- **File Storage**: S3-compatible storage
- **PDF Generation**: react-pdf or jspdf

### File Structure
```
app/
  (web)/
    index.tsx                 # Home page (patient list)
    patients/
      [id]/
        index.tsx             # Patient dashboard
        lab-results.tsx       # Lab results page
        charts.tsx            # Charts page
        reports.tsx           # Medical reports page
        timeline.tsx          # Timeline view
    upload.tsx                # Upload data page
    add-patient.tsx           # Add/edit patient
components/
  web/
    PatientCard.tsx
    SummaryCard.tsx
    CriticalFindings.tsx
    LabResultsTable.tsx
    TrendChart.tsx
    ReportSection.tsx
    Timeline.tsx
    FilterPanel.tsx
server/
  routers/
    patients.ts               # Patient CRUD operations
    labResults.ts             # Lab results queries
    reports.ts                # Report generation
    charts.ts                 # Chart data endpoints
  db/
    schema.ts                 # Drizzle schema definitions
```

## Implementation Phases

### Phase 1: Database Setup
1. Create database schema with Drizzle ORM
2. Set up migrations
3. Create seed data for Janice John

### Phase 2: Data Import
1. Import Janice's patient profile
2. Import 96 lab results from CSV
3. Upload chart images to S3
4. Import medical reports (markdown to database)

### Phase 3: Core Web UI
1. Build home page with patient list
2. Create patient dashboard
3. Implement lab results table
4. Add search and filter functionality

### Phase 4: Visualizations
1. Integrate charting library
2. Display all trend charts
3. Create interactive master dashboard
4. Implement chart export

### Phase 5: Medical Reports
1. Create report page layout
2. Render markdown reports
3. Add table of contents navigation
4. Implement PDF export

### Phase 6: Multi-Patient Support
1. Add patient management (CRUD)
2. Implement patient switching
3. Create family view
4. Add comparison features

### Phase 7: Polish & Deploy
1. Responsive design refinement
2. Loading states and error handling
3. Performance optimization
4. Testing
5. Deployment

## Success Criteria

- ✅ Display Janice John's complete medical history (96 lab results, 5-year period)
- ✅ All 11 trend charts displayed and interactive
- ✅ Comprehensive medical report rendered with proper formatting
- ✅ Search functionality works across all data
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Can add additional family members
- ✅ Can upload new lab results (CSV or manual)
- ✅ PDF export generates physician-ready reports
- ✅ Public URL accessible and fast (<3s load time)

## Inspiration Reference

**Vertigo Disease Report** (https://vertigorep-dkaxmrox.manus.space/)
- Clean, professional medical report layout
- Clear section hierarchy
- Data tables with proper formatting
- Inline charts and visualizations
- Clinical interpretations with evidence
- Action plans with priorities
- Print-friendly design

**Adapt for Family Portal**:
- Multi-patient support (not in original)
- Interactive charts (original is static)
- Searchable database (original is single report)
- Timeline view (original is snapshot)
- Comparison features (original is single patient)
