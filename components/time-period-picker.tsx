import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { ChevronRightIcon } from "@/lib/icons/ChevronRIght";
import { PERIODS, TimePeriod } from "@/lib/types";
import { assertUnreachable, titleCase } from "@/lib/utils";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Option } from "@rn-primitives/select";
import dayjs from "dayjs";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TimePeriodPickerProps {
  timePeriod: TimePeriod;
  onValueChange: (value: TimePeriod) => void;
}

function TimePeriodPicker({ timePeriod, onValueChange }: TimePeriodPickerProps) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(timePeriod.date.toISOString()),
      onChange: (event, date) => {
        onValueChange({ ...timePeriod, date: date ? dayjs(date) : timePeriod.date });
      },
      mode: "date",
    });
  };

  const incrementDate = () => {
    switch (timePeriod.period) {
      case "monthly":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "month") });
        break;
      case "weekly":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "week") });
        break;
      case "yearly":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "year") });
        break;
      case "all time":
        break;
      default:
        assertUnreachable(timePeriod.period);
    }
  };

  const decrementDate = () => {
    switch (timePeriod.period) {
      case "monthly":
        onValueChange({ ...timePeriod, date: timePeriod.date.subtract(1, "month") });
        break;
      case "weekly":
        onValueChange({ ...timePeriod, date: timePeriod.date.subtract(1, "week") });
        break;
      case "yearly":
        onValueChange({ ...timePeriod, date: timePeriod.date.subtract(1, "year") });
        break;
      case "all time":
        break;
      default:
        assertUnreachable(timePeriod.period);
    }
  };

  const handlePeriodChange = (option: Option) => {
    if (!option) return;
    onValueChange({ ...timePeriod, period: option?.value as TimePeriod["period"] });
  };
  return (
    <View className="flex-row items-center justify-between">
      {timePeriod.period !== "all time" ? (
        <View className="flex-row gap-1 items-center">
          <Button variant={"ghost"} size="icon" onPress={decrementDate} className="-ml-2">
            <ChevronLeftIcon className="text-foreground" size={20} />
          </Button>
          <Pressable onPress={showDatePicker}>
            <Text className="font-sans_semibold">{renderDate(timePeriod)}</Text>
          </Pressable>
          <Button variant={"ghost"} size="icon" onPress={incrementDate}>
            <ChevronRightIcon className="text-foreground" size={20} />
          </Button>
        </View>
      ) : null}
      <View className="flex-row gap-2 items-center ml-auto">
        <Select
          value={{ value: timePeriod.period, label: titleCase(timePeriod.period) }}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="gap-4" aria-labelledby="type">
            <SelectValue className="text-foreground" placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            <SelectGroup>
              {PERIODS.map((period) => (
                <SelectItem key={period} value={period} label={titleCase(period)}>
                  {titleCase(period)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
}

const renderDate = (timePeriod: TimePeriod): string => {
  switch (timePeriod.period) {
    case "yearly":
      return timePeriod.date.year().toString();
    case "monthly":
      return timePeriod.date.format("MMM YYYY");
    case "weekly": {
      const firstDay = timePeriod.date.day(0);
      const lastDay = timePeriod.date.day(6);
      return `${firstDay.format("MMM DD")} - ${lastDay.format("MMM DD, YYYY")}`;
    }
    case "all time":
      return timePeriod.date.format("MMM DD, YYYY");
  }
};

export default TimePeriodPicker;
