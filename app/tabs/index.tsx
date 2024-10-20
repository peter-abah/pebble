import AddButton from "@/components/add-button";
import AddDataModal from "@/components/add-data-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Text } from "@/components/ui/text";
import { testTransactions } from "@/lib/data";
import { CURRENCIES, addMoney, createMoney, formatMoney } from "@/lib/money";
import { getSortedTransactionsByDate, useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { arrayToRecord } from "@/lib/utils";
import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const sumTransactions = (transactions: Array<Transaction>) => {
  return transactions.reduce(
    (acc, curr) => addMoney(acc, curr.amount),
    createMoney(0, CURRENCIES.NGN)
  );
};

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
    defaultAccount.balance = {
      valueInMinorUnits: balanceFromTransactions,
      currency: defaultAccount.currency,
    };
  });
  state.updateState("transactions", arrayToRecord(testTransactions, "id"));
  state.updateState("_isFirstOpen", false);
};

export default function Home() {
  const transactions = useAppStore(getSortedTransactionsByDate);
  // TODO: support multiple accounts with different currencies
  const account = useAppStore((state) => state.accounts[state.defaultAccountID]);
  const isFirstInstall = useAppStore((state) => state._isFirstOpen);
  const updateState = useAppStore((state) => state.updateState);

  const [isModalOpen, setIsModalOpen] = useState(isFirstInstall);

  const expenses = sumTransactions(transactions.filter(({ type }) => type === "debit"));
  const income = sumTransactions(transactions.filter(({ type }) => type === "credit"));

  const handleLoadData = async () => {
    setIsModalOpen(false);
    await loadInitData();
    updateState("_isFirstOpen", false);
  };

  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-bold text-3xl mb-6">Home</Text>
        <View className="gap-4">
          <View className="gap-1 border rounded-lg p-4 bg-primary">
            <Text className="text-primary-foreground">Current Balance</Text>
            <Text className="font-bold text-2xl text-primary-foreground">
              {formatMoney(account.balance)}
            </Text>
          </View>

          <View className="gap-1 rounded-lg p-4 bg-primary/10">
            <Text className="">Income (This month)</Text>
            <Text className="font-bold text-2xl">{formatMoney(income)}</Text>
          </View>

          <View className="gap-1 rounded-lg p-4 bg-destructive/10">
            <Text className="">Expenses (This month)</Text>
            <Text className="font-bold text-2xl">{formatMoney(expenses)}</Text>
          </View>
        </View>

        <View className="mt-6">
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
      <AddButton />
      <AddDataModal open={isModalOpen} setOpen={setIsModalOpen} onYes={handleLoadData} />
    </ScreenWrapper>
  );
}
