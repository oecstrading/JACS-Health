CREATE TABLE `hospice_assessments` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`assessment_type` enum('admission','discharge') NOT NULL,
	`assessment_date` timestamp NOT NULL,
	`pain_screening_completed` boolean NOT NULL DEFAULT false,
	`pain_intensity_score` int,
	`dyspnea_screening_completed` boolean NOT NULL DEFAULT false,
	`dyspnea_treatment_provided` boolean NOT NULL DEFAULT false,
	`treatment_preferences_discussed` boolean NOT NULL DEFAULT false,
	`spiritual_concerns_addressed` boolean NOT NULL DEFAULT false,
	`emotional_support_provided` boolean NOT NULL DEFAULT false,
	`caregiver_education_completed` boolean NOT NULL DEFAULT false,
	`advance_directives_documented` boolean NOT NULL DEFAULT false,
	`submission_status` enum('pending','ready','submitted','accepted','rejected') NOT NULL DEFAULT 'pending',
	`submission_date` timestamp,
	`submission_deadline` timestamp NOT NULL,
	`iqies_confirmation_number` varchar(255),
	`validation_errors` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospice_caregivers` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`caregiver_name` text NOT NULL,
	`relationship` text NOT NULL,
	`address_line1` text NOT NULL,
	`address_line2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip_code` varchar(10) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`is_primary_caregiver` boolean NOT NULL DEFAULT false,
	`cahps_eligible` boolean NOT NULL DEFAULT false,
	`cahps_survey_sent` boolean NOT NULL DEFAULT false,
	`cahps_survey_sent_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_caregivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospice_compliance_alerts` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`alert_type` enum('his_submission_due','hope_submission_due','visit_gap','cahps_export_due','cost_report_due') NOT NULL,
	`alert_level` enum('green','yellow','red') NOT NULL,
	`due_date` timestamp NOT NULL,
	`description` text NOT NULL,
	`status` enum('active','resolved','dismissed') NOT NULL DEFAULT 'active',
	`resolved_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_compliance_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospice_expenses` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128),
	`expense_date` timestamp NOT NULL,
	`cost_center` enum('nursing','therapy','social_work','chaplain','volunteer','aide','medical_supplies','medications','dme','telehealth_salaries','telehealth_equipment','administrative','facility','other') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`level_of_care` enum('routine_home','continuous_home','inpatient_respite','general_inpatient'),
	`cms_worksheet` enum('A','B','C','F') NOT NULL,
	`description` text NOT NULL,
	`vendor` text,
	`invoice_number` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospice_patients` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`admission_date` timestamp NOT NULL,
	`discharge_date` timestamp,
	`level_of_care` enum('routine_home','continuous_home','inpatient_respite','general_inpatient') NOT NULL,
	`primary_diagnosis` text NOT NULL,
	`secondary_diagnoses` json,
	`attending_physician` text NOT NULL,
	`hospice_physician` text NOT NULL,
	`status` enum('active','discharged','deceased') NOT NULL DEFAULT 'active',
	`date_of_death` timestamp,
	`location_of_death` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospice_visits` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`visit_type` enum('skilled_nursing','social_work','chaplain','volunteer','aide') NOT NULL,
	`visit_date` timestamp NOT NULL,
	`clinician_name` text NOT NULL,
	`clinician_role` text NOT NULL,
	`duration_minutes` int NOT NULL,
	`visit_notes` text,
	`services_provided` json,
	`next_visit_scheduled` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospice_visits_id` PRIMARY KEY(`id`)
);
