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
import { GROUP_COLORS, HEX_TO_GROUP_COLOR } from "@/lib/constants";
import { CURRENCIES, renderCurrencyLabel } from "@/lib/money";
import { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { vars } from "nativewind";
import { Controller, useForm } from "react-hook-form";
import { Dimensions, TextInput, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const currencies = Object.values(CURRENCIES) as Array<Currency>;
const formSchema = z.object({
  name: z.string(),
  currency: z.string(),
  color: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface EditAccountFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const EditAccountForm = ({ defaultValues, onSubmit }: EditAccountFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
          <Label nativeID="currency" className="text-lg">
            Currency
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: value && renderCurrencyLabel(value) }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select Currency"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                    {currencies.map((currency) => (
                      <SelectItem
                        key={currency.isoCode}
                        label={renderCurrencyLabel(currency.isoCode)}
                        value={currency.isoCode}
                      />
                    ))}
                  </ScrollView>
                </SelectContent>
              </Select>
            )}
            name="currency"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Color
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{
                  value,
                  label: (value && HEX_TO_GROUP_COLOR[value]?.name) || "",
                }}
                onValueChange={(option) => onChange(option?.value)}
                className="w-1/2"
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className={cn(
                      "text-white text-sm native:text-lg bg-[var(--bg)] px-4 py-2 rounded-lg",
                      !value && "text-foreground"
                    )}
                    style={vars({ "--bg": value || "transparent" })}
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
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default EditAccountForm;
