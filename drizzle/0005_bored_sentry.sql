CREATE TABLE `alert_forwarding_settings` (
	`id` varchar(128) NOT NULL,
	`family_connection_id` varchar(128) NOT NULL,
	`forward_glucose_alerts` boolean NOT NULL DEFAULT true,
	`forward_medication_alerts` boolean NOT NULL DEFAULT true,
	`forward_appointment_alerts` boolean NOT NULL DEFAULT false,
	`forward_emergency_alerts` boolean NOT NULL DEFAULT true,
	`quiet_hours_start` varchar(5),
	`quiet_hours_end` varchar(5),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_forwarding_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_connections` (
	`id` varchar(128) NOT NULL,
	`patient_user_id` varchar(128) NOT NULL,
	`caregiver_user_id` varchar(128) NOT NULL,
	`relationship_type` enum('parent','child','spouse','caregiver','guardian','sibling','other') NOT NULL,
	`permission_level` enum('view_only','alerts','full_access') NOT NULL DEFAULT 'view_only',
	`is_active` boolean NOT NULL DEFAULT true,
	`is_approved` boolean NOT NULL DEFAULT false,
	`invitation_token` text,
	`invitation_expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`approved_at` timestamp,
	CONSTRAINT `family_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_data_access_log` (
	`id` varchar(128) NOT NULL,
	`family_connection_id` varchar(128) NOT NULL,
	`data_type` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`details` text,
	`accessed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_data_access_log_id` PRIMARY KEY(`id`)
);
