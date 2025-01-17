import EditAccountForm, { FormSchema } from "@/components/edit-account-form";
import EmptyState from "@/components/empty-state";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateAccount } from "@/db/mutations/accounts";
import { getAccounts } from "@/db/queries/accounts";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { queryClient } from "@/lib/react-query";
import { valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { PropsWithChildren } from "react";
import { View } from "react-native";

// add animation to loading indicator
const EditAccount = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = valueToNumber(params.id);
  const {
    data: accountsData,
    isError: isAccountError,
    isPending: isAccountPending,
  } = useQuery({
    queryKey: ["accounts", id],
    queryFn: async () =>
      getAccounts({ ids: id !== undefined ? [id] : undefined, limit: id !== undefined ? 1 : 0 }),
  });
  const account = accountsData?.[0];

  const onSubmit = async ({ name, currencyCode, color }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyCode];
    if (!account || !currency) return;

    await updateAccount(account.id, {
      name,
      color,
      currency_code: currencyCode,
    });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

    router.back();
  };

  if (isAccountPending) {
    return (
      <Layout>
        <EmptyState
          title="Loading..."
          icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
        />
      </Layout>
    );
  }

  if (isAccountError) {
    return <ResourceNotFound title="An error occured fetching account" />;
  }

  if (!account) {
    return <ResourceNotFound title="Account does not exist" />;
  }

  return (
    <Layout>
      <EditAccountForm
        defaultValues={{
          name: account.name,
          currencyCode: account.currency_code,
          color: account.color,
        }}
        onSubmit={onSubmit}
      />
    </Layout>
  );
};

const Layout = ({ children }: PropsWithChildren) => {
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

      {children}
    </ScreenWrapper>
  );
};

export default EditAccount;
