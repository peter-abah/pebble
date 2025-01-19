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
import { getAccount, getMainAccount } from "@/db/queries/accounts";
import { getTransactions } from "@/db/queries/transactions";
import { calculateAccountExpenses, calculateAccountIncome } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { PencilIcon } from "@/lib/icons/Pencil";
import { StarIcon } from "@/lib/icons/Star";
import { TrashIcon } from "@/lib/icons/Trash";
import { TrendingDownIcon } from "@/lib/icons/TrendingDown";
import { TrendingUpIcon } from "@/lib/icons/TrendingUp";
import { formatMoney } from "@/lib/money";
import { queryClient } from "@/lib/react-query";
import { TimePeriod } from "@/lib/types";
import { valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, View } from "react-native";

// todo: add logging, errors and other events
const AccountScreen = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: account,
    isError: isAccountError,
    isPending: isAccountPending,
  } = useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => (id ? await getAccount(id) : undefined),
  });

  const { data: mainAccount } = useQuery({
    queryKey: ["accounts", "mainAccount"],
    queryFn: () => getMainAccount(),
  });

  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const { data: accountTransactions } = useQuery({
    queryKey: ["transactions", { period: currentTimePeriod, accounts: [account?.id] }],
    queryFn: async () =>
      getTransactions({
        period: currentTimePeriod,
        sortBy: [{ column: "datetime", type: "desc" }],
        accounts: account?.id ? [account.id] : undefined,
        limit: account?.id ? undefined : 0,
      }),
    initialData: [],
  });

  const onDelete = async () => {
    if (!account) return;

    await deleteAccount(account.id);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

    // need to invalidate related transactions will be deleted and related budgets will be updated
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    router.back();
  };

  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${account?.name} account`,
    onConfirm: onDelete,
  });

  const handleDeletePress = () => {
    if (account?.id === mainAccount?.account_id) {
      Alert.alert(
        "Cannot delete main account.",
        "Set another account as the main account to delete"
      );
      return;
    }

    openDeleteModal();
  };

  if (isAccountPending) {
    return (
      <EmptyState
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }

  if (isAccountError) {
    return <ResourceNotFound title="An error occured, could not fetch account" />;
  }

  if (!account) {
    return <ResourceNotFound title="Account does not exist" />;
  }

  const income = calculateAccountIncome(account, accountTransactions);
  const expenses = calculateAccountExpenses(account, accountTransactions);

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
        <View className="flex-row items-center gap-2">
          <Text className="font-sans_bold text-2xl">{account.name}</Text>
          {mainAccount?.account_id === account.id && (
            <StarIcon className="text-primary fill-black" size={20} />
          )}
        </View>

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
            onPress={handleDeletePress}
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
        <Text className="text-sm font-sans_bold text-muted-foreground">Total balance</Text>
        <Text className="font-sans_bold text-2xl">
          {formatMoney({
            valueInMinorUnits: account.balance_value_in_minor_units,
            currencyCode: account.currency_code,
          })}
        </Text>
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
            <Text className="font-sans_bold">{formatMoney(income)}</Text>
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
            <Text className="font-sans_bold">{formatMoney(expenses)}</Text>
          </View>
        </Button>
      </View>

      <FlatList
        data={accountTransactions}
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
