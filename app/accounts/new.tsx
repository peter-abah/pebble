import AccountForm, { FormSchema } from "@/components/new-account-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router } from "expo-router";
import { View } from "react-native";

const CreateAccount = () => {
  const { addAccount } = useAppStore((state) => state.actions);
  const mainAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  if (!mainAccount) {
    // TODO: error is too harsh maybe redirect to onboard or to create a new account
    throw new Error("Should have a default account");
  }

  const onSubmit = ({ name, currency: currencyID, balance, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyID] || mainAccount.currency;
    addAccount({
      name,
      balance: createMoney(0, currency),
      currency,
      color,
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
        <Text className="font-bold text-2xl">New Account</Text>
      </View>

      <AccountForm
        defaultValues={{
          name: "",
          balance: 0,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateAccount;
