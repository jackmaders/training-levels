CREATE TABLE `comeafter_records` (
	`dog_id` text NOT NULL,
	`id` text PRIMARY KEY,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`step_id` text NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_comeafter_records_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `homework_reflections` (
	`dog_id` text NOT NULL,
	`id` text PRIMARY KEY,
	`page_slug` text NOT NULL,
	`reflection` text NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_homework_reflections_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comeafter_records_dog_id_step_id_unique` ON `comeafter_records` (`dog_id`,`step_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `homework_reflections_dog_id_page_slug_unique` ON `homework_reflections` (`dog_id`,`page_slug`);