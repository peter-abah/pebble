import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router } from "expo-router";
import { nanoid } from "nanoid";
import { View } from "react-native";

const CreateTransaction = () => {
  const createTransaction = useAppStore((state) => state.upsertTransaction);
  const mainAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  const currency = mainAccount.currency;

  const onSubmit = ({ amount, title, note, type, categoryID, datetime }: FormSchema) => {
    createTransaction({
      id: nanoid(),
      amount: createMoney(amount, currency),
      type,
      categoryID,
      title,
      note,
      accountID: mainAccount.id,
      datetime: datetime.toISOString(),
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
          <ChevronLeft className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-3xl">Add transaction</Text>
      </View>

      <TransactionForm
        defaultValues={{
          title: "",
          datetime: new Date(),
          note: "",
          categoryID: "",
          type: "debit",
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateTransaction;
