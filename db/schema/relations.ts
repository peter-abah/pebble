import { relations } from "drizzle-orm";
import { accountsTable, mainAccountsTable } from "./accounts";
import { budgetsAccountsTable, budgetsCategoriesTable, budgetsTable } from "./budgets";
import { categoriesTable } from "./categories";
import { transactionsTable } from "./transactions";

export const budgetsRelations = relations(budgetsTable, ({ many }) => ({
  budgetsToCategories: many(budgetsCategoriesTable),
  budgetsToAccounts: many(budgetsAccountsTable),
}));

export const budgetToCategoriesRelations = relations(budgetsCategoriesTable, ({ one }) => ({
  category: one(categoriesTable, {
    fields: [budgetsCategoriesTable.category_id],
    references: [categoriesTable.id],
  }),
  budget: one(budgetsTable, {
    fields: [budgetsCategoriesTable.budget_id],
    references: [budgetsTable.id],
  }),
}));

export const budgetToAccountsRelations = relations(budgetsAccountsTable, ({ one }) => ({
  account: one(accountsTable, {
    fields: [budgetsAccountsTable.account_id],
    references: [accountsTable.id],
  }),
  budget: one(budgetsTable, {
    fields: [budgetsAccountsTable.budget_id],
    references: [budgetsTable.id],
  }),
}));

export const transactionsRelations = relations(transactionsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [transactionsTable.category_id],
    references: [categoriesTable.id],
  }),
  account: one(accountsTable, {
    fields: [transactionsTable.account_id],
    references: [accountsTable.id],
    relationName: "accountOtherTransactions",
  }),
  fromAccount: one(accountsTable, {
    fields: [transactionsTable.from_account_id],
    references: [accountsTable.id],
    relationName: "accountFromTransactions",
  }),
  toAccount: one(accountsTable, {
    fields: [transactionsTable.to_account_id],
    references: [accountsTable.id],
    relationName: "accountToTransactions",
  }),
  loanTransaction: one(transactionsTable, {
    fields: [transactionsTable.loan_id],
    references: [transactionsTable.id],
    relationName: "loanToPaymentTransactions",
  }),
  loanPaymentTransactions: many(transactionsTable, { relationName: "loanToPaymentTransactions" }),
}));

export const mainAccountRelations = relations(mainAccountsTable, ({ one }) => ({
  account: one(accountsTable, {
    fields: [mainAccountsTable.account_id],
    references: [accountsTable.id],
  }),
}));

export const accountsRelations = relations(accountsTable, ({ many }) => ({
  otherTransactions: many(transactionsTable, { relationName: "accountOtherTransactions" }),
  toTransactions: many(transactionsTable, { relationName: "accountToTransactions" }),
  fromTransactions: many(transactionsTable, { relationName: "accountFromTransactions" }),
}));
