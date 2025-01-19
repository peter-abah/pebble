import EditAccountForm, { FormSchema } from "@/components/edit-account-form";
import{PlaceholderBlock}from "@/components/placeholder-block";
import{ErrorScreen}from "@/components/error-screen";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { insertMainAccount, updateAccount } from "@/db/mutations/accounts";
import { getAccount, getMainAccount } from "@/db/queries/accounts";
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
    data: account,
    isError: isAccountError,
    isPending: isAccountPending,
  } = useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => (id ? await getAccount(id) : undefined),
  });
  const {
    data: mainAccount,
    isError: isMainAccountError,
    isPending: isMainAccountPending,
  } = useQuery({
    queryKey: ["accounts", "mainAccount"],
    queryFn: () => getMainAccount(),
  });

  const onSubmit = async ({ name, currencyCode, color, isMainAccount }: FormSchema) => {
    const currency = CURRENCIES_MAP[currencyCode];
    if (!account || !currency) return;

    await updateAccount(account.id, {
      name,
      color,
      currency_code: currencyCode,
    });
    if (isMainAccount && mainAccount?.account_id !== account.id) {
      await insertMainAccount(account.id);
    }
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

    router.back();
  };

  if (isAccountPending || isMainAccountPending) {
    return (
      <Layout>
        <PlaceholderBlock
          title="Loading..."
          icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
        />
      </Layout>
    );
  }

  if (isAccountError || isMainAccountError) {
    return <ErrorScreen title="An error occured fetching account" />;
  }

  if (!account) {
    return <ErrorScreen title="Account does not exist" />;
  }

  return (
    <Layout>
      <EditAccountForm
        defaultValues={{
          name: account.name,
          currencyCode: account.currency_code,
          color: account.color,
          isMainAccount: mainAccount?.account_id === account.id,
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
        <Text className="font-sans_bold text-2xl">Edit Account</Text>
      </View>

      {children}
    </ScreenWrapper>
  );
};

export default EditAccount;
