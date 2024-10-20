import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import { Text } from "@/components/ui/text";
import { formatMoney } from "@/lib/money";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction, TransactionCategory } from "@/lib/types";
import {
  cn,
  dateToKey,
  groupTransactionsByMonth,
  groupTransactionsByWeek,
  groupTransactionsByYear,
} from "@/lib/utils";
import dayjs from "dayjs";
import { vars } from "nativewind";
import { memoize } from "proxy-memoize";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
interface PieDataItemCustom extends pieDataItem {
  categoryID: TransactionCategory["id"];
}

const Stats = () => {
  const [transactionType, setTransactionType] = useState<Transaction["type"]>("debit");
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const transactionsRecord = useAppStore(getSortedTransactionsByDate);
  const categories = useAppStore((state) => state.categories);
  const currency = useAppStore((state) => state.accounts[state.defaultAccountID].currency);
  const groupedTransactions: Record<TimePeriod["period"], Record<string, Transaction[]>> = {
    monthly: groupTransactionsByMonth(transactionsRecord),
    annually: groupTransactionsByYear(transactionsRecord),
    weekly: groupTransactionsByWeek(transactionsRecord),
  };

  const currentTransactions = groupedTransactions[currentTimePeriod.period][
    dateToKey(currentTimePeriod)
  ].filter(({ type }) => type === transactionType);

  const chartData = currentTransactions ? createChartData(currentTransactions) : null;

  return (
    <ScreenWrapper className="!pb-6 !pt-6">
      <View className="flex-row gap-4 items-center mb-4 px-4 justify-between">
        <Text className="font-semibold text-2xl">Stats</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
        {chartData && (
          <View className="justify-center flex-row my-4">
            <PieChart data={chartData} donut />
          </View>
        )}
        <View className="flex-row mb-4 bg-muted rounded-2xl">
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "debit" && "bg-primary"
            )}
            onPress={() => setTransactionType("debit")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "debit" && "text-primary-foreground"
              )}
            >
              Expenses
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "credit" && "bg-primary"
            )}
            onPress={() => setTransactionType("credit")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "credit" && "text-primary-foreground"
              )}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {chartData && (
          <View className="gap-3">
            {chartData.map(({ categoryID, color, value }) => (
              <View key={categoryID} className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full bg-[var(--bg)] mr-2"
                  style={vars({ "--bg": color! })}
                />
                <Text className="text-lg font-medium">{categories[categoryID].name}</Text>
                <Text className="ml-auto text-xl">
                  {formatMoney({ valueInMinorUnits: value, currency })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const createChartData = memoize((transactions: Transaction[]) => {
  const chartData = transactions.reduce((result, transaction) => {
    const dataItem = result[transaction.categoryID];
    if (dataItem) {
      result[transaction.categoryID] = {
        ...dataItem,
        value: dataItem.value + transaction.amount.valueInMinorUnits,
      };
    } else {
      result[transaction.categoryID] = {
        value: transaction.amount.valueInMinorUnits,
        categoryID: transaction.categoryID,
      };
    }
    return result;
  }, {} as Record<string, PieDataItemCustom>);

  // add distinct colors to each data item
  const dataKeys = Object.keys(chartData);
  const colors = useAppStore.getState().chartColors;
  for (let i = 0; i < dataKeys.length; i++) {
    chartData[dataKeys[i]] = { ...chartData[dataKeys[i]], color: colors[i] };
  }

  return Object.values(chartData).sort((a, b) => a.value - b.value);
});

export default Stats;
