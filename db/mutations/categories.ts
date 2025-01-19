import { eq } from "drizzle-orm";
import { db } from "../client";
import { categoriesTable, SchemaCategory, transactionsTable } from "../schema";
import { batchDeleteTransactions } from "./transactions";

// todo: category, showing transactions and total
export const deleteCategory = async (id: SchemaCategory["id"]) => {
  await db.transaction(async () => {
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.category_id, id));
    await batchDeleteTransactions(transactions);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  });
};

type InsertCategoryPayload = typeof categoriesTable.$inferInsert;
export const insertCategory = async (payload: InsertCategoryPayload) => {
  const [category] = await db.insert(categoriesTable).values(payload).returning();
  return category!;
};

export const updateCategory = async (
  id: SchemaCategory["id"],
  payload: Partial<InsertCategoryPayload>
) => {
  const [category] = await db
    .update(categoriesTable)
    .set(payload)
    .where(eq(categoriesTable.id, id))
    .returning();

  return category!;
};
