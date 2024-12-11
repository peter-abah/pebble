import ScreenWrapper from "@/components/screen-wrapper";
import TransactionForm, { FormSchema } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { db } from "@/db/client";
import { insertTransaction } from "@/db/mutations/transactions";
import { getAccounts, getMainAccount } from "@/db/queries/accounts";
import { SchemaAccount, SchemaTransaction, transactionsTable } from "@/db/schema";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { calcMoneyValueInMinorUnits } from "@/lib/money";
import { StringifyValues } from "@/lib/types";
import { arrayToMap, assertUnreachable, valueToDate, valueToNumber } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, View } from "react-native";

type Params = Partial<
  StringifyValues<SchemaTransaction, keyof SchemaTransaction> & { amount: string }
>;
const CreateTransaction = () => {
  const params = useLocalSearchParams<Params>();
  const { data: accounts } = useLiveQuery(getAccounts());
  const accountsMap = useMemo(() => arrayToMap(accounts, ({ id }) => id), [accounts]);
  const { data } = useLiveQuery(getMainAccount());
  const mainAccount = data?.account;
  if (!mainAccount) {
    //todo: alert and redirect to set main account
    throw new Error("You should have a main account");
  }

  const onSubmit = async (data: FormSchema) => {
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

        await insertTransaction({
          amount_value_in_minor_units: amount * 10 ** 2,
          amount_currency_code: fromCurrencyCode,
          type,
          from_account_id: from,
          to_account_id: to,
          title,
          note,
          exchange_rate: exchangeRate,
          datetime: datetime.toISOString(),
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

        await insertTransaction({
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

        await insertTransaction({
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

        insertTransaction({
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
        defaultValues={getDefaultValuesFromParams(params, mainAccount.id)}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

const getDefaultValuesFromParams = (
  params: Params,
  mainAccountID: SchemaAccount["id"]
): Partial<FormSchema> => {
  const baseDefaultValues = {
    title: params.title || "",
    datetime: valueToDate(params.datetime) || new Date(),
    note: params.note || "",
    amount: valueToNumber(params.amount),
  };

  switch (params.type) {
    case "expense":
    case "income":
      return {
        ...baseDefaultValues,
        type: params.type,
        categoryID: valueToNumber(params.category_id),
        accountID: valueToNumber(params.account_id) || mainAccountID,
      };

    case "transfer":
      return {
        ...baseDefaultValues,
        type: params.type,
        from: valueToNumber(params.from_account_id) || mainAccountID,
        to: valueToNumber(params.to_account_id),
        exchangeRate: valueToNumber(params.exchange_rate),
      };
    case "lent":
    case "borrowed": {
      return {
        ...baseDefaultValues,
        title: params.title,
        type: params.type,
        accountID: valueToNumber(params.account_id) || mainAccountID,
        dueDate: valueToDate(params.due_date),
      };
    }
    case "collected_debt":
    case "paid_loan":
      return {
        ...baseDefaultValues,
        accountID: valueToNumber(params.account_id) || mainAccountID,
        loanID: valueToNumber(params.loan_id),
        type: params.type,
      };
    default:
      return { ...baseDefaultValues, type: "expense", accountID: mainAccountID };
  }
};
export default CreateTransaction;
