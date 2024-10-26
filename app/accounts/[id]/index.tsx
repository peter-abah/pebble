import FloatingAddButton from "@/components/floating-add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { TrendingDownIcon } from "@/lib/icons/TrendingDown";
import { TrendingUpIcon } from "@/lib/icons/TrendingUp";
import { addMoney, createMoney, formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import {
  dateToKey,
  groupTransactionsByMonth,
  groupTransactionsByWeek,
  groupTransactionsByYear,
} from "@/lib/utils";
import dayjs from "dayjs";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

// TODO: icons should be 24 or leess
// TODO: all screens should have horizontal padding of 24px (px-6)
// TODO: add timestamps to all object types in store
// TODO: all headers should have thes same font size except home page
// TODO: empty state for all lists
const AccountScreen = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const account = useAppStore((state) => state.accounts[id]);
  const deleteAccount = useAppStore((state) => state.deleteAccount);
  if (!account) return null; // todo: 404 not found

  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const transactionsMap = useAppStore((state) => state.transactions);
  const transactions = useMemo(
    () => Object.values(transactionsMap) as Array<Transaction>,
    [transactionsMap]
  );
  const accountTransactions = useMemo(() => {
    // filter transactions by account and sort by date in descending order
    return transactions
      .filter((t) => t.accountID === account.id)
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [transactions]);
  const groupedTransactions: Record<
    TimePeriod["period"],
    Partial<Record<string, Transaction[]>>
  > = {
    monthly: groupTransactionsByMonth(accountTransactions),
    annually: groupTransactionsByYear(accountTransactions),
    weekly: groupTransactionsByWeek(accountTransactions),
  };
  const currentTransactions =
    groupedTransactions[currentTimePeriod.period][dateToKey(currentTimePeriod)];
  const income = useMemo(
    () =>
      (currentTransactions || [])
        .filter((t) => t.type === "credit")
        .reduce((a, b) => addMoney(a, b.amount), createMoney(0, account.currency)),
    [currentTransactions]
  );
  const expenses = useMemo(
    () =>
      (currentTransactions || [])
        ?.filter((t) => t.type === "debit")
        .reduce((a, b) => addMoney(a, b.amount), createMoney(0, account.currency)),
    [currentTransactions]
  );

  const onDelete = () => {
    deleteAccount(account.id);
    router.replace("/");
  };

  return (
    <ScreenWrapper className="pb-6">
      <View className="flex-row gap-4 items-center px-6 py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">{account.name}</Text>

        <View className="items-center flex-row ml-auto gap-3">
          <Link href={`/accounts/${account.id}/edit`} asChild>
            <Button
              className="rounded-full p-0 active:bg-accent items-center justify-center"
              variant="ghost"
              size="icon"
            >
              <PencilIcon className="text-foreground" size={24} />
            </Button>
          </Link>

          <Button
            className="rounded-full p-0 active:bg-accent ml-auto items-center justify-center"
            variant="ghost"
            // TODO: CONFIRM DELETION
            onPress={onDelete}
            size="icon"
          >
            <TrashIcon className="text-foreground" size={24} />
          </Button>
        </View>
      </View>

      <View className="px-6 pb-2">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
      </View>

      <View className="px-6 gap-2 py-2">
        <Text className="text-sm font-bold text-muted-foreground">Total balance</Text>
        <Text className="font-bold text-2xl">{formatMoney(account.balance)}</Text>
      </View>

      <View className="flex-row gap-4 py-2 px-6">
        <Button
          variant="outline"
          className="justify-start flex-1 p-3 h-auto items-center flex-row gap-2"
        >
          <View className="bg-green-600 items-center justify-center rounded-full w-10 h-10">
            <TrendingDownIcon className="text-white" size={24} />
          </View>
          <View>
            <Text>Income</Text>
            <Text className="font-bold">{formatMoney(income)}</Text>
          </View>
        </Button>
        <Button
          variant="outline"
          className="justify-start flex-1 p-3 h-auto items-center flex-row gap-2"
        >
          <View className="bg-red-600 items-center justify-center rounded-full w-10 h-10">
            <TrendingUpIcon className="text-white" size={24} />
          </View>
          <View>
            <Text>Expenses</Text>
            <Text className="font-bold">{formatMoney(expenses)}</Text>
          </View>
        </Button>
      </View>

      <FlatList
        data={currentTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        className="flex-1 px-6 py-2"
      />

      <Link href={`/transactions/create?accountID=${account.id}`} asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default AccountScreen;
