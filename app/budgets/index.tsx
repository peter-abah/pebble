import { BudgetCard } from "@/components/budget-card";
import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { useAppStore } from "@/lib/store";
import { Budget } from "@/lib/types";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Budgets = () => {
  const budgetsMap = useAppStore((state) => state.budgets);
  const budgets = useMemo(() => Object.values(budgetsMap) as Array<Budget>, [budgetsMap]);

  const [search, setSearch] = useState("");
  const filteredBudgets = useMemo(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch === "") return budgets;

    return budgets.filter((budget) =>
      budget.name.toLocaleLowerCase().includes(trimmedSearch.toLocaleLowerCase())
    );
  }, [search, budgets]);

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
        <Text className="font-semibold text-2xl">Budgets</Text>
      </View>

      <View className="px-6 py-2">
        <View className="border border-border rounded-2xl py-2 px-4 flex-row gap-2 items-center">
          <SearchIcon size={24} className="text-muted-foreground" />
          <Input
            className="p-0 rounded-none text-lg"
            placeholder="Search Budgets"
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredBudgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BudgetCard budget={item} />}
        className="flex-1"
        ListEmptyComponent={<EmptyState title="No Budgets To Show" />}
      />

      <Link href={"/budgets/new"} asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default Budgets;
