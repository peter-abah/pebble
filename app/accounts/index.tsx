import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getAccounts } from "@/db/queries/accounts";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { SearchIcon } from "@/lib/icons/Search";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

// todo: improve search performance, currently every change in search will trigger a db query
const Accounts = () => {
  const [search, setSearch] = useState("");
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts", { search: search.trim() }],
    queryFn: async () =>
      await getAccounts({ sortBy: [{ column: "name", type: "asc" }], search: search.trim() }),
    initialData: [],
  });

  if (isAccountsError) {
    return <ResourceNotFound title="An error occured fetching accounts" />;
  }
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
        <Text className="font-semibold text-2xl">Accounts</Text>
      </View>

      <View className="px-6 py-2">
        <View className="border border-border rounded-2xl py-2 px-4 flex-row gap-2 items-center">
          <SearchIcon size={24} className="text-muted-foreground" />
          <Input
            className="p-0 rounded-none text-lg"
            placeholder="Search accounts"
            onChangeText={setSearch}
          />
        </View>
      </View>

      {isAccountsError ? (
        <EmptyState
          title="An error occured."
          icon={<MaterialIcons name="error" size={100} className="text-muted-foreground" />}
        />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-6"
          contentContainerClassName="flex-1"
          renderItem={({ item, index }) => (
            <Link href={`/accounts/${item.id}`} asChild>
              <Pressable
                className={cn(
                  "p-4 flex-row items-center border-border",
                  index < accounts.length - 1 && "border-b"
                )}
              >
                <View
                  className="h-5 w-5 rounded-full mr-4"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-xl">{item.name}</Text>
                <Text className="ml-auto text-lg">
                  {formatMoney({
                    valueInMinorUnits: item.balance_value_in_minor_units,
                    currencyCode: item.currency_code,
                  })}
                </Text>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={<EmptyState title="No accounts to show" />}
        />
      )}

      <Link href={"/accounts/new"} asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default Accounts;
