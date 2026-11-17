CREATE TABLE `practice_totals` (
	`record_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`not_yet_count` integer NOT NULL,
	`step_id` text NOT NULL,
	`success_count` integer NOT NULL,
	`target` text NOT NULL,
	CONSTRAINT `fk_practice_totals_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `practice_total_corrections` (
	`corrected_at` integer NOT NULL,
	`correction_id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`not_yet_count` integer NOT NULL,
	`record_id` text NOT NULL,
	`success_count` integer NOT NULL,
	CONSTRAINT `fk_practice_total_corrections_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `practice_step_decisions` (
	`decided_at` integer NOT NULL,
	`decision` text NOT NULL,
	`dog_id` text NOT NULL,
	`step_id` text NOT NULL,
	CONSTRAINT `fk_practice_step_decisions_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `practice_totals_dog_step_created_idx` ON `practice_totals` (`dog_id`,`step_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `practice_total_corrections_dog_record_idx` ON `practice_total_corrections` (`dog_id`,`record_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `practice_step_decisions_dog_step_unique` ON `practice_step_decisions` (`dog_id`,`step_id`);
