import FloatingAddButton from "@/components/floating-add-button";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getAccounts } from "@/db/queries/accounts";
import { getTransactions } from "@/db/queries/transactions";
import { DEFAULT_GROUP_COLOR } from "@/lib/constants";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { formatMoney } from "@/lib/money";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function Home() {
  const { data } = useLiveQuery(
    getTransactions({ sortBy: [{ column: "datetime", type: "desc" }], limit: 10 })
  );

  const { data: accounts } = useLiveQuery(getAccounts({ limit: 2 }));

  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-bold text-3xl mb-6">Home</Text>
        <View>
          <View className="gap-2 flex-row">
            {accounts.map((account) => (
              <Link href={`/accounts/${account.id}`} asChild key={account.id}>
                <Button
                  className="h-auto p-4 flex-1 items-start justify-start gap-1 rounded-xl shrink-0"
                  style={{
                    backgroundColor: account.color || DEFAULT_GROUP_COLOR.color,
                  }}
                >
                  <Text className="text-primary-foreground font-medium">{account.name}</Text>
                  <Text className="font-bold text-2xl text-primary-foreground" numberOfLines={1}>
                    {formatMoney({
                      valueInMinorUnits: account.balance_value_in_minor_units,
                      currencyCode: account.currency_code,
                    })}
                  </Text>
                </Button>
              </Link>
            ))}
          </View>
          <Link href="/accounts" asChild>
            <Pressable className="px-2 py-1 mt-1 ml-auto -mx-2 rounded-sm active:bg-muted flex-row gap-1 items-center">
              <Text>view accounts</Text>
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

          {data.map((transaction) => (
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
          ))}
        </View>
      </ScrollView>
      <Link href="/transactions/new" asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
}
