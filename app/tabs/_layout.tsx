import { Text } from "@/components/ui/text";
import { Foundation } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ChartPieIcon, EllipsisIcon, WalletMinimalIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: { borderTopWidth: 0, height: 60 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabIcon
              icon={<Foundation name="home" size={24} color={color} />}
              title="Home"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <TabIcon
              icon={<WalletMinimalIcon size={24} color={color} />}
              title="Transactions"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<ChartPieIcon size={24} color={color} />} title="Stats" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<EllipsisIcon size={24} color={color} />} title="More" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

interface TabIconProps {
  title: string;
  color: string;
  icon: ReactNode;
}
const TabIcon = ({ title, color, icon }: TabIconProps) => {
  return (
    <View className="gap-1 items-center">
      {icon}
      <Text className="text-xs" style={{ color: color }}>
        {title}
      </Text>
    </View>
  );
};
