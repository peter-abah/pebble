import { PlusIcon } from "@/lib/icons/Plus";
import { cn } from "@/lib/utils";
import { ComponentProps, forwardRef } from "react";
import { Pressable, View } from "react-native";

interface FloatingAddButtonProps extends ComponentProps<typeof Pressable> {}
const FloatingAddButton = forwardRef<View, FloatingAddButtonProps>(
  ({ className, ...rest }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          "absolute bottom-6 right-6 bg-primary active:bg-primary/80 p-4 rounded-2xl shadow",
          className
        )}
        {...rest}
      >
        <PlusIcon className="text-primary-foreground" />
      </Pressable>
    );
  }
);

export default FloatingAddButton;
