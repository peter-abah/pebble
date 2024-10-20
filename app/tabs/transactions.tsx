import AddButton from "@/components/add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
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
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRIght";
import { Filter } from "@/lib/icons/Filter";
import { Search } from "@/lib/icons/Search";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import dayjs, { Dayjs } from "dayjs";
import { memoize } from "proxy-memoize";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const periods = ["monthly", "weekly", "annually"] as const;
type Period = (typeof periods)[number];

const Transactions = () => {
  const transactionsRecord = useAppStore((state) => state.transactions);
  const groupedTransactions: Record<Period, Record<string, Transaction[]>> = {
    monthly: groupTransactionsByMonth(transactionsRecord),
    annually: groupTransactionsByYear(transactionsRecord),
    weekly: groupTransactionsByWeek(transactionsRecord),
  };

  const [currentDate, setCurrentDate] = useState<{ period: Period; date: Dayjs }>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const currentTransactions = groupedTransactions[currentDate.period][dateToKey(currentDate)];
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

  return (
    <ScreenWrapper className="!pb-6 !pt-6">
      <View className="flex-row gap-4 items-center mb-2 px-4 justify-between">
        <Text className="font-semibold text-2xl">Transactions</Text>

        <View className="flex-row items-center gap-4">
          <Button
            onPress={() => {}}
            className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
            variant="ghost"
            size="icon"
          >
            <Filter className="text-foreground" size={24} />
          </Button>
          <Button
            onPress={() => {}}
            className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
            variant="ghost"
            size="icon"
          >
            <Search className="text-foreground" size={24} />
          </Button>
        </View>
      </View>

      <View className="mb-6 px-4 flex-row items-center justify-between">
        <View className="flex-row gap-1 items-center">
          <Button variant={"ghost"} size="icon" onPress={decrementDate} className="-ml-2">
            <ChevronLeft className="text-foreground" />
          </Button>
          <Text className="font-semibold">{renderDate()}</Text>
          <Button variant={"ghost"} size="icon" onPress={incrementDate}>
            <ChevronRight className="text-foreground" />
          </Button>
        </View>
        <View className="flex-row gap-2 items-center">
          <Select
            value={{ value: currentDate.period, label: titleCase(currentDate.period) }}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="gap-1" aria-aria-labelledby="type">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Select transaction type"
              />
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

      <FlatList
        data={currentTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        className="flex-1 px-4"
      />

      <AddButton />
    </ScreenWrapper>
  );
};

export default Transactions;
