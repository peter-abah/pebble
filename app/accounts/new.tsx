import AccountForm, { FormSchema } from "@/components/new-account-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { insertAccount } from "@/db/mutations/accounts";
import { insertTransaction } from "@/db/mutations/transactions";
import { GROUP_COLORS } from "@/lib/constants";
import { BALANCE_CREDIT_CATEGORY_ID } from "@/lib/data";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { queryClient } from "@/lib/react-query";
import { randomElement } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";

const CreateAccount = () => {
  const onSubmit = async ({ name, currencyCode, balance, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyCode];
    if (!currency) return;

    const account = await insertAccount({
      name,
      balance_value_in_minor_units: 0,
      currency_code: currencyCode,
      color,
    });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

    if (balance && balance > 0) {
      await insertTransaction({
        title: "Initial account balance",
        app_category_id: BALANCE_CREDIT_CATEGORY_ID,
        account_id: account.id,
        amount_value_in_minor_units: balance * 10 ** currency.minorUnit,
        amount_currency_code: currency.isoCode,
        type: "income",
        datetime: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
