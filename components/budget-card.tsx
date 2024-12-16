import { Text } from "@/components/ui/text";
import { QueryBudget } from "@/db/queries/budgets";
import { getTransactions } from "@/db/queries/transactions";
import { calculateAmountSpentInBudget } from "@/lib/app-utils";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";

export const BudgetCard = ({ budget }: { budget: QueryBudget }) => {
  const exchangeRates = useAppStore((state) => state.exchangeRates);

  const budgetCategoriesIDs =
    budget && budget.budgetsToCategories.map(({ category_id }) => category_id);
  const budgetAccountsIDs = budget && budget.budgetsToAccounts.map(({ account_id }) => account_id);
  const budgetPeriod = budget?.period ? { date: dayjs(), period: budget.period } : undefined;
  const { data: budgetTransactions, isError: isBudgetTransactionsError } = useQuery({
    queryKey: [
      "transactions",
      {
        categories: budgetCategoriesIDs,
        accounts: budgetAccountsIDs,
        period: budgetPeriod,
        type: "expense",
      },
    ],
    queryFn: async () =>
      await getTransactions({
        categories: budgetCategoriesIDs,
        accounts: budgetAccountsIDs,
        period: budgetPeriod,
        types: ["expense"],
        limit: budget ? undefined : 0,
      }),
    initialData: [],
  });

  const amountSpent = calculateAmountSpentInBudget(budget, budgetTransactions, exchangeRates);
  const ratio = amountSpent.valueInMinorUnits / budget.amount_value_in_minor_units;

  if (isBudgetTransactionsError) {
    return (
      <View className="px-6 py-2">
        <Text className="text-xl">An error occured fetching budget daa</Text>
      </View>
    );
  }

  return (
    <Link href={`/budgets/${budget.id}`} asChild>
      <Pressable className="px-6 py-2 rounded-xl gap-1 hover:bg-neutral-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{budget.name}</Text>
          <Text>
            {formatMoney({
              valueInMinorUnits: budget.amount_value_in_minor_units,
              currencyCode: budget.currency_code,
            })}
          </Text>
        </View>
        <View className="flex-row gap-4">
          <View
            className="relative flex-1 rounded-full h-3 bg-destructive/50"
            style={ratio < 1 ? { backgroundColor: budget.color + "22" } : undefined}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${ratio < 1 ? ratio * 100 : (1 / ratio) * 100}%`,
                backgroundColor: budget.color,
              }}
            />
          </View>
          <Text className={cn("text-sm font-medium", ratio > 1 && "text-destructive")}>
            {(ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

BudgetCard.displayName = "BudgetCard";
