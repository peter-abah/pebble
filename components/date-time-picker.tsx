import { Text } from "@/components/ui/text";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Pressable, View } from "react-native";

export type DateTimePickerMode = "time" | "date";
type Props = {
  onChange: (date?: Date) => void;
  date: Date;
};
export default function DateTimePicker({ onChange, date }: Props) {
  const _onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    onChange(selectedDate);
  };

  const showMode = (currentMode: DateTimePickerMode) => {
    DateTimePickerAndroid.open({
      value: date,
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

  return (
    <View className="border border-border flex-row px-3 py-2 gap-6 rounded">
      <Pressable onPress={showDatepicker}>
        <Text>{date.toDateString()}</Text>
      </Pressable>
      <Pressable onPress={showTimepicker}>
        <Text>
          {date.getHours().toString().padStart(2, "0")}:
          {date.getMinutes().toString().padStart(2, "0")}
        </Text>
      </Pressable>
    </View>
  );
}
