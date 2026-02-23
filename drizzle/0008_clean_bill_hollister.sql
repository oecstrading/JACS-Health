CREATE TABLE `consultations` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`provider_name` text NOT NULL,
	`provider_specialty` varchar(100),
	`provider_email` varchar(255),
	`provider_phone` varchar(50),
	`consultation_type` enum('video','phone','message','in_person') NOT NULL,
	`consultation_date` timestamp NOT NULL,
	`duration` int,
	`status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
	`reason` text,
	`notes` text,
	`prescription` text,
	`video_url` text,
	`recording_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_claims` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`claim_number` varchar(100),
	`insurance_provider` text NOT NULL,
	`policy_number` varchar(100),
	`claim_type` varchar(100),
	`service_date` timestamp NOT NULL,
	`submission_date` timestamp NOT NULL,
	`provider_name` text,
	`diagnosis` text,
	`procedure_code` varchar(50),
	`claimed_amount` decimal(10,2) NOT NULL,
	`approved_amount` decimal(10,2),
	`paid_amount` decimal(10,2),
	`out_of_pocket` decimal(10,2),
	`status` enum('submitted','pending','approved','denied','paid') DEFAULT 'submitted',
	`denial_reason` text,
	`document_urls` text,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provider_messages` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`consultation_id` varchar(128),
	`sender_type` enum('patient','provider') NOT NULL,
	`sender_name` text NOT NULL,
	`message` text NOT NULL,
	`attachment_url` text,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `provider_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_data` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`device_id` varchar(128) NOT NULL,
	`data_type` varchar(50) NOT NULL,
	`data_date` timestamp NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(20),
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_devices` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`device_type` enum('fitbit','apple_watch','garmin','other') NOT NULL,
	`device_name` text NOT NULL,
	`is_connected` boolean DEFAULT false,
	`last_sync_at` timestamp,
	`access_token` text,
	`refresh_token` text,
	`token_expires_at` timestamp,
	`sync_enabled` boolean DEFAULT true,
	`sync_frequency` int DEFAULT 60,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_devices_id` PRIMARY KEY(`id`)
);
