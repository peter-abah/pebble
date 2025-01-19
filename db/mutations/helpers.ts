/* eslint-disable drizzle/enforce-delete-with-where */
import {
  accountsTable,
  budgetsAccountsTable,
  budgetsCategoriesTable,
  budgetsTable,
  categoriesTable,
  mainAccountsTable,
  transactionsTable,
} from "@/db/schema";
import { assertUnreachable } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { SchemaTransaction } from "../schema/transactions";

export const resetDB = async () => {
  await db.transaction(async (tx) => {
    await db.delete(accountsTable);
    await db.delete(budgetsTable);
    await db.delete(categoriesTable);
    await db.delete(mainAccountsTable);
    await db.delete(budgetsAccountsTable);
    await db.delete(budgetsCategoriesTable);
    await db.delete(transactionsTable);
  });
};

// todo: store account balance like a cache with a balance for all transactions maybe a join table.
export const updateAccountBalanceForInsertedTransaction = async (
  transaction: SchemaTransaction
) => {
  switch (transaction.type) {
    case "expense":
    case "lent":
    case "paid_loan": {
      if (!transaction.account_id) {
        throw new Error(
          `Transaction with ${transaction.id} does not have an account. cannot update account balance`
        );
      }

      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.account_id));

      if (!account) {
        throw new Error(`Account (id: ${transaction.account_id}) does not exist.`);
      }

      if (account.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `Account currency (${account.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units - transaction.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "income":
    case "borrowed":
    case "collected_debt": {
      if (!transaction.account_id) {
        throw new Error(
          `Transaction with ${transaction.id} does not have an account. cannot update account balance`
        );
      }

      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.account_id));

      if (!account) {
        throw new Error(`Account (id: ${transaction.account_id}) does not exist.`);
      }

      if (account.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `Account currency (${account.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units + transaction.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "transfer": {
      if (!transaction.from_account_id) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have a from account. cannot update account balance`
        );
      }
      if (!transaction.exchange_rate) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have an exchange rate. cannot update account balance`
        );
      }

      if (!transaction.to_account_id) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have a to account. cannot update account balance`
        );
      }
      const [fromAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.from_account_id));
      const [toAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.to_account_id));

      if (!fromAccount) {
        throw new Error(`From account (id: ${transaction.from_account_id}) does not exist.`);
      }

      if (!toAccount) {
        throw new Error(`To account (id: ${transaction.to_account_id}) does not exist.`);
      }
      if (fromAccount.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `From account currency (${fromAccount.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }
      const convertedAmount = transaction.amount_value_in_minor_units * transaction.exchange_rate;

      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            fromAccount.balance_value_in_minor_units - transaction.amount_value_in_minor_units,
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
      assertUnreachable(transaction.type);
  }
};

export const updateAccountBalanceForDeletedTransaction = async (transaction: SchemaTransaction) => {
  switch (transaction.type) {
    case "expense":
    case "lent":
    case "paid_loan": {
      if (!transaction.account_id) {
        throw new Error(
          `Transaction with ${transaction.id} does not have an account. cannot update account balance`
        );
      }

      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.account_id));

      if (!account) {
        throw new Error(`Account (id: ${transaction.account_id}) does not exist.`);
      }

      if (account.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `Account currency (${account.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }

      // add transaction amount back to from account balance,
      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units + transaction.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "income":
    case "borrowed":
    case "collected_debt": {
      if (!transaction.account_id) {
        throw new Error(
          `Transaction with ${transaction.id} does not have an account. cannot update account balance`
        );
      }

      const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.account_id));

      if (!account) {
        throw new Error(`Account (id: ${transaction.account_id}) does not exist.`);
      }

      if (account.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `Account currency (${account.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }

      // minus transaction amount back from account balance, since the transaction was a credit
      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            account.balance_value_in_minor_units - transaction.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, account.id));
      break;
    }
    case "transfer": {
      if (!transaction.from_account_id) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have a from account. cannot update account balance`
        );
      }
      if (!transaction.exchange_rate) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have an exchange rate. cannot update account balance`
        );
      }

      if (!transaction.to_account_id) {
        throw new Error(
          `Transfer transaction with ${transaction.id} does not have a to account. cannot update account balance`
        );
      }
      const [fromAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.from_account_id));
      const [toAccount] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.to_account_id));

      if (!fromAccount) {
        throw new Error(`From account (id: ${transaction.from_account_id}) does not exist.`);
      }

      if (!toAccount) {
        throw new Error(`To account (id: ${transaction.to_account_id}) does not exist.`);
      }
      if (fromAccount.currency_code !== transaction.amount_currency_code) {
        throw new Error(
          `From account currency (${fromAccount.currency_code}) does not match transaction currency (${transaction.amount_currency_code})`
        );
      }
      const convertedAmount = transaction.amount_value_in_minor_units * transaction.exchange_rate;

      // add transaction amount back to  account balance,
      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units:
            fromAccount.balance_value_in_minor_units - transaction.amount_value_in_minor_units,
        })
        .where(eq(accountsTable.id, fromAccount.id));

      // minus transaction amount back from account balance,
      await db
        .update(accountsTable)
        .set({
          balance_value_in_minor_units: toAccount.balance_value_in_minor_units - convertedAmount,
        })
        .where(eq(accountsTable.id, toAccount.id));

      break;
    }
    default:
      assertUnreachable(transaction.type);
  }
};
