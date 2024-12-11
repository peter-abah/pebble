import BudgetForm, { FormSchema } from "@/components/budget-form";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateBudget } from "@/db/mutations/budgets";
import { getBudgets } from "@/db/queries/budgets";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { calcMoneyValueInMajorUnits } from "@/lib/money";
import { NonEmptyArray } from "@/lib/types";
import { valueToNumber } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditBudget = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = valueToNumber(params.id);
  const {
    data: [budget],
  } = useLiveQuery(
    getBudgets({ ids: id !== undefined ? [id] : undefined, limit: id !== undefined ? 1 : 0 }),
    [id]
  );

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

  if (!budget) {
    return <ResourceNotFound title="Budget does not exist" />;
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
