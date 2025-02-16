import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./column_helpers";

export const accountsTable = sqliteTable(
  "accounts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    balance_value_in_minor_units: integer().notNull(),
    color: text().notNull(),
    currency_code: text().notNull(),
    ...timestamps,
  },
  (table) => ({
    nameIndex: index("a_name_index").on(table.name),
  })
);

// todo: handle data during migrations
// main account will be last updated row,
// other rows will serve as history of previous main accounts
export const mainAccountsTable = sqliteTable("main_accounts", {
  id: integer().primaryKey({ autoIncrement: true }),
  account_id: integer()
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  ...timestamps,
});

export type SchemaAccount = typeof accountsTable.$inferSelect;
