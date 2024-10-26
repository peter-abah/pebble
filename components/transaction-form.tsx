import DateTimePicker from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Account, TRANSACTION_TYPES, TransactionCategory } from "@/lib/types";
import { isStringNumeric, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const formSchema = z.object({
  amount: z.union([
    z
      .string()
      .refine(isStringNumeric, { message: "Enter a number" })
      .transform(Number)
      .refine((v) => v > 0, { message: "Enter amount greater than zero" }),
    z.number().positive({ message: "Enter amount greater than zero" }),
  ]),
  datetime: z.date(),
  title: z.string().optional(),
  categoryID: z.string().min(1, { message: "Select category" }),
  accountID: z.string().min(1, { message: "Select account" }),
  note: z.string().optional(),
  type: z.enum(TRANSACTION_TYPES),
});

export type FormSchema = z.infer<typeof formSchema>;
// TODO: zod is slow, probably due to handlimg large immutable data, research on it and fix
interface TransactionFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const TransactionForm = ({ defaultValues, onSubmit }: TransactionFormProps) => {
  const categories = useAppStore((state) => state.categories);
  const accountsMap = useAppStore((state) => state.accounts);
  const accounts = Object.values(accountsMap) as Array<Account>;

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

  const account = accountsMap[watch("accountID")];
  // TODO: wrong behavior, also currency should be from transaction (edit) before checking account, for new
  const currency = account?.currency || CURRENCIES.NGN;
  const type = watch("type");
  const categoriesList = (Object.values(categories) as Array<TransactionCategory>).filter(
    (c) => c.type === type || !c.type
  );

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  // TODO: go to next input after finishing  input
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="py-4 gap-4" className="flex-1 px-6">
        <View className="flex-row gap-1 items-center mb-6">
          <Text className="text-3xl font-semibold leading-none mt-1.5">{currency.symbol}</Text>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                placeholder="Enter Amount"
                aria-labelledby="amount"
                autoFocus={!defaultValues.amount}
                value={typeof value === "string" ? value : value?.toFixed(currency.minorUnit) || ""}
                onBlur={onBlur}
                onChangeText={onChange}
                inputMode="numeric"
                className="text-3xl font-semibold p-0 grow"
              />
            )}
            name="amount"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Type
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: titleCase(value) }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select transaction type"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <SelectGroup>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} label={titleCase(type)} value={type}>
                        {titleCase(type)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            name="type"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="accountID" className="text-lg">
            Account
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: value && (accountsMap[value]?.name || "Unknown") }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select Account"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <SelectGroup>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} label={account.name} value={account.id} />
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            name="accountID"
          />
        </View>

        <View className="gap-2 relative">
          <Label nativeID="category" className="text-lg">
            Category
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: value && (categories[value]?.name || "Unknown") }}
                onValueChange={(option) => onChange(option?.value)}
              >
                <SelectTrigger className="w-full" aria-aria-labelledby="type">
                  <SelectValue
                    className="text-foreground text-sm native:text-lg"
                    placeholder="Select Category"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                    {categoriesList.map((category) => (
                      <SelectItem key={category.id} label={category.name} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </ScrollView>
                </SelectContent>
              </Select>
            )}
            name="categoryID"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="date" className="text-lg">
            Date
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <DateTimePicker onChange={onChange} date={value} />
            )}
            name="datetime"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="title" className="text-lg">
            Title
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className="px-3 py-2 border border-border rounded"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                aria-labelledby="title"
                placeholder="Describe transaction"
              />
            )}
            name="title"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="note" className="text-lg">
            Note
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Textarea
                value={value}
                aria-labelledby="note"
                onChangeText={onChange}
                onBlur={onBlur}
                className="px-3 py-2 border border-border rounded"
              />
            )}
            name="note"
          />
        </View>
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default TransactionForm;
