import EmptyState from "@/components/empty-state";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { deleteBudget } from "@/db/mutations/budgets";
import { getBudgets, QueryBudget } from "@/db/queries/budgets";
import { getCategories } from "@/db/queries/categories";
import { getTransactions, QueryTransaction } from "@/db/queries/transactions";
import { calculateAmountSpentInBudget, createChartData } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Money } from "@/lib/types";
import { arrayToMap, cn, valueToNumber } from "@/lib/utils";
import dayjs from "dayjs";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link, router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const BudgetScreen = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const {
    data: [budget],
  } = useLiveQuery(
    getBudgets({ ids: id !== undefined ? [id] : undefined, limit: id !== undefined ? 1 : 0 }),
    [id]
  );

  const { data: budgetTransactions } = useLiveQuery(
    getTransactions({
      categories: budget && budget.budgetsToCategories.map(({ category_id }) => category_id),
      accounts: budget && budget.budgetsToAccounts.map(({ account_id }) => account_id),
      period: budget?.period ? { date: dayjs(), period: budget.period } : undefined,
      types: ["expense"],
      limit: budget ? undefined : 0,
    }),
    [budget]
  );

  const amountSpent = budget
    ? calculateAmountSpentInBudget(budget, budgetTransactions, exchangeRates)
    : null;

  const onDelete = () => {
    if (!budget) return;

    deleteBudget(budget.id);
    router.back();
  };

  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${budget?.name} budget.`,
    onConfirm: onDelete,
  });

  const ratio = amountSpent
    ? amountSpent.valueInMinorUnits / (budget?.amount_value_in_minor_units || 1)
    : 0;

  if (!budget || !amountSpent) {
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
          {ratio < 1 ? "spent" : "overspent"} of{" "}
          {formatMoney({
            valueInMinorUnits: budget.amount_value_in_minor_units,
            currencyCode: budget.currency_code,
          })}
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
            {(ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/transactions/${item.id}/edit`} asChild>
            <TransactionCard transaction={item} />
          </Link>
        )}
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
  transactions: Array<QueryTransaction>;
  budget: QueryBudget;
  total: Money;
}) => {
  const exchangeRates = useAppStore((state) => state.exchangeRates);

  const chartData = createChartData(
    transactions,
    budget.currency_code,
    exchangeRates,
    (t) => t.category_id || -1
  );

  const { data: categories } = useLiveQuery(
    getCategories({
      ids: chartData.map(({ key }) => {
        const id = valueToNumber(key);
        return id === undefined ? -1 : id;
      }),
      limit: chartData.length < 1 ? 0 : undefined,
    }),
    [chartData]
  );
  const categoriesMap = arrayToMap(categories, ({ id }) => id);

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
          const category = categoriesMap[dataItem.key];
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
