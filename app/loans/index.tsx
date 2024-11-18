import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { useAppStore } from "@/lib/store";
import { LoanTransaction } from "@/lib/types";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Loans = () => {
  const transactionsMap = useAppStore((state) => state.transactions);
  const loans = Object.values(transactionsMap).filter(
    (t): t is LoanTransaction => t?.type === "borrowed" || t?.type === "lent"
  );

  const [search, setSearch] = useState("");
  const filteredLoans = useMemo(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch === "") return loans;

    return loans.filter((loan) =>
      loan.title.toLocaleLowerCase().includes(trimmedSearch.toLocaleLowerCase())
    );
  }, [search, loans]);

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-semibold text-2xl">Loans</Text>
      </View>

      <View className="px-6 py-2">
        <View className="border border-border rounded-2xl py-2 px-4 flex-row gap-2 items-center">
          <SearchIcon size={24} className="text-muted-foreground" />
          <Input
            className="p-0 rounded-none text-lg"
            placeholder="Search Loans"
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/loans/${item.id}`} asChild>
            <TransactionCard transaction={item} />
          </Link>
        )}
        className="flex-1 px-6 py-4"
        ListEmptyComponent={<EmptyState title="No Loans To Show" />}
      />

      <Link href="/transactions/new?type=lent" asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default Loans;
