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
import { getMainAccount } from "@/db/queries/accounts";
import { CURRENCIES, CURRENCIES_MAP } from "@/lib/data/currencies";
import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { renderCurrencyLabel } from "@/lib/money";
import { isStringNumeric, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import { AccountsInput } from "./accounts-input";
import { CategoriesInput } from "./categories-input";
import ColorPicker from "./color-picker";
import{PlaceholderBlock}from "./placeholder-block";
import{ErrorScreen}from "./error-screen";
import { Redirect } from "expo-router";

const PERIODS = ["weekly", "monthly", "yearly"] as const;
const formSchema = z.object({
  amount: z.union([
    z
      .string({ message: "Enter a string" })
      .refine(isStringNumeric, { message: "Enter a number" })
      .transform(Number)
      .refine((v) => v > 0, { message: "Amount must be greater than zero" }),
    z.number({ message: "Enter a number" }).gt(0, { message: "Amount must be greater than zero" }),
  ]),
  name: z.string().min(1, { message: "Budget name is required." }),
  currency: z.string({ message: "Currency is required" }),
  color: z.string({ message: "Color is required" }),
  accounts: z
    .array(z.number(), { message: "Select accounts" })
    .nonempty({ message: "Select accounts" }),
  categories: z
    .array(z.number(), { message: "Select categories" })
    .nonempty({ message: "Select categories" }),
  period: z.enum(PERIODS, { message: "Period is required" }),
});

const SORTED_CURRENCIES = [...CURRENCIES].sort((a, b) => a.isoCode.localeCompare(b.isoCode));

export type FormSchema = z.infer<typeof formSchema>;

interface BudgetFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const BudgetForm = ({ defaultValues, onSubmit }: BudgetFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  };

  const {
    data,
    isError: isMainAccountError,
    isPending: isMainAccountPending,
  } = useQuery({
    queryKey: ["accounts", "mainAccount"],
    queryFn: () => getMainAccount(),
  });

  if (isMainAccountPending) {
    return (
      <PlaceholderBlock
        title="Loading..."
        icon={<LoaderCircleIcon size={100} className="text-muted-foreground" />}
      />
    );
  }
  if (isMainAccountError) {
    return <ErrorScreen title="An error occured fetching  data" />;
  }

  const mainAccount = data?.account;
  if (!mainAccount) {
    // this should not occur normally
    return <Redirect href="/accounts" />;
  }
  const defaultCurrency = CURRENCIES_MAP[mainAccount.currency_code];
  const currencyISO = watch("currency");
  const currency = CURRENCIES_MAP[currencyISO];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="px-6 py-4 gap-4" style={{ flex: 1 }}>
        <View className="gap-2">
          <Label nativeID="name" className="text-lg">
            Name
          </Label>
          <View>
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
            {errors.name?.message && (
              <Text className="text-xs text-destructive">{errors.name.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Amount
          </Label>
          <View>
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
                          maximumFractionDigits: currency?.minorUnit || defaultCurrency?.minorUnit,
                        }) || ""
                  }
                  onBlur={onBlur}
                  onChangeText={onChange}
                  inputMode="numeric"
                />
              )}
              name="amount"
            />
            {errors.amount?.message && (
              <Text className="text-xs text-destructive">{errors.amount.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2 relative">
          <Label nativeID="currency" className="text-lg">
            Currency
          </Label>
          <View>
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
            {errors.currency?.message && (
              <Text className="text-xs text-destructive">{errors.currency.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2">
          <Label nativeID="period" className="text-lg">
            Period
          </Label>
          <View>
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
            {errors.period?.message && (
              <Text className="text-xs text-destructive">{errors.period.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Color
          </Label>
          <View>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <ColorPicker value={value} onChange={onChange} />
              )}
              name="color"
            />
            {errors.color?.message && (
              <Text className="text-xs text-destructive">{errors.color.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2 relative">
          <Label nativeID="categories" className="text-lg">
            Categories
          </Label>
          <View>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <CategoriesInput value={value} onChange={onChange} />
              )}
              name="categories"
            />
            {errors.categories?.message && (
              <Text className="text-xs text-destructive">{errors.categories.message}</Text>
            )}
          </View>
        </View>

        <View className="gap-2 relative">
          <Label nativeID="color" className="text-lg">
            Accounts
          </Label>
          <View>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <AccountsInput value={value} onChange={onChange} />
              )}
              name="accounts"
            />
          </View>
        </View>
        {errors.accounts?.message && (
          <Text className="text-xs text-destructive">{errors.accounts.message}</Text>
        )}
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default BudgetForm;
