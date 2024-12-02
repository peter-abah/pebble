/* eslint-disable drizzle/enforce-delete-with-where */
import {
  accountsTable,
  budgetsAccountsTable,
  budgetsCategoriesTable,
  budgetsTable,
  categoriesTable,
  transactionsTable,
} from "@/db/schema";
import { db } from "../client";

export const resetDB = async () => {
  await db.transaction(async (tx) => {
    await db.delete(accountsTable);
    await db.delete(budgetsTable);
    await db.delete(categoriesTable);
    await db.delete(budgetsAccountsTable);
    await db.delete(budgetsCategoriesTable);
    await db.delete(transactionsTable);
  });
};
