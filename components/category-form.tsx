import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { emojiPattern } from "@/lib/emoji-regex";
import { useAppStore } from "@/lib/store";
import { Satisfies, TransactionCategory, TransactionType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import ColorPicker from "./color-picker";
import IconPicker from "./icon-picker";
import { humanizeString, titleCase } from "@/lib/utils";

const emojiAtStartPattern = new RegExp(`^${emojiPattern}`);
const formSchema = z
  .object({
    name: z.string(),
    color: z.string(),
    parentID: z.string().optional(),
    iconType: z.enum(["emoji", "icon"]),
    icon: z.string(),
    type: z.enum(["expense", "income"]),
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

export type FormSchema = Satisfies<
  {
    type: Extract<TransactionType, "income" | "expense">;
    iconType: TransactionCategory["icon"]["type"];
  },
  z.infer<typeof formSchema>
>;

interface CategoryFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const CategoryForm = ({ defaultValues, onSubmit }: CategoryFormProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<FormSchema>({
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
                value={value && { value, label: titleCase(value) }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select type"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  {["expenses", "income"].map((v) => (
                    <SelectItem label={humanizeString(v)} value={v} key={v} />
                  ))}
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
                  value === undefined
                    ? value
                    : { value, label: value && (categoryMap[value]?.name || "Unknown") }
                }
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-labelledby="type">
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
          <View className="gap-2 relative flex-1">
            <Label nativeID="color" className="text-lg">
              Color
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <ColorPicker value={value} onChange={onChange} />
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
                <IconPicker
                  iconValue={value}
                  onIconChange={onChange}
                  iconTypeValue={iconType}
                  color={color}
                  onIconTypeChange={(value) => {
                    if (value) setValue("iconType", value);
                  }}
                />
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

export default CategoryForm;
