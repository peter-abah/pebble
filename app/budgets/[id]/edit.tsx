import BudgetForm, { FormSchema } from "@/components/budget-form";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney, getMoneyValueInMajorUnits } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { NonEmptyArray } from "@/lib/types";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditBudget = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const budget = useAppStore((state) => state.budgets[id]);
  const { updateBudget } = useAppStore((state) => state.actions);

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
    if (!currency || !budget) return;

    updateBudget({
      ...budget,
      name,
      amount: createMoney(amount, currency),
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
          amount: getMoneyValueInMajorUnits(budget.amount),
          currency: budget.amount.currency.isoCode,
          period: budget.period,
          accounts: budget.accounts as NonEmptyArray<string>,
          categories: budget.categories as NonEmptyArray<string>,
          color: budget.color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditBudget;
