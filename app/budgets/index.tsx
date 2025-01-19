import { BudgetCard } from "@/components/budget-card";
import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getBudgets } from "@/db/queries/budgets";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Budgets = () => {
  const [search, setSearch] = useState("");
  const { data: budgets, isError: isBudgetsError } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets(),
    initialData: [],
  });

  if (isBudgetsError) {
    return <ResourceNotFound title="An error occured. Could not fetch budgets." />;
  }

  const searchedBudgets = search.trim()
    ? budgets.filter((a) => a.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    : budgets;

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
        data={searchedBudgets}
        keyExtractor={(item) => item.id.toString()}
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
