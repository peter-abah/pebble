import EmptyState from "@/components/empty-state";
import FloatingAddButton from "@/components/floating-add-button";
import { usePromptModal } from "@/components/prompt-modal";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { SearchIcon } from "@/lib/icons/Search";
import { TrashIcon } from "@/lib/icons/Trash";
import { CATEGORY_ICONS, CategoryIconName } from "@/lib/icons/category-icons";
import { useAppStore } from "@/lib/store";
import { TransactionCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Categories = () => {
  const categoriesMap = useAppStore((state) => state.categories);

  const categories = useMemo(
    () => Object.values(categoriesMap) as Array<TransactionCategory>,
    [categoriesMap]
  );

  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch === "") return categories;

    return categories.filter((category) =>
      category.name.toLocaleLowerCase().includes(trimmedSearch.toLocaleLowerCase())
    );
  }, [search, categories]);

  return (
    <ScreenWrapper className="!pb-6">
      <View className="flex-row gap-4 items-center pt-8 pb-4 px-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-semibold text-2xl">Categories</Text>
      </View>

      <View className="px-6 py-2">
        <View className="border border-border rounded-2xl py-2 px-4 flex-row gap-2 items-center">
          <SearchIcon size={24} className="text-muted-foreground" />
          <Input
            className="p-0 rounded-none text-lg"
            placeholder="Search categories"
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <CategoryCard category={item} />}
        contentContainerClassName="pb-16"
        className="flex-1 px-6"
        ListEmptyComponent={<EmptyState title="No categories to show" />}
      />

      <Link href={"/categories/new"} asChild>
        <FloatingAddButton />
      </Link>
    </ScreenWrapper>
  );
};

const CategoryCard = ({ category }: { category: TransactionCategory }) => {
  const { deleteCategory } = useAppStore((state) => state.actions);

  const { Modal, openModal } = usePromptModal({
    title: `Are you sure you want to delete '${category.name}' category?`,
    onConfirm: () => deleteCategory(category.id),
  });

  return (
    <>
      <View className={cn("flex-row items-center gap-4")}>
        <Link href={`/categories/${category.id}/edit`} asChild>
          <Pressable className={cn("flex-row items-center p-4 active:bg-muted flex-1")}>
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: category.color }}
            >
              {category.icon.type === "emoji" ? (
                <Text className="text-2xl font-bold">{category.icon.emoji}</Text>
              ) : (
                CATEGORY_ICONS[category.icon.name as CategoryIconName]?.({
                  size: 24,
                  color: "white",
                })
              )}
            </View>

            {/* TODO: choose font for app */}

            <Text className="text-xl font-medium">{category.name}</Text>
          </Pressable>
        </Link>
        <Button
          className="rounded-full p-0 active:bg-accent ml-auto items-center justify-center"
          variant="ghost"
          size="icon"
          onPress={openModal}
        >
          <TrashIcon className="text-foreground" size={24} />
        </Button>
      </View>
      <Modal />
    </>
  );
};

export default Categories;
