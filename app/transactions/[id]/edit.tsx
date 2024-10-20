import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { TrashIcon } from "@/lib/icons/Trash";
import { createMoney, getMoneyValueInMajorUnits } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const CreateTransaction = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const updateTransaction = useAppStore((state) => state.upsertTransaction);
  const deleteTransaction = useAppStore((state) => state.deleteTransaction);
  const transaction = useAppStore((state) => state.transactions[id]);
  const mainAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  const currency = mainAccount.currency;

  const onSubmit = ({ amount, title, note, type, categoryID, datetime }: FormSchema) => {
    updateTransaction({
      id: transaction.id,
      amount: createMoney(amount, currency),
      type,
      categoryID,
      title,
      note,
      accountID: transaction.accountID,
      datetime: datetime.toISOString(),
    });
    router.replace("/");
  };

  const onDelete = () => {
    deleteTransaction(transaction.id);
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
        <Text className="font-bold text-3xl">Edit transaction</Text>
        <Button
          onPress={onDelete}
          className="ml-auto rounded-full p-0 active:bg-accent -mr-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <TrashIcon className="text-foreground" size={28} />
        </Button>
      </View>

      <TransactionForm
        defaultValues={{
          title: transaction.title,
          datetime: new Date(transaction.datetime),
          note: transaction.note,
          categoryID: transaction.categoryID,
          type: transaction.type,
          amount: getMoneyValueInMajorUnits(transaction.amount),
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateTransaction;
