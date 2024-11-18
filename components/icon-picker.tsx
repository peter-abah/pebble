import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { NAME_TO_GROUP_COLOR } from "@/lib/constants";
import { emojiPattern } from "@/lib/emoji-regex";
import { CATEGORY_ICONS, CATEGORY_ICONS_NAMES } from "@/lib/icons/category-icons";
import { Icon as IconType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dimensions, TextInput, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Icon } from "./icon";

interface IconPickerProps {
  iconValue?: string;
  iconTypeValue?: IconType["type"];
  onIconChange: (value?: string) => void;
  onIconTypeChange: (value?: IconType["type"]) => void;
  color?: string;
}

const emojiAtStartPattern = new RegExp(`^${emojiPattern}`);

const IconPicker = ({
  iconValue,
  iconTypeValue,
  onIconChange,
  onIconTypeChange,
  color,
}: IconPickerProps) => {
  return (
    <Dialog className="flex-1">
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 rounded-lg px-3 py-0 h-10 font-normal items-start justify-center"
        >
          {iconValue ? (
            <Icon type={iconTypeValue!} value={iconValue} color={color} />
          ) : (
            <Text className="text-sm font-medium text-muted-foreground">Select Icon</Text>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[600px] rounded-2xl"
        style={{
          width: Dimensions.get("screen").width - 24 * 2,
          height: iconTypeValue === "emoji" ? 200 : Dimensions.get("screen").height * 0.75,
        }}
      >
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle>Pick Icon</DialogTitle>
          {iconTypeValue === "emoji" ? (
            <Button variant={"secondary"} onPress={() => onIconTypeChange("icon")}>
              <Text className="font-medium">Use Icon</Text>
            </Button>
          ) : (
            <Button variant={"secondary"} onPress={() => onIconTypeChange("emoji")}>
              <Text className="font-medium">Use Emoji</Text>
            </Button>
          )}
        </DialogHeader>
        {iconTypeValue === "emoji" ? (
          <View className="flex-row gap-4 items-center">
            <Label nativeID="name" className="text-lg">
              Enter Emoji
            </Label>

            <TextInput
              className="px-3 py-2 border border-border rounded flex-1"
              value={iconValue?.match(emojiAtStartPattern)?.[0] || ""}
              onChangeText={(value) => onIconChange(value.match(emojiAtStartPattern)?.[0] || "")}
              aria-labelledby="emoji"
            />
          </View>
        ) : (
          <FlatList
            data={CATEGORY_ICONS_NAMES}
            renderItem={({ item }) => (
              <Button
                onPress={() => {
                  onIconChange(item);
                  onIconTypeChange("icon");
                }}
                className="w-auto p-3 rounded-2xl"
                style={{
                  ...(item === iconValue && {
                    backgroundColor: color || NAME_TO_GROUP_COLOR["purple-dark"].color,
                  }),
                }}
                variant={"ghost"}
              >
                {CATEGORY_ICONS[item]({
                  size: 24,
                  className: cn("text-muted-foreground", item === iconValue && "text-white"),
                })}
              </Button>
            )}
            className="flex-1 w-full"
            numColumns={4}
            contentContainerClassName="gap-6"
            columnWrapperClassName="justify-between gap-6"
          />
        )}
        <DialogClose asChild>
          <Button>
            <Text>Done</Text>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
