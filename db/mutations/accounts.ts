import { eq, or } from "drizzle-orm";
import { db } from "../client";
import { getMainAccount } from "../queries/accounts";
import { accountsTable, mainAccountsTable, SchemaAccount, transactionsTable } from "../schema";
import { batchDeleteTransactions } from "./transactions";

export const deleteAccount = async (id: SchemaAccount["id"]) => {
  const mainAccount = await getMainAccount();
  if (mainAccount?.account_id === id) {
    // prevent the main account from being deleted
    // TODO: log or throw error
    return;
  }

  await db.transaction(async (tx) => {
    // delete related transfer transactions
    const transferTransactions = await db
      .select()
      .from(transactionsTable)
      .where(
        or(eq(transactionsTable.to_account_id, id), eq(transactionsTable.from_account_id, id))
      );

    // using this method to delete transfer transactions since it updates the balance of the
    // other account in the transaction
    // other transactions will be delete by delete cascade once the account is deleted
    await batchDeleteTransactions(transferTransactions);
    await db.delete(accountsTable).where(eq(accountsTable.id, id));
  });
};

export const insertMainAccount = async (id: SchemaAccount["id"]) => {
  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, id));
  if (!account) {
    // todo: to throw or to silently fail
    throw new Error(`Account with id : ${id} does not exist`);
  }

  await db.insert(mainAccountsTable).values({ account_id: account.id });
};

type InsertAccountPayload = typeof accountsTable.$inferInsert;
export const insertAccount = async (paylaod: InsertAccountPayload) => {
  const account = await db.transaction(async (tx) => {
    const [account] = await db.insert(accountsTable).values(paylaod).returning();
    if (!account) {
      return tx.rollback();
    }
    return account;
  });
  return account;
};

export const updateAccount = async (
  id: SchemaAccount["id"],
  payload: Partial<InsertAccountPayload>
) => {
  const updatedAccount = await db.transaction(async (tx) => {
    const result = await db
      .update(accountsTable)
      .set(payload)
      .where(eq(accountsTable.id, id))
      .returning();
    if (result.length !== 1) {
      return tx.rollback();
    }
    return result[0]!;
  });

  return updatedAccount;
};
