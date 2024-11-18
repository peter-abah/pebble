import { CATEGORY_ICONS, CategoryIconName } from "@/lib/icons/category-icons";
import { type Icon as IconType } from "@/lib/types";
import { View } from "react-native";
import { Text } from "./ui/text";
import { ReactNode } from "react";

interface IconProps {
  type: IconType["type"];
  value: string;
  color?: string;
}
export const Icon = ({ type, value, color }: IconProps): ReactNode => {
  switch (type) {
    case "emoji":
      return <Text className="text-2xl">{value}</Text>;
    case "icon":
      return (
        <View>
          {CATEGORY_ICONS[value as CategoryIconName]?.({
            className: "text-foreground",
            size: 24,
            color: color ? color : undefined,
          }) || ""}
        </View>
      );
  }
};
