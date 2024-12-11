import { and, inArray, like, SQL, sql } from "drizzle-orm";
import { db } from "../client";
import { budgetsTable, SchemaBudget } from "../schema/budgets";

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
    with: {
      budgetsToAccounts: {
        with: {
          account: true,
        },
      },
      budgetsToCategories: {
        with: {
          category: true,
        },
      },
    },
  });
};

export type QueryBudget = Awaited<ReturnType<typeof getBudgets>>[number];

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
