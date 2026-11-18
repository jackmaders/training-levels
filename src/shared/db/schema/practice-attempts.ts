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

const practiceTotals = sqliteTable(
  "practice_totals",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    notYetCount: integer("not_yet_count").notNull(),
    recordId: text("record_id").primaryKey(),
    stepId: text("step_id").notNull(),
    successCount: integer("success_count").notNull(),
    target: text("target").notNull(),
  },
  (table) => [
    index("practice_totals_dog_step_created_idx").on(table.dogId, table.stepId, table.createdAt),
  ],
);

const practiceTotalCorrections = sqliteTable(
  "practice_total_corrections",
  {
    correctedAt: integer("corrected_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    correctionId: text("correction_id").primaryKey(),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    notYetCount: integer("not_yet_count").notNull(),
    recordId: text("record_id").notNull(),
    successCount: integer("success_count").notNull(),
  },
  (table) => [index("practice_total_corrections_dog_record_idx").on(table.dogId, table.recordId)],
);

const practiceStepDecisions = sqliteTable(
  "practice_step_decisions",
  {
    decidedAt: integer("decided_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    decision: text("decision", { enum: ["keep_practicing", "recommend_test"] }).notNull(),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    stepId: text("step_id").notNull(),
  },
  (table) => [uniqueIndex("practice_step_decisions_dog_step_unique").on(table.dogId, table.stepId)],
);

const stepTests = sqliteTable(
  "step_tests",
  {
    coldOverride: integer("cold_override", { mode: "boolean" }).notNull().default(false),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    outcome: text("outcome", { enum: ["success", "not_yet"] }).notNull(),
    stepId: text("step_id").notNull(),
    testId: text("test_id").primaryKey(),
    testedAt: integer("tested_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("step_tests_dog_step_tested_idx").on(table.dogId, table.stepId, table.testedAt),
    uniqueIndex("step_tests_dog_test_unique").on(table.dogId, table.testId),
  ],
);

type PracticeAttempt = typeof practiceAttempts.$inferSelect;
type PracticeAttemptCorrection = typeof practiceAttemptCorrections.$inferSelect;
type PracticeTotal = typeof practiceTotals.$inferSelect;
type PracticeTotalCorrection = typeof practiceTotalCorrections.$inferSelect;
type PracticeStepDecision = typeof practiceStepDecisions.$inferSelect;
type StepTest = typeof stepTests.$inferSelect;

export {
  practiceAttempts,
  practiceAttemptCorrections,
  practiceTotals,
  practiceTotalCorrections,
  practiceStepDecisions,
  stepTests,
  type PracticeAttempt,
  type PracticeAttemptCorrection,
  type PracticeTotal,
  type PracticeTotalCorrection,
  type PracticeStepDecision,
  type StepTest,
};
