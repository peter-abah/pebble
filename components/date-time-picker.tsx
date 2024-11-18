import { Text } from "@/components/ui/text";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { Pressable, View } from "react-native";
import { Button } from "./ui/button";

export type DateTimePickerMode = "time" | "date";
type Props = {
  onChange: (date?: Date) => void;
  date?: Date;
  mode?: "date" | "time";
  showClearButton?: boolean;
};
export default function DateTimePicker({ onChange, date, mode, showClearButton }: Props) {
  const _onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    onChange(selectedDate);
  };

  const showMode = (currentMode: DateTimePickerMode) => {
    DateTimePickerAndroid.open({
      value: date || new Date(),
      onChange: _onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const renderDate = (date: Date) => {
    const dayjsDate = dayjs(date);
    const today = dayjs();
    if (today.isSame(dayjsDate, "day")) {
      return "Today";
    }
    if (today.add(1, "day").isSame(dayjsDate, "day")) {
      return "Tomorrow";
    }
    if (today.subtract(1, "day").isSame(dayjsDate, "day")) {
      return "Yesterday";
    }
    if (today.isSame(dayjsDate, "year")) {
      return dayjsDate.format("MMMM D");
    }
    return dayjsDate.format("MMM D, YYYY");
  };
  return (
    <View className="flex-row items-center gap-2">
      <View className="border border-border flex-row items-center px-3 py-2 gap-6 rounded-xl shrink">
        {mode !== "time" && (
          <Pressable onPress={showDatepicker} className="w-full shrink">
            <Text className="text-lg font-">{date ? renderDate(date) : "Select date"}</Text>
          </Pressable>
        )}
        {mode !== "date" && date && (
          <Pressable onPress={showTimepicker} className="shrink-0">
            <Text>{date ? dayjs(date).format("hh:mm A") : "Select time"}</Text>
          </Pressable>
        )}
      </View>
      {showClearButton && date && (
        <Button variant={"outline"} className="shrink-0" onPress={() => onChange(undefined)}>
          <Text className="font-normal">Clear</Text>
        </Button>
      )}
    </View>
  );
}
