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
import * as LabelPrimitive from "@rn-primitives/label";

import { useAppStore } from "@/lib/store";
import { Account, TRANSACTION_TYPES, TransactionCategory } from "@/lib/types";
import { isStringNumeric, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const baseTransactionFormSchema = z.object({
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
  note: z.string().optional(),
});

const transferTransactionFormSchema = z
  .object({
    from: z.string().min(1, { message: "Select sending account" }),
    to: z.string().min(1, { message: "Select receiving account" }),
    exchangeRate: z.union([
      z
        .string()
        .refine(isStringNumeric, { message: "Enter a number" })
        .transform(Number)
        .refine((v) => v > 0, { message: "Exchange rate must be greater than zero." }),
      z
        .number({ message: "Exchange rate is required" })
        .gt(0, { message: "Exchange rate must be greater than zero." }),
    ]),
    type: z.literal("transfer"),
  })
  .merge(baseTransactionFormSchema);

const normalTransactionFormSchema = z
  .object({
    categoryID: z.string().min(1, { message: "Select category" }),
    accountID: z.string().min(1, { message: "Select account" }),
    type: z.enum(["expense", "income"]),
  })
  .merge(baseTransactionFormSchema);

const formSchema = z
  .discriminatedUnion("type", [transferTransactionFormSchema, normalTransactionFormSchema])
  .refine(
    (data) => {
      if (data.type !== "transfer") return true;
      return data.from !== data.to;
    },
    {
      message: "Receiving account cannot be same Sending account",
      path: ["to"],
    }
  );

export type FormSchema = z.infer<typeof formSchema>;

// TODO: zod is slow, probably due to handlimg large immutable data, research on it and fix
// THAT IS PROBABLY A ZUSTAND PROBLEM RATHER THAN ZOD, STILL TIME IT
interface TransactionFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const TransactionForm = ({ defaultValues, onSubmit }: TransactionFormProps) => {
  const categories = useAppStore((state) => state.categories);
  const accountsMap = useAppStore((state) => state.accounts);
  const accounts = Object.values(accountsMap) as Array<Account>;

  const { control, handleSubmit, watch } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const type = watch("type");
  const account = accountsMap[watch("accountID")];
  const fromAccount = accountsMap[watch("from")];
  const toAccount = accountsMap[watch("to")];

  const currency = type === "transfer" ? fromAccount?.currency : account?.currency;
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
          <Text className="text-3xl font-semibold leading-none mt-1.5">{currency?.symbol}</Text>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                placeholder="Enter Amount"
                aria-labelledby="amount"
                autoFocus={!defaultValues.amount}
                value={
                  typeof value === "string" ? value : value?.toFixed(currency?.minorUnit) || ""
                }
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

        {type === "transfer" ? (
          <>
            <View className="gap-2">
              <Label nativeID="from" className="text-lg">
                From
              </Label>
              <Controller
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Select
                    value={{ value, label: value && (accountsMap[value]?.name || "Unknown") }}
                    onValueChange={(option) => onChange(option?.value)}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="to">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select Sending Account"
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
                name="from"
              />
            </View>

            <View className="gap-2">
              <Label nativeID="to" className="text-lg">
                To
              </Label>
              <Controller
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Select
                    value={{ value, label: value && (accountsMap[value]?.name || "Unknown") }}
                    onValueChange={(option) => onChange(option?.value)}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="to">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select Receiving Account"
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
                name="to"
              />
            </View>

            <View className="gap-2">
              <LabelPrimitive.Root
                nativeID="exchangeRate"
                className="text-lg flex-row gap-1 items-center"
              >
                <Text>Exchange rate</Text>
                {fromAccount && toAccount ? (
                  <Text className="text-xs">
                    ({fromAccount.currency.isoCode} to {toAccount.currency.isoCode})
                  </Text>
                ) : null}
              </LabelPrimitive.Root>
              <Controller
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className="px-3 py-2 border border-border rounded"
                    value={value === undefined ? "" : value.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    aria-labelledby="exchangeRate"
                    inputMode="numeric"
                    placeholder="Enter exchange rate"
                  />
                )}
                name="exchangeRate"
              />
            </View>
          </>
        ) : (
          <>
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
          </>
        )}

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
