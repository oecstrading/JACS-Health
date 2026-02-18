CREATE TABLE `chart_images` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`chart_name` text NOT NULL,
	`chart_category` varchar(100),
	`image_url` text NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chart_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_results` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`test_date` timestamp NOT NULL,
	`test_name` text NOT NULL,
	`result` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`reference_range` varchar(100),
	`status` enum('Normal','High','Low') NOT NULL,
	`category` enum('Blood Count','Lipids','Kidney','Liver','Electrolytes','Diabetes','Thyroid','Iron Studies','Autoimmune','Vitamins','Metabolic','Other') NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_documents` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`document_name` text NOT NULL,
	`document_type` enum('Lab Report','Imaging Study','Medical Report','Prescription','Other') NOT NULL,
	`upload_date` timestamp NOT NULL DEFAULT (now()),
	`file_url` text NOT NULL,
	`file_size` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patient_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_reports` (
	`id` varchar(128) NOT NULL,
	`patient_id` varchar(128) NOT NULL,
	`report_date` timestamp NOT NULL,
	`report_type` enum('Comprehensive Medical Report','Quick Summary','Findings by System','Action Plan') NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patient_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`name` text NOT NULL,
	`date_of_birth` timestamp NOT NULL,
	`gender` enum('male','female','other'),
	`medical_record_number` varchar(100),
	`photo_url` text,
	`relationship` varchar(50),
	`emergency_contact` text,
	`primary_physician` text,
	`insurance_info` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_medical_record_number_unique` UNIQUE(`medical_record_number`)
);
