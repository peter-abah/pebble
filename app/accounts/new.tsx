import AccountForm, { FormSchema } from "@/components/new-account-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { GROUP_COLORS } from "@/lib/constants";
import { BALANCE_CREDIT_CATEGORY_ID } from "@/lib/data";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { randomElement } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";

const CreateAccount = () => {
  const { addAccount, addTransaction } = useAppStore((state) => state.actions);

  const onSubmit = ({ name, currency: currencyID, balance, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyID];
    if (!currency) return;

    const account = addAccount({
      name,
      balance: createMoney(0, currency),
      currency,
      color,
    });

    if (balance && balance > 0) {
      addTransaction({
        title: "Initial account balance",
        categoryID: BALANCE_CREDIT_CATEGORY_ID,
        accountID: account.id,
        amount: createMoney(balance, account.currency),
        type: "income",
        datetime: new Date().toISOString(),
      });
    }
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
        <Text className="font-bold text-2xl">New Account</Text>
      </View>

      <AccountForm
        defaultValues={{
          name: "",
          balance: 0,
          color: randomElement(GROUP_COLORS).color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateAccount;
