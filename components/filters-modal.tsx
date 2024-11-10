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
import { CheckIcon } from "@/lib/icons/Check";
import { FilterIcon } from "@/lib/icons/Filter";
import { ShapesIcon } from "@/lib/icons/Shapes";
import { CATEGORY_ICONS, CategoryIconName } from "@/lib/icons/category-icons";
import { useAppStore } from "@/lib/store";
import {
  Account,
  Icon,
  TRANSACTION_TYPES,
  TransactionCategory,
  TransactionType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dimensions, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export interface Filters {
  categories: Array<TransactionCategory["id"]>;
  types: Array<TransactionType>;
  accounts: Array<Account["id"]>;
}

interface FiltersModalProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

const FiltersModal = ({ filters, onFiltersChange }: FiltersModalProps) => {
  const categoriesMap = useAppStore((state) => state.categories);
  const accounstMap = useAppStore((state) => state.accounts);
  const categories = (Object.values(categoriesMap) as Array<TransactionCategory>).filter(
    ({ type }) => {
      if (filters.types.length === 0 || !type) return true;
      return filters.types.includes(type);
    }
  );
  const accounts = Object.values(accounstMap) as Array<Account>;

  const handleCategoryChange = (id: TransactionCategory["id"]) => {
    const newCategories = filters.categories.includes(id)
      ? filters.categories.filter((e) => e !== id)
      : [...filters.categories, id];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleAccountChange = (id: TransactionCategory["id"]) => {
    const newAccounts = filters.accounts.includes(id)
      ? filters.accounts.filter((e) => e !== id)
      : [...filters.accounts, id];
    onFiltersChange({ ...filters, accounts: newAccounts });
  };

  const handleTypeChange = (type: TransactionType) => {
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
            <Text className="font-bold">Type:</Text>
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
                  <Text className="capitalize">{item}</Text>
                </Button>
              )}
              contentContainerClassName="gap-4"
            />
          </View>

          <View>
            <Text className="text-lg font-semibold">Categories</Text>
            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item.id}
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
                    {renderIcon(
                      item.icon.type,
                      item.icon.type === "emoji" ? item.icon.emoji : item.icon.name
                    )}
                  </View>
                  <Text className="text-xs" numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
              contentContainerClassName="gap-4"
            />
          </View>

          <View className="flex-row gap-3 items-center">
            <Text className="font-bold">Account:</Text>
            <FlatList
              data={accounts}
              horizontal
              keyExtractor={(item) => item.id}
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

const renderIcon = (type: Icon["type"], value: string, color?: string) => {
  switch (type) {
    case "emoji":
      return <Text className="text-2xl">{value}</Text>;
    case "icon":
      return (
        <View>
          {CATEGORY_ICONS[value as CategoryIconName]?.({
            className: "text-foreground",
            size: 24,
            color: color ? color : undefined,
          }) || ""}
        </View>
      );
  }
};

export default FiltersModal;
