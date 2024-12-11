import { TimePeriod } from "@/lib/types";
import { assertUnreachable } from "@/lib/utils";
import { and, asc, between, desc, inArray, like, or, sql, SQL } from "drizzle-orm";
import { db } from "../client";
import { SchemaAccount, SchemaCategory, SchemaTransaction, transactionsTable } from "../schema";

interface GetTransactionsOptions {
  search?: string;
  sortBy?: Array<{ column: keyof SchemaTransaction; type: "asc" | "desc" }>;
  categories?: Array<SchemaCategory["id"]>;
  accounts?: Array<SchemaAccount["id"]>;
  ids?: Array<SchemaTransaction["id"]>;
  types?: Array<SchemaTransaction["type"]>;
  period?: TimePeriod;
  limit?: number;
}

export const getTransactions = (options?: GetTransactionsOptions) => {
  const orderBy = options?.sortBy
    ? options.sortBy.map(({ column, type }) =>
        type === "asc" ? asc(transactionsTable[column]) : desc(transactionsTable[column])
      )
    : undefined;
  const filters = options ? buildTransactionsFilters(options) : [];

  return db.query.transactionsTable.findMany({
    orderBy,
    where: and(...filters),
    with: {
      category: true,
      account: true,
      fromAccount: true,
      toAccount: true,
      loanTransaction: true,
      loanPaymentTransactions: {
        with: {
          category: true,
          account: true,
          fromAccount: true,
          toAccount: true,
          loanTransaction: true,
        },
      },
    },
    limit: options?.limit ? options.limit : undefined,
  });
};

const buildTransactionsFilters = ({
  search,
  categories,
  accounts,
  period,
  types,
  ids,
}: GetTransactionsOptions) => {
  const filters: Array<SQL> = [];
  if (search) {
    filters.push(like(sql`lower(${transactionsTable.title})`, `%${search}%`));
  }
  if (categories && categories.length > 0) {
    filters.push(inArray(transactionsTable.category_id, categories));
  }
  if (ids && ids.length > 0) {
    filters.push(inArray(transactionsTable.id, ids));
  }
  if (accounts && accounts.length > 0) {
    filters.push(
      or(
        inArray(transactionsTable.account_id, accounts),
        inArray(transactionsTable.from_account_id, accounts),
        inArray(transactionsTable.to_account_id, accounts)
      ) as SQL<unknown>
    );
  }
  if (types && types.length > 0) {
    filters.push(inArray(transactionsTable.type, types));
  }
  if (period && period.period !== "all time") {
    let startDate: string, endDate: string;
    switch (period.period) {
      case "yearly": {
        startDate = period.date.startOf("year").format();
        endDate = period.date.endOf("year").format();
        break;
      }
      case "monthly": {
        startDate = period.date.startOf("month").format();
        endDate = period.date.endOf("month").format();
        break;
      }
      case "weekly": {
        startDate = period.date.startOf("week").format();
        endDate = period.date.endOf("week").format();
        break;
      }
      default:
        assertUnreachable(period.period);
    }
    filters.push(between(transactionsTable.datetime, startDate, endDate));
  }

  return filters;
};

export type QueryTransaction = Awaited<ReturnType<typeof getTransactions>>[number];
