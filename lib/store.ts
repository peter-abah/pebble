import { CURRENCIES, addMoney, subtractMoney } from "@/lib/money";
import { Account, Currency, Transaction, TransactionCategory } from "@/lib/types";
import { setAutoFreeze } from "immer";
import "react-native-get-random-values";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

setAutoFreeze(false);

export interface AppState {
  transactions: Record<Transaction["id"], Transaction>;
  accounts: Record<Account["id"], Account>;
  categories: Record<TransactionCategory["id"], TransactionCategory>;
  currency: Currency;
  defaultAccountID: Account["id"];
  isFirstInstall: boolean;
}

export interface AppStateActions {
  upsertTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionID: Transaction["id"]) => void;
  addCategory: (category: TransactionCategory) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountID: Account["id"]) => void;
  updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
}

const DEFAULT_STATE: AppState = {
  accounts: {},
  currency: CURRENCIES.NGN,
  transactions: {},
  categories: {},
  defaultAccountID: "",
  isFirstInstall: true,
};

export const createAppStore = (initProps?: Partial<AppState>) => {
  return createStore<AppState & AppStateActions>()(
    immer((set) => ({
      ...DEFAULT_STATE,
      ...initProps,

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
    }))
  );
};

export type AppStore = ReturnType<typeof createAppStore>;
