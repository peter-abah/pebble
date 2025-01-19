import{PlaceholderBlock}from "@/components/placeholder-block";
import{ErrorScreen}from "@/components/error-screen";
import ScreenWrapper from "@/components/screen-wrapper";
import TimePeriodPicker from "@/components/time-period-picker";
import { Text } from "@/components/ui/text";
import { getMainAccount } from "@/db/queries/accounts";
import { getCategories } from "@/db/queries/categories";
import { getTransactions } from "@/db/queries/transactions";
import { createChartData } from "@/lib/app-utils";
import { CREDIT_TRANSACTION_TYPES, DEBIT_TRANSACTION_TYPES } from "@/lib/constants";
import { SPECIAL_CATEGORIES } from "@/lib/data";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { TimePeriod } from "@/lib/types";
import { arrayToMap, assertUnreachable, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Redirect } from "expo-router";
import { vars } from "nativewind";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const LENT_TRANSACTIONS_CHART_ID = "LENT_TRANSACTIONS_CHART_ID";
const BORROWED_TRANSACTIONS_CHART_ID = "BORROWED_TRANSACTIONS_CHART_ID";
const PAID_LOAN_TRANSACTIONS_CHART_ID = "PAID_LOAN_TRANSACTIONS_CHART_ID";
const COLLECTED_DEBT_TRANSACTIONS_CHART_ID = "COLLECTED_DEBT_TRANSACTIONS_CHART_ID";
const UNKNOWN_TYPE_CHART_ID = "UNKNOWN_TYPE_CHART_ID";

const Stats = () => {
  const [transactionType, setTransactionType] = useState<"minus" | "plus">("minus");
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(() => ({
    date: dayjs(),
    period: "monthly",
  }));
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const { data: transactions, isError: isTransactionsError } = useQuery({
    queryKey: [
      "transactions",
      {
        period: currentTimePeriod,
        type: transactionType,
      },
    ],
    queryFn: () =>
      getTransactions({
        period: currentTimePeriod,
        types: transactionType === "minus" ? DEBIT_TRANSACTION_TYPES : CREDIT_TRANSACTION_TYPES,
      }),
    initialData: [],
  });
  const { data: categories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    initialData: [],
  });
  const categoriesMap = useMemo(() => arrayToMap(categories, ({ id }) => id), [categories]);

  const {
    data,
    isError: isMainAccountError,
    isPending: isMainAccountPending,
  } = useQuery({
    queryKey: ["accounts", "mainAccount"],
    queryFn: () => getMainAccount(),
  });

  if (isMainAccountPending) {
    return (
      <PlaceholderBlock
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }

  if (isCategoriesError || isTransactionsError || isMainAccountError) {
    return <ErrorScreen title="An error occured fetching stats data" />;
  }

  const mainAccount = data?.account;
  if (!mainAccount) {
    // this should not occur normally
    return <Redirect href="/accounts" />;
  }

  const chartData = createChartData(transactions, mainAccount.currency_code, exchangeRates, (t) => {
    switch (t.type) {
      case "expense":
      case "income":
        return t.category_id!;
      case "lent":
        return LENT_TRANSACTIONS_CHART_ID;
      case "borrowed":
        return BORROWED_TRANSACTIONS_CHART_ID;
      case "paid_loan":
        return PAID_LOAN_TRANSACTIONS_CHART_ID;
      case "collected_debt":
        return COLLECTED_DEBT_TRANSACTIONS_CHART_ID;
      case "transfer":
        return UNKNOWN_TYPE_CHART_ID;
      default:
        assertUnreachable(t.type);
    }
  });

  const getDataLabel = (key: string | number): string => {
    if (typeof key === "number") {
      return categoriesMap[key]?.name || SPECIAL_CATEGORIES.UNKNOWN.name;
    }

    switch (key) {
      case LENT_TRANSACTIONS_CHART_ID:
        return "Lent";
      case BORROWED_TRANSACTIONS_CHART_ID:
        return "Borrowed";
      case PAID_LOAN_TRANSACTIONS_CHART_ID:
        return "Paid loan";
      case COLLECTED_DEBT_TRANSACTIONS_CHART_ID:
        return "Collected debt";
      default:
        return SPECIAL_CATEGORIES[key]?.name || SPECIAL_CATEGORIES.UNKNOWN.name;
    }
  };

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6 justify-between">
        <Text className="font-sans_semibold text-2xl">Stats</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 gap-4">
        <TimePeriodPicker timePeriod={currentTimePeriod} onValueChange={setCurrentTimePeriod} />
        <View className="flex-row bg-muted rounded-2xl">
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "minus" && "bg-primary"
            )}
            onPress={() => setTransactionType("minus")}
          >
            <Text
              className={cn(
                "text-center",
                transactionType === "minus" && "text-primary-foreground"
              )}
            >
              Expenses
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "flex-1 px-3 py-2 rounded-2xl",
              transactionType === "plus" && "bg-primary"
            )}
            onPress={() => setTransactionType("plus")}
          >
            <Text
              className={cn("text-center", transactionType === "plus" && "text-primary-foreground")}
            >
              Income
            </Text>
          </Pressable>
        </View>
        {chartData && chartData.length > 0 ? (
          <>
            <View className="justify-center flex-row">
              <PieChart data={chartData} donut />
            </View>

            <View className="gap-3">
              {chartData.map(({ key, color, value }) => (
                <View key={key} className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full bg-[var(--bg)] mr-2"
                    style={vars({ "--bg": color! })}
                  />
                  <Text className="text-lg font-sans_medium">{getDataLabel(key)}</Text>
                  <Text className="ml-auto text-xl">
                    {formatMoney({
                      valueInMinorUnits: value,
                      currencyCode: mainAccount.currency_code,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <PlaceholderBlock title="No data to show" />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Stats;
