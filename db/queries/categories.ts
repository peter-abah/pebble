import { and, asc, desc, eq, inArray, like, SQL, sql } from "drizzle-orm";
import { db } from "../client";
import { categoriesTable, SchemaCategory } from "../schema";

interface GetCategoriesOptions {
  search?: string;
  ids?: Array<SchemaCategory["id"]>;
  limit?: number;
  sortBy?: Array<{ column: keyof SchemaCategory; type: "asc" | "desc" }>;
}

export const getCategories = (options?: GetCategoriesOptions) => {
  const orderBy = options?.sortBy
    ? options.sortBy.map(({ column, type }) =>
        type === "asc" ? asc(categoriesTable[column]) : desc(categoriesTable[column])
      )
    : undefined;

  const filters = options ? buildCategoriesFilters(options) : [];
  return db.query.categoriesTable.findMany({
    orderBy,
    where: and(...filters),
    limit: options?.limit && options.limit,
  });
};

export const getCategory = (id: SchemaCategory["id"]) => {
  return db.query.categoriesTable.findFirst({
    where: eq(categoriesTable.id, id),
  });
};

const buildCategoriesFilters = ({ search, ids }: GetCategoriesOptions) => {
  const filters: Array<SQL> = [];
  if (search) {
    filters.push(like(sql`lower(${categoriesTable.name})`, `%${search}%`));
  }
  if (ids && ids.length > 0) {
    filters.push(inArray(categoriesTable.id, ids));
  }
  return filters;
};
