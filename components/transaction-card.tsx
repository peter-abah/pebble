import { Text } from "@/components/ui/text";
import { QueryTransaction } from "@/db/queries/transactions";
import { getTransactionCategory, renderDate } from "@/lib/app-utils";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { CATEGORY_ICONS, CategoryIconName } from "@/lib/icons/category-icons";
import { formatMoney } from "@/lib/money";
import { StrictOmit } from "@/lib/types";
import { assertUnreachable, cn } from "@/lib/utils";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { ComponentProps, forwardRef } from "react";
import { Pressable, View } from "react-native";

interface TransactionCardProps extends ComponentProps<typeof Pressable> {
  transaction: StrictOmit<QueryTransaction, "loanPaymentTransactions">;
}
const TransactionCard = forwardRef<View, TransactionCardProps>(
  ({ transaction, ...restProps }, ref) => {
    let sign: string;
    switch (transaction?.type) {
      case "expense":
      case "lent":
      case "paid_loan":
        sign = "-";
        break;
      case "borrowed":
      case "collected_debt":
      case "income":
        sign = "+";
        break;
      default:
        sign = "";
    }
    return (
      <Pressable
        className="w-full flex-row items-center active:bg-background/50 px-2 py-1 rounded-lg mb-4"
        {...restProps}
        ref={ref}
      >
        <TransactionIcon transaction={transaction} />
        <TransactionText transaction={transaction} />

        <View className="ml-auto items-end">
          <Text className="font-bold text-lg">
            {sign}
            {formatMoney({
              valueInMinorUnits: transaction.amount_value_in_minor_units,
              currencyCode: transaction.amount_currency_code,
            })}
          </Text>
          <Text>{renderDate(transaction.datetime)}</Text>
        </View>
      </Pressable>
    );
  }
);

TransactionCard.displayName = "TransactionCard";

const TransactionIcon = ({ transaction }: TransactionCardProps) => {
  const { type } = transaction;
  if (type === "income" || type === "expense") {
    const category = getTransactionCategory(transaction);

    return (
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-2"
        style={{ backgroundColor: category?.color }}
      >
        <Text className="text-2xl font-bold">
          {category?.icon?.type === "emoji"
            ? category?.icon.emoji
            : CATEGORY_ICONS[category?.icon.name as CategoryIconName]?.({
                size: 24,
                color: "white",
              })}
        </Text>
      </View>
    );
  }

  if (type === "transfer") {
    return (
      <View className="w-12 h-12 rounded-full items-center justify-center mr-2 bg-gray-600">
        {/* store icon in a constant so it is clear when it being used */}
        <MaterialIcons size={24} color={"white"} name="multiple-stop" />
      </View>
    );
  }

  if (type === "lent" || type === "borrowed") {
    return (
      <View
        className={cn(
          "w-12 h-12 rounded-full items-center justify-center mr-2",
          type === "borrowed" && "bg-green-800",
          type === "lent" && "bg-red-800"
        )}
      >
        {/* store icon in a constant so it is clear when it being used */}
        <FontAwesome6 size={24} color={"white"} name="sack-dollar" />
      </View>
    );
  }

  // I AM BEING EXPLICIT HERE SO IT IS OBVIOUS IF A NEW TRANSACTION TYPE IS ADDED
  if (type === "collected_debt" || type === "paid_loan") {
    return (
      <View
        className={cn(
          "w-12 h-12 rounded-full items-center justify-center mr-2",
          type === "collected_debt" && "bg-green-800",
          type === "paid_loan" && "bg-red-800"
        )}
      >
        {/* store icon in a constant so it is clear when it being used */}
        <MaterialIcons size={24} color={"white"} name="paid" />
      </View>
    );
  }

  // all this does is throw a compiler error if a new type is added that is not handled
  assertUnreachable(type);
};

const TransactionText = ({ transaction }: TransactionCardProps) => {
  let topText: string | undefined | null;
  let bottomText: string | undefined;

  const { type } = transaction;
  switch (type) {
    case "transfer": {
      const { fromAccount, toAccount } = transaction;
      topText = transaction.title;
      bottomText = `${fromAccount?.name || "Unknown account"}→${toAccount?.name}`;
      break;
    }
    case "expense":
    case "income": {
      const category = getTransactionCategory(transaction);
      topText = transaction.title;
      bottomText = category?.name || "Unknown category";
      break;
    }
    case "lent":
    case "borrowed": {
      const isOverdue = transaction.due_date ? dayjs().isAfter(dayjs(transaction.due_date)) : false;
      topText = `${transaction.title} (${type})`;
      bottomText = transaction.due_date
        ? `${isOverdue ? "Overdue" : "Due"}: ${renderDate(transaction.due_date)}`
        : undefined;
      break;
    }
    case "collected_debt": {
      const { loanTransaction } = transaction;
      topText = transaction.title;
      bottomText = `Collected "${
        loanTransaction?.type === "lent" ? loanTransaction.title : "Deleted"
      }" loan payment`;
      break;
    }
    case "paid_loan": {
      const { loanTransaction } = transaction;
      topText = transaction.title;
      bottomText = `Paid "${
        loanTransaction?.type === "borrowed" ? loanTransaction.title : "Deleted"
      } loan payment"`;
      break;
    }
    default:
      assertUnreachable(type);
  }

  return (
    <View className="shrink gap-1">
      <Text className="font-medium leading-none" numberOfLines={1}>
        {topText || bottomText}
      </Text>

      {topText ? <Text className="leading-none text-sm">{bottomText}</Text> : null}
    </View>
  );
};

export default TransactionCard;
