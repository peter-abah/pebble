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
import { getCategories } from "@/db/queries/categories";
import { SchemaAccount, SchemaCategory, SchemaTransaction } from "@/db/schema";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { CheckIcon } from "@/lib/icons/Check";
import { FilterIcon } from "@/lib/icons/Filter";
import { ShapesIcon } from "@/lib/icons/Shapes";
import { Filters } from "@/lib/types";
import { cn, humanizeString } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Dimensions, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Icon } from "./icon";
interface FiltersModalProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

const FiltersModal = ({ filters, onFiltersChange }: FiltersModalProps) => {
  const { data: categories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ sortBy: [{ column: "name", type: "asc" }] }),
    initialData: [],
  });
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts({ sortBy: [{ column: "name", type: "asc" }] }),
    initialData: [],
  });

  const handleCategoryChange = (id: SchemaCategory["id"]) => {
    const newCategories = filters.categories.includes(id)
      ? filters.categories.filter((e) => e !== id)
      : [...filters.categories, id];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleAccountChange = (id: SchemaAccount["id"]) => {
    const newAccounts = filters.accounts.includes(id)
      ? filters.accounts.filter((e) => e !== id)
      : [...filters.accounts, id];
    onFiltersChange({ ...filters, accounts: newAccounts });
  };

  const handleTypeChange = (type: SchemaTransaction["type"]) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((e) => e !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"icon"} className="rounded-xl">
          <FilterIcon size={20} className="text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[600px] rounded-2xl"
        style={{
          width: Dimensions.get("screen").width - 24 * 2,
        }}
      >
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="text-2xl">Select Filters</DialogTitle>
        </DialogHeader>
        <View className="gap-4">
          <View className="flex-row gap-2 items-center">
            <Text className="font-sans_bold">Type:</Text>
            <FlatList
              data={TRANSACTION_TYPES}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Button
                  variant={"outline"}
                  className="flex-row gap-1"
                  onPress={() => handleTypeChange(item)}
                >
                  {filters.types.includes(item) && (
                    <CheckIcon size={16} className="text-foreground" />
                  )}
                  <Text>{humanizeString(item)}</Text>
                </Button>
              )}
              contentContainerClassName="gap-4"
            />
          </View>

          <View>
            <Text className="text-lg font-sans_semibold">Categories</Text>
            {isCategoriesError ? (
              <Text className="text-sm">An error occured fetching categories</Text>
            ) : (
              <FlatList
                data={categories}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                contentContainerClassName="gap-4"
                ListHeaderComponent={
                  <Pressable
                    onPress={() =>
                      onFiltersChange({
                        ...filters,
                        categories: [],
                      })
                    }
                    className="gap-1 items-center"
                  >
                    <View
                      className={cn(
                        "w-16 h-16 px-1 justify-center items-center rounded-xl",
                        filters.categories.length === 0 && "border-2 border-foreground/40"
                      )}
                    >
                      <ShapesIcon size={24} className="text-foreground" />
                    </View>
                    <Text className="text-sm" numberOfLines={1}>
                      All
                    </Text>
                  </Pressable>
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleCategoryChange(item.id)}
                    className="gap-1 items-center"
                  >
                    <View
                      className={cn(
                        "w-16 h-16 px-1 justify-center items-center rounded-xl",
                        filters.categories.includes(item.id) && "border-2 border-foreground/40"
                      )}
                      style={{
                        backgroundColor: item.color + "55", // make hex color semitransparent
                      }}
                    >
                      <Icon
                        type={item.icon.type}
                        value={item.icon.type === "emoji" ? item.icon.emoji : item.icon.name}
                      />
                    </View>
                    <Text className="text-xs" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>

          <View className="flex-row gap-3 items-center">
            <Text className="font-sans_bold">Account:</Text>
            {isAccountsError ? (
              <Text className="text-sm">An error occured fetching accounts</Text>
            ) : (
              <FlatList
                data={accounts}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Button
                    variant="outline"
                    className="flex-row gap-1"
                    style={{ borderColor: item.color + "88" }}
                    onPress={() => handleAccountChange(item.id)}
                  >
                    {filters.accounts.includes(item.id) && (
                      <CheckIcon size={16} className="text-foreground" />
                    )}
                    <Text>{item.name}</Text>
                  </Button>
                )}
                contentContainerClassName="gap-4"
              />
            )}
          </View>
        </View>
        <DialogClose asChild>
          <Button className="mt-4">
            <Text>Done</Text>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersModal;
