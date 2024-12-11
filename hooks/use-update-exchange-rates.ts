import { getAccounts } from "@/db/queries/accounts";
import { getBudgets } from "@/db/queries/budgets";
import { fetchExchangeRates } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useMemo } from "react";

export const useUpdateExchangeRate = () => {
  const { data: accounts } = useLiveQuery(getAccounts());
  const { data: budgets } = useLiveQuery(getBudgets());
  const exchangeRates = useAppStore((state) => state.exchangeRates);
  const { updateExchangeRate } = useAppStore((state) => state.actions);
  const currencyCodes = useMemo(
    () =>
      new Set([...accounts.map((a) => a.currency_code), ...budgets.map((b) => b.currency_code)]),
    [accounts, budgets]
  );

  // updates the exchange rate every time the app is opened or the any of the account currencies changes
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); //e.g 2024-11-14
    currencyCodes.forEach((code) => {
      if (exchangeRates[code.toLocaleLowerCase()]?.date === today) return;

      fetchExchangeRates(code).then(({ data, error }) => {
        if (!data) {
          return;
        }

        updateExchangeRate(code, data);
      });
    });
  }, [currencyCodes, updateExchangeRate, exchangeRates]);
};
