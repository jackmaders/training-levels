import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { dogs } from "./dogs";

const comeafterRecords = sqliteTable(
  "comeafter_records",
  {
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    note: text("note").notNull().default(""),
    status: text("status", { enum: ["not_started", "practicing", "completed"] })
      .notNull()
      .default("not_started"),
    stepId: text("step_id").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("comeafter_records_dog_id_step_id_unique").on(table.dogId, table.stepId)],
);

const homeworkReflections = sqliteTable(
  "homework_reflections",
  {
    dogId: text("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageSlug: text("page_slug").notNull(),
    reflection: text("reflection").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("homework_reflections_dog_id_page_slug_unique").on(table.dogId, table.pageSlug),
  ],
);

type ComeafterRecord = typeof comeafterRecords.$inferSelect;
type HomeworkReflection = typeof homeworkReflections.$inferSelect;

export { comeafterRecords, homeworkReflections, type ComeafterRecord, type HomeworkReflection };
