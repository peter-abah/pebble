import { and, eq, inArray, like, SQL, sql } from "drizzle-orm";
import { db } from "../client";
import { budgetsTable, SchemaBudget } from "../schema/budgets";
import { deepFreeze } from "@/lib/utils";

export const budgetRelations = deepFreeze({
  budgetsToAccounts: {
    with: {
      account: true as const,
    },
  },
  budgetsToCategories: {
    with: {
      category: true as const,
    },
  },
});
interface GetBudgetsOptions {
  search?: string;
  ids?: Array<SchemaBudget["id"]>;
  limit?: number;
}
export const getBudgets = (options?: GetBudgetsOptions) => {
  const filters = options ? buildBudgetsFilters(options) : [];
  return db.query.budgetsTable.findMany({
    where: and(...filters),
    limit: options?.limit && options.limit,
    with: budgetRelations,
  });
};

export const getBudget = (id: SchemaBudget["id"]) => {
  return db.query.budgetsTable.findFirst({
    where: eq(budgetsTable.id, id),
    with: budgetRelations,
  });
};

export type QueryBudget = NonNullable<Awaited<ReturnType<typeof getBudget>>>;

const buildBudgetsFilters = ({ search, ids }: GetBudgetsOptions) => {
  const filters: Array<SQL> = [];

  if (search) {
    filters.push(like(sql<string>`lower(${budgetsTable.name})`, `%${search}%`));
  }

  if (ids) {
    filters.push(inArray(budgetsTable.id, ids));
  }

  return filters;
};
