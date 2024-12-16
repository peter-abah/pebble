import { useUpdateExchangeRate } from "@/hooks/use-update-exchange-rates";
import "../global.css";

import { useLoadApp } from "@/hooks/use-load-app";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient({ defaultOptions: { queries: { networkMode: "always" } } });

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const info = useLoadApp();
  const { isDarkColorScheme } = useColorScheme();

  if (info.migrationError) {
    console.log(info.migrationError);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <LayoutView />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const LayoutView = () => {
  useUpdateExchangeRate();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
      </Stack>
      <PortalHost />
    </GestureHandlerRootView>
  );
};
