import BudgetForm, { FormSchema } from "@/components/budget-form";
import { ErrorScreen } from "@/components/error-screen";
import { Loader } from "@/components/loader";
import { PlaceholderBlock } from "@/components/placeholder-block";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateBudget } from "@/db/mutations/budgets";
import { getBudget } from "@/db/queries/budgets";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { calcMoneyValueInMajorUnits } from "@/lib/money";
import { queryClient } from "@/lib/react-query";
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
    queryFn: async () => (id ? (await getBudget(id)) ?? null : null),
  });

  const onSubmit = async ({
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

    await updateBudget(budget.id, {
      name,
      amount_value_in_minor_units: amount * 10 ** currency.minorUnit,
      currency_code: currencyID,
      color,
      period,
      categories,
      accounts,
    });
    queryClient.invalidateQueries({ queryKey: ["budgets"] });

    router.back();
  };

  if (isBudgetError) {
    return <ErrorScreen title="An error occured fetching budget" />;
  }

  if (isBudgetPending) {
    return <PlaceholderBlock title="Loading..." icon={<Loader />} />;
  }

  if (!budget) {
    return <ErrorScreen title="Budget not found" />;
  }

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center pt-8 pb-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-sans_bold text-2xl">Edit Budget</Text>
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
