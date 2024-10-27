import AccountForm, { FormSchema } from "@/components/new-account-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { CURRENCIES, createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router } from "expo-router";
import { nanoid } from "nanoid";
import { View } from "react-native";

// TODO: add timestamps to all object types in store

const CreateAccount = () => {
  const addAccount = useAppStore((state) => state.addAccount);
  const mainAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  // TODO: bad behavior
  const mainCurrency = mainAccount?.currency || CURRENCIES.NGN;

  const onSubmit = ({ name, currency: currencyID, balance, color }: FormSchema) => {
    const currency = CURRENCIES[currencyID] || mainCurrency;
    addAccount({
      id: nanoid(),
      name,
      balance: createMoney(0, currency),
      currency,
      color,
    });
    router.back();
  };

  return (
    <ScreenWrapper className="!p-6">
      <View className="flex-row gap-4 items-center my-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-3xl">New Account</Text>
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
