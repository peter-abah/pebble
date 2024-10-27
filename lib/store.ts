import { CURRENCIES, addMoney, createMoney, subtractMoney } from "@/lib/money";
import { Account, Currency, Transaction, TransactionCategory } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { memoize } from "proxy-memoize";
import { Platform } from "react-native";
import "react-native-get-random-values";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { accounts, categories } from "./data";
import { arrayToMap, generateColors, shuffle } from "./utils";

setAutoFreeze(false);

export interface AppState {
  transactions: Partial<Record<Transaction["id"], Transaction>>;
  accounts: Partial<Record<Account["id"], Account>>;
  categories: Partial<Record<TransactionCategory["id"], TransactionCategory>>;
  currency: Currency;
  defaultAccountID: Account["id"];
  chartColors: Array<string>;
  _isFirstOpen: boolean;
  _hasHydrated: boolean;
}

export interface AppStateActions {
  upsertTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionID: Transaction["id"]) => void;
  addCategory: (category: TransactionCategory) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountID: Account["id"]) => void;
  updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  reset: () => void;
}

const chartColors = generateColors(categories.length);
shuffle(chartColors);

const DEFAULT_STATE: AppState = {
  accounts: arrayToMap(accounts, 'id'),
  currency: CURRENCIES.NGN,
  transactions: {},
  categories: arrayToMap(categories, "id"),
  chartColors,
  defaultAccountID: "1",
  _isFirstOpen: true,
  _hasHydrated: false,
};

export const useAppStore = create<AppState & AppStateActions>()(
  persist(
    immer((set) => ({
      ...DEFAULT_STATE,

      upsertTransaction: (transaction) => {
        set((state) => {
          const prevTransaction = state.transactions[transaction.id];
          if (prevTransaction) {
            // TODO: transfers will cause bug
            // revert previous transaction from balance
            const { type, accountID, amount } = prevTransaction;
            if (state.accounts[accountID]) {
              state.accounts[accountID]!.balance =
                type === "credit"
                  ? subtractMoney(state.accounts[accountID]!.balance, amount)
                  : addMoney(state.accounts[accountID]!.balance, amount);
            }
          }

          // update transaction balance
          const { type, accountID, amount } = transaction;
          if (state.accounts[accountID]) {
            state.accounts[accountID]!.balance =
              type === "credit"
                ? addMoney(state.accounts[accountID]!.balance, amount)
                : subtractMoney(state.accounts[accountID]!.balance, amount);
          }
          // Add or update transaction
          state.transactions[transaction.id] = transaction;
        });
      },

      deleteTransaction: (transactionID) => {
        set((state) => {
          const transaction = state.transactions[transactionID];

          if (transaction) {
            // TODO: transfers will cause bug
            // revert  transaction from balance
            const { type, accountID, amount } = transaction;
            if (state.accounts[accountID]) {
              state.accounts[accountID]!.balance =
                type === "credit"
                  ? subtractMoney(state.accounts[accountID]!.balance, amount)
                  : addMoney(state.accounts[accountID]!.balance, amount);
            }

            // delete
            delete state.transactions[transactionID];
          }
        });
      },

      addCategory: (category) => {
        set((state) => {
          state.categories[category.id] = category;
        });
      },

      addAccount: (account) => {
        set((state) => {
          state.accounts[account.id] = account;
        });
      },

      updateAccount: (account) => {
        set((state) => {
          state.accounts[account.id] = account;
        });
      },

      // TODO: delete associated transactions or mark them
      deleteAccount: (accountID) => {
        set((state) => {
          delete state.accounts[accountID];
        });
      },

      updateState: (key, value) => {
        set((state) => {
          (state as AppState)[key] = value;
        });
      },
      reset: () => {
        set(DEFAULT_STATE);
      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => (Platform.OS === "web" ? localStorage : AsyncStorage)),
      onRehydrateStorage: (state) => {
        return () => state.updateState("_hasHydrated", true);
      },
    }
  )
);

export const getSortedTransactionsByDate = memoize((state: AppState) => {
  const transactions = Object.values(state.transactions) as Array<Transaction>;
  transactions.sort((a, b) => b.datetime.localeCompare(a.datetime));
  return transactions;
});
