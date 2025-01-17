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

import { getAccounts } from "@/db/queries/accounts";
import { getCategories } from "@/db/queries/categories";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { useAppStore } from "@/lib/store";
import { arrayToMap, cn, humanizeString, isStringNumeric, valueToNumber } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import ResourceNotFound from "./resource-not-found";
import TransactionPicker from "./transaction-picker";

const baseTransactionFormSchema = z.object({
  amount: z.union([
    z
      .string({ message: "Enter amount" })
      .refine(isStringNumeric, { message: "Amount must be a number" })
      .transform(Number)
      .refine((v) => v > 0, { message: "Amount must greater than zero" }),
    z.number({ message: "Enter amount" }).positive({ message: "Amount must greater than zero" }),
  ]),
  datetime: z.date({ message: "Enter date" }),
  title: z.string().optional(),
  note: z.string().optional(),
});

const transferTransactionFormSchema = baseTransactionFormSchema.merge(
  z.object({
    from: z.number({ message: "Select sending account" }),
    to: z.number({ message: "Select receiving account" }),
    exchangeRate: z.union([
      z
        .string({ message: "Enter exchange rate" })
        .refine(isStringNumeric, { message: "Enter a number" })
        .transform(Number)
        .refine((v) => v > 0, { message: "Exchange rate must be greater than zero." }),
      z
        .number({ message: "Enter exchange rate" })
        .gt(0, { message: "Exchange rate must be greater than zero." }),
    ]),
    type: z.literal("transfer", { message: "Select type" }),
  })
);

const normalTransactionFormSchema = baseTransactionFormSchema.merge(
  z.object({
    categoryID: z.number({ message: "Select category" }),
    accountID: z.number({ message: "Select account" }),
    type: z.enum(["expense", "income"], { message: "Select type" }),
  })
);

const loanTransactionFormSchema = baseTransactionFormSchema.merge(
  z.object({
    accountID: z.number({ message: "Select account" }),
    type: z.enum(["lent", "borrowed"], { message: "Select type" }),
    dueDate: z.date({ message: "Due date must be a valid date" }).optional(),
    title: z
      .string({ message: "Enter transaction title" })
      .min(1, { message: "Enter transaction title" }),
  })
);

const loanPaymentTransactionFormSchema = z
  .object({
    accountID: z.number({ message: "Select account" }),
    loanID: z.number({ message: "Select loan" }),
    type: z.enum(["paid_loan", "collected_debt"], { message: "Select type" }),
  })
  .merge(baseTransactionFormSchema);

const formSchema = z
  .discriminatedUnion("type", [
    transferTransactionFormSchema,
    normalTransactionFormSchema,
    loanTransactionFormSchema,
    loanPaymentTransactionFormSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.type === "transfer" && data.from === data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Receiving account cannot be same sending account.",
        path: ["to"],
      });
    }

    if (data.type === "lent" || (data.type === "borrowed" && data.dueDate)) {
      if (dayjs(data.dueDate).isSameOrBefore(data.datetime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Loan due date must be after loan date.",
          path: ["dueDate"],
        });
      }
    }
  });

export type FormSchema = z.infer<typeof formSchema>;

interface TransactionFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const TransactionForm = ({ defaultValues, onSubmit }: TransactionFormProps) => {
  const { data: accounts, isError: isAccountsError } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    initialData: [],
  });
  const accountsMap = useMemo(() => arrayToMap(accounts, ({ id }) => id), [accounts]);
  const { data: categories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    initialData: [],
  });
  const categoriesMap = useMemo(() => arrayToMap(categories, ({ id }) => id), [categories]);

  const exchangeRates = useAppStore((state) => state.exchangeRates);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const accountID = watch("accountID");
  const fromAccountID = watch("from");
  const toAccountID = watch("to");

  const account = accountsMap[accountID];
  const fromAccount = accountsMap[fromAccountID];
  const toAccount = accountsMap[toAccountID];

  const type = watch("type");
  const currencyCode = type === "transfer" ? fromAccount?.currency_code : account?.currency_code;
  const currency = currencyCode ? CURRENCIES_MAP[currencyCode] : undefined;

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  if (isCategoriesError || isAccountsError) {
    return <ResourceNotFound title="An error occured" />;
  }

  // TODO: go to next input after finishing  input
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="py-4 gap-4" className="flex-1 px-6">
        <View>
          <View className="flex-row gap-1 items-center">
            <Text className="text-3xl font-semibold leading-none mt-1.5">
              {currency?.symbol || ""}
            </Text>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="Enter Amount"
                  aria-labelledby="amount"
                  autoFocus={!defaultValues.amount}
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
                  className="text-3xl font-semibold p-0 grow"
                />
              )}
              name="amount"
            />
          </View>
          {errors.amount?.message && (
            <Text className="text-xs text-destructive">{errors.amount.message}</Text>
          )}
        </View>

        <View className="gap-2">
          <Label nativeID="date" className="text-lg">
            Date
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <DateTimePicker onChange={onChange} date={value} />
                {errors.datetime?.message && (
                  <Text className="text-xs text-destructive">{errors.datetime.message}</Text>
                )}
              </View>
            )}
            name="datetime"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="type" className="text-lg">
            Type
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <Select
                  value={value ? { value, label: humanizeString(type) } : undefined}
                  onValueChange={(option) => onChange(option?.value)}
                >
                  <SelectTrigger className="w-full" nativeID="type">
                    <SelectValue
                      className="text-foreground text-sm native:text-lg"
                      placeholder="Select transaction type"
                    />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets} className="w-full">
                    <SelectGroup>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type} label={humanizeString(type)} value={type} />
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.type?.message && (
                  <Text className="text-xs text-destructive">{errors.type.message}</Text>
                )}
              </View>
            )}
            name="type"
          />
        </View>

        {/* TRANSFER TRANSACTION FIELDS INPUTS  */}
        <View className={cn("gap-4 hidden", type === "transfer" && "flex")}>
          <View className="gap-2">
            <Label nativeID="from" className="text-lg">
              From
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <Select
                    value={
                      value
                        ? { value: value.toString(), label: accountsMap[value]?.name || "Unknown" }
                        : undefined
                    }
                    onValueChange={(option) => {
                      onChange(valueToNumber(option?.value));
                      if (!option?.value) return;

                      const fromCurrencyCode =
                        accountsMap[Number(option.value)]?.currency_code.toLocaleLowerCase();
                      const toCurrencyCode = toAccount?.currency_code.toLocaleLowerCase();
                      if (!fromCurrencyCode || !toCurrencyCode) return;

                      const exchangeRate = exchangeRates[fromCurrencyCode]?.rates[toCurrencyCode];
                      if (exchangeRate === undefined) return;

                      setValue("exchangeRate", exchangeRate);
                    }}
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
                          <SelectItem
                            key={account.id}
                            label={account.name}
                            value={account.id.toString()}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {"from" in errors && errors.from?.message && (
                    <Text className="text-xs text-destructive">{errors.from.message}</Text>
                  )}
                </View>
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
                <View>
                  <Select
                    value={
                      value
                        ? { value: value.toString(), label: accountsMap[value]?.name || "Unknown" }
                        : undefined
                    }
                    onValueChange={(option) => {
                      onChange(valueToNumber(option?.value));

                      if (!option?.value) return;

                      const fromCurrencyCode = fromAccount?.currency_code.toLocaleLowerCase();
                      const toCurrencyCode =
                        accountsMap[Number(option.value)]?.currency_code.toLocaleLowerCase();
                      if (!fromCurrencyCode || !toCurrencyCode) return;

                      const exchangeRate = exchangeRates[fromCurrencyCode]?.rates[toCurrencyCode];
                      if (exchangeRate === undefined) return;

                      setValue("exchangeRate", exchangeRate);
                    }}
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
                          <SelectItem
                            key={account.id}
                            label={account.name}
                            value={account.id.toString()}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {"to" in errors && errors.to?.message && (
                    <Text className="text-xs text-destructive">{errors.to.message}</Text>
                  )}
                </View>
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
                  ({fromAccount.currency_code} to {toAccount.currency_code})
                </Text>
              ) : null}
            </LabelPrimitive.Root>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <Input
                    className="px-3 py-2 border border-border rounded"
                    value={value === undefined ? "" : value.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    aria-labelledby="exchangeRate"
                    inputMode="numeric"
                    placeholder="Enter exchange rate"
                  />

                  {"exchangeRate" in errors && errors.exchangeRate?.message && (
                    <Text className="text-xs text-destructive">{errors.exchangeRate.message}</Text>
                  )}
                </View>
              )}
              name="exchangeRate"
            />
          </View>
        </View>

        {/* EXPENSE/INCOME TRANSACTION FIELDS INPUTS  */}
        <View className={cn("gap-4 hidden", (type === "income" || type === "expense") && "flex")}>
          <View className="gap-2">
            <Label nativeID="accountID" className="text-lg">
              Account
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <Select
                  value={
                    value
                      ? { value: value.toString(), label: accountsMap[value]?.name || "Unknown" }
                      : undefined
                  }
                  onValueChange={(option) => onChange(valueToNumber(option?.value))}
                >
                  <SelectTrigger className="w-full" aria-labelledby="type">
                    <SelectValue
                      className="text-foreground text-sm native:text-lg"
                      placeholder="Select Account"
                    />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets} className="w-full">
                    <SelectGroup>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          label={account.name}
                          value={account.id.toString()}
                        />
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
                <View>
                  <Select
                    value={{
                      value: value ? value.toString() : "",
                      label: value ? categoriesMap[value]?.name || "Unknown" : "Choose category",
                    }}
                    onValueChange={(option) => onChange(valueToNumber(option?.value))}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="type">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select Category"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets} className="w-full">
                      <ScrollView className="max-h-40" onStartShouldSetResponder={() => true}>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            label={category.name}
                            value={category.id.toString()}
                          />
                        ))}
                      </ScrollView>
                    </SelectContent>
                  </Select>
                  {"categoryID" in errors && errors.categoryID?.message && (
                    <Text className="text-xs text-destructive">{errors.categoryID.message}</Text>
                  )}
                </View>
              )}
              name="categoryID"
            />
          </View>
        </View>

        {/* LOAN TRANSACTION FIELDS INPUTS  */}
        <View className={cn("gap-4 hidden", (type === "lent" || type === "borrowed") && "flex")}>
          <View className="gap-2">
            <Label nativeID="accountID" className="text-lg">
              Account
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <Select
                    value={
                      value
                        ? { value: value.toString(), label: accountsMap[value]?.name || "Unknown" }
                        : undefined
                    }
                    onValueChange={(option) => onChange(valueToNumber(option?.value))}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="type">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select Account"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets} className="w-full">
                      <SelectGroup>
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            label={account.name}
                            value={account.id.toString()}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {"accountID" in errors && errors.accountID?.message && (
                    <Text className="text-xs text-destructive">{errors.accountID.message}</Text>
                  )}
                </View>
              )}
              name="accountID"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="dueDate" className="text-lg">
              Due Date
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <DateTimePicker onChange={onChange} date={value} showClearButton />
                  {"dueDate" in errors && errors.dueDate?.message && (
                    <Text className="text-xs text-destructive">{errors.dueDate.message}</Text>
                  )}
                </View>
              )}
              name="dueDate"
            />
          </View>
        </View>

        {/* LOAN PAYMENT TRANSACTION FIELDS INPUTS  */}
        <View
          className={cn(
            "gap-4 hidden",
            (type === "paid_loan" || type === "collected_debt") && "flex"
          )}
        >
          <View className="gap-2">
            <Label nativeID="accountID" className="text-lg">
              Account
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <Select
                    value={
                      value
                        ? { value: value.toString(), label: accountsMap[value]?.name || "Unknown" }
                        : undefined
                    }
                    onValueChange={(option) => onChange(valueToNumber(option?.value))}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="type">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select Account"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets} className="w-full">
                      <SelectGroup>
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            label={account.name}
                            value={account.id.toString()}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {"accountID" in errors && errors.accountID?.message && (
                    <Text className="text-xs text-destructive">{errors.accountID.message}</Text>
                  )}
                </View>
              )}
              name="accountID"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="loanID" className="text-lg">
              Loan Transaction
            </Label>
            <Controller
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <TransactionPicker
                    value={value}
                    onChange={onChange}
                    filters={{
                      types: [type === "paid_loan" ? "borrowed" : "lent"],
                      accounts: [],
                      categories: [],
                    }}
                  />
                  {"loanID" in errors && errors.loanID?.message && (
                    <Text className="text-xs text-destructive">{errors.loanID.message}</Text>
                  )}
                </View>
              )}
              name="loanID"
            />
          </View>
        </View>

        <View className="gap-2">
          <Label nativeID="title" className="text-lg">
            Title
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <View>
                <Input
                  className="px-3 py-2 border border-border rounded"
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  aria-labelledby="title"
                  placeholder="Describe transaction"
                />
                {errors.title?.message && (
                  <Text className="text-xs text-destructive">{errors.title.message}</Text>
                )}
              </View>
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
              <View>
                <Textarea
                  value={value || ""}
                  aria-labelledby="note"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="px-3 py-2 border border-border rounded"
                />
                {errors.note?.message && (
                  <Text className="text-xs text-destructive">{errors.note.message}</Text>
                )}
              </View>
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
