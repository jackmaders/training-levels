CREATE TABLE `dogs` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`name` text(128) DEFAULT 'My Dog' NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_dogs_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `step_completions` (
	`completed_at` integer NOT NULL,
	`dog_id` text NOT NULL,
	`id` text PRIMARY KEY,
	`step_id` text NOT NULL,
	CONSTRAINT `fk_step_completions_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `dogs_user_id_idx` ON `dogs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `step_completions_dog_id_step_id_unique` ON `step_completions` (`dog_id`,`step_id`);