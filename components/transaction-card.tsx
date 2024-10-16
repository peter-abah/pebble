import { formatMoney } from "@/lib/money";
import { useStoreContext } from "@/lib/store-context";
import { Transaction } from "@/lib/types";
import { Link } from "expo-router";
import { vars } from "nativewind";
import { Text, View } from "react-native";

interface TransactionCardProps {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const category = useStoreContext((state) => state.categories[transaction.categoryID]);
  const icon = category.icon.type === "emoji" ? category.icon.emoji : category.name[0];
  return (
    <Link href={`/transactions/${transaction.id}/edit`} asChild>
      <View className="w-full flex-row items-center active:bg-background/50 px-2 py-1 rounded-lg mb-4 -mx-2">
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

        <Text className=" font-bold ml-auto">
          {transaction.type === "debit" && "-"}
          {formatMoney(transaction.amount)}
        </Text>
      </View>
    </Link>
  );
};

export default TransactionCard;
