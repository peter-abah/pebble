import { AppStateProperties, useAppStore } from "@/lib/store";
import { Budget, Currency, Money, Transaction, TransactionCategory } from "@/lib/types";
import dayjs from "dayjs";
import { memoizeWithArgs } from "proxy-memoize";
import { pieDataItem } from "react-native-gifted-charts";
import { convertMoney } from "./money";

export const isTransactionInBudget = (transaction: Transaction, budget: Budget) => {
  //? only expense transaction is in budget
  if (transaction.type === "transfer" || transaction.type === "income") return false;

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
    }
  }

  return (
    budget.accounts.includes(transaction.accountID) &&
    budget.categories.includes(transaction.categoryID) &&
    matchesPeriod
  );
};

interface PieDataItemCustom extends pieDataItem {
  categoryID: TransactionCategory["id"];
}

export const createChartData = memoizeWithArgs(
  (
    transactions: Array<Transaction>,
    currency: Currency,
    exchangeRates: AppStateProperties["exchangeRates"]
  ) => {
    const chartDataMap = transactions.reduce((result, transaction) => {
      if (transaction.type === "transfer") {
        return result;
      }

      const dataItem = result[transaction.categoryID];
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
        result[transaction.categoryID] = {
          ...dataItem,
          value: dataItem.value + amount.valueInMinorUnits,
        };
      } else {
        result[transaction.categoryID] = {
          value: amount.valueInMinorUnits,
          categoryID: transaction.categoryID,
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
