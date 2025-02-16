import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BanknoteIcon } from "@/lib/icons/BankNote";
import { MaterialCommunityIcons } from "@/lib/icons/MaterialCommunityIcons";
import { PiggyBankIcon } from "@/lib/icons/PiggyBank";
import { SettingsIcon } from "@/lib/icons/Settings";
import { ShapesIcon } from "@/lib/icons/Shapes";
import { WalletCardsIcon } from "@/lib/icons/WalletCards";
import { loadMockData } from "@/lib/mock";
import { queryClient } from "@/lib/react-query";
import { Link } from "expo-router";
import { ComponentProps, ReactNode, forwardRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const More = () => {
  const onLoadTestData = async () => {
    await loadMockData();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center pt-8 px-6 pb-4 justify-between">
        <Text className="font-sans_semibold text-2xl">More Actions</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerClassName="gap-4">
        <Link href={"/accounts"} asChild>
          <ActionButton
            title="Accounts"
            icon={<WalletCardsIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>

        <Link href={"/categories"} asChild>
          <ActionButton
            title="Categories"
            icon={<ShapesIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>
        <Link href={"/budgets"} asChild>
          <ActionButton
            title="Budgets"
            icon={
              <MaterialCommunityIcons
                name="briefcase-variant"
                size={24}
                className="text-foreground mr-2"
              />
            }
          />
        </Link>
        <Link href={"/loans"} asChild>
          <ActionButton
            title="Loans"
            icon={<BanknoteIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>
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

        <Link href="/settings" asChild>
          <ActionButton
            title="Settings"
            icon={<SettingsIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>

        <ActionButton
          title="Load test data"
          onPress={onLoadTestData}
          icon={
            <MaterialCommunityIcons name="database" size={24} className="text-foreground mr-2" />
          }
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

interface ActionButtonProps extends ComponentProps<typeof Button> {
  title: string;
  icon: ReactNode;
}
const ActionButton = forwardRef<View, ActionButtonProps>(({ title, icon, ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      className="flex-row items-center justify-start py-3 px-4 h-auto"
      variant={"outline"}
      {...rest}
    >
      {icon}
      <Text className="font-sans_medium text-lg">{title}</Text>
    </Button>
  );
});

ActionButton.displayName = "ActionButton";
export default More;
