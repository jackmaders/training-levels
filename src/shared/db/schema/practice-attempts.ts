import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { dogs } from "./dogs";

const practiceAttempts = sqliteTable(
  "practice_attempts",
  {
    attemptId: text("attempt_id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    outcome: text("outcome", { enum: ["success", "not_yet"] }).notNull(),
    stepId: text("step_id").notNull(),
    target: text("target").notNull(),
    undoneAt: integer("undone_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("practice_attempts_dog_step_created_idx").on(table.dogId, table.stepId, table.createdAt),
    uniqueIndex("practice_attempts_dog_attempt_unique").on(table.dogId, table.attemptId),
  ],
);

const practiceAttemptCorrections = sqliteTable(
  "practice_attempt_corrections",
  {
    attemptId: text("attempt_id").notNull(),
    correctedAt: integer("corrected_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    correctionId: text("correction_id").primaryKey(),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    isUndo: integer("is_undo", { mode: "boolean" }).notNull().default(false),
    outcome: text("outcome", { enum: ["success", "not_yet"] }).notNull(),
  },
  (table) => [
    index("practice_attempt_corrections_dog_attempt_idx").on(table.dogId, table.attemptId),
  ],
);

type PracticeAttempt = typeof practiceAttempts.$inferSelect;
type PracticeAttemptCorrection = typeof practiceAttemptCorrections.$inferSelect;

export {
  practiceAttempts,
  practiceAttemptCorrections,
  type PracticeAttempt,
  type PracticeAttemptCorrection,
};
