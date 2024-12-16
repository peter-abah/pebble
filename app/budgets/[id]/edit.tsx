import BudgetForm, { FormSchema } from "@/components/budget-form";
import EmptyState from "@/components/empty-state";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateBudget } from "@/db/mutations/budgets";
import { getBudget } from "@/db/queries/budgets";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { calcMoneyValueInMajorUnits } from "@/lib/money";
import { NonEmptyArray } from "@/lib/types";
import { valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditBudget = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = valueToNumber(params.id);
  const {
    data: budget,
    isPending: isBudgetPending,
    isError: isBudgetError,
  } = useQuery({
    queryKey: ["budgets", id],
    queryFn: () => (id ? getBudget(id) : undefined),
  });

  const onSubmit = ({
    name,
    currency: currencyID,
    amount,
    period,
    color,
    accounts,
    categories,
  }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyID];
    if (!currency || !budget) {
      console.warn(`Currency with code ${currencyID} does not exist or budget with id ${id}`);
      return;
    }

    updateBudget(budget.id, {
      name,
      amount_value_in_minor_units: amount * 10 ** currency.minorUnit,
      currency_code: currencyID,
      color,
      period,
      categories,
      accounts,
    });

    router.back();
  };

  if (isBudgetError) {
    return <ResourceNotFound title="An error occured fetching budget" />;
  }

  if (isBudgetPending) {
    return (
      <EmptyState
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }

  if (!budget) {
    return <ResourceNotFound title="Budget not found" />;
  }

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Edit Budget</Text>
      </View>

      <BudgetForm
        defaultValues={{
          name: budget.name,
          amount: calcMoneyValueInMajorUnits({
            valueInMinorUnits: budget.amount_value_in_minor_units,
            currencyCode: budget.currency_code,
          }),
          currency: budget.currency_code,
          period: budget.period || undefined,
          accounts: budget.budgetsToAccounts.map(
            ({ account_id }) => account_id
          ) as NonEmptyArray<number>,
          categories: budget.budgetsToCategories.map(
            ({ category_id }) => category_id
          ) as NonEmptyArray<number>,
          color: budget.color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditBudget;
