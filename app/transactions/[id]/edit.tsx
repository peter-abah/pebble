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
import { Transaction } from "@/lib/types";
import { assertUnreachable } from "@/lib/utils";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

const EditTransaction = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const { updateTransaction, deleteTransaction } = useAppStore((state) => state.actions);
  const transactionMap = useAppStore((state) => state.transactions);
  const transaction = transactionMap[id];
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
    switch (type) {
      case "transfer": {
        const { from, to, exchangeRate } = data;

        const fromCurrency = accountsMap[from]?.currency;
        const toCurrency = accountsMap[to]?.currency;
        if (!fromCurrency) {
          Alert.alert("Sending account does not exist.");
          return;
        }
        if (!toCurrency) {
          Alert.alert("Receiving account does not exist.");
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
        break;
      }
      case "income":
      case "expense": {
        const { accountID, categoryID } = data;

        const currency = accountsMap[accountID]?.currency;
        if (!currency) {
          Alert.alert("Account does not exist");
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
        break;
      }
      case "lent":
      case "borrowed": {
        const { accountID, dueDate } = data;

        const currency = accountsMap[accountID]?.currency;
        if (!currency) {
          Alert.alert("Account does not exist");
          return;
        }

        updateTransaction({
          ...transaction,
          amount: createMoney(amount, currency),
          type,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          title,
          note,
          accountID,
          datetime: datetime.toISOString(),
        });
        break;
      }
      case "paid_loan":
      case "collected_debt": {
        const { accountID, loanID } = data;

        const currency = accountsMap[accountID]?.currency;
        if (!currency) {
          Alert.alert("Account does not exist");
          return;
        }
        const loanTransaction = transactionMap[loanID];
        if (!loanTransaction) {
          Alert.alert("Loan transaction does not exist");
          return;
        }
        if (loanTransaction.type !== "borrowed" && loanTransaction.type !== "lent") {
          Alert.alert("Loan transaction selected is not a loan");
          return;
        }

        updateTransaction({
          ...transaction,
          amount: createMoney(amount, currency),
          type,
          loanID: loanTransaction.id,
          title,
          note,
          accountID,
          datetime: datetime.toISOString(),
        });
        break;
      }
      default:
        assertUnreachable(type);
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
        defaultValues={getTransactionDefaultValues(transaction)}
        onSubmit={onSubmit}
      />
      <Modal />
    </ScreenWrapper>
  );
};

const getTransactionDefaultValues = (transaction: Transaction): FormSchema => {
  const baseDefaultValues = {
    title: transaction.title,
    datetime: new Date(transaction.datetime),
    note: transaction.note,

    amount: getMoneyValueInMajorUnits(transaction.amount),
  };

  const type = transaction.type;
  switch (type) {
    case "expense":
    case "income":
      return {
        ...baseDefaultValues,
        type: transaction.type,
        categoryID: transaction.categoryID,
        accountID: transaction.accountID,
      };

    case "transfer":
      return {
        ...baseDefaultValues,
        type: transaction.type,
        from: transaction.from,
        to: transaction.to,
        exchangeRate: transaction.exchangeRate.rate,
      };
    case "lent":
    case "borrowed":
      return {
        ...baseDefaultValues,
        title: transaction.title,
        type: transaction.type,
        accountID: transaction.accountID,
        dueDate: transaction.dueDate !== undefined ? new Date(transaction.dueDate) : undefined,
      };
    case "collected_debt":
    case "paid_loan":
      return {
        ...baseDefaultValues,
        accountID: transaction.accountID,
        loanID: transaction.loanID,
        type: transaction.type,
      };
    default:
      assertUnreachable(type);
  }
};

export default EditTransaction;
