import "../global.css";

import { useLoadApp } from "@/hooks/use-load-app";
import { useUpdateExchangeRate } from "@/hooks/use-update-exchange-rates";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

dayjs.extend(isSameOrBefore);

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const info = useLoadApp();
  const { isDarkColorScheme } = useColorScheme();
  useUpdateExchangeRate();

  if (info.migrationError) {
    console.log(info.migrationError);
  }

  return (
    <>
      {/* <StoreProvider> */}
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tabs" />
          </Stack>
          <PortalHost />
        </GestureHandlerRootView>
      </ThemeProvider>
      {/* </StoreProvider> */}
    </>
  );
}
