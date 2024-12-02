import { NonNullableFields, StrictOmit } from "@/lib/types";
import { assertUnreachable } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { accountsTable } from "../schema/accounts";
import { SchemaTransaction, transactionsTable } from "../schema/transactions";

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

const updateAccountBalanceForNewTransaction = async (payload: InsertTransactionPayload) => {
  switch (payload.type) {
    case "expense":
    case "lent":
    case "paid_loan": {
      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, payload.account_id));
      if (!account || account.currency_code !== payload.amount_currency_code) {
        throw new Error(
          "Account does not exist or account currency does not match transaction currency"
        );
      }

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units - payload.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "income":
    case "borrowed":
    case "collected_debt": {
      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, payload.account_id));
      if (!account || account.currency_code !== payload.amount_currency_code) {
        throw new Error(
          "Account does not exist or account currency does not match transaction currency"
        );
      }

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units + payload.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "transfer":
    case undefined:
    case null: {
      const [fromAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, payload.from_account_id));
      const [toAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, payload.to_account_id));

      if (
        !fromAccount ||
        !toAccount ||
        fromAccount.currency_code !== payload.amount_currency_code
      ) {
        throw new Error(
          "Sending or receiving account does not exist or account currency does not match transaction currency"
        );
      }

      const convertedAmount = payload.amount_value_in_minor_units * payload.exchange_rate;

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            fromAccount.balance_value_in_minor_units - payload.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, fromAccount.id));
      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units: toAccount.balance_value_in_minor_units + convertedAmount,
        })
        .where(eq(accountsTable.id, toAccount.id));

      break;
    }
    default:
      assertUnreachable(payload);
  }
};

export const insertTransaction = async (
  payload: InsertTransactionPayload
): Promise<SchemaTransaction> => {
  const transaction = await db.transaction(async (tx) => {
    const [transaction] = await db.insert(transactionsTable).values(payload).returning();

    try {
      await updateAccountBalanceForNewTransaction(payload);
    } catch {
      tx.rollback();
    }

    if (!transaction) {
      return tx.rollback();
    }

    return transaction;
  });

  return transaction;
};

export const batchInsertTransaction = async (batchPayload: Array<InsertTransactionPayload>) => {
  const transactions = await db.transaction(async (tx) => {
    const transactions = await db.insert(transactionsTable).values(batchPayload).returning();

    for (let payload of batchPayload) {
      try {
        await updateAccountBalanceForNewTransaction(payload);
      } catch {
        tx.rollback();
      }
    }

    return transactions;
  });

  return transactions;
};
