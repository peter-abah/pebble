import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps extends ComponentProps<typeof SafeAreaView> {}
const ScreenWrapper = ({ children, className, ...rest }: ScreenWrapperProps) => {
  return (
    <SafeAreaView className={cn("grow bg-gray-200", className)} {...rest}>
      {children}
    </SafeAreaView>
  );
};

export default ScreenWrapper;
