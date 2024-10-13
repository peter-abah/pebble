import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";

/* Makes nativewind works on web, I don't know it works
 * see: https://github.com/nativewind/nativewind/issues/470#issuecomment-1589092569
 */
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
