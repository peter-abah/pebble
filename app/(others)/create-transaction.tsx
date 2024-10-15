import DateTimePicker from "@/components/date-time-picker";
import ScreenWrapper from "@/components/screen-wrapper";
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
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { createMoney } from "@/lib/money";
import { useStoreContext } from "@/lib/store-context";
import { TRANSACTION_TYPES } from "@/lib/types";
import { isStringNumeric, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { nanoid } from "nanoid";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TextInput, View } from "react-native";
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
  title: z.string().min(1, { message: "Enter title" }),
  categoryID: z.string().min(1, { message: "Select category" }),
  note: z.string().optional(),
  type: z.enum(TRANSACTION_TYPES),
});

type FormSchema = z.infer<typeof formSchema>;

const CreateTransaction = () => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    defaultValues: {
      title: "",
      datetime: new Date(),
      note: "",
      categoryID: "",
      type: "debit",
    },
    resolver: zodResolver(formSchema),
  });

  const categories = useStoreContext((state) => state.categories);
  const createTransaction = useStoreContext((state) => state.upsertTransaction);
  const mainAccount = useStoreContext((state) => state.accounts[state.defaultAccountID]);
  const currency = mainAccount.currency;
  const categoriesList = Object.values(categories);

  const onSubmit = ({ amount, title, note, type, categoryID, datetime }: FormSchema) => {
    createTransaction({
      id: nanoid(),
      amount: createMoney(amount, currency),
      type,
      categoryID,
      title,
      note,
      accountID: mainAccount.id,
      datetime: datetime.toISOString(),
    });
    router.replace("/");
    reset;
  };

  return (
    <ScreenWrapper className="!p-6">
      <View className="flex-row gap-4 items-center mb-6">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeft className="text-foreground" size={28} />
        </Button>
        <Text className="font-bold text-3xl">Add transaction</Text>
      </View>

      <ScrollView contentContainerClassName="py-4 gap-4" style={{ flex: 1 }}>
        <View className="flex-row gap-1 items-center mb-6">
          <Text className="text-3xl font-semibold leading-none mt-2">{currency.symbol}</Text>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                placeholder="Enter Amount"
                aria-labelledby="amount"
                autoFocus
                value={value?.toString() || ""}
                onBlur={onBlur}
                onChangeText={onChange}
                inputMode="numeric"
                className="text-3xl font-semibold p-0 grow"
                numberOfLines={1}
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
                  <SelectGroup>
                    {categoriesList.map((category) => (
                      <SelectItem key={category.id} label={category.name} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
    </ScreenWrapper>
  );
};

export default CreateTransaction;
