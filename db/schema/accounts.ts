import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./column_helpers";

export const accountsTable = sqliteTable("accounts", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  balance_value_in_minor_units: integer().notNull(),
  color: text().notNull(),
  currency_code: text().notNull(),
  ...timestamps,
});

export type SchemaAccount = typeof accountsTable.$inferSelect;
