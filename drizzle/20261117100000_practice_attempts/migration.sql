CREATE TABLE `practice_attempts` (
	`attempt_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`outcome` text NOT NULL,
	`step_id` text NOT NULL,
	`target` text NOT NULL,
	`undone_at` integer,
	CONSTRAINT `fk_practice_attempts_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `practice_attempt_corrections` (
	`attempt_id` text NOT NULL,
	`correction_id` text PRIMARY KEY NOT NULL,
	`corrected_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`is_undo` integer DEFAULT false NOT NULL,
	`outcome` text NOT NULL,
	CONSTRAINT `fk_practice_attempt_corrections_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `practice_attempts_dog_step_created_idx` ON `practice_attempts` (`dog_id`,`step_id`,`created_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `practice_attempts_dog_attempt_unique` ON `practice_attempts` (`dog_id`,`attempt_id`);
--> statement-breakpoint
CREATE INDEX `practice_attempt_corrections_dog_attempt_idx` ON `practice_attempt_corrections` (`dog_id`,`attempt_id`);
