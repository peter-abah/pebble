import EmptyState from "@/components/empty-state";
import FiltersModal from "@/components/filters-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker, { TimePeriod } from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { filterTransactions } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Filters, Transaction } from "@/lib/types";
import dayjs from "dayjs";
import { Link, router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";

const Search = () => {
  const [search, setSearch] = useState("");
  const transactions = useAppStore(getSortedTransactionsByDate) as Array<Transaction>;
  const categoriesMap = useAppStore((state) => state.categories);
  const accountsMap = useAppStore((state) => state.accounts);

  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));
  const [filters, setFilters] = useState<Filters>({ categories: [], accounts: [], types: [] });

  const filtered = filterTransactions(transactions, {
    search,
    period: currentTimePeriod,
    filters: filters,
  });

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Search</Text>
      </View>

      <View className="px-6 mb-4 flex-row gap-2 items-center">
        <Input
          className="border border-border px-3 py-2 flex-1"
          placeholder="Search transactions"
          onChangeText={setSearch}
          value={search}
        />
        <FiltersModal filters={filters} onFiltersChange={setFilters} />
      </View>

      <View className="px-6 pb-2">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
      </View>

      <View className="px-6 py-2 gap-2">
        {filters.categories.length > 0 ? (
          <View className="flex flex-row gap-2 items-center">
            <Text className="text-sm font-medium">Categories:</Text>
            <FlatList
              data={filters.categories}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View className="flex-row gap-1 border border-border rounded-xl px-3 py-1.5">
                  <Text className="text-sm">{categoriesMap[item]?.name}</Text>
                </View>
              )}
              contentContainerClassName="gap-4"
            />
          </View>
        ) : null}
        {filters.accounts.length > 0 ? (
          <View className="flex flex-row gap-2 items-center">
            <Text className="text-sm font-medium">Accounts:</Text>
            <FlatList
              data={filters.accounts}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View className="flex-row gap-1 border border-border rounded-xl px-3 py-1.5">
                  <Text className="text-sm">{accountsMap[item]?.name}</Text>
                </View>
              )}
              contentContainerClassName="gap-4"
            />
          </View>
        ) : null}
        {filters.types.length > 0 ? (
          <View className="flex flex-row gap-2 items-center">
            <Text className="text-sm font-medium">Transaction type:</Text>
            <FlatList
              data={filters.types}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View className="flex-row gap-1 border border-border rounded-xl px-3 py-1.5">
                  <Text className="text-sm capitalize">{item}</Text>
                </View>
              )}
              contentContainerClassName="gap-4"
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
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
        className="flex-1 px-6"
        ListEmptyComponent={
          search === "" ? (
            <EmptyState
              title="Search transactions"
              icon={<SearchIcon size={100} className="text-muted-foreground" />}
            />
          ) : (
            <EmptyState title="No transactions to show" />
          )
        }
      />
    </ScreenWrapper>
  );
};

export default Search;
