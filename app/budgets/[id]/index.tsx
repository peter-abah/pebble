import EmptyState from "@/components/empty-state";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { createChartData, isTransactionInBudget } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { addMoney, convertMoney, createMoney, formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Budget, Money, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";

const BudgetScreen = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const budget = useAppStore((state) => state.budgets[id]);
  const transactionsMap = useAppStore((state) => state.transactions);
  const accountsMap = useAppStore((state) => state.accounts);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const defaultAccount = accountsMap[defaultAccountID] || Object.values(accountsMap)[0]!;
  const { deleteBudget } = useAppStore((state) => state.actions);

  const budgetTransactions = useMemo(() => {
    if (!budget) return [];

    const transactions = Object.values(transactionsMap) as Array<Transaction>;
    return transactions.filter((t) => isTransactionInBudget(t, budget));
  }, [transactionsMap, budget]);

  const amountSpent = useMemo(
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

          // TODO: support for income transactions maybe minus
          return addMoney(result, convertedAmount);
        }

        // todo: inform about skipped transaction due to no exchange rate
        return result;
      }, createMoney(0, budget?.amount.currency || defaultAccount.currency)),
    [budget?.amount.currency, defaultAccount.currency, budgetTransactions, exchangeRates]
  );

  const onDelete = () => {
    if (!budget) return;

    deleteBudget(budget.id);
    router.back();
  };
  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${budget?.name} budget.`,
    onConfirm: onDelete,
  });

  const ratio = amountSpent.valueInMinorUnits / (budget?.amount.valueInMinorUnits || 1);

  if (!budget) {
    return <ResourceNotFound title="Budget does not exist" />;
  }
  return (
    <ScreenWrapper className="pb-6">
      <View className="flex-row gap-4 items-center px-6 py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">{budget.name}</Text>

        <View className="items-center flex-row ml-auto gap-3">
          <Link href={`/budgets/${budget.id}/edit`} asChild>
            <Button
              className="rounded-full p-0 active:bg-accent items-center justify-center"
              variant="ghost"
              size="icon"
            >
              <PencilIcon className="text-foreground" size={24} />
            </Button>
          </Link>

          <Button
            className="rounded-full p-0 active:bg-accent ml-auto items-center justify-center"
            variant="ghost"
            onPress={openDeleteModal}
            size="icon"
          >
            <TrashIcon className="text-foreground" size={24} />
          </Button>
        </View>
      </View>

      <View className="px-6 py-4 gap-2">
        <Text className="text-neutral-600">
          <Text className="text-lg font-semibold">{formatMoney(amountSpent)}</Text>{" "}
          {ratio < 1 ? "spent" : "overspent"} of {formatMoney(budget.amount)}
        </Text>

        <View className="flex-row gap-4">
          <View
            className="relative flex-1 rounded-full h-5"
            style={{ backgroundColor: budget.color + "22" }}
          >
            <View
              className="h-full rounded-3xl bg-destructive"
              style={{
                width: `${ratio < 1 ? ratio * 100 : 100}%`,
                ...(ratio < 1 && { backgroundColor: budget.color }),
              }}
            />
          </View>
          <Text className={cn("font-medium", ratio > 1 && "text-destructive")}>
            {(ratio * 100).toFixed(2)}%
          </Text>
        </View>
      </View>

      {budgetTransactions.length > 0 ? (
        <View className="px-6 py-4 gap-2">
          <Text className="font-medium">Spending by Categories</Text>
          <BudgetChart transactions={budgetTransactions} total={amountSpent} budget={budget} />
        </View>
      ) : null}

      <FlatList
        data={budgetTransactions}
        ListHeaderComponent={<Text className="text-lg font-medium">Transactions</Text>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        className="flex-1 px-6 py-4"
        ListEmptyComponent={<EmptyState title="No transactions to show" />}
      />
      <DeleteModal />
    </ScreenWrapper>
  );
};

const BudgetChart = ({
  transactions,
  budget,
  total,
}: {
  transactions: Array<Transaction>;
  budget: Budget;
  total: Money;
}) => {
  const categoryMap = useAppStore((state) => state.categories);
  const exchangeRates = useAppStore((state) => state.exchangeRates);

  const chartData = createChartData(transactions, budget.amount.currency, exchangeRates);
  if (chartData.length < 1) {
    return null;
  }

  return (
    <View className="items-center gap-2">
      <PieChart
        data={chartData}
        donut
        centerLabelComponent={() => (
          <Text className="font-semibold text-sm">{formatMoney(total)}</Text>
        )}
      />
      <View className="flex-row items-center justify-center gap-4">
        {chartData.map((dataItem) => {
          const category = categoryMap[dataItem.categoryID];
          if (!category) return null;

          return (
            <View key={category.id} className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full" style={{ backgroundColor: dataItem.color }} />
              <Text className="text-xs">{category.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default BudgetScreen;
