CREATE TABLE `medication_logs` (
	`id` varchar(128) NOT NULL,
	`medication_id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`taken_at` timestamp NOT NULL,
	`status` enum('taken','skipped','missed') NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`name` text NOT NULL,
	`dosage` varchar(255) NOT NULL,
	`frequency` varchar(255) NOT NULL,
	`instructions` text,
	`prescribed_by` text,
	`pharmacy` text,
	`refills_remaining` int,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`reminder_enabled` boolean NOT NULL DEFAULT true,
	`reminder_times` json,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vitals` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`vital_type` enum('blood_pressure','heart_rate','blood_glucose','weight','temperature','oxygen_saturation') NOT NULL,
	`systolic` int,
	`diastolic` int,
	`value` decimal(10,2),
	`unit` varchar(50),
	`notes` text,
	`recorded_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vitals_id` PRIMARY KEY(`id`)
);
