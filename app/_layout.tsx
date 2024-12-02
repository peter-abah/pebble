import { useAppStore } from "@/lib/store";
import "../global.css";

import { useLoadApp } from "@/hooks/use-load-app";
import { fetchExchangeRates } from "@/lib/api";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
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
  // todo: do something with migration error if it occurs
  const info = useLoadApp();
  const { isDarkColorScheme } = useColorScheme();
  const accounts = useAppStore((state) => state.accounts);
  const budgets = useAppStore((state) => state.budgets);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const { updateExchangeRate } = useAppStore((state) => state.actions);
  // const currencyCodes = useMemo(
  //   () =>
  //     new Set([
  //       ...Object.values(accounts).map((a) => a!.currency.isoCode),
  //       ...Object.values(budgets).map((b) => b!.amount.currency.isoCode),
  //     ]),
  //   [accounts, budgets]
  // );

  // updates the exchange rate every time the app is opened or the any of the account currencies changes
  // useEffect(() => {
  //   const today = new Date().toISOString().slice(0, 10); //e.g 2024-11-14
  //   currencyCodes.forEach((code) => {
  //     if (exchangeRates[code.toLocaleLowerCase()]?.date === today) return;

  //     fetchExchangeRates(code).then(({ data, error }) => {
  //       if (!data) {
  //         return;
  //       }

  //       updateExchangeRate(code, data);
  //     });
  //   });
  // }, [currencyCodes, updateExchangeRate, exchangeRates]);

  console.log({ info });

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
