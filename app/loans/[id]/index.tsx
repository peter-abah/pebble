import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { renderDate } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { addMoney, convertMoney, createMoney, formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { LoanPaymentTransaction, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

const LoanScreen = () => {
  const { id } = useLocalSearchParams() as { id: string };

  const transactionsMap = useAppStore((state) => state.transactions);
  const loan = transactionsMap[id];
  const accountsMap = useAppStore((state) => state.accounts);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const defaultAccountID = useAppStore((state) => state.defaultAccountID);
  const defaultAccount = accountsMap[defaultAccountID] || Object.values(accountsMap)[0]!;
  const { deleteTransaction } = useAppStore((state) => state.actions);

  const loanPaymentTransactions = useMemo(() => {
    if (!loan || (loan.type !== "borrowed" && loan.type !== "lent")) return [];

    const transactions = Object.values(transactionsMap) as Array<Transaction>;
    return transactions
      .filter((t): t is LoanPaymentTransaction => {
        if (loan.type === "lent") {
          return t.type === "collected_debt" && t.loanID === loan.id;
        }
        return t.type === "paid_loan" && t.loanID === loan.id;
      })
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [transactionsMap, loan]);

  const amountPaid = useMemo(() => {
    if (!loan) return createMoney(0, defaultAccount.currency);
    return loanPaymentTransactions.reduce((result, curr) => {
      if (result.currency.isoCode === curr.amount.currency.isoCode) {
        return addMoney(result, curr.amount);
      }

      const baseCurrencyCode = curr.amount.currency.isoCode.toLocaleLowerCase();
      const convertedCurrencyCode = result.currency.isoCode.toLocaleLowerCase();
      const exchangeRate = exchangeRates[baseCurrencyCode]?.rates[convertedCurrencyCode];
      if (exchangeRate) {
        const convertedAmount = convertMoney(curr.amount, {
          from: curr.amount.currency,
          to: result.currency,
          rate: exchangeRate,
        });

        return addMoney(result, convertedAmount);
      }

      // todo: inform about skipped transaction due to no exchange rate
      return result;
    }, createMoney(0, loan.amount.currency));
  }, [defaultAccount.currency, loan, exchangeRates, loanPaymentTransactions]);

  const onDelete = () => {
    if (!loan) return;

    deleteTransaction(loan.id);
    router.back();
  };
  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${loan?.title} loan.`,
    onConfirm: onDelete,
  });

  if (!loan) {
    return <ResourceNotFound title="Loan does not exist" />;
  }

  if (loan.type !== "borrowed" && loan.type !== "lent") {
    return <Redirect href={`/transactions/${loan.id}/edit`} />;
  }

  const today = dayjs();
  const isOverdue = loan.dueDate ? today.isAfter(dayjs(loan.dueDate)) : false;
  const ratio = amountPaid.valueInMinorUnits / loan.amount.valueInMinorUnits;

  return (
    <ScreenWrapper className="pb-6">
      <View className="flex-row gap-4 items-center px-6 py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Loan</Text>

        <View className="items-center flex-row ml-auto gap-3">
          <Link href={`/transactions/${loan.id}/edit`} asChild>
            <Button
              className="rounded-full p-0 active:bg-accent items-center justify-center"
              variant="ghost"
              size="icon"
            >
              <PencilIcon className="text-foreground" size={24} />
            </Button>
          </Link>

          <Button
            className="rounded-full p-0 active:bg-accent ml-auto items-center justify-center"
            variant="ghost"
            onPress={openDeleteModal}
            size="icon"
          >
            <TrashIcon className="text-foreground" size={24} />
          </Button>
        </View>
      </View>

      <View className="px-6 py-4 gap-2">
        <View className="gap-2">
          <Text className="text-xl">
            {loan.title}{" "}
            <Text className="text-xl">
              {formatMoney(loan.amount)} ({formatMoney(amountPaid)} paid)
            </Text>
          </Text>

          {loan.dueDate && (
            <Text className={cn("text-lg", isOverdue && "text-red-700")}>
              {isOverdue ? "Overdue: " : "Due: "}
              {renderDate(loan.dueDate)}
            </Text>
          )}
        </View>

        <View className="flex-row gap-4">
          <View className="relative flex-1 rounded-full h-5 bg-primary/20">
            <View
              className={cn("h-full rounded-3xl bg-primary", ratio >= 1 && "bg-green-700")}
              style={{
                width: `${ratio < 1 ? ratio * 100 : 100}%`,
              }}
            />
          </View>
          <Text className={cn("font-medium", ratio > 1 && "text-green-700")}>
            {(ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
          </Text>
        </View>
      </View>

      <FlatList
        data={loanPaymentTransactions}
        ListHeaderComponent={
          <View className="flex-row justify-between">
            <Text className="text-lg font-medium">Payments</Text>
            <Text className="text-lg font-medium">Total: {formatMoney(amountPaid)}</Text>
          </View>
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/transactions/${item.id}/edit`} asChild>
            <TransactionCard transaction={item} />
          </Link>
        )}
        className="flex-1 px-6 py-4"
        ListEmptyComponent={<EmptyState title="No payments to show" />}
      />

      {/* todo: links to create a payment transaction directly */}
      <Link
        href={`/transactions/new?loanID=${loan.id}&type=${
          loan.type === "borrowed" ? "paid_loan" : "collected_debt"
        }`}
        asChild
      >
        <FloatingAddButton />
      </Link>
      <DeleteModal />
    </ScreenWrapper>
  );
};

export default LoanScreen;
