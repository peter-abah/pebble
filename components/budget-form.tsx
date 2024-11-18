import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { CURRENCIES, CURRENCIES_MAP } from "@/lib/data/currencies";
import { renderCurrencyLabel } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { isStringNumeric, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import { AccountsInput } from "./accounts-input";
import { CategoriesInput } from "./categories-input";
import ColorPicker from "./color-picker";

// todo: form error msgs
const PERIODS = ["weekly", "monthly", "yearly"] as const;
const formSchema = z.object({
  amount: z.union([
    z
      .string()
      .refine(isStringNumeric, { message: "Enter a number" })
      .transform(Number)
      .refine((v) => v > 0, { message: "Amount must be greater than zero" }),
    z.number({ message: "Enter a number" }).gt(0, { message: "Amount must be greater than zero" }),
  ]),
  name: z.string().min(1, { message: "Budget name is required." }),
  currency: z.string({ message: "Currency is required" }),
  color: z.string({ message: "Color is required" }),
  accounts: z.array(z.string()).nonempty({ message: "Select accounts" }),
  categories: z.array(z.string()).nonempty({ message: "Select categories" }),
  period: z.enum(PERIODS, { message: "Period is required" }),
});

const SORTED_CURRENCIES = [...CURRENCIES].sort((a, b) => a.isoCode.localeCompare(b.isoCode));

export type FormSchema = z.infer<typeof formSchema>;

interface BudgetFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const BudgetForm = ({ defaultValues, onSubmit }: BudgetFormProps) => {
  const { control, handleSubmit, watch } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const defaultAccount = useAppStore((state) => state.accounts[state.defaultAccountID]);
  if (!defaultAccount) {
    throw new Error("You should have a default account"); // todo
  }

  const defaultCurrency = defaultAccount.currency;
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

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Amount
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="px-3 py-2 border border-border rounded"
                aria-labelledby="amount"
                value={
                  typeof value === "string"
                    ? value
                    : value?.toLocaleString(undefined, {
                        maximumFractionDigits: (currency || defaultCurrency).minorUnit,
                      }) || ""
                }
                onBlur={onBlur}
                onChangeText={onChange}
                inputMode="numeric"
              />
            )}
            name="amount"
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
                <SelectTrigger className="w-full" aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select Currency"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                    {SORTED_CURRENCIES.map((currency) => (
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
          <Label nativeID="period" className="text-lg">
            Period
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={value && { value, label: titleCase(value) }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" nativeID="period">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select Budget Period"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <SelectGroup>
                    {PERIODS.map((type) => (
                      <SelectItem key={type} label={titleCase(type)} value={type}>
                        {titleCase(type)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            name="period"
          />
        </View>

        <View className="gap-2 relative">
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

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Categories
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <CategoriesInput value={value} onChange={onChange} />
            )}
            name="categories"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Accounts
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <AccountsInput value={value} onChange={onChange} />
            )}
            name="accounts"
          />
        </View>
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default BudgetForm;
