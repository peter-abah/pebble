import { Text } from "@/components/ui/text";
import { MaterialCommunityIcons } from "@/lib/icons/MaterialCommunityIcons";
import { ReactNode } from "react";
import { View } from "react-native";

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export const PlaceholderBlock = ({ title, description, icon }: PlaceholderProps) => {
  return (
    <View className="flex-1 justify-center items-center py-10">
      <View className="p-10 rounded-full bg-muted mb-6">
        {icon ?? (
          <MaterialCommunityIcons
            name="folder-outline"
            size={100}
            className="text-muted-foreground"
          />
        )}
      </View>

      <Text className="text-2xl font-sans_bold mb-3 w-4/5 text-center">{title}</Text>

      {description && <Text className="text-lg font-sans_medium w-4/5">{description}</Text>}
    </View>
  );
};
