import { eq } from "drizzle-orm";
import { db } from "../client";
import { accountsTable, mainAccountsTable, SchemaAccount } from "../schema";

// todo: what happens to main account and related transactions
export const deleteAccount = async (id: SchemaAccount["id"]) => {
  await db.delete(accountsTable).where(eq(accountsTable.id, id));
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
