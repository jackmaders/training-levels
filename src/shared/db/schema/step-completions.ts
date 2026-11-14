import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { dogs } from "./dogs";

const stepCompletions = sqliteTable(
  "step_completions",
  {
    completedAt: integer("completed_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    stepId: text("step_id").notNull(),
  },
  (table) => [uniqueIndex("step_completions_dog_id_step_id_unique").on(table.dogId, table.stepId)],
);

type StepCompletion = typeof stepCompletions.$inferSelect;

export { stepCompletions, type StepCompletion };
