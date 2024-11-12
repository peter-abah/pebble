import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { TrashIcon } from "@/lib/icons/Trash";
import { createMoney, getMoneyValueInMajorUnits } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

const EditTransaction = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const { updateTransaction, deleteTransaction } = useAppStore((state) => state.actions);
  const transaction = useAppStore((state) => state.transactions[id]);
  const accountsMap = useAppStore((state) => state.accounts);

  const onDelete = () => {
    if (!transaction) return;

    deleteTransaction(transaction.id);
    router.back();
  };

  const { Modal, openModal } = usePromptModal({
    title: "Are you sure you want to delete this transaction?",
    onConfirm: onDelete,
  });

  const onSubmit = (data: FormSchema) => {
    if (!transaction) return;

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

      updateTransaction({
        ...transaction,
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

      updateTransaction({
        ...transaction,
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

  if (!transaction) {
    return <ResourceNotFound title="Transaction does not exist" />;
  }

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center px-6 py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Edit transaction</Text>
        <Button
          onPress={openModal}
          className="ml-auto rounded-full p-0 active:bg-accent -mr-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <TrashIcon className="text-foreground" size={24} />
        </Button>
      </View>

      <TransactionForm
        defaultValues={{
          title: transaction.title,
          datetime: new Date(transaction.datetime),
          note: transaction.note,
          type: transaction.type,
          amount: getMoneyValueInMajorUnits(transaction.amount),
          ...(transaction.type === "transfer"
            ? {
                from: transaction.from,
                to: transaction.to,
                exchangeRate: transaction.exchangeRate.rate,
              }
            : { categoryID: transaction.categoryID, accountID: transaction.accountID }),
        }}
        onSubmit={onSubmit}
      />
      <Modal />
    </ScreenWrapper>
  );
};

export default EditTransaction;
