import AddButton from "@/components/add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FilterIcon } from "@/lib/icons/Filter";
import { SearchIcon } from "@/lib/icons/Search";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import {
  cn,
  dateToKey,
  groupTransactionsByMonth,
  groupTransactionsByWeek,
  groupTransactionsByYear,
} from "@/lib/utils";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const periods = ["monthly", "weekly", "annually"] as const;
type Period = (typeof periods)[number];

const Transactions = () => {
  const transactions = useAppStore(getSortedTransactionsByDate);
  const groupedTransactions: Record<Period, Record<string, Transaction[]>> = {
    monthly: groupTransactionsByMonth(transactions),
    annually: groupTransactionsByYear(transactions),
    weekly: groupTransactionsByWeek(transactions),
  };

  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const currentTransactions =
    groupedTransactions[currentTimePeriod.period][dateToKey(currentTimePeriod)];

  return (
    <ScreenWrapper className="!pb-6 !pt-6">
      <View className="flex-row gap-4 items-center mb-4 px-4 justify-between">
        <Text className="font-semibold text-2xl">Transactions</Text>

        <View className="flex-row items-center gap-4">
          <Button
            onPress={() => {}}
            className="rounded-full p-0 -ml-2 items-center justify-center"
            variant="ghost"
            size="icon"
          >
            <FilterIcon className="text-foreground" size={20} />
          </Button>
          <Link href="/search" asChild>
            <Button
              onPress={() => {}}
              className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
              variant="ghost"
              size="icon"
            >
              <SearchIcon className="text-foreground" size={20} />
            </Button>
          </Link>
        </View>
      </View>

      <View className="px-4 mb-4">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
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
