import { AccountCard } from "@/components/account-card";
import { ErrorScreen } from "@/components/error-screen";
import FloatingAddButton from "@/components/floating-add-button";
import { PlaceholderBlock } from "@/components/placeholder-block";
import { usePromptModal } from "@/components/prompt-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getAccounts, getMainAccount } from "@/db/queries/accounts";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { SearchIcon } from "@/lib/icons/Search";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Accounts = () => {
  const [search, setSearch] = useState("");
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => await getAccounts({ sortBy: [{ column: "name", type: "asc" }] }),
    initialData: [],
  });
  const {
    data: mainAccount,
    isError: isMainAccountError,
    isPending: isMainAccountPending,
  } = useQuery({
    queryKey: ["accounts", "mainAccount"],
    queryFn: async () => (await getMainAccount()) ?? null,
  });

  const { Modal: MainAccountPromptModal, openModal } = usePromptModal({
    title: "No main account set",
    description: "You need to set a main account to use the app.",
  });

  useEffect(() => {
    if (!isMainAccountPending && !mainAccount) {
      openModal();
    }
  }, [isMainAccountPending, mainAccount, openModal]);

  if (isAccountsError || isMainAccountError) {
    return <ErrorScreen title="An error occured fetching accounts" />;
  }

  const searchedAccounts = search.trim()
    ? accounts.filter((a) => a.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    : accounts;

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
        <Text className="font-sans_semibold text-2xl">Accounts</Text>
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
        <PlaceholderBlock
          title="An error occured."
          icon={<MaterialIcons name="error" size={100} className="text-muted-foreground" />}
        />
      ) : (
        <FlatList
          data={searchedAccounts}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-6"
          contentContainerClassName="gap-6"
          renderItem={({ item, index }) => (
            <Link href={`/accounts/${item.id}`} asChild>
              <AccountCard account={item} />
            </Link>
          )}
          ListEmptyComponent={<PlaceholderBlock title="No accounts to show" />}
        />
      )}

      <MainAccountPromptModal />

      <Link href={"/accounts/new"} asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

export default Accounts;
