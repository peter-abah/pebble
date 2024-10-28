import EditAccountForm, { FormSchema } from "@/components/edit-account-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { CURRENCIES } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditAccount = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const { updateAccount } = useAppStore((state) => state.actions);
  const account = useAppStore((state) => state.accounts[id]);

  if (!account) return null; // TODO: not found 404

  const onSubmit = ({ name, currency: currencyISO, color }: FormSchema) => {
    const currency = CURRENCIES[currencyISO] || CURRENCIES.NGN;
    updateAccount({
      ...account,
      name,
      color,
      currency,
    });
    router.back();
  };

  return (
    <ScreenWrapper className="!p-6">
      <View className="flex-row gap-4 items-center my-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-3xl">Edit Account</Text>
      </View>

      <EditAccountForm
        defaultValues={{
          name: account.name,
          currency: account.currency.isoCode,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditAccount;
