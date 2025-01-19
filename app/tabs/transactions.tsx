import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getTransactions } from "@/db/queries/transactions";
import { SearchIcon } from "@/lib/icons/Search";
import { TimePeriod } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Transactions = () => {
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));

  const { data: transactions, isError: isTransactionsError } = useQuery({
    queryKey: ["transactions", { period: currentTimePeriod }],
    queryFn: () =>
      getTransactions({
        period: currentTimePeriod,
        sortBy: [{ column: "datetime", type: "desc" }],
      }),
    initialData: [],
  });

  // todo: same error msgs for all pages
  if (isTransactionsError) {
    return <ResourceNotFound title="An error occured fetching transactions" />;
  }

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6 justify-between">
        <Text className="font-sans_semibold text-2xl">Transactions</Text>

        <View className="flex-row items-center gap-4">
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

      <View className="px-6 py-2">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
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

      <Link href="/transactions/new" asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default Transactions;
