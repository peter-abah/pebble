import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
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
import { CURRENCIES, addMoney, convertMoney, createMoney, formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { dateToKey, groupTransactionsByPeriod } from "@/lib/utils";
import dayjs from "dayjs";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

const AccountScreen = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const account = useAppStore((state) => state.accounts[id]);
  const { deleteAccount } = useAppStore((state) => state.actions);

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
    if (!account) return [];
    // filter transactions by account and sort by date in descending order
    return transactions
      .filter((t) =>
        t.type === "transfer"
          ? t.to === account.id || t.from === account.id
          : t.accountID === account.id
      )
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [transactions, account]);

  const currentTransactions =
    groupTransactionsByPeriod[currentTimePeriod.period](accountTransactions)[
      dateToKey(currentTimePeriod)
    ];
  const income = useMemo(() => {
    if (!account) return createMoney(0, CURRENCIES.NGN);

    return (currentTransactions || [])
      .filter((t) => {
        if (t.type === "transfer") {
          return t.to === account.id;
        }
        return t.type === "income";
      })
      .reduce((acc, curr) => {
        if (curr.type === "transfer") {
          return addMoney(acc, convertMoney(curr.amount, curr.exchangeRate));
        }
        return addMoney(acc, curr.amount);
      }, createMoney(0, account.currency));
  }, [currentTransactions, account]);

  const expenses = useMemo(() => {
    if (!account) return createMoney(0, CURRENCIES.NGN);

    return (currentTransactions || [])
      ?.filter((t) => {
        if (t.type === "transfer") {
          return t.from === account.id;
        }
        return t.type === "expense";
      })
      .reduce((a, b) => addMoney(a, b.amount), createMoney(0, account.currency));
  }, [currentTransactions, account]);

  const onDelete = () => {
    if (!account) return;

    deleteAccount(account.id);
    router.back();
  };

  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${account?.name} account`,
    onConfirm: onDelete,
  });

  if (!account) {
    return <ResourceNotFound title="Account does not exist" />;
  }
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
            onPress={openDeleteModal}
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
        ListEmptyComponent={<EmptyState title="No transactions to show" />}
      />

      <Link href={`/transactions/create?accountID=${account.id}`} asChild>
        <FloatingAddButton />
      </Link>
      <DeleteModal />
    </ScreenWrapper>
  );
};

export default AccountScreen;
