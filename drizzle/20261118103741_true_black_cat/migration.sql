CREATE TABLE `practice_attempt_corrections` (
	`attempt_id` text NOT NULL,
	`corrected_at` integer NOT NULL,
	`correction_id` text PRIMARY KEY,
	`dog_id` text NOT NULL,
	`is_undo` integer DEFAULT false NOT NULL,
	`outcome` text NOT NULL,
	CONSTRAINT `fk_practice_attempt_corrections_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `practice_attempts` (
	`attempt_id` text PRIMARY KEY,
	`created_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`outcome` text NOT NULL,
	`step_id` text NOT NULL,
	`target` text NOT NULL,
	`undone_at` integer,
	CONSTRAINT `fk_practice_attempts_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
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
CREATE TABLE `practice_total_corrections` (
	`corrected_at` integer NOT NULL,
	`correction_id` text PRIMARY KEY,
	`dog_id` text NOT NULL,
	`not_yet_count` integer NOT NULL,
	`record_id` text NOT NULL,
	`success_count` integer NOT NULL,
	CONSTRAINT `fk_practice_total_corrections_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `practice_totals` (
	`created_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`not_yet_count` integer NOT NULL,
	`record_id` text PRIMARY KEY,
	`step_id` text NOT NULL,
	`success_count` integer NOT NULL,
	`target` text NOT NULL,
	CONSTRAINT `fk_practice_totals_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `step_tests` (
	`cold_override` integer DEFAULT false NOT NULL,
	`dog_id` text NOT NULL,
	`outcome` text NOT NULL,
	`step_id` text NOT NULL,
	`test_id` text PRIMARY KEY,
	`tested_at` integer NOT NULL,
	CONSTRAINT `fk_step_tests_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `practice_attempt_corrections_dog_attempt_idx` ON `practice_attempt_corrections` (`dog_id`,`attempt_id`);--> statement-breakpoint
CREATE INDEX `practice_attempts_dog_step_created_idx` ON `practice_attempts` (`dog_id`,`step_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `practice_attempts_dog_attempt_unique` ON `practice_attempts` (`dog_id`,`attempt_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `practice_step_decisions_dog_step_unique` ON `practice_step_decisions` (`dog_id`,`step_id`);--> statement-breakpoint
CREATE INDEX `practice_total_corrections_dog_record_idx` ON `practice_total_corrections` (`dog_id`,`record_id`);--> statement-breakpoint
CREATE INDEX `practice_totals_dog_step_created_idx` ON `practice_totals` (`dog_id`,`step_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `step_tests_dog_step_tested_idx` ON `step_tests` (`dog_id`,`step_id`,`tested_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `step_tests_dog_test_unique` ON `step_tests` (`dog_id`,`test_id`);