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
import { CURRENCIES, CURRENCIES_MAP } from "@/lib/data/currencies";
import { renderCurrencyLabel } from "@/lib/money";
import { isStringNumeric } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import ColorPicker from "./color-picker";

const formSchema = z.object({
  balance: z.union([
    z.string().refine(isStringNumeric, { message: "Enter a number" }).transform(Number).optional(),
    z.number().optional(),
  ]),
  name: z.string({ message: "Enter account name" }).min(1, { message: "Enter account name" }),
  currency: z.string({ message: "Select currency" }),
  color: z.string({ message: "Select color" }),
});

export type FormSchema = z.infer<typeof formSchema>;

interface NewAccountFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const NewAccountForm = ({ defaultValues, onSubmit }: NewAccountFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const currencyISO = watch("currency");
  const currency = CURRENCIES_MAP[currencyISO];

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="px-6 py-4 gap-4" style={{ flex: 1 }}>
        <View className="gap-2">
          <Label nativeID="name" className="text-lg">
            Name
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <TextInput
                  className="px-3 py-2 border border-border rounded"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  aria-labelledby="name"
                />
                {errors.name?.message && (
                  <Text className="text-xs text-destructive">{errors.name.message}</Text>
                )}
              </View>
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
              <View>
                <Select
                  value={{ value, label: value && renderCurrencyLabel(value) }}
                  onValueChange={(option) => onChange(option?.value)}
                >
                  <SelectTrigger className="w-full" aria-labelledby="type">
                    <SelectValue
                      className="text-foreground text-sm native:text-lg"
                      placeholder="Select Currency"
                    />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets} className="w-full">
                    <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                      {CURRENCIES.map((currency) => (
                        <SelectItem
                          key={currency.isoCode}
                          label={renderCurrencyLabel(currency.isoCode)}
                          value={currency.isoCode}
                        />
                      ))}
                    </ScrollView>
                  </SelectContent>
                </Select>
                {errors.currency?.message && (
                  <Text className="text-xs text-destructive">{errors.currency.message}</Text>
                )}
              </View>
            )}
            name="currency"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Initial Balance
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <TextInput
                  className="px-3 py-2 border border-border rounded"
                  aria-labelledby="amount"
                  value={
                    typeof value === "string"
                      ? value
                      : value?.toLocaleString(undefined, {
                          maximumFractionDigits: currency?.minorUnit,
                        }) || ""
                  }
                  onBlur={onBlur}
                  onChangeText={onChange}
                  inputMode="numeric"
                />
                {errors.balance?.message && (
                  <Text className="text-xs text-destructive">{errors.balance.message}</Text>
                )}
              </View>
            )}
            name="balance"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Color
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <ColorPicker value={value} onChange={onChange} />
                {errors.color?.message && (
                  <Text className="text-xs text-destructive">{errors.color.message}</Text>
                )}
              </View>
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

export default NewAccountForm;
