import { Text } from "@/components/ui/text";
import { NAME_TO_GROUP_COLOR } from "@/lib/constants";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { CATEGORY_ICONS, CategoryIconName } from "@/lib/icons/category-icons";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";

interface TransactionCardProps {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const category = useAppStore((state) =>
    transaction.type === "transfer" ? null : state.categories[transaction.categoryID]
  );
  const accounts = useAppStore((state) => state.accounts);
  return (
    <Link href={`/transactions/${transaction.id}/edit`} asChild>
      <Pressable className="w-full flex-row items-center active:bg-background/50 px-2 py-1 rounded-lg mb-4">
        {transaction.type === "transfer" ? (
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: NAME_TO_GROUP_COLOR["blue-dark"].color }}
          >
            <MaterialIcons size={24} color={"white"} name="multiple-stop" />
          </View>
        ) : (
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: category?.color }}
          >
            <Text className="text-2xl font-bold">
              {category?.icon.type === "emoji"
                ? category?.icon.emoji
                : CATEGORY_ICONS[category?.icon.name as CategoryIconName]?.({
                    size: 24,
                    color: "white",
                  })}
            </Text>
          </View>
        )}

        <View>
          {transaction.type === "transfer" ? (
            <View className="flex flex-row gap-2 items-center">
              <Text className="font-semibold leading-none">{accounts[transaction.from]?.name}</Text>
              <MaterialIcons name="arrow-right-alt" size={24} className="text-foreground" />
              <Text className="font-semibold leading-none">{accounts[transaction.to]?.name}</Text>
            </View>
          ) : (
            <Text className="font-semibold leading-none" numberOfLines={1}>
              {transaction.title || category?.name}
            </Text>
          )}
          {transaction.title && (
            <Text className="leading-none">
              {transaction.type === "transfer" ? transaction.title : category?.name}
            </Text>
          )}
        </View>

        <View className="ml-auto items-end">
          <Text className="font-bold text-lg">
            {transaction.type === "expense" && "-"}
            {formatMoney(transaction.amount)}
          </Text>
          <Text>{renderDate(transaction.datetime)}</Text>
        </View>
      </Pressable>
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
