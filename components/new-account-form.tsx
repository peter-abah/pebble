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
import { CURRENCIES, renderCurrencyLabel } from "@/lib/money";
import { Currency } from "@/lib/types";
import { isStringNumeric } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const currencies = Object.values(CURRENCIES) as Array<Currency>;
const formSchema = z.object({
  balance: z.union([
    z.string().refine(isStringNumeric, { message: "Enter a number" }).transform(Number),
    z.number(),
  ]),
  name: z.string(),
  currency: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface NewAccountFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
  excludedFields?: Array<keyof FormSchema>;
}
const NewAccountForm = ({ defaultValues, onSubmit, excludedFields }: NewAccountFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // TODO:
    watch,
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const currencyISO = watch("currency");
  // TODO: wrong app behavior
  const currency = CURRENCIES[currencyISO] || CURRENCIES.NGN;

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="py-4 gap-4" style={{ flex: 1 }}>
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

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Initial Balance
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="px-3 py-2 border border-border rounded"
                aria-labelledby="amount"
                value={typeof value === "string" ? value : value?.toFixed(currency.minorUnit) || ""}
                onBlur={onBlur}
                onChangeText={onChange}
                inputMode="numeric"
              />
            )}
            name="balance"
          />
        </View>
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)}>
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default NewAccountForm;
