import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GROUP_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { vars } from "nativewind";
import { Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ColorPickerProps {
  value: string;
  onChange: (value?: string) => void;
}
const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  };
  const selectValue = value
    ? {
        value,
        label: value,
      }
    : undefined;

  return (
    <Select
      value={selectValue}
      onValueChange={(option) => onChange(option?.value)}
      className="w-full"
    >
      <SelectTrigger className="w-full gap-1 h-10 items-center" aria-aria-labelledby="type">
        <SelectValue
          className={cn("px-4 py-2 flex-1 rounded-lg text-white", !value && "text-foreground")}
          style={{ backgroundColor: value || "transparent" }}
          placeholder="Select Color"
        />
      </SelectTrigger>
      <SelectContent
        insets={{
          ...contentInsets,
          left: 24,
          right: (Dimensions.get("screen").width - contentInsets.left * 2) / 2,
        }}
        className="w-full"
      >
        <FlatList
          data={GROUP_COLORS}
          renderItem={({ item: color }) => (
            <SelectItem
              label={""}
              value={color.color}
              className="text-white h-auto py-2 px-4 rounded-lg active:bg-[--bg]/10 bg-[--bg]"
              style={vars({ "--bg": color.color || "#333" })}
            />
          )}
          keyExtractor={(item, index) => item.color}
          className="max-h-40"
          contentContainerClassName="gap-4"
          onStartShouldSetResponder={() => true}
        />
      </SelectContent>
    </Select>
  );
};

export default ColorPicker;
