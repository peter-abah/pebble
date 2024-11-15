import { addMoney, convertMoney, subtractMoney } from "@/lib/money";
import {
  Account,
  AtLeast,
  DistributiveOmit,
  PartialRecord,
  Transaction,
  TransactionCategory,
  WithTimestamps,
} from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { memoize } from "proxy-memoize";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ACCOUNTS, CATEGORIES } from "./data";
import { arrayToMap, generateColors, shuffle } from "./utils";
import { nanoid } from "./nanoid";

setAutoFreeze(false);

export interface AppStateProperties {
  transactions: Partial<Record<Transaction["id"], Transaction>>;
  accounts: Partial<Record<Account["id"], Account>>;
  categories: Partial<Record<TransactionCategory["id"], TransactionCategory>>;
  defaultAccountID: Account["id"];
  chartColors: Array<string>;
  exchangeRates: PartialRecord<string, { date: string; rates: PartialRecord<string, number> }>;
  _hasHydrated: boolean;
}

export interface AppStateActions {
  addTransaction: (transaction: DistributiveOmit<Transaction, "id" | keyof WithTimestamps>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionID: Transaction["id"]) => void;
  addCategory: (category: Omit<TransactionCategory, "id" | keyof WithTimestamps>) => void;
  updateCategory: (category: AtLeast<TransactionCategory, "id">) => void;
  deleteCategory: (categoryID: TransactionCategory["id"]) => void;
  addAccount: (account: Omit<Account, "id" | keyof WithTimestamps>) => void;
  updateAccount: (account: AtLeast<Account, "id">) => void;
  deleteAccount: (accountID: Account["id"]) => void;
  updateState: <K extends keyof AppStateProperties>(key: K, value: AppStateProperties[K]) => void;
  updateExchangeRate: (
    code: string,
    data: { date: string; rates: PartialRecord<string, number> }
  ) => void;
  reset: () => void;
  _updateAccountBalanceForNewTransaction: (
    transaction: DistributiveOmit<Transaction, "id" | keyof WithTimestamps>
  ) => void;
  _updateAccountBalanceForRemovedTransaction: (transaction: Transaction) => void;
}

export interface AppState extends AppStateProperties {
  actions: AppStateActions;
}

const chartColors = generateColors(CATEGORIES.length);
shuffle(chartColors);

const DEFAULT_STATE: AppStateProperties = {
  accounts: arrayToMap(ACCOUNTS, "id"),
  transactions: {},
  categories: arrayToMap(CATEGORIES, "id"),
  chartColors,
  defaultAccountID: ACCOUNTS[0].id,
  _hasHydrated: false,
  exchangeRates: {},
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      ...DEFAULT_STATE,

      actions: {
        _updateAccountBalanceForNewTransaction: (transaction) => {
          set((state) => {
            switch (transaction.type) {
              case "expense": {
                const account = state.accounts[transaction.accountID];
                if (!account) {
                  throw new Error(
                    `Account with id ${transaction.accountID} does not exist. Transaction not created`
                  );
                }
                account.balance = subtractMoney(account.balance, transaction.amount);

                break;
              }
              case "income": {
                const account = state.accounts[transaction.accountID];
                if (!account) {
                  throw new Error(
                    `Account with id ${transaction.accountID} does not exist. Transaction not created`
                  );
                }
                account.balance = addMoney(account.balance, transaction.amount);
                break;
              }
              case "transfer": {
                const fromAccount = state.accounts[transaction.from];
                const toAccount = state.accounts[transaction.to];
                if (!fromAccount || !toAccount) {
                  throw new Error(
                    `Accounts for transfer transaction does not exist. Transaction not created`
                  );
                }
                fromAccount.balance = subtractMoney(fromAccount.balance, transaction.amount);
                const convertedAmount = convertMoney(transaction.amount, transaction.exchangeRate);
                toAccount.balance = addMoney(toAccount.balance, convertedAmount);
              }
            }
          });
        },
        _updateAccountBalanceForRemovedTransaction: (transaction) => {
          set((state) => {
            switch (transaction.type) {
              case "expense": {
                const account = state.accounts[transaction.accountID];
                if (!account) {
                  // TODO: maybe throw an and handle in the app error?
                  console.warn(
                    `Account with id ${transaction.accountID} does not exist. Transaction not updated`
                  );
                  return;
                }
                account.balance = addMoney(account.balance, transaction.amount);
                break;
              }
              case "income": {
                const account = state.accounts[transaction.accountID];
                if (!account) {
                  // TODO: maybe throw an and handle in the app error?
                  console.warn(
                    `Account with id ${transaction.accountID} does not exist. Transaction not updated`
                  );
                  return;
                }
                account.balance = subtractMoney(account.balance, transaction.amount);
                break;
              }
              case "transfer": {
                const fromAccount = state.accounts[transaction.from];
                const toAccount = state.accounts[transaction.to];
                if (!fromAccount || !toAccount) {
                  // TODO: maybe throw an and handle in the app error?
                  console.warn(
                    `Accounts for transfer transaction does not exist. Transaction not updated`
                  );
                  return;
                }
                fromAccount.balance = addMoney(fromAccount.balance, transaction.amount);
                const convertedAmount = convertMoney(transaction.amount, transaction.exchangeRate);
                toAccount.balance = subtractMoney(toAccount.balance, convertedAmount);
              }
            }
          });
        },
        addTransaction: (transaction) => {
          // update balance
          get().actions._updateAccountBalanceForNewTransaction(transaction);
          set((state) => {
            const id = nanoid();
            const timeStamp = new Date().toISOString();
            state.transactions[id] = {
              ...transaction,
              id,
              createdAt: timeStamp,
              updatedAt: timeStamp,
            };
          });
        },
        updateTransaction: (transaction) => {
          const state = get();
          const prevTransaction = state.transactions[transaction.id];
          if (!prevTransaction) {
            // TODO: maybe throw error
            console.warn("Cannot update transaction as it does not exist");
            return;
          }

          // ? reverse previous change in account balance
          state.actions._updateAccountBalanceForRemovedTransaction(prevTransaction);
          // ? update balance
          state.actions._updateAccountBalanceForNewTransaction(transaction);

          set((state) => {
            state.transactions[transaction.id] = {
              ...transaction,
              updatedAt: new Date().toISOString(),
            };
          });
        },

        deleteTransaction: (transactionID) => {
          const state = get();
          const transaction = state.transactions[transactionID];
          if (!transaction) return;
          //? revert transaction from balance
          state.actions._updateAccountBalanceForRemovedTransaction(transaction);

          set((state) => {
            delete state.transactions[transactionID];
          });
        },

        addCategory: (category) => {
          set((state) => {
            const id = nanoid();
            const timestamp = new Date().toISOString();
            state.categories[id] = { ...category, id, createdAt: timestamp, updatedAt: timestamp };
          });
        },

        updateCategory: (category) => {
          set((state) => {
            const timestamp = new Date().toISOString();
            const prevCategory = state.categories[category.id];
            if (!prevCategory) {
              console.warn("Cannot update category as it does not exist in state");
              return;
            }
            state.categories[category.id] = { ...prevCategory, ...category, updatedAt: timestamp };
          });
        },

        deleteCategory: (categoryID) => {
          set((state) => {
            delete state.categories[categoryID];

            // delete category transactions
            // todo: ask user to move transactions before deleting
            /* todo: this is very innefficient and will cause app to lag because we are loading all
             * transactions into memory before filtering. this is probably a zustand issue, the immutability
             * means a new array of thousands of transactions will be created for every change.
             * switch to a database later. sqlite or other options
             */
            const relatedTransactions = Object.values(state.transactions).filter((t) =>
              t?.type === "transfer" ? false : t?.categoryID === categoryID
            ) as Array<Transaction>;
            relatedTransactions.forEach((transaction) =>
              state.actions.deleteTransaction(transaction.id)
            );
          });
        },

        addAccount: (account) => {
          set((state) => {
            const id = nanoid();
            const timestamp = new Date().toISOString();
            state.accounts[id] = { ...account, id, createdAt: timestamp, updatedAt: timestamp };
          });
        },

        updateAccount: (account) => {
          set((state) => {
            // TODO: updating account currency should change transaction currency
            // maybe a different action to update currency
            const timestamp = new Date().toISOString();
            const prevAccount = state.accounts[account.id];
            if (!prevAccount) {
              console.warn("Cannot update category as it does not exist in state");
              return;
            }
            state.accounts[account.id] = { ...prevAccount, ...account, updatedAt: timestamp };
          });
        },

        // TODO: delete associated transactions or mark them
        deleteAccount: (accountID) => {
          set((state) => {
            const accounts = Object.values(state.accounts) as Array<Account>;
            if (accounts.length <= 1) {
              // this should an error or something so the app shows a modal
              console.warn("Cannot remove only account");
              return;
            }

            delete state.accounts[accountID];
            if (state.defaultAccountID === accountID) {
              state.defaultAccountID = accounts[0].id;
            }
          });
        },

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
      version: 3, // TODO: change back to 0
      storage: createJSONStorage(() => (Platform.OS === "web" ? localStorage : AsyncStorage)),
      onRehydrateStorage: (state) => {
        return () => state.actions.updateState("_hasHydrated", true);
      },
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => key !== "actions")),
    }
  )
);

export const getSortedTransactionsByDate = memoize((state: AppState) => {
  const transactions = Object.values(state.transactions) as Array<Transaction>;
  transactions.sort((a, b) => b.datetime.localeCompare(a.datetime));
  return transactions;
});
