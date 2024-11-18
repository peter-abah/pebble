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
import { TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import ColorPicker from "./color-picker";

const formSchema = z.object({
  name: z.string(),
  currency: z.string(),
  color: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface EditAccountFormProps {
  defaultValues: Partial<FormSchema>;
  onSubmit: (values: FormSchema) => void;
}
const EditAccountForm = ({ defaultValues, onSubmit }: EditAccountFormProps) => {
  const { control, handleSubmit } = useForm<FormSchema>({
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
        {/* TODO: CHANGE IN ACCOUNT CURRENCY SHOULD MODIFY ALL ACCOUNT TRANSACTIONS */}
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
            )}
            name="currency"
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
      </ScrollView>

      <Button onPress={handleSubmit(onSubmit)} className="mx-6">
        <Text className="text-lg">Save</Text>
      </Button>
    </View>
  );
};

export default EditAccountForm;
