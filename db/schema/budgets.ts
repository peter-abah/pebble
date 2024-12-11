import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { timestamps } from "./column_helpers";

export const budgetsTable = sqliteTable("budgets", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  color: text().notNull(),
  amount_value_in_minor_units: integer().notNull(),
  currency_code: text().notNull(),
  period: text({ enum: ["weekly", "monthly", "yearly"] }),
  ...timestamps,
});

export const budgetsAccountsTable = sqliteTable(
  "budgets_accounts",
  {
    account_id: integer()
      .notNull()
      .references(() => accountsTable.id, { onDelete: "cascade" }),
    budget_id: integer()
      .notNull()
      .references(() => budgetsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.account_id, table.budget_id] }),
  })
);

export const budgetsCategoriesTable = sqliteTable(
  "budgets_categories",
  {
    category_id: integer()
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
    budget_id: integer()
      .notNull()
      .references(() => budgetsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.category_id, table.budget_id] }),
  })
);

export type SchemaBudget = typeof budgetsTable.$inferSelect;
