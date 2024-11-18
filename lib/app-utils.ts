import { TimePeriod } from "@/components/time-period-picker";
import { AppStateProperties, useAppStore } from "@/lib/store";
import { Budget, Currency, Filters, Money, Transaction } from "@/lib/types";
import { dateToKey, groupTransactionsByPeriod } from "@/lib/utils";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import { memoizeWithArgs } from "proxy-memoize";
import { pieDataItem } from "react-native-gifted-charts";
import { convertMoney } from "./money";
import { assertUnreachable } from "./utils";

export const isTransactionInBudget = (transaction: Transaction, budget: Budget) => {
  //? only expense transaction is in budget
  if (transaction.type !== "expense") return false;

  let matchesPeriod: boolean;
  switch (budget.period) {
    case "weekly": {
      const firstDayOfThisWeek = dayjs().day(0).format().slice(0, 10);
      const firstDayOfTransactionWeek = dayjs(transaction.datetime).day(0).format().slice(0, 10);
      matchesPeriod = firstDayOfThisWeek === firstDayOfTransactionWeek;
      break;
    }
    case "monthly": {
      const thisMonth = dayjs().format().slice(0, 7);
      const transactionMonth = dayjs(transaction.datetime).format().slice(0, 7);
      matchesPeriod = thisMonth === transactionMonth;
      break;
    }
    case "yearly": {
      const thisYear = dayjs().format().slice(0, 4);
      const transactionYear = dayjs(transaction.datetime).format().slice(0, 4);
      matchesPeriod = thisYear === transactionYear;
      break;
    }
    default:
      assertUnreachable(budget.period);
  }

  return (
    budget.accounts.includes(transaction.accountID) &&
    budget.categories.includes(transaction.categoryID) &&
    matchesPeriod
  );
};

interface PieDataItemCustom extends pieDataItem {
  key: string;
}

// ? assumes it is okay to add all transactions together and the transactions hace been filtered
// ? before passing them to the function
export const createChartData = memoizeWithArgs(
  <T extends Transaction>(
    transactions: Array<T>,
    currency: Currency,
    exchangeRates: AppStateProperties["exchangeRates"],
    extractKey: (transaction: T) => string
  ) => {
    const chartDataMap = transactions.reduce((result, transaction) => {
      const key = extractKey(transaction);
      const dataItem = result[key];
      let amount: Money;
      if (transaction.amount.currency.isoCode !== currency.isoCode) {
        const exchangeRate =
          exchangeRates[transaction.amount.currency.isoCode.toLocaleLowerCase()]?.rates[
            currency.isoCode.toLocaleLowerCase()
          ];
        if (!exchangeRate) return result;

        amount = convertMoney(transaction.amount, {
          from: transaction.amount.currency,
          to: currency,
          rate: exchangeRate,
        });
      } else {
        amount = transaction.amount;
      }

      if (dataItem) {
        result[key] = {
          ...dataItem,
          value: dataItem.value + amount.valueInMinorUnits,
        };
      } else {
        result[key] = {
          value: amount.valueInMinorUnits,
          key: key,
        };
      }
      return result;
    }, {} as Partial<Record<string, PieDataItemCustom>>);
    const chartData = Object.values(chartDataMap) as Array<PieDataItemCustom>;

    // add distinct colors to each data item
    const colors = useAppStore.getState().chartColors;
    for (let i = 0; i < chartData.length; i++) {
      chartData[i].color = colors[i];
    }

    return chartData;
  }
);

export const searchTransactions = memoizeWithArgs(
  (transactions: Array<Transaction>, search: string) => {
    const trimmedSearch = search.trim();
    if (trimmedSearch === "") return transactions;

    return transactions.filter(
      (transaction) =>
        transaction.title && transaction.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }
);

export const debouncedSearchTransactions = debounce(searchTransactions, 200, {
  leading: true,
  trailing: true,
});

export const filterTransactions = memoizeWithArgs(
  (
    transactions: Array<Transaction>,
    { search, filters, period }: { search: string; filters: Filters; period: TimePeriod }
  ) => {
    const transactionsForPeriod =
      groupTransactionsByPeriod[period.period](transactions)[dateToKey(period)] || [];

    const transactionsForSearch = debouncedSearchTransactions(transactionsForPeriod, search);

    const transactionsForFilters = transactionsForSearch.filter(
      (transaction) =>
        (filters.accounts.length === 0 ||
          (transaction.type === "transfer"
            ? filters.accounts.includes(transaction.to) ||
              filters.accounts.includes(transaction.from)
            : filters.accounts.includes(transaction.accountID))) &&
        (filters.categories.length === 0 ||
          filters.categories.includes(
            transaction.type === "expense" || transaction.type === "income"
              ? transaction.categoryID
              : ""
          )) &&
        (filters.types.length === 0 || filters.types.includes(transaction.type))
    );

    return transactionsForFilters;
  }
);

export const renderDate = (datetime: string) => {
  const date = dayjs(datetime);
  const today = dayjs();

  if (date.isSame(today, "day")) {
    return date.format("hh:mm A");
  }

  if (date.isSame(today.add(1, "day"), "day")) {
    return `Tomorrow ${date.format("hh:mm A")}`;
  }

  if (date.isSame(today.subtract(1, "day"), "day")) {
    return `Yesterday ${date.format("hh:mm A")}`;
  }

  if (date.isSame(today, "year")) {
    return date.format("DD MMM");
  }
  return date.format("DD MMM YYYY");
};
