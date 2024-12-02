import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const timestamps = {
  updated_at: text()
    .notNull()
    .default(sql`(current_timestamp)`),
  created_at: text()
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdateFn(() => sql`current_timestamp`),
};
