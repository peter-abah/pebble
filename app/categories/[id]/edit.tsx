import CategoryForm, { FormSchema } from "@/components/category-form";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { useAppStore } from "@/lib/store";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const CreateCategory = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateCategory } = useAppStore((state) => state.actions);
  const categoriesMap = useAppStore((state) => state.categories);
  const category = categoriesMap[id];

  const onSubmit = ({ name, icon, color, iconType, type, parentID }: FormSchema) => {
    if (!category) return;

    updateCategory({
      ...category,
      name,
      icon: iconType === "emoji" ? { type: iconType, emoji: icon } : { type: iconType, name: icon },
      parentID,
      type,
      color,
    });
    router.back();
  };

  if (!category) {
    return <ResourceNotFound title="Category does not exist" />;
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
        <Text className="font-bold text-2xl">Edit Category</Text>
      </View>

      <CategoryForm
        defaultValues={{
          name: category.name,
          color: category.color,
          iconType: category.icon.type,
          icon: category.icon.type === "emoji" ? category.icon.emoji : category.icon.type,
          parentID: category.parentID || undefined,
          type: category.type,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateCategory;
