CREATE TABLE `step_tests` (
	`cold_override` integer DEFAULT false NOT NULL,
	`dog_id` text NOT NULL,
	`outcome` text NOT NULL,
	`step_id` text NOT NULL,
	`test_id` text PRIMARY KEY NOT NULL,
	`tested_at` integer NOT NULL,
	CONSTRAINT `fk_step_tests_dog_id_dogs_id_fk` FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `step_tests_dog_step_tested_idx` ON `step_tests` (`dog_id`,`step_id`,`tested_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `step_tests_dog_test_unique` ON `step_tests` (`dog_id`,`test_id`);
