import { QueryTransaction } from "@/db/queries/transactions";
import { SchemaAccount, SchemaBudget, SchemaTransaction } from "@/db/schema";
import {
  CREDIT_TRANSACTION_TYPES,
  CreditTransactionType,
  DEBIT_TRANSACTION_TYPES,
  DebitTransactionType,
} from "@/lib/constants";
import { addMoney, convertMoney, createMoney } from "@/lib/money";
import { AppStateProperties, useAppStore } from "@/lib/store";
import { Currency, ExchangeRate, Money, StrictOmit } from "@/lib/types";
import dayjs from "dayjs";
import { memoizeWithArgs } from "proxy-memoize";
import { pieDataItem } from "react-native-gifted-charts";
import { SPECIAL_CATEGORIES } from "./data";

interface PieDataItemCustom<K extends PropertyKey = PropertyKey> extends pieDataItem {
  key: K;
}

// ? assumes it is okay to add all transactions together and the transactions hace been filtered
// ? before passing them to the function
export const createChartData = memoizeWithArgs(
  <K extends PropertyKey>(
    transactions: Array<SchemaTransaction>,
    currencyCode: Currency["isoCode"],
    exchangeRates: AppStateProperties["exchangeRates"],
    extractKey: (transaction: SchemaTransaction) => K
  ) => {
    const chartDataMap = transactions.reduce((result, transaction) => {
      const key = extractKey(transaction);
      const dataItem = result[key];
      let amount: Money;
      if (transaction.amount_currency_code !== currencyCode) {
        const exchangeRate =
          exchangeRates[transaction.amount_currency_code.toLocaleLowerCase()]?.rates[
            currencyCode.toLocaleLowerCase()
          ];
        if (!exchangeRate) return result;

        amount = convertMoney(
          {
            valueInMinorUnits: transaction.amount_value_in_minor_units,
            currencyCode: transaction.amount_currency_code,
          },
          {
            from: transaction.amount_currency_code,
            to: currencyCode,
            rate: exchangeRate,
          }
        );
      } else {
        amount = {
          valueInMinorUnits: transaction.amount_value_in_minor_units,
          currencyCode: transaction.amount_currency_code,
        };
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
    }, {} as Record<K, PieDataItemCustom<K>>);
    const chartData = Object.values(chartDataMap) as Array<PieDataItemCustom<K>>;

    // add distinct colors to each data item
    const colors = useAppStore.getState().chartColors;
    for (let i = 0; i < chartData.length; i++) {
      const dataItem = chartData[i];
      if (dataItem) {
        dataItem.color = colors[i];
      }
    }

    return chartData;
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

export const getTransactionCategory = (
  transaction: StrictOmit<QueryTransaction, "loanPaymentTransactions">
) => {
  return (
    transaction.category ||
    (transaction.app_category_id
      ? SPECIAL_CATEGORIES[transaction.app_category_id]
      : SPECIAL_CATEGORIES.UNKNOWN)
  );
};

export const calculateAccountIncome = memoizeWithArgs(
  (account: SchemaAccount, transactions: Array<QueryTransaction>) => {
    return transactions
      .filter((t) => {
        if (t.type === "transfer") {
          return t.to_account_id === account.id;
        }
        CREDIT_TRANSACTION_TYPES.includes(t.type as CreditTransactionType);
      })
      .reduce((acc, curr) => {
        if (curr.type === "transfer") {
          const exchangeRate: ExchangeRate = {
            from: curr.fromAccount?.currency_code!,
            to: curr.toAccount?.currency_code!,
            rate: curr.exchange_rate!,
          };
          return addMoney(
            acc,
            convertMoney(
              {
                valueInMinorUnits: curr.amount_value_in_minor_units,
                currencyCode: curr.amount_currency_code,
              },
              exchangeRate
            )
          );
        }
        return addMoney(acc, {
          valueInMinorUnits: curr.amount_value_in_minor_units,
          currencyCode: curr.amount_currency_code,
        });
      }, createMoney(0, account.currency_code));
  }
);

export const calculateAccountExpenses = memoizeWithArgs(
  (account: SchemaAccount, transactions: Array<QueryTransaction>) => {
    return transactions
      .filter((t) => {
        if (t.type === "transfer") {
          return t.from_account_id === account.id;
        }
        return DEBIT_TRANSACTION_TYPES.includes(t.type as DebitTransactionType);
      })
      .reduce(
        (a, b) =>
          addMoney(a, {
            valueInMinorUnits: b.amount_value_in_minor_units,
            currencyCode: b.amount_currency_code,
          }),
        createMoney(0, account.currency_code)
      );
  }
);

export const calculateAmountSpentInBudget = memoizeWithArgs(
  (
    budget: SchemaBudget,
    transactions: Array<SchemaTransaction>,
    exchangeRates: AppStateProperties["exchangeRates"]
  ) => {
    return transactions.reduce((result, transaction) => {
      if (transaction.type !== "expense") return result;

      if (result.currencyCode === transaction.amount_currency_code) {
        return addMoney(result, {
          valueInMinorUnits: transaction.amount_value_in_minor_units,
          currencyCode: transaction.amount_currency_code,
        });
      }

      const baseCurrencyCode = transaction.amount_currency_code.toLocaleLowerCase();
      const convertedCurrencyCode = result.currencyCode.toLocaleLowerCase();
      const exchangeRate = exchangeRates[baseCurrencyCode]?.rates[convertedCurrencyCode];
      if (exchangeRate) {
        const convertedAmount = convertMoney(
          {
            valueInMinorUnits: transaction.amount_value_in_minor_units,
            currencyCode: transaction.amount_currency_code,
          },
          {
            from: transaction.amount_currency_code,
            to: budget.currency_code,
            rate: exchangeRate,
          }
        );

        return addMoney(result, convertedAmount);
      }

      console.warn(
        `Exchange rate not found for ${baseCurrencyCode} to ${convertedCurrencyCode}. Transaction with id: ${transaction.id} skipped`
      );
      // todo: inform about skipped transaction due to no exchange rate
      return result;
    }, createMoney(0, budget.currency_code));
  }
);

export const calculateAmountPaidInLoan = memoizeWithArgs(
  (loan: QueryTransaction, exchangeRates: AppStateProperties["exchangeRates"]) => {
    return loan.loanPaymentTransactions.reduce((result, transaction) => {
      if (result.currencyCode === transaction.amount_currency_code) {
        return addMoney(result, {
          valueInMinorUnits: transaction.amount_value_in_minor_units,
          currencyCode: transaction.amount_currency_code,
        });
      }

      const baseCurrencyCode = transaction.amount_currency_code.toLocaleLowerCase();
      const convertedCurrencyCode = result.currencyCode.toLocaleLowerCase();
      const exchangeRate = exchangeRates[baseCurrencyCode]?.rates[convertedCurrencyCode];
      if (exchangeRate) {
        const convertedAmount = convertMoney(
          {
            valueInMinorUnits: transaction.amount_value_in_minor_units,
            currencyCode: transaction.amount_currency_code,
          },
          {
            from: transaction.amount_currency_code,
            to: result.currencyCode,
            rate: exchangeRate,
          }
        );

        return addMoney(result, convertedAmount);
      }

      console.warn(
        `Exchange rate not found for ${baseCurrencyCode} to ${convertedCurrencyCode}. Transaction with id: ${transaction.id} skipped`
      );
      // todo: inform about skipped transaction due to no exchange rate
      return result;
    }, createMoney(0, loan.amount_currency_code));
  }
);
