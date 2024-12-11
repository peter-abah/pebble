import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { db } from "@/db/client";
import { deleteTransaction, updateTransaction } from "@/db/mutations/transactions";
import { getAccounts } from "@/db/queries/accounts";
import { getTransactions } from "@/db/queries/transactions";
import { SchemaTransaction, transactionsTable } from "@/db/schema";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { TrashIcon } from "@/lib/icons/Trash";
import {
  calcMoneyValueInMajorUnits,
  calcMoneyValueInMinorUnits,
  convertTransactionAmountToMoney,
} from "@/lib/money";
import { arrayToMap, assertUnreachable, valueToDate, valueToNumber } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, View } from "react-native";

const EditTransaction = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: [transaction],
  } = useLiveQuery(
    getTransactions({
      ids: id !== undefined ? [id] : undefined,
      limit: id !== undefined ? 1 : undefined,
    })
  );
  const { data: accounts } = useLiveQuery(getAccounts());
  const accountsMap = useMemo(() => arrayToMap(accounts, ({ id }) => id), [accounts]);

  const onDelete = async () => {
    if (!transaction) return;

    await deleteTransaction(transaction.id);
    router.back();
  };

  const { Modal, openModal } = usePromptModal({
    title: "Are you sure you want to delete this transaction?",
    onConfirm: onDelete,
  });

  const onSubmit = async (data: FormSchema) => {
    if (!transaction) return;

    const { amount, title, note, type, datetime } = data;

    switch (type) {
      case "transfer": {
        const { from, to, exchangeRate } = data;

        const fromCurrencyCode = accountsMap[from]?.currency_code || "";
        const toCurrencyCode = accountsMap[to]?.currency_code || "";
        if (!CURRENCIES_MAP[fromCurrencyCode]) {
          Alert.alert("Sending account does not have a currency");
          return;
        }
        if (!CURRENCIES_MAP[toCurrencyCode]) {
          Alert.alert("Receiving account does not have a currency");
          return;
        }

        updateTransaction(transaction.id, {
          amount_value_in_minor_units: calcMoneyValueInMinorUnits(amount, fromCurrencyCode),
          type,
          from_account_id: from,
          to_account_id: to,
          title,
          note,
          datetime: datetime.toISOString(),
          exchange_rate: exchangeRate,
        });
        break;
      }
      case "income":
      case "expense": {
        const { accountID, categoryID } = data;

        const currencyCode = accountsMap[accountID]?.currency_code || "";
        if (!CURRENCIES_MAP[currencyCode]) {
          Alert.alert("Account does not have a currency");
          return;
        }

        updateTransaction(transaction.id, {
          amount_value_in_minor_units: calcMoneyValueInMinorUnits(amount, currencyCode),
          amount_currency_code: currencyCode,
          type,
          category_id: categoryID,
          title,
          note,
          account_id: accountID,
          datetime: datetime.toISOString(),
        });
        break;
      }
      case "lent":
      case "borrowed": {
        const { accountID, dueDate } = data;

        const currencyCode = accountsMap[accountID]?.currency_code || "";
        if (!CURRENCIES_MAP[currencyCode]) {
          Alert.alert("Account does not have a currency");
          return;
        }

        updateTransaction(transaction.id, {
          amount_value_in_minor_units: calcMoneyValueInMinorUnits(amount, currencyCode),
          amount_currency_code: currencyCode,
          type,
          due_date: dueDate ? dueDate.toISOString() : undefined,
          title,
          note,
          account_id: accountID,
          datetime: datetime.toISOString(),
        });
        break;
      }
      case "paid_loan":
      case "collected_debt": {
        const { accountID, loanID } = data;

        const currencyCode = accountsMap[accountID]?.currency_code || "";
        if (!CURRENCIES_MAP[currencyCode]) {
          Alert.alert("Account does not have a currency");
          return;
        }

        const [loanTransaction] = await db
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable, loanID));
        if (!loanTransaction) {
          Alert.alert("Loan transaction does not exist");
          return;
        }
        if (loanTransaction.type !== "borrowed" && loanTransaction.type !== "lent") {
          Alert.alert("Transaction selected is not a loan transaction");
          return;
        }

        updateTransaction(transaction.id, {
          amount_value_in_minor_units: calcMoneyValueInMinorUnits(amount, currencyCode),
          amount_currency_code: currencyCode,
          type,
          loan_id: loanTransaction.id,
          title,
          note,
          account_id: accountID,
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

const getTransactionDefaultValues = (transaction: SchemaTransaction): FormSchema => {
  const baseDefaultValues = {
    title: transaction.title || undefined,
    datetime: valueToDate(transaction.datetime) || new Date(),
    note: transaction.note || undefined,
    amount: calcMoneyValueInMajorUnits(convertTransactionAmountToMoney(transaction)),
  };

  const type = transaction.type;
  switch (type) {
    case "expense":
    case "income":
      return {
        ...baseDefaultValues,
        type: type,
        categoryID: transaction.category_id!,
        accountID: transaction.account_id!,
      };

    case "transfer":
      return {
        ...baseDefaultValues,
        type: type,
        from: transaction.from_account_id!,
        to: transaction.to_account_id!,
        exchangeRate: transaction.exchange_rate!,
      };
    case "lent":
    case "borrowed":
      return {
        ...baseDefaultValues,
        title: transaction.title!,
        type: type,
        accountID: transaction.account_id!,
        dueDate: valueToDate(transaction.due_date),
      };
    case "collected_debt":
    case "paid_loan":
      return {
        ...baseDefaultValues,
        accountID: transaction.account_id!,
        loanID: transaction.loan_id!,
        type: type,
      };
    default:
      assertUnreachable(type);
  }
};

export default EditTransaction;
