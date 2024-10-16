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
import { useStoreContext } from "@/lib/store-context";
import { Currency, TRANSACTION_TYPES } from "@/lib/types";
import { isStringNumeric, roundNumber, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const createFormSchema = (currency: Currency) =>
  z.object({
    amount: z.union([
      z
        .string()
        .refine(isStringNumeric, { message: "Enter a number" })
        .transform((n) => roundNumber(Number(n), currency.minorUnit))
        .refine((v) => v > 0, { message: "Enter amount greater than zero" }),
      z.number().positive({ message: "Enter amount greater than zero" }),
    ]),
    datetime: z.date(),
    title: z.string().optional(),
    categoryID: z.string().min(1, { message: "Select category" }),
    note: z.string().optional(),
    type: z.enum(TRANSACTION_TYPES),
  });

export type FormSchema = z.infer<ReturnType<typeof createFormSchema>>;

interface TransactionFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const TransactionForm = ({ defaultValues, onSubmit }: TransactionFormProps) => {
  const categories = useStoreContext((state) => state.categories);
  const mainAccount = useStoreContext((state) => state.accounts[state.defaultAccountID]);
  const currency = mainAccount.currency;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(createFormSchema(currency)),
  });
  const type = watch("type");
  const categoriesList = Object.values(categories).filter((c) => c.type === type || !c.type);

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

        <View className="gap-2 relative">
          <Label nativeID="category" className="text-lg">
            Category
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={{ value, label: categories[value]?.name }}
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

      <Button onPress={handleSubmit(onSubmit)}>
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default TransactionForm;
