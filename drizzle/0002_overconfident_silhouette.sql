CREATE TABLE `imaging_analyses` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`medical_record_id` varchar(128),
	`imaging_type` enum('xray','ct_scan','mri','ultrasound','pet_scan','mammogram','other') NOT NULL,
	`body_part` varchar(100) NOT NULL,
	`study_date` timestamp,
	`image_paths` json NOT NULL,
	`ai_analysis` json,
	`report_text` text,
	`radiologist_review` text,
	`status` enum('pending_analysis','analyzed','reviewed') NOT NULL DEFAULT 'pending_analysis',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imaging_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_records` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`document_type` enum('lab_report','radiology_report','prescription','discharge_summary','consultation_note','insurance_card','vaccination_record','other') NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`file_path` text NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`file_size` int NOT NULL,
	`document_date` timestamp,
	`upload_date` timestamp NOT NULL DEFAULT (now()),
	`category` varchar(100),
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_records_id` PRIMARY KEY(`id`)
);
