import { ErrorScreen } from "@/components/error-screen";
import { Loader } from "@/components/loader";
import { PlaceholderBlock } from "@/components/placeholder-block";
import { usePromptModal } from "@/components/prompt-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { deleteBudget } from "@/db/mutations/budgets";
import { getBudget, QueryBudget } from "@/db/queries/budgets";
import { getTransactions, QueryTransaction } from "@/db/queries/transactions";
import { calculateAmountSpentInBudget, createChartData } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { formatMoney } from "@/lib/money";
import { queryClient } from "@/lib/react-query";
import { useAppStore } from "@/lib/store";
import { Money } from "@/lib/types";
import { arrayToMap, cn, valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

// todo: see previos periods
const BudgetScreen = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);

  const {
    data: budget,
    isPending: isBudgetPending,
    isError: isBudgetError,
  } = useQuery({
    queryKey: ["budgets", id],
    queryFn: async () => (id ? (await getBudget(id)) ?? null : null),
  });

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
        categories: budgetCategoriesIDs || undefined,
        accounts: budgetAccountsIDs || undefined,
        period: budgetPeriod,
        types: ["expense"],
        limit: budget ? undefined : 0,
      }),
    initialData: [],
  });

  const handleDelete = async () => {
    if (!budget) return;

    await deleteBudget(budget.id);
    queryClient.invalidateQueries({ queryKey: ["budgets"] });

    router.back();
  };

  if (isBudgetError || isBudgetTransactionsError) {
    return <ErrorScreen title="An error occured fetching budget" />;
  }

  if (isBudgetPending) {
    return <PlaceholderBlock title="Loading..." icon={<Loader />} />;
  }

  if (!budget) {
    return <ErrorScreen title="Budget not found" />;
  }

  return (
    <BudgetView budget={budget} budgetTransactions={budgetTransactions} onDelete={handleDelete} />
  );
};

interface BudgetViewProps {
  budget: QueryBudget;
  budgetTransactions: Array<QueryTransaction>;
  onDelete: () => void;
}
const BudgetView = ({ budget, budgetTransactions, onDelete }: BudgetViewProps) => {
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${budget.name} budget.`,
    onConfirm: onDelete,
  });

  const amountSpent = calculateAmountSpentInBudget(budget, budgetTransactions, exchangeRates);
  const ratio = amountSpent.valueInMinorUnits / (budget?.amount_value_in_minor_units || 1);

  return (
    <ScreenWrapper className="pb-6">
      <View className="flex-row gap-4 items-center px-6 pt-8 pb-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-sans_bold text-2xl">{budget.name}</Text>

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
          <Text className="text-lg font-sans_semibold">{formatMoney(amountSpent)}</Text>{" "}
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
          <Text className={cn("font-sans_medium", ratio > 1 && "text-destructive")}>
            {(ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
          </Text>
        </View>
      </View>

      {budgetTransactions.length > 0 ? (
        <View className="px-6 py-4 gap-2">
          <Text className="font-sans_medium">Spending by Categories</Text>
          <BudgetChart transactions={budgetTransactions} total={amountSpent} budget={budget} />
        </View>
      ) : null}

      <FlatList
        data={budgetTransactions}
        ListHeaderComponent={<Text className="text-lg font-sans_medium">Transactions</Text>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/transactions/${item.id}/edit`} asChild>
            <TransactionCard transaction={item} />
          </Link>
        )}
        className="flex-1 px-6 py-4"
        ListEmptyComponent={<PlaceholderBlock title="No transactions to show" />}
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

  const categories = budget.budgetsToCategories.map(({ category }) => category);
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
          <Text className="font-sans_semibold text-sm">{formatMoney(total)}</Text>
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
