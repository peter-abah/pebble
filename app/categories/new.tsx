import CategoryForm, { FormSchema } from "@/components/category-form";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { GROUP_COLORS } from "@/lib/constants";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { useAppStore } from "@/lib/store";
import { randomElement } from "@/lib/utils";
import { router } from "expo-router";
import { nanoid } from "nanoid";
import { Alert, View } from "react-native";

// TODO: add timestamps to all object types in store

const CreateCategory = () => {
  const addCategory = useAppStore((state) => state.addCategory);
  const onSubmit = ({ name, icon, color, iconType, type, parentID }: FormSchema) => {
    addCategory({
      id: nanoid(),
      name,
      icon: iconType === "emoji" ? { type: iconType, emoji: icon } : { type: iconType, name: icon },
      parentID,
      type,
      color,
    });
    router.back();
  };

  return (
    <ScreenWrapper className="!p-6">
      <View className="flex-row gap-4 items-center my-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-2xl">Add Category</Text>
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
