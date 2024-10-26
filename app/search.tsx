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

const Search = () => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Array<Transaction>>([]);
  const transactions = useAppStore(getSortedTransactionsByDate) as Array<Transaction>;

  const onSearch = () => {
    setFiltered(filterTransactions(transactions, search));
  };

  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center my-4 mx-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-2xl">Search</Text>
      </View>

      <View className="px-4 mb-4 flex-row gap-2 items-center">
        <Input
          className="border border-border px-3 py-2 flex-1"
          placeholder="Search transactions"
          onChangeText={setSearch}
          value={search}
        />
        <Button size="icon" onPress={onSearch}>
          <SearchIcon size={20} className="text-primary-foreground" />
        </Button>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        className="flex-1 px-4"
      />
    </ScreenWrapper>
  );
};

export default Search;
