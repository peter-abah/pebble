import { sql } from "drizzle-orm";
import { check, index, int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { timestamps } from "./column_helpers";

export const baseTransactionsTable = sqliteTable(
  "base_transactions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    amount_value_in_minor_units: int().notNull(),
    amount_currency_code: text().notNull(),
    datetime: text()
      .notNull()
      .default(sql`(current_timestamp)`),
    title: text(),
    note: text(),
    ...timestamps,
  },
  (table) => ({
    title_index: index("title_index").on(table.title),
    datetime_index: index("datetime_index").on(table.datetime),
  })
);

export const expenseIncomeTransactionsTable = sqliteTable(
  "expense_income_transactions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    type: text({ enum: ["income", "expense"] }).notNull(),
    category_id: integer().references(() => categoriesTable.id),
    account_id: integer()
      .notNull()
      .references(() => accountsTable.id),
    app_category_id: integer(),
  },
  (table) => ({
    // either category id or app category must be present
    checkConstraint: check(
      "category_id_check",
      sql`${table.app_category_id} IS NOT NULL OR ${table.category_id} IS NOT NULL`
    ),
  })
);

export const transferTransactionsTable = sqliteTable(
  "transfer_transactions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    type: text().default("transfer"),
    from_account_id: integer()
      .notNull()
      .references(() => accountsTable.id),
    to_account_id: integer()
      .notNull()
      .references(() => accountsTable.id),
    exchange_rate: integer().notNull(),
  },
  (table) => ({
    // either category id or app category must be present
    checkConstraint: check(
      "diff_accounts_check",
      sql`${table.from_account_id} <> ${table.to_account_id}`
    ),
  })
);

export const loanTransactionsTable = sqliteTable("loan_transactions", {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["lent", "borrowed"] }).notNull(),
  account_id: integer()
    .notNull()
    .references(() => accountsTable.id),
  due_date: text(),
});

export const loanPaymentTransactionsTable = sqliteTable("loan_payment_transactions", {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["paid_loan", "collected_debt"] }).notNull(),
  account_id: integer()
    .notNull()
    .references(() => accountsTable.id),
  loan_id: integer()
    .notNull()
    .references(() => loanTransactionsTable.id),
});
