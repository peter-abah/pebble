import CategoryForm, { FormSchema } from "@/components/category-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { insertCategory } from "@/db/mutations/categories";
import { GROUP_COLORS } from "@/lib/constants";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { CATEGORY_ICONS_NAMES } from "@/lib/icons/category-icons";
import { queryClient } from "@/lib/react-query";
import { randomElement } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";

// todo: sub categories
const CreateCategory = () => {
  const onSubmit = async ({ name, icon, color, iconType, type, parentID }: FormSchema) => {
    await insertCategory({
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
        <Text className="font-sans_bold text-2xl">Add Category</Text>
      </View>

      <CategoryForm
        defaultValues={{
          name: "",
          color: randomElement(GROUP_COLORS).color,
        }}
        onSubmit={onSubmit}
      />
    </ScreenWrapper>
  );
};

export default CreateCategory;
