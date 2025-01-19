import { LoaderCircleIcon } from "@/lib/icons/loader-circle";
import { ComponentProps, useEffect } from "react";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export function Loader(props: ComponentProps<typeof LoaderCircleIcon>) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });
  return (
    <Animated.View style={animatedStyle}>
      <LoaderCircleIcon size={100} className="text-muted-foreground" {...props} />
    </Animated.View>
  );
}
