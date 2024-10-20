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
import { titleCase } from "@/lib/utils";
import { Option } from "@rn-primitives/select";
import { Dayjs } from "dayjs";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const periods = ["monthly", "weekly", "annually"] as const;
export interface TimePeriod {
  period: (typeof periods)[number];
  date: Dayjs;
}
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

  const incrementDate = () => {
    switch (timePeriod.period) {
      case "monthly":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "month") });
        break;
      case "weekly":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "week") });
        break;
      case "annually":
        onValueChange({ ...timePeriod, date: timePeriod.date.add(1, "year") });
        break;
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
      case "annually":
        onValueChange({ ...timePeriod, date: timePeriod.date.subtract(1, "year") });
        break;
    }
  };

  const handlePeriodChange = (option: Option) => {
    if (!option) return;
    onValueChange({ ...timePeriod, period: option?.value as TimePeriod["period"] });
  };
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row gap-1 items-center">
        <Button variant={"ghost"} size="icon" onPress={decrementDate} className="-ml-2">
          <ChevronLeftIcon className="text-foreground" size={20} />
        </Button>
        <Text className="font-semibold">{renderDate(timePeriod)}</Text>
        <Button variant={"ghost"} size="icon" onPress={incrementDate}>
          <ChevronRightIcon className="text-foreground" size={20} />
        </Button>
      </View>
      <View className="flex-row gap-2 items-center">
        <Select
          value={{ value: timePeriod.period, label: titleCase(timePeriod.period) }}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="gap-4" aria-aria-labelledby="type">
            <SelectValue className="text-foreground" placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            <SelectGroup>
              {periods.map((period) => (
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

const renderDate = (timePeriod: TimePeriod) => {
  switch (timePeriod.period) {
    case "annually":
      return timePeriod.date.year();
    case "monthly":
      return timePeriod.date.format("MMM YYYY");
    case "weekly":
      const firstDay = timePeriod.date.day(0);
      const lastDay = timePeriod.date.day(6);
      return `${firstDay.format("MMM DD")} - ${lastDay.format("MMM DD, YYYY")}`;
  }
};

export default TimePeriodPicker;
