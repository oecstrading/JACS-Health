CREATE TABLE `meal_foods` (
	`id` varchar(128) NOT NULL,
	`meal_id` varchar(128) NOT NULL,
	`food_name` text NOT NULL,
	`serving_size` varchar(100),
	`quantity` decimal(10,2) NOT NULL,
	`calories` int NOT NULL,
	`protein` decimal(10,2),
	`carbs` decimal(10,2),
	`fat` decimal(10,2),
	`barcode` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meal_foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`meal_type` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`meal_date` timestamp NOT NULL,
	`total_calories` int DEFAULT 0,
	`total_protein` decimal(10,2) DEFAULT '0',
	`total_carbs` decimal(10,2) DEFAULT '0',
	`total_fat` decimal(10,2) DEFAULT '0',
	`notes` text,
	`photo_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`symptom_name` text NOT NULL,
	`severity` int NOT NULL,
	`log_date` timestamp NOT NULL,
	`duration` int,
	`triggers` text,
	`notes` text,
	`glucose_level` int,
	`medication_taken` text,
	`activity_before` text,
	`meal_before` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `symptoms_id` PRIMARY KEY(`id`)
);
