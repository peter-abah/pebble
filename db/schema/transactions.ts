import { and, eq, isNotNull, or, SQL, sql } from "drizzle-orm";
import {
  AnySQLiteColumn,
  check,
  index,
  int,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { timestamps } from "./column_helpers";

export const transactionsTable = sqliteTable(
  "transactions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    amount_value_in_minor_units: int().notNull(),
    amount_currency_code: text().notNull(),
    type: text({
      enum: ["income", "expense", "transfer", "lent", "borrowed", "paid_loan", "collected_debt"],
    }).notNull(),
    datetime: text()
      .notNull()
      .default(sql`(current_timestamp)`),
    title: text(), // required in loan transactions (lent | borrowed)
    note: text(),

    // not nullable in expense, income, loan and loan payment transactions
    account_id: integer().references(() => accountsTable.id, { onDelete: "cascade" }),

    // not nullable in expense income transactions
    category_id: integer().references(() => categoriesTable.id, { onDelete: "cascade" }),
    app_category_id: text(),

    // not nullable transfer transactions
    from_account_id: integer().references(() => accountsTable.id, { onDelete: "cascade" }),
    to_account_id: integer().references(() => accountsTable.id, { onDelete: "cascade" }),
    exchange_rate: integer(),

    // loan transaction
    due_date: text(), // truly nullable

    // loan payment transaction
    loan_id: integer()
      // todo: check in app to convert to normal transaction or just inform it is going to be deleted
      .references((): AnySQLiteColumn => transactionsTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    titleIndex: index("t_title_index").on(table.title),
    datetimeIndex: index("t_datetime_index").on(table.datetime),
    typeIndex: index("t_type_index").on(table.type),
    accountIndex: index("t_account_index").on(table.account_id),
    fromAccountIndex: index("t_from_account_index").on(table.from_account_id),
    toAccountIndex: index("t_to_account_index").on(table.to_account_id),
    categoryIndex: index("t_category_index").on(table.category_id),
    loanIndex: index("t_loan_index").on(table.loan_id),

    // check constraint to ensure columns specific for each transaction type are not null
    typeSpecificChecks: check(
      "type_specific_fields_check",
      or(
        // category and accounts exists for expense and income transactions
        and(
          or(eq(table.type, sql`'expense'`), eq(table.type, sql`'income'`)),
          or(
            isNotNull(table.category_id),
            isNotNull(table.app_category_id),
            isNotNull(table.account_id)
          )
        ),
        // exchage rate, from and to accounts exists for transfer transaction are not null
        and(
          eq(table.type, sql`'transfer'`),
          isNotNull(table.from_account_id),
          isNotNull(table.to_account_id),
          isNotNull(table.exchange_rate)
        ),
        // title and account is not null for loan transaction
        and(
          or(eq(table.type, sql`'lent'`), eq(table.type, sql`'borrowed'`)),
          isNotNull(table.title),
          isNotNull(table.account_id)
        ),
        // loan and accounts exists for loan payments transaction
        and(
          or(eq(table.type, sql`'paid_loan'`), eq(table.type, sql`'collected_debt'`)),
          isNotNull(table.loan_id),
          isNotNull(table.account_id)
        )
      ) as SQL<unknown>
    ),
  })
);

export type SchemaTransaction = typeof transactionsTable.$inferSelect;
