import EditAccountForm, { FormSchema } from "@/components/edit-account-form";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateAccount } from "@/db/mutations/accounts";
import { getAccounts } from "@/db/queries/accounts";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { valueToNumber } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const EditAccount = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: [account],
  } = useLiveQuery(
    getAccounts({ ids: id !== undefined ? [id] : undefined, limit: id !== undefined ? 1 : 0 }),
    [id]
  );

  const onSubmit = ({ name, currencyCode, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyCode];
    if (!account || !currency) return;

    updateAccount(account.id, {
      name,
      color,
      currency_code: currencyCode,
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
          currencyCode: account.currency_code,
          color: account.color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default EditAccount;
