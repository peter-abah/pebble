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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CreateTransaction = () => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
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
          <Text className="text-3xl font-semibold">$</Text>
          <Input
            placeholder="Enter Amount"
            aria-labelledby="amount"
            autoFocus
            inputMode="numeric"
            className="text-3xl font-semibold border-none p-0"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="catgory" className="text-lg">
            Transaction Type
          </Label>
          <Select defaultValue={{ value: "apple", label: "Apple" }}>
            <SelectTrigger className="w-full" aria-aria-labelledby="category">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Select a fruit"
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="w-[250px]">
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem label="Apple" value="apple">
                  Apple
                </SelectItem>
                <SelectItem label="Banana" value="banana">
                  Banana
                </SelectItem>
                <SelectItem label="Blueberry" value="blueberry">
                  Blueberry
                </SelectItem>
                <SelectItem label="Grapes" value="grapes">
                  Grapes
                </SelectItem>
                <SelectItem label="Pineapple" value="pineapple">
                  Pineapple
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        <View className="gap-2">
          <Label nativeID="catgory" className="text-lg">
            Category
          </Label>
          <Select defaultValue={{ value: "apple", label: "Apple" }}>
            <SelectTrigger className="w-full" aria-aria-labelledby="category">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Select a fruit"
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="w-[250px]">
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem label="Apple" value="apple">
                  Apple
                </SelectItem>
                <SelectItem label="Banana" value="banana">
                  Banana
                </SelectItem>
                <SelectItem label="Blueberry" value="blueberry">
                  Blueberry
                </SelectItem>
                <SelectItem label="Grapes" value="grapes">
                  Grapes
                </SelectItem>
                <SelectItem label="Pineapple" value="pineapple">
                  Pineapple
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        <View className="gap-2">
          <Label nativeID="date" className="text-lg">
            Date
          </Label>
          <DateTimePicker onChange={() => {}} date={new Date()} />
        </View>

        <View className="gap-2">
          <Label nativeID="title" className="text-lg">
            Title
          </Label>
          <Input className="px-3 py-2 border border-border rounded" />
        </View>

        <View className="gap-2">
          <Label nativeID="title" className="text-lg">
            Note
          </Label>
          <Textarea className="px-3 py-2 border border-border rounded" />
        </View>
      </ScrollView>

      <Button>
        <Text className="text-lg">Save</Text>
      </Button>
    </ScreenWrapper>
  );
};

export default CreateTransaction;
