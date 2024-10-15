import ScreenWrapper from "@/components/screen-wrapper";
import { Text } from "@/components/ui/text";
import { Plus } from "@/lib/icons/Plus";
import { CURRENCIES, addMoney, createMoney, formatMoney } from "@/lib/money";
import { getSortedTransactionsByDate } from "@/lib/store";
import { useStoreContext } from "@/lib/store-context";
import { Transaction } from "@/lib/types";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

const sumTransactions = (transactions: Array<Transaction>) => {
  return transactions.reduce(
    (acc, curr) => addMoney(acc, curr.amount),
    createMoney(0, CURRENCIES.NGN)
  );
};
export default function Home() {
  const transactionsRecord = useStoreContext(getSortedTransactionsByDate);
  // TODO: support multiple accounts with different currencies
  const account = useStoreContext((state) => state.accounts[state.defaultAccountID]);
  const categories = useStoreContext((state) => state.categories);
  const transactionsList = Object.values(transactionsRecord);
  const expenses = sumTransactions(transactionsList.filter(({ type }) => type === "debit"));
  const income = sumTransactions(transactionsList.filter(({ type }) => type === "credit"));

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

          {transactionsList.map((item) => (
            <Pressable
              className="flex-row items-center active:bg-background/50 px-2 py-1 rounded-lg mb-4 -mx-2"
              key={item.id}
            >
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-2">
                <Text className="text-xl font-bold">{categories[item.categoryID].name[0]}</Text>
              </View>

              <View>
                <Text className="text-lg font-semibold leading-none" numberOfLines={1}>
                  {item.title || categories[item.categoryID].name}
                </Text>
                {item.title && (
                  <Text className="font-medium  leading-none">
                    {categories[item.categoryID].name}
                  </Text>
                )}
              </View>

              <Text className=" font-bold ml-auto">{formatMoney(item.amount)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <AddButton />
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
