import EmptyState from "@/components/empty-state";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import { Text } from "@/components/ui/text";
import { createChartData } from "@/lib/app-utils";
import { formatMoney } from "@/lib/money";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { cn, dateToKey, groupTransactionsByPeriod } from "@/lib/utils";
import dayjs from "dayjs";
import { vars } from "nativewind";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const Stats = () => {
  const [transactionType, setTransactionType] = useState<Transaction["type"]>("expense");
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
  )[dateToKey(currentTimePeriod)]?.filter(({ type }) => type === transactionType);

  const chartData = currentTransactions
    ? createChartData(currentTransactions, currency, exchangeRates)
    : null;

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
              transactionType === "expense" && "bg-primary"
            )}
            onPress={() => setTransactionType("expense")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "expense" && "text-primary-foreground"
              )}
            >
              Expenses
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "income" && "bg-primary"
            )}
            onPress={() => setTransactionType("income")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "income" && "text-primary-foreground"
              )}
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
              {chartData.map(({ categoryID, color, value }) => (
                <View key={categoryID} className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full bg-[var(--bg)] mr-2"
                    style={vars({ "--bg": color! })}
                  />
                  <Text className="text-lg font-medium">
                    {categories[categoryID]?.name || "Unknown"}
                  </Text>
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
