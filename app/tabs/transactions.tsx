import AddButton from "@/components/add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { MONTHS } from "@/lib/constants";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRIght";
import { Filter } from "@/lib/icons/Filter";
import { Search } from "@/lib/icons/Search";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { memoize } from "proxy-memoize";
import { useRef, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const groupTransactionsByMonth = memoize((transactions: Record<string, Transaction>) =>
  Object.values(transactions).reduce((result, transaction) => {
    const monthAndYear = transaction.datetime.slice(0, 7); // e.g 2024-10
    if (result[monthAndYear]) {
      result[monthAndYear].push(transaction);
    } else {
      result[monthAndYear] = [];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

const Transactions = () => {
  const transactionsRecord = useAppStore((state) => state.transactions);
  const transactions = groupTransactionsByMonth(transactionsRecord);
  const todayRef = useRef(new Date());
  const [currentMonth, setCurrentMonth] = useState({
    month: todayRef.current.getMonth(),
    year: todayRef.current.getFullYear(),
  });

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const incrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) {
        return {
          month: 1,
          year: prev.year + 1,
        };
      }

      return {
        month: prev.month + 1,
        year: prev.year,
      };
    });
  };

  const decrementMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) {
        return {
          month: 12,
          year: prev.year - 1,
        };
      }

      return {
        month: prev.month - 1,
        year: prev.year,
      };
    });
  };
  const monthISO = `${currentMonth.year}-${(currentMonth.month + 1).toString().padStart(2, "0")}`;

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
          <Button variant={"ghost"} size="icon" onPress={decrementMonth} className="-ml-2">
            <ChevronLeft className="text-foreground" />
          </Button>
          <Text className="font-semibold">
            {MONTHS[currentMonth.month]} {currentMonth.year}
          </Text>
          <Button variant={"ghost"} size="icon" onPress={incrementMonth}>
            <ChevronRight className="text-foreground" />
          </Button>
        </View>
        <View className="flex-row gap-2 items-center">
          <Select value={{ value: "Monthly", label: "Monthly" }}>
            <SelectTrigger className="gap-1" aria-aria-labelledby="type">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Select transaction type"
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets}>
              <SelectGroup>
                <SelectItem value={"Weekly"} label="Weekly">
                  Weekly
                </SelectItem>
                <SelectItem value={"Monthly"} label="Monthly">
                  Monthly
                </SelectItem>
                <SelectItem value={"Annualy"} label="Annually">
                  Annually
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {transactions[monthISO]
          ? transactions[monthISO].map((transaction) => (
              <TransactionCard transaction={transaction} key={transaction.id} />
            ))
          : null}
      </ScrollView>

      <AddButton />
    </ScreenWrapper>
  );
};

export default Transactions;
