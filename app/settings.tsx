import DateTimePicker from "@/components/date-time-picker";
import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  };

  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center pt-8 px-6 pb-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
        <Text className="font-sans_semibold text-2xl">Settings</Text>
      </View>

      <ScrollView className="px-6" contentContainerClassName="gap-5">
        <View className="gap-2">
          <Text className="text-lg font-sans_semibold">Theme</Text>
          <View className="flex-row items-center justify-between">
            <Text>Theme mode</Text>

            <Select>
              <SelectTrigger aria-labelledby="theme" className="w-[150px]">
                <SelectValue className="text-foreground text-sm" placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent insets={contentInsets} className="w-[150px]">
                <SelectItem label="Dark" value="dark" />
                <SelectItem label="System" value="system" />
                <SelectItem label="Light" value="light" />
              </SelectContent>
            </Select>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-lg font-sans_semibold">Notifications</Text>
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text>Add transaction reminder</Text>

              <Switch
                checked={true}
                onCheckedChange={() => {}}
                nativeID="add-transaction-reminder"
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text>Reminder time</Text>

              <DateTimePicker date={new Date()} onChange={() => {}} mode="time" />
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text>Upcoming transactions reminder</Text>

            <Switch checked={true} onCheckedChange={() => {}} nativeID="add-transaction-reminder" />
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-lg font-sans_semibold">Security</Text>
          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Passcode</Text>
          </Button>
        </View>

        <View className="gap-3">
          <Text className="text-lg font-sans_semibold">Data</Text>

          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Export Pebble data file</Text>
          </Button>

          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Import Pebble data file</Text>
          </Button>

          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Google drive</Text>
          </Button>

          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Export CSV</Text>
          </Button>

          <Button variant={"ghost"} className="-ml-4">
            <Text className="w-full font-normal text-base">Import CSV</Text>
          </Button>

          <Button variant={"ghost"} className="-ml-4 hover:text-current">
            <Text className="w-full font-normal text-base text-destructive">Reset data</Text>
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Settings;
