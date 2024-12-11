import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { deleteAccount } from "@/db/mutations/accounts";
import { getAccounts } from "@/db/queries/accounts";
import { getTransactions } from "@/db/queries/transactions";
import { calculateAccountExpenses, calculateAccountIncome } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { TrendingDownIcon } from "@/lib/icons/TrendingDown";
import { TrendingUpIcon } from "@/lib/icons/TrendingUp";
import { formatMoney } from "@/lib/money";
import { TimePeriod } from "@/lib/types";
import { valueToNumber } from "@/lib/utils";
import dayjs from "dayjs";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";

const AccountScreen = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: [account],
  } = useLiveQuery(
    getAccounts({ ids: id !== undefined ? [id] : undefined, limit: id !== undefined ? 1 : 0 })
  );

  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const { data: transactions } = useLiveQuery(
    getTransactions({
      period: currentTimePeriod,
      sortBy: [{ column: "datetime", type: "desc" }],
      accounts: account?.id ? [account.id] : undefined,
      limit: account?.id ? undefined : 0,
    }),
    [currentTimePeriod, account?.id]
  );

  const income = account ? calculateAccountIncome(account, transactions) : null;
  const expenses = account ? calculateAccountExpenses(account, transactions) : null;

  const onDelete = async () => {
    if (!account) return;

    await deleteAccount(account.id);
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
        <Text className="font-bold text-2xl">
          {formatMoney({
            valueInMinorUnits: account.balance_value_in_minor_units,
            currencyCode: account.currency_code,
          })}
        </Text>
      </View>

      <View className="flex-row gap-4 py-2 px-6">
        {income ? (
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
        ) : null}
        {expenses ? (
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
        ) : null}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={
              item.type === "lent" || item.type === "borrowed"
                ? `/loans/${item.id}`
                : `/transactions/${item.id}/edit`
            }
            asChild
          >
            <TransactionCard transaction={item} />
          </Link>
        )}
        className="flex-1 px-6 py-2"
        ListEmptyComponent={<EmptyState title="No transactions to show" />}
      />

      <Link href={`/transactions/new?account_id=${account.id}`} asChild>
        <FloatingAddButton />
      </Link>
      <DeleteModal />
    </ScreenWrapper>
  );
};

export default AccountScreen;
