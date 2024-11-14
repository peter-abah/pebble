import { useAppStore } from "@/lib/store";
import "../global.css";

import { fetchExchangeRates } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

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

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  const hasStoreHydrated = useAppStore((state) => state._hasHydrated);
  const accounts = useAppStore((state) => state.accounts);
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const accountCurrenciesCodes = useMemo(
    () => new Set(Object.values(accounts).map((a) => a!.currency.isoCode)),
    [accounts]
  );
  const { updateExchangeRate } = useAppStore((state) => state.actions);

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    };
    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasStoreHydrated && isColorSchemeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [hasStoreHydrated, isColorSchemeLoaded]);

  // updates the exchange rate every time the app is opened or the any of the account currencies changes
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); //e.g 2024-11-14
    accountCurrenciesCodes.forEach((code) => {
      if (exchangeRates[code.toLocaleLowerCase()]?.date === today) return;

      fetchExchangeRates(code).then(({ data, error }) => {
        if (!data) {
          return;
        }

        updateExchangeRate(code, data);
      });
    });
  }, [accountCurrenciesCodes, updateExchangeRate, exchangeRates, hasStoreHydrated]);

  if (!isColorSchemeLoaded) {
    return null;
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
