import EmptyState from "@/components/empty-state";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import { Text } from "@/components/ui/text";
import { createChartData } from "@/lib/app-utils";
import {
  CREDIT_TRANSACTION_TYPES,
  CreditTransactionType,
  DEBIT_TRANSACTION_TYPES,
  DebitTransactionType,
} from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { nanoid } from "@/lib/nanoid";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction, TransferTransaction } from "@/lib/types";
import { assertUnreachable, cn, dateToKey, groupTransactionsByPeriod } from "@/lib/utils";
import dayjs from "dayjs";
import { vars } from "nativewind";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const LOAN_TRANSACTIONS_CHART_ID = nanoid();
const LOAN_PAYMENT_TRANSACTIONS_CHART_ID = nanoid();

const Stats = () => {
  const [transactionType, setTransactionType] = useState<"minus" | "plus">("minus");
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const transactionsRecord = useAppStore(getSortedTransactionsByDate);
  const categories = useAppStore((state) => state.categories);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const accountsMap = useAppStore((state) => state.accounts);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);

  const mainAccount = accountsMap[defaultAccountID] || Object.values(accountsMap)[0]!;
  const currency = mainAccount.currency;

  const currentTransactions = groupTransactionsByPeriod[currentTimePeriod.period](
    transactionsRecord
  )[dateToKey(currentTimePeriod)]?.filter((t): t is Exclude<Transaction, TransferTransaction> => {
    if (transactionType === "minus") {
      return DEBIT_TRANSACTION_TYPES.includes(t.type as DebitTransactionType);
    } else {
      return CREDIT_TRANSACTION_TYPES.includes(t.type as CreditTransactionType);
    }
  });

  const chartData = currentTransactions
    ? createChartData(currentTransactions, currency, exchangeRates, (t) => {
        const { type } = t;
        switch (type) {
          case "expense":
          case "income":
            return t.categoryID;
          case "lent":
          case "borrowed":
            return LOAN_TRANSACTIONS_CHART_ID;
          case "paid_loan":
          case "collected_debt":
            return LOAN_PAYMENT_TRANSACTIONS_CHART_ID;
          default:
            assertUnreachable(type);
        }
      })
    : null;

  const getDataLabel = (key: string): string => {
    switch (key) {
      case LOAN_TRANSACTIONS_CHART_ID:
        // todo: each type should have an id
        return transactionType === "plus" ? "Lent" : "Borrowed";
      case LOAN_PAYMENT_TRANSACTIONS_CHART_ID:
        return transactionType === "plus" ? "Collected debt" : "Paid loan";
      default:
        return categories[key]?.name || "Unknown category";
    }
  };
  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6 justify-between">
        <Text className="font-semibold text-2xl">Stats</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 gap-4">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
        <View className="flex-row bg-muted rounded-2xl">
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "minus" && "bg-primary"
            )}
            onPress={() => setTransactionType("minus")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "minus" && "text-primary-foreground"
              )}
            >
              Expenses
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "plus" && "bg-primary"
            )}
            onPress={() => setTransactionType("plus")}
          >
            <Text
              className={cn("text-center", transactionType === "plus" && "text-primary-foreground")}
            >
              Income
            </Text>
          </Pressable>
        </View>
        {chartData && chartData.length > 0 ? (
          <>
            <View className="justify-center flex-row">
              <PieChart data={chartData} donut />
            </View>

            <View className="gap-3">
              {chartData.map(({ key, color, value }) => (
                <View key={key} className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full bg-[var(--bg)] mr-2"
                    style={vars({ "--bg": color! })}
                  />
                  <Text className="text-lg font-medium">{getDataLabel(key)}</Text>
                  <Text className="ml-auto text-xl">
                    {formatMoney({ valueInMinorUnits: value, currency })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <EmptyState title="No data to show" />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Stats;
