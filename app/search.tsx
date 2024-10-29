import EmptyState from "@/components/empty-state";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { router } from "expo-router";
import { memoizeWithArgs } from "proxy-memoize";
import { useState } from "react";
import { FlatList, View } from "react-native";
import debounce from "lodash.debounce";

const filterTransactions = memoizeWithArgs((transactions: Array<Transaction>, search: string) => {
  return transactions.filter((transaction) => {
    if (search.trim().length === 0) return false;
    const matchesTitle =
      transaction.title && transaction.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesNote =
      transaction.note && transaction.note.toLowerCase().includes(search.trim().toLowerCase());

    return matchesTitle || matchesNote;
  });
});

const debouncedFilterTransactions = debounce(filterTransactions, 200, {
  leading: true,
  trailing: true,
});

const Search = () => {
  const [search, setSearch] = useState("");
  const transactions = useAppStore(getSortedTransactionsByDate) as Array<Transaction>;

  const filtered = debouncedFilterTransactions(transactions, search);

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
        {/* TODO: add time period to search */}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
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

// TODO: Add attribution to flaticons
export default Search;
