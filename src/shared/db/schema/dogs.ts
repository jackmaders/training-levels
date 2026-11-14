import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

const DOG_NAME_MAX_LENGTH = 128;

const dogs = sqliteTable(
  "dogs",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name", { length: DOG_NAME_MAX_LENGTH }).notNull().default("My Dog"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("dogs_user_id_idx").on(table.userId)],
);

type Dog = typeof dogs.$inferSelect;

export { dogs, type Dog };
