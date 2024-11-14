import EditAccountForm, { FormSchema } from "@/components/edit-account-form";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditAccount = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const { updateAccount } = useAppStore((state) => state.actions);
  const account = useAppStore((state) => state.accounts[id]);

  const onSubmit = ({ name, currency: currencyISO, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyISO];
    if (!account || !currency) return;

    updateAccount({
      ...account,
      name,
      color,
      currency,
    });
    router.back();
  };

  if (!account) {
    return <ResourceNotFound title="Account does not exist" />;
  }

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center py-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-bold text-2xl">Edit Account</Text>
      </View>

      <EditAccountForm
        defaultValues={{
          name: account.name,
          currency: account.currency.isoCode,
          color: account.color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditAccount;
