import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Merge, StringifyValues, Transaction } from "@/lib/types";
import { assertUnreachable, isStringNumeric } from "@/lib/utils";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

type Params = Partial<StringifyValues<Merge<Transaction>, "amount" | "exchangeRate" | "type">>;
const CreateTransaction = () => {
  const { addTransaction } = useAppStore((state) => state.actions);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const accountsMap = useAppStore((state) => state.accounts);
  const transactionMap = useAppStore((state) => state.transactions);
  const params = useLocalSearchParams<Params>();

  const onSubmit = (data: FormSchema) => {
    const { amount, title, note, type, datetime } = data;
    switch (type) {
      case "transfer": {
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
        break;
      }
      case "income":
      case "expense": {
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

        addTransaction({
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

        addTransaction({
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
        defaultValues={getDefaultValuesFromParams(params, defaultAccountID)}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

const getDefaultValuesFromParams = (params: Params, mainAccountID: string): Partial<FormSchema> => {
  const baseDefaultValues = {
    title: params.title || "",
    datetime: params.datetime ? new Date(params.datetime) : new Date(),
    note: params.note || "",
    amount: params.amount && isStringNumeric(params.amount) ? Number(params.amount) : undefined,
  };

  switch (params.type) {
    case "expense":
    case "income":
      return {
        ...baseDefaultValues,
        type: params.type,
        categoryID: params.categoryID,
        accountID: params.accountID || mainAccountID,
      };

    case "transfer":
      return {
        ...baseDefaultValues,
        type: params.type,
        from: params.from || mainAccountID,
        to: params.to,
        exchangeRate:
          params.exchangeRate && isStringNumeric(params.exchangeRate)
            ? Number(params.exchangeRate)
            : undefined,
      };
    case "lent":
    case "borrowed":
      return {
        ...baseDefaultValues,
        title: params.title,
        type: params.type,
        accountID: params.accountID || mainAccountID,
        dueDate: params.dueDate !== undefined ? new Date(params.dueDate) : undefined,
      };
    case "collected_debt":
    case "paid_loan":
      return {
        ...baseDefaultValues,
        accountID: params.accountID || mainAccountID,
        loanID: params.loanID,
        type: params.type,
      };
    default:
      return { ...baseDefaultValues, type: "expense", accountID: mainAccountID };
  }
};
export default CreateTransaction;
