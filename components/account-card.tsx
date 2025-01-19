import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SchemaAccount } from "@/db/schema";
import { DEFAULT_GROUP_COLOR } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { ComponentProps, forwardRef } from "react";
import { Pressable, View } from "react-native";

interface AccountCardProps extends ComponentProps<typeof Pressable> {
  account: SchemaAccount;
}
export const AccountCard = forwardRef<View, AccountCardProps>(function AccountCard(
  { account, ...restProps },
  ref
) {
  return (
    <Button
      className="p-4 items-start justify-start gap-1 rounded-xl flex-1"
      {...restProps}
      style={{
        backgroundColor: account.color || DEFAULT_GROUP_COLOR.color,
      }}
      ref={ref}
    >
      <Text className="text-primary-foreground font-sans_medium">{account.name}</Text>
      <Text className="font-sans_bold text-2xl text-primary-foreground" numberOfLines={1}>
        {formatMoney({
          valueInMinorUnits: account.balance_value_in_minor_units,
          currencyCode: account.currency_code,
        })}
      </Text>
    </Button>
  );
});
