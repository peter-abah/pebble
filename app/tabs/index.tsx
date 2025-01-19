import { AccountCard } from "@/components/account-card";
import FloatingAddButton from "@/components/floating-add-button";
import { PlaceholderBlock } from "@/components/placeholder-block";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Text } from "@/components/ui/text";
import { getAccounts } from "@/db/queries/accounts";
import { getTransactions } from "@/db/queries/transactions";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function Home() {
  const { data: transactions, isError: isTransactionsError } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions({ sortBy: [{ column: "datetime", type: "desc" }], limit: 10 }),
    initialData: [],
  });
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts({ limit: 2 }),
    initialData: [],
  });

  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-sans_bold text-3xl mb-6">Home</Text>
        <View>
          <View className="gap-2 flex-row">
            {isAccountsError ? (
              <View className="rounded-xl p-4 border border-border flex-1">
                <Text className="text-lg font-sans_medium">An error occured fetching accounts</Text>
              </View>
            ) : (
              accounts.map((account) => (
                <Link href={`/accounts/${account.id}`} asChild key={account.id}>
                  <AccountCard account={account} />
                </Link>
              ))
            )}
          </View>
          {accounts.length > 2 && (
            <Link href="/accounts" asChild>
              <Pressable className="px-2 py-1 mt-1 ml-auto -mx-2 rounded-sm active:bg-muted flex-row gap-1 items-center">
                <Text>view all accounts</Text>
                <MaterialIcons name="arrow-right-alt" className="text-foreground" size={16} />
              </Pressable>
            </Link>
          )}
        </View>

        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-sans_medium text-xl">Transactions</Text>
            <Link
              href="/tabs/transactions"
              className="px-2 py-1 -my-1 -mx-2 rounded-sm active:bg-muted"
            >
              <Text>See all</Text>
            </Link>
          </View>

          {isTransactionsError ? (
            <PlaceholderBlock
              title="An error occured fetching transactions"
              icon={<MaterialIcons name="error" size={100} className="text-muted-foreground" />}
            />
          ) : (
            transactions.map((transaction) => (
              <Link
                href={
                  transaction.type === "lent" || transaction.type === "borrowed"
                    ? `/loans/${transaction.id}`
                    : `/transactions/${transaction.id}/edit`
                }
                asChild
                key={transaction.id}
              >
                <TransactionCard transaction={transaction} />
              </Link>
            ))
          )}
        </View>
      </ScrollView>
      <Link href="/transactions/new" asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
}
