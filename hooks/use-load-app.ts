import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { useAppStore } from "@/lib/store";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "~/lib/useColorScheme";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

const useLoadTheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await AsyncStorage.getItem("theme");
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

  return isColorSchemeLoaded;
};

export const useLoadApp = () => {
  const hasStoreHydrated = useAppStore((state) => state._hasHydrated);
  const isColorSchemeLoaded = useLoadTheme();
  const [fontSuccess, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const fontLoaded = fontSuccess || fontError;
  const { success, error } = useMigrations(db, migrations);
  const migrationLoaded = success || error;

  const allLoaded = migrationLoaded && isColorSchemeLoaded && hasStoreHydrated && fontLoaded;

  useEffect(() => {
    if (allLoaded) {
      SplashScreen.hideAsync();
    }
  }, [allLoaded]);

  return {
    migrationSuccess: success,
    migrationError: error,
    isColorSchemeLoaded,
    storeLoaded: hasStoreHydrated,
    fontSuccess,
    fontError,
  };
};
