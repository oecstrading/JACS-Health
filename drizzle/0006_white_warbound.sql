CREATE TABLE `doctor_appointments` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`doctor_name` text NOT NULL,
	`specialty` varchar(100),
	`location` text,
	`phone` varchar(20),
	`appointment_date` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`appointment_type` varchar(50),
	`reason` text,
	`notes` text,
	`preparation_checklist` text,
	`post_visit_notes` text,
	`reminder_sent_24h` boolean DEFAULT false,
	`reminder_sent_1h` boolean DEFAULT false,
	`status` enum('scheduled','completed','cancelled','rescheduled') NOT NULL DEFAULT 'scheduled',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctor_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_progress_logs` (
	`id` varchar(128) NOT NULL,
	`goal_id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`notes` text,
	`log_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goal_progress_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_goals` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`goal_type` enum('weight_loss','weight_gain','exercise','glucose_control','blood_pressure','steps','water_intake','sleep','custom') NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`target_value` decimal(10,2),
	`current_value` decimal(10,2),
	`unit` varchar(20),
	`start_date` timestamp NOT NULL,
	`target_date` timestamp,
	`frequency` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`reminder_time` varchar(5),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`share_with_family` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_reminder_logs` (
	`id` varchar(128) NOT NULL,
	`reminder_id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`scheduled_time` timestamp NOT NULL,
	`taken_time` timestamp,
	`status` enum('taken','skipped','missed') NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_reminder_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_reminders` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`medication_name` text NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`instructions` text,
	`frequency` enum('once_daily','twice_daily','three_times_daily','four_times_daily','every_other_day','weekly','as_needed','custom') NOT NULL,
	`reminder_times` text NOT NULL,
	`pill_count` int,
	`refill_reminder_days` int DEFAULT 7,
	`is_active` boolean NOT NULL DEFAULT true,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medication_reminders_id` PRIMARY KEY(`id`)
);
