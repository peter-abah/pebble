import { CURRENCIES, addMoney, createMoney, subtractMoney } from "@/lib/money";
import { Account, Currency, Transaction, TransactionCategory } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { memoize } from "proxy-memoize";
import "react-native-get-random-values";
import { create, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import { arrayToRecord } from "./utils";
import { categories } from "./data";
import { Platform } from "react-native";

setAutoFreeze(false);

export interface AppState {
  transactions: Record<Transaction["id"], Transaction>;
  accounts: Record<Account["id"], Account>;
  categories: Record<TransactionCategory["id"], TransactionCategory>;
  currency: Currency;
  defaultAccountID: Account["id"];
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

const DEFAULT_STATE: AppState = {
  accounts: {
    "1": {
      name: "Account",
      id: "1",
      type: "general",
      balance: createMoney(0, CURRENCIES.NGN),
      currency: CURRENCIES.NGN,
    },
  },
  currency: CURRENCIES.NGN,
  transactions: {},
  categories: arrayToRecord(categories, "id"),
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
            state.accounts[accountID].balance =
              type === "credit"
                ? subtractMoney(state.accounts[accountID].balance, amount)
                : addMoney(state.accounts[accountID].balance, amount);
          }

          // update transaction balance
          const { type, accountID, amount } = transaction;
          state.accounts[accountID].balance =
            type === "credit"
              ? addMoney(state.accounts[accountID].balance, amount)
              : subtractMoney(state.accounts[accountID].balance, amount);

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
            state.accounts[accountID].balance =
              type === "credit"
                ? subtractMoney(state.accounts[accountID].balance, amount)
                : addMoney(state.accounts[accountID].balance, amount);

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
  const transactions = Object.values(state.transactions);
  transactions.sort((a, b) => b.datetime.localeCompare(a.datetime));
  return transactions;
});
