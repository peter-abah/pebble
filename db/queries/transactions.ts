import { db } from "../client";

// todo: implement pagination and filters
export const getTransactions = () => {
  return db.query.transactionsTable.findMany({
    with: {
      category: true,
      account: true,
      fromAccount: true,
      toAccount: true,
      loanTransaction: true,
    },
  });
};

export type QueryTransaction = Awaited<ReturnType<typeof getTransactions>>[number];
