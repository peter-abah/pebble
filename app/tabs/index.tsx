import AddDataModal from "@/components/add-data-modal";
import FloatingAddButton from "@/components/floating-add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { testTransactions } from "@/lib/data";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { formatMoney } from "@/lib/money";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Account } from "@/lib/types";
import { arrayToMap } from "@/lib/utils";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

// TODO: record initial balance in records but use special type to indicate
export default function Home() {
  const transactions = useAppStore(getSortedTransactionsByDate);
  // TODO: support multiple accounts with different currencies
  const accountsMap = useAppStore((state) => state.accounts);
  const accounts = Object.values(accountsMap) as Array<Account>;
  const isFirstInstall = useAppStore((state) => state._isFirstOpen);
  const updateState = useAppStore((state) => state.updateState);

  const [isModalOpen, setIsModalOpen] = useState(isFirstInstall);

  const handleLoadData = async () => {
    setIsModalOpen(false);
    await loadInitData();
    updateState("_isFirstOpen", false);
  };

  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-bold text-3xl mb-6">Home</Text>
        <View>
          <View className="gap-2 flex-row">
            {accounts.slice(0, 2).map((account) => (
              <Link href={`/accounts/${account.id}`} asChild key={account.id}>
                <Button className="h-auto p-4 flex-1 items-start justify-start gap-1">
                  <Text className="text-primary-foreground font-medium">{account.name}</Text>
                  <Text className="font-bold text-2xl text-primary-foreground" numberOfLines={1}>
                    {formatMoney(account.balance)}
                  </Text>
                </Button>
              </Link>
            ))}
          </View>
          <Link href="/accounts" asChild>
            <Pressable className="px-2 py-1 mt-1 ml-auto -mx-2 rounded-sm active:bg-muted flex-row gap-1 items-center">
              <Text>view all</Text>
              <MaterialIcons name="arrow-right-alt" className="text-foreground" size={16} />
            </Pressable>
          </Link>
        </View>

        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-xl">Transactions</Text>
            <Link
              href="/tabs/transactions"
              className="px-2 py-1 -my-1 -mx-2 rounded-sm active:bg-muted"
            >
              <Text>See all</Text>
            </Link>
          </View>

          {transactions.slice(0, 5).map((transaction) => (
            <TransactionCard transaction={transaction} key={transaction.id} />
          ))}
        </View>
      </ScrollView>
      <Link href="/transactions/create" asChild>
        <FloatingAddButton />
      </Link>
      <AddDataModal open={isModalOpen} setOpen={setIsModalOpen} onYes={handleLoadData} />
    </ScreenWrapper>
  );
}

// TODO: bad code, use onboarding, remove in release / beta
const loadInitData = async () => {
  const state = useAppStore.getState();
  state.reset();
  testTransactions.sort((a, b) => b.datetime.localeCompare(a.datetime));
  const balanceFromTransactions = testTransactions.reduce(
    (acc, curr) =>
      curr.type === "credit"
        ? acc + curr.amount.valueInMinorUnits
        : acc - curr.amount.valueInMinorUnits,
    0
  );
  useAppStore.setState((state) => {
    const defaultAccount = state.accounts[state.defaultAccountID];
    if (defaultAccount) {
      defaultAccount.balance = {
        valueInMinorUnits: balanceFromTransactions,
        currency: defaultAccount.currency,
      };
    }
  });
  state.updateState("transactions", arrayToMap(testTransactions, "id"));
  state.updateState("_isFirstOpen", false);
};
