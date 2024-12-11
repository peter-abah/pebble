import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CATEGORIES } from "./data";
import { generateColors, shuffle } from "./utils";

setAutoFreeze(false);

export interface AppStateProperties {
  chartColors: Array<string>;
  exchangeRates: Record<string, { date: string; rates: Record<string, number> }>;
  _hasHydrated: boolean;
}

export interface AppStateActions {
  updateState: <K extends keyof AppStateProperties>(key: K, value: AppStateProperties[K]) => void;
  updateExchangeRate: (code: string, data: { date: string; rates: Record<string, number> }) => void;
  reset: () => void;
}

export interface AppState extends AppStateProperties {
  actions: AppStateActions;
}

const chartColors = generateColors(CATEGORIES.length);
shuffle(chartColors);

const DEFAULT_STATE: AppStateProperties = {
  chartColors,
  _hasHydrated: false,
  exchangeRates: {},
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      ...DEFAULT_STATE,

      actions: {
        updateState: (key, value) => {
          set((state) => {
            (state as AppStateProperties)[key] = value;
          });
        },

        updateExchangeRate: (code, data) => {
          set((state) => {
            const codeLowerCase = code.toLocaleLowerCase();
            const prevDate = state.exchangeRates[codeLowerCase]?.date;

            if (prevDate && prevDate >= data.date) return;

            state.exchangeRates[codeLowerCase] = data;
          });
        },
        reset: () => {
          set(DEFAULT_STATE);
        },
      },
    })),
    {
      name: "app-storage",
      version: 0,
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? window.localStorage : AsyncStorage
      ),
      onRehydrateStorage: (state) => {
        return () => state.actions.updateState("_hasHydrated", true);
      },
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => key !== "actions")),
    }
  )
);
