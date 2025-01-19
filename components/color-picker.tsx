import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GROUP_COLORS, HEX_TO_GROUP_COLOR } from "@/lib/constants";
import { cn, humanizeString } from "@/lib/utils";
import { vars } from "nativewind";
import { useState } from "react";
import { Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ColorPickerProps {
  value: string;
  onChange: (value?: string) => void;
}
const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const insets = useSafeAreaInsets();

  const [contentInsets, setContentInsets] = useState({
    top: insets.top,
    bottom: insets.bottom,
    left: 24,
    right: 24,
  });

  const colorName = HEX_TO_GROUP_COLOR[value]?.name;
  const selectValue = value
    ? {
        value,
        label: humanizeString(colorName || value),
      }
    : undefined;

  return (
    <Select
      value={selectValue}
      onValueChange={(option) => onChange(option?.value)}
      className="w-full"
    >
      <SelectTrigger
        className="w-full gap-1 items-center"
        aria-labelledby="color"
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContentInsets((prev) => ({
            ...prev,
            right: Dimensions.get("screen").width - (prev.left + width),
          }));
        }}
      >
        <SelectValue
          className={cn("px-4 py-2 flex-1 rounded-xl text-white", !value && "text-foreground")}
          style={{ backgroundColor: value || "transparent" }}
          placeholder="Select Color"
        />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-full">
        <FlatList
          data={GROUP_COLORS}
          renderItem={({ item: color }) => (
            <SelectItem
              label={""}
              value={color.color}
              className="text-white h-auto py-2 px-4 rounded-xl active:bg-[--bg]/10 bg-[--bg]"
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
