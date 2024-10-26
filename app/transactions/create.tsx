import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { CURRENCIES, createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { nanoid } from "nanoid";
import { View } from "react-native";

const CreateTransaction = () => {
  const createTransaction = useAppStore((state) => state.upsertTransaction);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const accountsMap = useAppStore((state) => state.accounts);
  const { accountID: paramsAccountID } = useLocalSearchParams<{ accountID?: string }>();

  const onSubmit = ({ amount, title, note, accountID, type, categoryID, datetime }: FormSchema) => {
    // TODO: you know
    const currency = accountsMap[accountID]?.currency || CURRENCIES.NGN;
    createTransaction({
      id: nanoid(),
      amount: createMoney(amount, currency),
      type,
      categoryID,
      title,
      note,
      accountID,
      datetime: datetime.toISOString(),
    });
    router.back();
  };

  return (
    <ScreenWrapper className="!py-6">
      <View className="flex-row gap-4 px-6 items-center my-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-3xl">Add transaction</Text>
      </View>

      <TransactionForm
        defaultValues={{
          title: "",
          datetime: new Date(),
          note: "",
          type: "debit",
          accountID: paramsAccountID || defaultAccountID,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateTransaction;
