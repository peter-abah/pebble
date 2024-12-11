import { eq } from "drizzle-orm";
import { db } from "../client";
import { categoriesTable, SchemaCategory } from "../schema";

// todo: what happens to related transactions (deleted)
export const deleteCategory = async (id: SchemaCategory["id"]) => {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
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
