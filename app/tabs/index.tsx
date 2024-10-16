import AddDataModal from "@/components/add-data-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Text } from "@/components/ui/text";
import { testTransactions } from "@/lib/data";
import { Plus } from "@/lib/icons/Plus";
import { CURRENCIES, addMoney, createMoney, formatMoney } from "@/lib/money";
import { AppStore, getSortedTransactionsByDate } from "@/lib/store";
import { StoreContext, useStoreContext } from "@/lib/store-context";
import { Transaction } from "@/lib/types";
import { arrayToRecord } from "@/lib/utils";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const sumTransactions = (transactions: Array<Transaction>) => {
  return transactions.reduce(
    (acc, curr) => addMoney(acc, curr.amount),
    createMoney(0, CURRENCIES.NGN)
  );
};

const loadInitData = async (store: AppStore) => {
  const state = store.getState();
  state.reset();
  testTransactions.sort((a, b) => b.datetime.localeCompare(a.datetime));
  const balanceFromTransactions = testTransactions.reduce(
    (acc, curr) =>
      curr.type === "credit"
        ? acc + curr.amount.valueInMinorUnits
        : acc - curr.amount.valueInMinorUnits,
    0
  );
  store.setState((state) => {
    const defaultAccount = state.accounts[state.defaultAccountID];
    defaultAccount.balance = {
      valueInMinorUnits: balanceFromTransactions,
      currency: defaultAccount.currency,
    };
  });
  state.updateState("transactions", arrayToRecord(testTransactions, "id"));
  // testTransactions.forEach((t) => state.upsertTransaction(t));
  state.updateState("isFirstInstall", false);
};

export default function Home() {
  const store = useContext(StoreContext)!;
  const transactionsRecord = useStoreContext(getSortedTransactionsByDate);
  // TODO: support multiple accounts with different currencies
  const account = useStoreContext((state) => state.accounts[state.defaultAccountID]);
  const isFirstInstall = useStoreContext((state) => state.isFirstInstall);
  const updateState = useStoreContext((state) => state.updateState);
  const transactionsList = Object.values(transactionsRecord);

  const [isModalOpen, setIsModalOpen] = useState(isFirstInstall);
  const [isLoading, setIsLoading] = useState(false);

  const expenses = sumTransactions(transactionsList.filter(({ type }) => type === "debit"));
  const income = sumTransactions(transactionsList.filter(({ type }) => type === "credit"));

  const handleLoadData = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    await loadInitData(store);
    updateState("isFirstInstall", false);
  };
  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-bold text-3xl mb-6">Overview</Text>
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
            <Text className="font-medium text-xl">Recent Transactions</Text>
            <Pressable className="px-2 py-1 -my-1 -mx-2 rounded-sm active:">
              <Text>View all</Text>
            </Pressable>
          </View>

          {transactionsList.slice(0, 10).map((transaction) => (
            <TransactionCard transaction={transaction} key={transaction.id} />
          ))}
        </View>
      </ScrollView>
      <AddButton />
      <AddDataModal open={isModalOpen} setOpen={setIsModalOpen} onYes={handleLoadData} />
    </ScreenWrapper>
  );
}

const AddButton = () => {
  return (
    <Link
      href="/transactions/create"
      className="absolute bottom-6 right-6 bg-primary active:bg-primary/80 p-4 rounded-2xl shadow"
    >
      <Plus className="text-primary-foreground" />
    </Link>
  );
};
