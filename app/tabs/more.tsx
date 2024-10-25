import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BanknoteIcon } from "@/lib/icons/BankNote";
import { MaterialCommunityIcons } from "@/lib/icons/MaterialCommunityIcons";
import { PiggyBankIcon } from "@/lib/icons/PiggyBank";
import { SettingsIcon } from "@/lib/icons/Settings";
import { ShapesIcon } from "@/lib/icons/Shapes";
import { WalletCardsIcon } from "@/lib/icons/WalletCards";
import { ReactNode } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const More = () => {
  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center pt-8 px-6 py-4 justify-between">
        <Text className="font-semibold text-2xl">More actions</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerClassName="gap-4">
        <ActionButton
          title="Accounts"
          icon={<WalletCardsIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Categories"
          icon={<ShapesIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Debts and Loans"
          icon={<BanknoteIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Subscriptions"
          icon={
            <MaterialCommunityIcons
              name="calendar-refresh-outline"
              size={24}
              className="text-foreground mr-2"
            />
          }
        />
        <ActionButton
          title="Scheduled"
          icon={
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={24}
              className="text-foreground mr-2"
            />
          }
        />
        <ActionButton
          title="Savings"
          icon={<PiggyBankIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Settings"
          icon={<SettingsIcon size={24} className="text-foreground mr-2" />}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

interface ActionButtonProps {
  title: string;
  icon: ReactNode;
}
const ActionButton = ({ title, icon }: ActionButtonProps) => {
  return (
    <Button className="flex-row items-center justify-start py-3 px-4 h-auto" variant={"outline"}>
      {icon}
      <Text className="font-medium text-lg">{title}</Text>
    </Button>
  );
};
/* 
accounts
categories
goals
loans
budgets
settings
reccurent
tags
*/
export default More;
