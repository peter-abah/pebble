import { and, asc, desc, inArray, like, SQL, sql } from "drizzle-orm";
import { db } from "../client";
import { accountsTable, mainAccountsTable, SchemaAccount } from "../schema";

interface GetAccountsOptions {
  search?: string;
  ids?: Array<SchemaAccount["id"]>;
  sortBy?: Array<{ column: keyof SchemaAccount; type: "asc" | "desc" }>;
  limit?: number;
}
export const getAccounts = (options?: GetAccountsOptions) => {
  const orderBy = options?.sortBy
    ? options.sortBy.map(({ column, type }) =>
        type === "asc" ? asc(accountsTable[column]) : desc(accountsTable[column])
      )
    : undefined;
  const filters = options ? buildAccountsFilters(options) : [];
  return db.query.accountsTable.findMany({
    orderBy,
    where: and(...filters),
    limit: options?.limit && options.limit,
  });
};

const buildAccountsFilters = ({ search, ids }: GetAccountsOptions) => {
  const filters: Array<SQL> = [];

  if (search) {
    filters.push(like(sql<string>`lower(${accountsTable.name})`, `%${search}%`));
  }

  if (ids) {
    filters.push(inArray(accountsTable.id, ids));
  }

  return filters;
};

export const getMainAccount = () => {
  return db.query.mainAccountsTable.findFirst({
    orderBy: [desc(mainAccountsTable.updated_at)],
    with: {
      account: true,
    },
  });
};

export type QueryMainAccount = Awaited<ReturnType<typeof getMainAccount>>;
