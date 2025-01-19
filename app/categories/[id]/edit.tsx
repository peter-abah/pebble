import CategoryForm, { FormSchema } from "@/components/category-form";
import EmptyState from "@/components/empty-state";
import ResourceNotFound from "@/components/resource-not-found";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { updateCategory } from "@/db/mutations/categories";
import { getCategory } from "@/db/queries/categories";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { CATEGORY_ICONS_NAMES } from "@/lib/icons/category-icons";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { queryClient } from "@/lib/react-query";
import { valueToNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const CreateCategory = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = valueToNumber(params.id);
  const {
    data: category,
    isError: isCategoryError,
    isPending: isCategoryPending,
  } = useQuery({
    queryKey: ["categories", id],
    queryFn: () => (id ? getCategory(id) : undefined),
  });

  const onSubmit = async ({ name, icon, color, iconType, type, parentID }: FormSchema) => {
    if (!category) return;

    await updateCategory(category.id, {
      name,
      icon:
        iconType === "emoji"
          ? { type: iconType, emoji: icon }
          : { type: iconType, name: icon as (typeof CATEGORY_ICONS_NAMES)[number] },
      type,
      color,
    });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    router.back();
  };

  if (isCategoryPending) {
    return (
      <EmptyState
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }

  if (isCategoryError) {
    return <ResourceNotFound title="An error occured fetching category" />;
  }

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
        <Text className="font-sans_bold text-2xl">Edit Category</Text>
      </View>

      <CategoryForm
        defaultValues={{
          name: category.name,
          color: category.color,
          iconType: category.icon.type,
          icon: category.icon.type === "emoji" ? category.icon.emoji : category.icon.name,
          // parentID: category.parentID || undefined,
          type: category.type || undefined,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateCategory;
