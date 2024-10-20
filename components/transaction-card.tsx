import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { vars } from "nativewind";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface TransactionCardProps {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const category = useAppStore((state) => state.categories[transaction.categoryID]);
  const icon = category.icon.type === "emoji" ? category.icon.emoji : category.name[0];
  return (
    <Link href={`/transactions/${transaction.id}/edit`} asChild>
      <View className="w-full flex-row items-center active:bg-background/50 px-2 py-1 rounded-lg mb-4">
        <View
          className="w-12 h-12 rounded-full bg-[var(--color)] items-center justify-center mr-2"
          style={vars({ "--color": category.color })}
        >
          <Text className="text-2xl font-bold">{icon}</Text>
        </View>

        <View>
          <Text className="text-lg font-semibold leading-none" numberOfLines={1}>
            {transaction.title || category.name}
          </Text>
          {transaction.title && <Text className="font-medium  leading-none">{category.name}</Text>}
        </View>

        <View className="ml-auto items-end">
          <Text className="font-bold text-lg">
            {transaction.type === "debit" && "-"}
            {formatMoney(transaction.amount)}
          </Text>
          <Text>{renderDate(transaction.datetime)}</Text>
        </View>
      </View>
    </Link>
  );
};

const renderDate = (datetime: string) => {
  const dayJS = dayjs(datetime);
  const today = dayjs();
  if (dayJS.isSame(today, "day")) {
    return dayJS.format("hh:mm A");
  }

  if (dayJS.isSame(today.subtract(1, "day"), "day")) {
    return "Yesterday";
  }

  if (dayJS.isSame(today, "year")) {
    return dayJS.format("DD MMM");
  }
  return dayJS.format("DD MMM YYYY");
};

export default TransactionCard;
