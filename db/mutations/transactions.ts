import { NonNullableFields, RequiredFields, StrictOmit } from "@/lib/types";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { SchemaTransaction, transactionsTable } from "../schema/transactions";
import {
  updateAccountBalanceForDeletedTransaction,
  updateAccountBalanceForInsertedTransaction,
} from "./helpers";

type InsertTransaction = typeof transactionsTable.$inferInsert;
type ExpenseIncomeFields = NonNullableFields<
  StrictOmit<
    InsertTransaction,
    "type" | "loan_id" | "from_account_id" | "to_account_id" | "due_date" | "exchange_rate"
  >,
  "account_id"
> & { type: "expense" | "income" };

type TransferFields = NonNullableFields<
  StrictOmit<
    InsertTransaction,
    "type" | "loan_id" | "category_id" | "account_id" | "app_category_id" | "due_date"
  >,
  "from_account_id" | "to_account_id" | "exchange_rate"
> & { type: "transfer" };

type LoanFields = NonNullableFields<
  StrictOmit<
    InsertTransaction,
    | "type"
    | "from_account_id"
    | "to_account_id"
    | "exchange_rate"
    | "category_id"
    | "loan_id"
    | "app_category_id"
  >,
  "title" | "account_id"
> & { type: "lent" | "borrowed" };

type LoanPaymentFields = NonNullableFields<
  StrictOmit<
    InsertTransaction,
    | "type"
    | "from_account_id"
    | "to_account_id"
    | "exchange_rate"
    | "category_id"
    | "app_category_id"
  >,
  "loan_id" | "account_id"
> & { type: "paid_loan" | "collected_debt" };

export type InsertTransactionPayload =
  | ExpenseIncomeFields
  | TransferFields
  | LoanFields
  | LoanPaymentFields;

export const insertTransaction = async (
  payload: InsertTransactionPayload
): Promise<SchemaTransaction> => {
  const transaction = await db.transaction(async (tx) => {
    const [transaction] = await db.insert(transactionsTable).values(payload).returning();

    if (!transaction) {
      return tx.rollback();
    }

    await updateAccountBalanceForInsertedTransaction(transaction);
    return transaction;
  });

  return transaction;
};

export const batchInsertTransaction = async (batchPayload: Array<InsertTransactionPayload>) => {
  const transactions = await db.transaction(async (tx) => {
    const transactions = await db.insert(transactionsTable).values(batchPayload).returning();

    for (let transaction of transactions) {
      await updateAccountBalanceForInsertedTransaction(transaction);
    }

    return transactions;
  });

  return transactions;
};

type UpdateTransactionPayload = RequiredFields<Partial<InsertTransaction>, "type">;

export const updateTransaction = async (
  id: SchemaTransaction["id"],
  payload: UpdateTransactionPayload
): Promise<SchemaTransaction> => {
  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  if (!transaction) {
    throw Error(`Transaction with id ${id} does not exist. Cannot update transaction`);
  }

  const updatedTransaction = await db.transaction(async (tx) => {
    const [updated] = await db
      .update(transactionsTable)
      .set(payload)
      .where(eq(transactionsTable.id, id))
      .returning();

    if (!updated) {
      return tx.rollback();
    }

    // removing the previous transaction from the account and add the updated amount, updates the correct balance
    await updateAccountBalanceForDeletedTransaction(transaction);
    await updateAccountBalanceForInsertedTransaction(updated);

    return updated;
  });

  return updatedTransaction;
};

export const deleteTransaction = async (id: SchemaTransaction["id"]) => {
  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  // todo: throw or fail silently
  if (!transaction) {
    throw Error(`Transaction with id ${id} does not exist. Cannot delete transaction`);
  }
  await db.transaction(async (tx) => {
    await updateAccountBalanceForDeletedTransaction(transaction);
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
  });
};
