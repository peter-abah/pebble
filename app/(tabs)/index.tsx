import ScreenWrapper from "@/components/screen-wrapper";
import { Colors } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

const transactions = [
  { name: "Groceries", price: 100, category: "Food" },
  { name: "Data", price: 50, category: "Phone" },
  { name: "Iphone 13", price: 500, category: "Electronics" },
  { name: "Coffee", price: 5, category: "Snacks" },
  { name: "lon", price: 200, category: "Food" },
  { name: "Spotify", price: 8, category: "Entertainment" },
  { name: "T shirts", price: 190, category: "Clothing" },
  { name: "Econs textbook", price: 2000, category: "Education" },
];
const item = transactions[0];
export default function Home() {
  return (
    <ScreenWrapper className="h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-bold text-3xl mb-6">Overview</Text>
        <View className="gap-4">
          <View className="gap-1 bg-gray-800 rounded-lg p-4">
            <Text className="text-gray-50">Current Balance</Text>
            <Text className="font-bold text-2xl text-gray-50">$2000.00</Text>
          </View>

          <View className="gap-1 bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-800">Income (This month)</Text>
            <Text className="font-bold text-2xl text-gray-800">$500.00</Text>
          </View>

          <View className="gap-1 bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-800">Expenses (This month)</Text>
            <Text className="font-bold text-2xl text-gray-800">$756.00</Text>
          </View>
        </View>

        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-xl">Recent Transactions</Text>
            <Pressable className="px-2 py-1 -my-1 -mx-2 rounded-sm active:bg-gray-300">
              <Text>View all</Text>
            </Pressable>
          </View>

          {transactions.map((item) => (
            <Pressable
              className="flex-row items-center active:bg-gray-300 px-2 py-1 rounded-lg mb-4 -mx-2"
              key={item.name}
            >
              <View className="w-12 h-12 bg-green-800/20 rounded-full items-center justify-center mr-2">
                <Text className="text-xl font-bold">{item.category[0]}</Text>
              </View>

              <View>
                <Text className="text-lg font-semibold leading-none" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="font-medium text-gray-700 leading-none">{item.category}</Text>
              </View>

              <Text className="text-gray-900 font-bold ml-auto">-${item.price.toFixed(2)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <AddButton />
    </ScreenWrapper>
  );
}

const AddButton = () => {
  return (
    <Pressable className="absolute bottom-6 right-6 bg-gray-800 active:bg-gray-600 p-4 rounded-2xl shadow">
      <AntDesign name="plus" size={20} color={Colors.light["primary-foreground"].DEFAULT} />
    </Pressable>
  );
};
