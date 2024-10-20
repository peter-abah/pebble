import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import {
  Option,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { ChevronRightIcon } from "@/lib/icons/ChevronRIght";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction, TransactionCategory } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";
import dayjs, { Dayjs } from "dayjs";
import { vars } from "nativewind";
import { memoize } from "proxy-memoize";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface PieDataItemCustom extends pieDataItem {
  categoryID: TransactionCategory["id"];
}
const groupTransactionsByMonth = memoize((transactions: Record<string, Transaction>) =>
  Object.values(transactions).reduce((result, transaction) => {
    const monthAndYear = transaction.datetime.slice(0, 7); // e.g 2024-10
    if (result[monthAndYear]) {
      result[monthAndYear].push(transaction);
    } else {
      result[monthAndYear] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

const groupTransactionsByWeek = memoize((transactions: Record<string, Transaction>) =>
  Object.values(transactions).reduce((result, transaction) => {
    const firstDayOfWeek = dayjs(transaction.datetime).day(0).toISOString().slice(0, 10); // first day of week e.g 2024-10-20
    if (result[firstDayOfWeek]) {
      result[firstDayOfWeek].push(transaction);
    } else {
      result[firstDayOfWeek] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

const groupTransactionsByYear = memoize((transactions: Record<string, Transaction>) =>
  Object.values(transactions).reduce((result, transaction) => {
    const year = transaction.datetime.slice(0, 4); // e.g 2024
    if (result[year]) {
      result[year].push(transaction);
    } else {
      result[year] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

const dateToKey = ({ period, date }: { period: Period; date: Dayjs }) => {
  switch (period) {
    case "annually":
      return date.year().toString();
    case "monthly":
      return date.toISOString().slice(0, 7);
    case "weekly":
      return date.day(0).toISOString().slice(0, 10);
  }
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

const periods = ["monthly", "weekly", "annually"] as const;
type Period = (typeof periods)[number];

const Stats = () => {
  const transactionsRecord = useAppStore((state) => state.transactions);
  const categories = useAppStore((state) => state.categories);
  const currency = useAppStore((state) => state.accounts[state.defaultAccountID].currency);
  const groupedTransactions: Record<Period, Record<string, Transaction[]>> = {
    monthly: groupTransactionsByMonth(transactionsRecord),
    annually: groupTransactionsByYear(transactionsRecord),
    weekly: groupTransactionsByWeek(transactionsRecord),
  };

  const [transactionType, setTransactionType] = useState<Transaction["type"]>("debit");

  const [currentDate, setCurrentDate] = useState<{ period: Period; date: Dayjs }>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const currentTransactions = groupedTransactions[currentDate.period][
    dateToKey(currentDate)
  ].filter(({ type }) => type === transactionType);

  const chartData = currentTransactions ? createChartData(currentTransactions) : null;
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const incrementDate = () => {
    switch (currentDate.period) {
      case "monthly":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.add(1, "month") }));
        break;
      case "weekly":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.add(1, "week") }));
        break;
      case "annually":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.add(1, "year") }));
        break;
    }
  };

  const decrementDate = () => {
    switch (currentDate.period) {
      case "monthly":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.subtract(1, "month") }));
        break;
      case "weekly":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.subtract(1, "week") }));
        break;
      case "annually":
        setCurrentDate((prev) => ({ period: prev.period, date: prev.date.subtract(1, "year") }));
        break;
    }
  };

  const renderDate = () => {
    switch (currentDate.period) {
      case "annually":
        return currentDate.date.year();
      case "monthly":
        return currentDate.date.format("MMM YYYY");
      case "weekly":
        const firstDay = currentDate.date.day(0);
        const lastDay = currentDate.date.day(6);
        return `${firstDay.format("MMM DD")} - ${lastDay.format("MMM DD, YYYY")}`;
    }
  };

  const handlePeriodChange = (option: Option) => {
    if (!option) return;
    setCurrentDate((prev) => ({ period: option.value as Period, date: prev.date.day(0) }));
  };
  console.log({ chartData });

  return (
    <ScreenWrapper className="!pb-6 !pt-6">
      <View className="flex-row gap-4 items-center mb-4 px-4 justify-between">
        <Text className="font-semibold text-2xl">Stats</Text>
      </View>

      <View className="flex-1 px-4">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row gap-1 items-center">
            <Button variant={"ghost"} size="icon" onPress={decrementDate} className="-ml-2">
              <ChevronLeftIcon className="text-foreground" size={20} />
            </Button>
            <Text className="font-semibold">{renderDate()}</Text>
            <Button variant={"ghost"} size="icon" onPress={incrementDate}>
              <ChevronRightIcon className="text-foreground" size={20} />
            </Button>
          </View>
          <View className="flex-row gap-2 items-center">
            <Select
              value={{ value: currentDate.period, label: titleCase(currentDate.period) }}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger className="gap-4" aria-aria-labelledby="type">
                <SelectValue className="text-foreground" placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period} label={titleCase(period)}>
                      {titleCase(period)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        </View>
        {chartData && (
          <View className="justify-center flex-row mb-4">
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
                "text-lg text-center",
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
                "text-lg text-center",
                transactionType === "credit" && "text-primary-foreground"
              )}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {chartData && (
          <ScrollView className="flex-1" contentContainerClassName="gap-3">
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
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Stats;
