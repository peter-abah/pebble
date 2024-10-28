import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { GROUP_COLORS, NAME_TO_GROUP_COLOR } from "@/lib/constants";
import { emojiPattern } from "@/lib/emoji-regex";
import { CATEGORY_ICONS, CATEGORY_ICONS_NAMES, CategoryIconName } from "@/lib/icons/category-icons";
import { useAppStore } from "@/lib/store";
import { Icon, TRANSACTION_TYPES, TransactionCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { vars } from "nativewind";
import { Controller, useForm } from "react-hook-form";
import { Alert, Dimensions, TextInput, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const emojiAtStartPattern = new RegExp(`^${emojiPattern}`);
const formSchema = z
  .object({
    name: z.string(),
    color: z.string(),
    parentID: z.string().optional(),
    iconType: z.enum(["emoji", "icon"]),
    icon: z.string(),
    type: z.enum(TRANSACTION_TYPES),
  })
  .transform((data, ctx) => {
    if (data.iconType === "icon") return data;

    const emoji = data.icon.match(emojiAtStartPattern)?.[0];
    if (!emoji) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["icon"],
        message: "Invalid Emoji",
      });
      return z.NEVER;
    }

    return { ...data, icon: emoji };
  });

export type FormSchema = z.infer<typeof formSchema>;

interface CategoryFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const CategoryForm = ({ defaultValues, onSubmit }: CategoryFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // TODO:
    watch,
    setValue,
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const categoryMap = useAppStore((state) => state.categories);
  const type = watch("type");
  const name = watch("name");
  const parentCategories = (Object.values(categoryMap) as Array<TransactionCategory>).filter(
    (c) => (c.type === type || !c.type) && c.name !== name
  );

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  };

  const iconType = watch("iconType");
  const color = watch("color");

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="py-4 px-6 gap-4" style={{ flex: 1 }}>
        <View className="gap-2">
          <Label nativeID="name" className="text-lg">
            Name
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="px-3 py-2 border border-border rounded"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                aria-labelledby="name"
              />
            )}
            name="name"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="parent" className="text-lg">
            Type
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: value && (value === "debit" ? "Expenses" : "Income") }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select type"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <SelectItem label={"Expenses"} value={"debit"} />
                  <SelectItem label={"Income"} value={"credit"} />
                </SelectContent>
              </Select>
            )}
            name="type"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="parent" className="text-lg">
            Parent Category
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={
                  value == undefined
                    ? value
                    : { value, label: value && (categoryMap[value]?.name || "Unknown") }
                }
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="None"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                    {parentCategories.map((category) => (
                      <SelectItem key={category.id} label={category.name} value={category.id} />
                    ))}
                  </ScrollView>
                </SelectContent>
              </Select>
            )}
            name="parentID"
          />
        </View>
        <View className="flex-row gap-4">
          {/* TODO: extract to component, color picker */}
          <View className="gap-2 relative flex-1">
            <Label nativeID="color" className="text-lg">
              Color
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <Select
                  value={{
                    value,
                    label: value && "",
                  }}
                  onValueChange={(option) => onChange(option?.value)}
                  className="w-full"
                >
                  <SelectTrigger
                    className="w-full gap-1 h-10 items-center"
                    aria-aria-labelledby="type"
                  >
                    <SelectValue
                      className={cn(
                        "px-4 py-2 flex-1 rounded-lg text-white",
                        !value && "text-foreground"
                      )}
                      style={{ backgroundColor: value || "transparent" }}
                      placeholder="Select Color"
                    />
                  </SelectTrigger>
                  <SelectContent
                    insets={{
                      ...contentInsets,
                      left: 24,
                      right: (Dimensions.get("screen").width - contentInsets.left * 2) / 2,
                    }} // TODO: spaghetti code
                    className="w-full"
                  >
                    <FlatList
                      data={GROUP_COLORS}
                      renderItem={({ item: color }) => (
                        <SelectItem
                          label={""}
                          value={color.color}
                          className="text-white h-auto py-2 px-4 rounded-lg active:bg-[--bg]/10 bg-[--bg]"
                          style={vars({ "--bg": color.color || "#333" })}
                        />
                      )}
                      keyExtractor={(item, index) => item.color}
                      className="max-h-40"
                      contentContainerClassName="gap-4"
                      onStartShouldSetResponder={() => true}
                    />

                    {/* </ScrollView> */}
                  </SelectContent>
                </Select>
              )}
              name="color"
            />
          </View>

          <View className="gap-2 relative flex-1">
            <Label nativeID="icon" className="text-lg">
              Icon
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <Dialog className="flex-1">
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-lg px-3 py-0 h-10 font-normal items-start justify-center"
                    >
                      {value ? (
                        renderIcon(iconType, value, color)
                      ) : (
                        <Text className="text-sm font-medium text-muted-foreground">
                          Select Icon
                        </Text>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-h-[600px] rounded-2xl"
                    style={{
                      width: Dimensions.get("screen").width - 24 * 2,
                      height: iconType === "emoji" ? 200 : Dimensions.get("screen").height * 0.75,
                    }}
                  >
                    <DialogHeader className="flex-row justify-between items-center">
                      <DialogTitle>Pick Icon</DialogTitle>
                      {iconType === "emoji" ? (
                        <Button variant={"secondary"} onPress={() => setValue("iconType", "icon")}>
                          <Text className="font-medium">Use Icon</Text>
                        </Button>
                      ) : (
                        <Button variant={"secondary"} onPress={() => setValue("iconType", "emoji")}>
                          <Text className="font-medium">Use Emoji</Text>
                        </Button>
                      )}
                    </DialogHeader>
                    {iconType === "emoji" ? (
                      <View className="flex-row gap-4 items-center">
                        <Label nativeID="name" className="text-lg">
                          Enter Emoji
                        </Label>
                        <Controller
                          control={control}
                          render={({ field: { value, onChange, onBlur } }) => (
                            <TextInput
                              className="px-3 py-2 border border-border rounded flex-1"
                              value={value?.match(emojiAtStartPattern)?.[0] || ""}
                              onChangeText={(value) =>
                                onChange(value.match(emojiAtStartPattern)?.[0] || "")
                              }
                              onBlur={onBlur}
                              aria-labelledby="emoji"
                            />
                          )}
                          name="icon"
                        />
                      </View>
                    ) : (
                      <FlatList
                        data={CATEGORY_ICONS_NAMES}
                        renderItem={({ item }) => (
                          <Button
                            onPress={() => {
                              onChange(item);
                              setValue("iconType", "icon");
                            }}
                            className="w-auto p-3 rounded-2xl"
                            style={{
                              ...(item === value && {
                                backgroundColor: color || NAME_TO_GROUP_COLOR["purple-dark"].color,
                              }),
                            }}
                            variant={"ghost"}
                          >
                            {CATEGORY_ICONS[item]({
                              size: 24,
                              className: cn(
                                "text-muted-foreground",
                                item === value && "text-white"
                              ),
                            })}
                          </Button>
                        )}
                        className="flex-1 w-full"
                        numColumns={4}
                        contentContainerClassName="gap-6"
                        columnWrapperClassName="justify-between gap-6"
                      />
                    )}
                    <DialogClose asChild>
                      <Button>
                        <Text>Done</Text>
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              )}
              name="icon"
            />
          </View>
        </View>
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

const renderIcon = (type: Icon["type"], value: string, color: string) => {
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
export default CategoryForm;
