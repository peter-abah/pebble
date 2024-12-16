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
import { ShapesIcon } from "@/lib/icons/Shapes";

import { getCategories } from "@/db/queries/categories";
import { SchemaCategory } from "@/db/schema";
import { arrayToMap, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Icon } from "./icon";

interface CategoriesInputProps {
  value?: Array<SchemaCategory["id"]>;
  onChange: (v: Array<SchemaCategory["id"]>) => void;
}
export const CategoriesInput = ({ value, onChange }: CategoriesInputProps) => {
  const { data: categories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    initialData: [],
  });
  const categoriesMap = useMemo(() => arrayToMap(categories, ({ id }) => id), [categories]);

  const handleCategoryClick = (id: SchemaCategory["id"]) => {
    if (!value) {
      onChange([id]);
      return;
    }

    const newCategories = value.includes(id) ? value.filter((e) => e !== id) : [...value, id];
    onChange(newCategories);
  };

  const getLabel = () => {
    if (value?.length === 0 || !value) {
      return "Select Category";
    }
    if (value.length === 1) {
      return categoriesMap[value[0]!]?.name;
    }
    if (value.length === categories.length) {
      return "All";
    }
    return `${value.length} categor${value.length > 0 ? "ies" : "y"} selected`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="rounded-xl justify-start items-start">
          <Text>{getLabel()}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="rounded-2xl"
        style={{
          width: Dimensions.get("screen").width - 24 * 2,
          height: Dimensions.get("screen").height * 0.6,
        }}
      >
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="text-lg">Select Categories</DialogTitle>
        </DialogHeader>

        {isCategoriesError ? (
          <View className="flex-1 w-full">
            <Text className="text-lg">An error occured fetching categories</Text>
          </View>
        ) : (
          <FlatList
            data={["all" as const, ...categories]}
            numColumns={4}
            columnWrapperClassName="gap-4 justify-between w-full"
            contentContainerClassName="gap-4"
            className="flex-1 w-full"
            renderItem={({ item, index }) =>
              item === "all" ? (
                <Pressable
                  onPress={() =>
                    onChange(value?.length === categories.length ? [] : categories.map((c) => c.id))
                  }
                  className="gap-1 items-center w-16"
                >
                  <View
                    className={cn(
                      "w-16 h-16 px-1 justify-center items-center rounded-xl",
                      categories.length === value?.length && "border-2 border-foreground/40"
                    )}
                  >
                    <ShapesIcon size={24} className="text-foreground" />
                  </View>
                  <Text className="text-sm" numberOfLines={1}>
                    All
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleCategoryClick(item.id)}
                  className="gap-1 items-center w-16"
                >
                  <View
                    className={cn(
                      "w-16 h-16 px-1 justify-center items-center rounded-xl",
                      value?.includes(item.id) && "border-2 border-foreground/40"
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
              )
            }
          />
        )}

        <DialogClose asChild>
          <Button className="mt-4">
            <Text>Done</Text>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
