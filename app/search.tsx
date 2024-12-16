import EmptyState from "@/components/empty-state";
import FiltersModal from "@/components/filters-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker from "@/components/time-period-picker";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getAccounts } from "@/db/queries/accounts";
import { getCategories } from "@/db/queries/categories";
import { getTransactions } from "@/db/queries/transactions";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { Filters, TimePeriod } from "@/lib/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";

const Search = () => {
  const [search, setSearch] = useState("");
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));
  const [filters, setFilters] = useState<Filters>({ categories: [], accounts: [], types: [] });

  // checking just the error state because the db query is very fast and resolves in less than a sec
  const { data: transactions, isError: isTransactionsError } = useQuery({
    queryKey: ["transactions", { search, period: currentTimePeriod, filters }],
    queryFn: async () =>
      getTransactions({
        search,
        period: currentTimePeriod,
        ...filters,
        sortBy: [{ column: "datetime", type: "desc" }],
      }),
    initialData: [],
  });

  const { data: categories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories", { ids: filters.categories }],
    queryFn: async () => await getCategories({ ids: filters.categories }),
    initialData: [],
  });
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["categories", { ids: filters.categories }],
    queryFn: async () => await getAccounts({ ids: filters.categories }),
    initialData: [],
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
            {isCategoriesError ? (
              <Text className="text-sm">"Error. Could not fetch categories"</Text>
            ) : (
              <FlatList
                data={categories}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="flex-row gap-1 border border-border rounded-xl px-3 py-1.5">
                    <Text className="text-sm">{item.name}</Text>
                  </View>
                )}
                contentContainerClassName="gap-4"
              />
            )}
          </View>
        ) : null}
        {filters.accounts.length > 0 ? (
          <View className="flex flex-row gap-2 items-center">
            <Text className="text-sm font-medium">Accounts:</Text>
            {isAccountsError ? (
              <Text className="text-sm">Error. Could not fetch accounts</Text>
            ) : (
              <FlatList
                data={accounts}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="flex-row gap-1 border border-border rounded-xl px-3 py-1.5">
                    <Text className="text-sm">{item.name}</Text>
                  </View>
                )}
                contentContainerClassName="gap-4"
              />
            )}
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

      {isTransactionsError ? (
        <EmptyState
          title="An error occured."
          icon={<MaterialIcons name="error" size={100} className="text-muted-foreground" />}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-6"
          contentContainerClassName="flex-1"
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
      )}
    </ScreenWrapper>
  );
};

export default Search;
