import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import { usePromptModal } from "@/components/prompt-modal";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import TransactionCard from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { deleteTransaction } from "@/db/mutations/transactions";
import { getTransaction } from "@/db/queries/transactions";
import { calculateAmountPaidInLoan, renderDate } from "@/lib/app-utils";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { PencilIcon } from "@/lib/icons/Pencil";
import { TrashIcon } from "@/lib/icons/Trash";
import { convertTransactionAmountToMoney, formatMoney } from "@/lib/money";
import { queryClient } from "@/lib/react-query";
import { useAppStore } from "@/lib/store";
import { cn, valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";

const LoanScreen = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: loan,
    isPending: isLoanPending,
    isError: isLoanError,
  } = useQuery({
    queryKey: ["transactions", id],
    queryFn: () => (id ? getTransaction(id) : undefined),
  });

  const exchangeRates = useAppStore((state) => state.exchangeRates);

  const onDelete = async () => {
    if (!loan) return;

    await deleteTransaction(loan.id);
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    // change in transactions updates account balance
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

    router.back();
  };
  const { Modal: DeleteModal, openModal: openDeleteModal } = usePromptModal({
    title: `Are you sure you want to delete ${loan?.title} loan.`,
    onConfirm: onDelete,
  });

  if (isLoanPending) {
    return (
      <EmptyState
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }

  if (isLoanError) {
    return <ResourceNotFound title="An error occured fetching loan" />;
  }

  if (!loan) {
    return <ResourceNotFound title="Loan does not exist" />;
  }

  if (loan.type !== "borrowed" && loan.type !== "lent") {
    return <Redirect href={`/transactions/${loan.id}/edit`} />;
  }

  const today = dayjs();
  const isOverdue = loan.due_date ? today.isAfter(dayjs(loan.due_date)) : false;
  const amountPaid = calculateAmountPaidInLoan(loan, exchangeRates);
  const ratio = amountPaid.valueInMinorUnits / loan.amount_value_in_minor_units;

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
              {formatMoney(convertTransactionAmountToMoney(loan))} ({formatMoney(amountPaid)} paid)
            </Text>
          </Text>

          {loan.due_date && (
            <Text className={cn("text-lg", isOverdue && "text-red-700")}>
              {isOverdue ? "Overdue: " : "Due: "}
              {renderDate(loan.due_date)}
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
        data={loan.loanPaymentTransactions}
        ListHeaderComponent={
          <View className="flex-row justify-between">
            <Text className="text-lg font-medium">Payments</Text>
            <Text className="text-lg font-medium">Total: {formatMoney(amountPaid)}</Text>
          </View>
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/transactions/${item.id}/edit`} asChild>
            <TransactionCard transaction={item} />
          </Link>
        )}
        className="flex-1 px-6 py-4"
        ListEmptyComponent={<EmptyState title="No payments to show" />}
      />

      <Link
        href={`/transactions/new?loan_id=${loan.id}&type=${
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
