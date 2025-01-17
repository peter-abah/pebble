import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { getAccounts } from "@/db/queries/accounts";
import { SchemaAccount } from "@/db/schema";
import { CheckIcon } from "@/lib/icons/Check";
import { arrayToMap } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import ResourceNotFound from "./resource-not-found";

interface AccountsInputProps {
  value?: Array<SchemaAccount["id"]>;
  onChange: (v: Array<SchemaAccount["id"]>) => void;
}
export const AccountsInput = ({ value, onChange }: AccountsInputProps) => {
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts({ sortBy: [{ column: "name", type: "asc" }] }),
    initialData: [],
  });
  const accountsMap = useMemo(() => arrayToMap(accounts, ({ id }) => id), [accounts]);

  const handleAccountClick = (id: SchemaAccount["id"]) => {
    if (!value) {
      onChange([id]);
      return;
    }

    const newAccounts = value.includes(id) ? value.filter((e) => e !== id) : [...value, id];
    onChange(newAccounts);
  };

  const getLabel = () => {
    if (value?.length === 0 || !value) {
      return "Select Account";
    }
    if (value.length === 1) {
      return accountsMap[value[0]!]?.name;
    }
    if (value.length === accounts.length) {
      return "All";
    }
    return `${value.length} account${value.length > 0 ? "ies" : ""} selected`;
  };

  if (isAccountsError) {
    return <ResourceNotFound title="An error occured fetching accounts" />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="rounded-xl justify-start items-start">
          <Text>{getLabel()}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="rounded-2xl max-h-[250px]"
        style={{
          width: Dimensions.get("screen").width - 24 * 2,
          height: Dimensions.get("screen").height * 0.6,
        }}
      >
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="text-lg">Select Accounts</DialogTitle>
        </DialogHeader>

        <FlatList
          data={["all" as const, ...accounts]}
          contentContainerClassName="gap-4 flex-row flex-wrap"
          className="flex-1 w-full"
          renderItem={({ item, index }) =>
            item === "all" ? (
              <Button
                variant="outline"
                className="flex-row gap-1"
                onPress={() =>
                  onChange(value?.length === accounts.length ? [] : accounts.map((a) => a.id))
                }
              >
                {accounts.length === value?.length && (
                  <CheckIcon size={16} className="text-foreground" />
                )}
                <Text>All</Text>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-row gap-1"
                style={{ borderColor: item.color + "88" }}
                onPress={() => handleAccountClick(item.id)}
              >
                {value?.includes(item.id) && <CheckIcon size={16} className="text-foreground" />}
                <Text>{item.name}</Text>
              </Button>
            )
          }
        />

        <DialogClose asChild>
          <Button className="mt-4">
            <Text>Done</Text>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
