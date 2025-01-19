import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeftIcon } from "@/lib/icons/ChevronLeft";
import { MaterialIcons } from "@/lib/icons/MaterialIcons";
import { Link, router } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";

interface ResourceNotFoundProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

// todo: rename to more general name, errorish
const ResourceNotFound = ({ title, description, icon }: ResourceNotFoundProps) => {
  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center px-6 py-4">
        <Button
          onPress={() => router.back()}
          className="rounded-full p-0 active:bg-accent -ml-2 items-center justify-center"
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="text-foreground" size={24} />
        </Button>
      </View>
      <View className="flex-1 items-center pt-10">
        <View className="p-10 rounded-full bg-muted mb-6">
          {icon ? (
            icon
          ) : (
            <MaterialIcons name="error" size={100} className="text-muted-foreground" />
          )}
        </View>
        <Text className="text-2xl font-sans_bold mb-3 w-4/5 text-center">{title}</Text>
        {description ? <Text className="text-lg font-sans_medium w-4/5">{description}</Text> : null}
        <Link href={"/"} asChild>
          <Button className="mx-auto mt-6 px-8">
            <Text className="text-lg">Back to home</Text>
          </Button>
        </Link>
      </View>
    </ScreenWrapper>
  );
};

export default ResourceNotFound;
