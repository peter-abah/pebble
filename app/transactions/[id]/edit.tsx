import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { TrashIcon } from "@/lib/icons/Trash";
import { CURRENCIES, createMoney, getMoneyValueInMajorUnits } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditTransaction = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const { updateTransaction, deleteTransaction } = useAppStore((state) => state.actions);
  const transaction = useAppStore((state) => state.transactions[id]);
  const mainAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  const currency = mainAccount?.currency || CURRENCIES.NGN;

  if (!transaction) {
    return null;
  }

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
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center px-6 py-4">
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
          accountID: transaction.accountID,
          amount: getMoneyValueInMajorUnits(transaction.amount),
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditTransaction;
