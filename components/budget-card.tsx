import { Text } from "@/components/ui/text";
import { isTransactionInBudget } from "@/lib/app-utils";
import { addMoney, convertMoney, createMoney, formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Budget, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

export const BudgetCard = ({ budget }: { budget: Budget }) => {
  const transactionsMap = useAppStore((state) => state.transactions);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const budgetTransactions = useMemo(() => {
    const transactions = Object.values(transactionsMap) as Array<Transaction>;
    return transactions.filter((t) => isTransactionInBudget(t, budget));
  }, [transactionsMap, budget]);

  const amountSpent = useMemo(
    // todo: similar logic in view budget screen
    () =>
      budgetTransactions.reduce((result, curr) => {
        if (result.currency.isoCode === curr.amount.currency.isoCode) {
          return addMoney(result, curr.amount);
        }

        const baseCurrencyCode = curr.amount.currency.isoCode.toLocaleLowerCase();
        const convertedCurrencyCode = result.currency.isoCode.toLocaleLowerCase();
        const exchangeRate = exchangeRates[baseCurrencyCode]?.rates[convertedCurrencyCode];
        if (exchangeRate) {
          const convertedAmount = convertMoney(curr.amount, {
            from: curr.amount.currency,
            to: result.currency,
            rate: exchangeRate,
          });

          return addMoney(result, convertedAmount);
        }

        // todo: inform about skipped transaction due to no exchange rate
        return result;
      }, createMoney(0, budget.amount.currency)),
    [budget.amount.currency, budgetTransactions, exchangeRates]
  );
  const ratio = amountSpent.valueInMinorUnits / budget.amount.valueInMinorUnits;
  return (
    <Link href={`/budgets/${budget.id}`} asChild>
      <Pressable className="px-6 py-2 rounded-xl gap-1 hover:bg-neutral-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{budget.name}</Text>
          <Text>{formatMoney(budget.amount)}</Text>
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
