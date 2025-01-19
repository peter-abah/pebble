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
import { CURRENCIES } from "@/lib/data/currencies";
import { renderCurrencyLabel } from "@/lib/money";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import ColorPicker from "./color-picker";
import { Checkbox } from "./ui/checkbox";

const formSchema = z.object({
  name: z.string(),
  currencyCode: z.string(),
  color: z.string(),
  isMainAccount: z.boolean().optional(),
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
        {/* todo: currency list takes time to render in select && currency list sort in select */}
        {/* todo: inform users of the type of change that occurs when currency is changed */}
        {/* TODO: BUGGG CHANGE IN ACCOUNT CURRENCY SHOULD MODIFY ALL ACCOUNT TRANSACTIONS and account balanxe
          this will involve account transactions being able to have diff currency from related account. also need
          to store exchange rates in db */}
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
                {errors.currencyCode?.message && (
                  <Text className="text-xs text-destructive">{errors.currencyCode.message}</Text>
                )}
              </View>
            )}
            name="currencyCode"
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

        <View className="gap-2 relative flex-row items-center justify-between">
          <Label nativeID="isMainAccount" className="text-lg">
            Set as main account
          </Label>
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Checkbox
                checked={value || false}
                // the user is only allowed to set the account as the main account, the user can unset
                // the only way to unset is to set another account as the main account
                onCheckedChange={(v) => {
                  if (defaultValues.isMainAccount) {
                    Alert.alert(
                      "Cannot remove account as main account",
                      "Set another account as the main account to remove this account as the main account."
                    );
                    return;
                  }
                  onChange(v);
                }}
              />
            )}
            name="isMainAccount"
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
