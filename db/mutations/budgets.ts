import { and, eq, inArray } from "drizzle-orm";
import { db } from "../client";
import { getBudgets, QueryBudget } from "../queries/budgets";
import {
  budgetsAccountsTable,
  budgetsCategoriesTable,
  budgetsTable,
  SchemaAccount,
  SchemaBudget,
  SchemaCategory,
} from "../schema";
import { setDifference } from "@/lib/utils";

type InsertBudgetPayload = typeof budgetsTable.$inferInsert & {
  accounts: Array<SchemaAccount["id"]>;
  categories: Array<SchemaCategory["id"]>;
};
export const insertBudget = async (payload: InsertBudgetPayload) => {
  const budget = await db.transaction(async (tx) => {
    const [budget] = await db.insert(budgetsTable).values(payload).returning();
    if (!budget) {
      return tx.rollback();
    }
    if (payload.accounts.length > 0) {
      await db
        .insert(budgetsAccountsTable)
        .values(payload.accounts.map((id) => ({ budget_id: budget.id, account_id: id })));
    }
    if (payload.categories.length > 0) {
      await db
        .insert(budgetsCategoriesTable)
        .values(payload.categories.map((id) => ({ budget_id: budget.id, category_id: id })));
    }
    return budget;
  });
  return budget;
};

export const deleteBudget = async (id: SchemaBudget["id"]) => {
  await db.delete(budgetsTable).where(eq(budgetsTable.id, id));
};

export const updateBudget = async (
  id: SchemaBudget["id"],
  payload: Partial<InsertBudgetPayload>
) => {
  const [budget] = await getBudgets({ ids: [id] });
  if (!budget) {
    // todo: to fail silently or to throw an error
    throw new Error(`Budget with id ${id} does not exist`);
  }
  const updatedBudget = await db.transaction(async (tx) => {
    const [updatedBudget] = await db
      .update(budgetsTable)
      .set(payload)
      .where(eq(budgetsTable.id, id))
      .returning();
    if (payload.accounts && payload.accounts.length > 0) {
      await updateBudgetAccounts(budget, payload.accounts);
    }
    if (payload.categories && payload.categories.length > 0) {
      await updateBudgetCategories(budget, payload.categories);
    }

    return updatedBudget!;
  });

  return updatedBudget;
};

const updateBudgetAccounts = async (
  budget: QueryBudget,
  updatedAccounts: Array<SchemaAccount["id"]>
) => {
  const updatedAccountsSet = new Set(updatedAccounts);
  const budgetAccountsSet = new Set(budget.budgetsToAccounts.map(({ account_id }) => account_id));

  const addedAccounts = setDifference(updatedAccountsSet, budgetAccountsSet);
  const deletedAccounts = setDifference(budgetAccountsSet, updatedAccountsSet);

  if (addedAccounts.size > 0) {
    await db
      .insert(budgetsAccountsTable)
      .values([...addedAccounts].map((id) => ({ account_id: id, budget_id: budget.id })));
  }
  if (deletedAccounts.size > 0) {
    await db
      .delete(budgetsAccountsTable)
      .where(
        and(
          inArray(budgetsAccountsTable.account_id, [...deletedAccounts]),
          eq(budgetsAccountsTable.budget_id, budget.id)
        )
      );
  }
};

const updateBudgetCategories = async (
  budget: QueryBudget,
  updatedCategories: Array<SchemaCategory["id"]>
) => {
  const updatedCategoriesSet = new Set(updatedCategories);
  const budgetCategoriesSet = new Set(
    budget.budgetsToCategories.map(({ category_id }) => category_id)
  );

  const addedCategories = setDifference(updatedCategoriesSet, budgetCategoriesSet);
  const deletedCategories = setDifference(budgetCategoriesSet, updatedCategoriesSet);

  if (addedCategories.size > 0) {
    await db
      .insert(budgetsCategoriesTable)
      .values([...addedCategories].map((id) => ({ category_id: id, budget_id: budget.id })));
  }
  if (deletedCategories.size > 0) {
    await db
      .delete(budgetsCategoriesTable)
      .where(
        and(
          inArray(budgetsCategoriesTable.category_id, [...deletedCategories]),
          eq(budgetsCategoriesTable.budget_id, budget.id)
        )
      );
  }
};
