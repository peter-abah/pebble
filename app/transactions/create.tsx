import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

const CreateTransaction = () => {
  const { addTransaction } = useAppStore((state) => state.actions);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const accountsMap = useAppStore((state) => state.accounts);
  const { accountID: paramsAccountID } = useLocalSearchParams<{ accountID?: string }>();

  const onSubmit = (data: FormSchema) => {
    const { amount, title, note, type, datetime } = data;
    if (type === "transfer") {
      const { from, to, exchangeRate } = data;

      const fromCurrency = accountsMap[from]?.currency;
      const toCurrency = accountsMap[to]?.currency;
      if (!fromCurrency) {
        Alert.alert("Sending account does not have a currency");
        return;
      }
      if (!toCurrency) {
        Alert.alert("Receiving account does not have a currency");
        return;
      }

      addTransaction({
        amount: createMoney(amount, fromCurrency),
        type,
        from,
        to,
        title,
        note,
        exchangeRate: { from: fromCurrency, to: toCurrency, rate: exchangeRate },
        datetime: datetime.toISOString(),
      });
    } else {
      const { accountID, categoryID } = data;

      const currency = accountsMap[accountID]?.currency;
      if (!currency) {
        Alert.alert("Account does not have a currency");
        return;
      }

      addTransaction({
        amount: createMoney(amount, currency),
        type,
        categoryID,
        title,
        note,
        accountID,
        datetime: datetime.toISOString(),
      });
    }

    router.back();
  };

  return (
    <ScreenWrapper className="!py-6">
      <View className="flex-row gap-4 px-6 items-center py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Add transaction</Text>
      </View>

      <TransactionForm
        defaultValues={{
          title: "",
          datetime: new Date(),
          note: "",
          type: "expense",
          accountID: paramsAccountID || defaultAccountID,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateTransaction;
