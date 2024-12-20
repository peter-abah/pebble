import BudgetForm, { FormSchema } from "@/components/budget-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { GROUP_COLORS } from "@/lib/constants";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { randomElement } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";

const CreateBudget = () => {
  const { addBudget } = useAppStore((state) => state.actions);
  const accountsMap = useAppStore((state) => state.accounts);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const defaultAccount = accountsMap[defaultAccountID] || Object.values(accountsMap)[0]!;

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
    if (!currency) return;

    addBudget({
      name,
      amount: createMoney(amount, currency),
      color,
      period,
      categories,
      accounts,
    });

    router.back();
  };

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
        <Text className="font-bold text-2xl">New Budget</Text>
      </View>

      <BudgetForm
        defaultValues={{
          name: "",
          amount: 0,
          currency: defaultAccount.currency.isoCode,
          color: randomElement(GROUP_COLORS).color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateBudget;
