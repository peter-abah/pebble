import { CURRENCIES, addMoney, subtractMoney } from "@/lib/money";
import {
  Account,
  AtLeast,
  Currency,
  Transaction,
  TransactionCategory,
  WithTimestamps,
} from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { nanoid } from "nanoid";
import { memoize } from "proxy-memoize";
import { Platform } from "react-native";
import "react-native-get-random-values";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { accounts, categories } from "./data";
import { arrayToMap, generateColors, shuffle } from "./utils";

setAutoFreeze(false);

export interface AppStateProperties {
  transactions: Partial<Record<Transaction["id"], Transaction>>;
  accounts: Partial<Record<Account["id"], Account>>;
  categories: Partial<Record<TransactionCategory["id"], TransactionCategory>>;
  currency: Currency;
  defaultAccountID: Account["id"];
  chartColors: Array<string>;
  _hasHydrated: boolean;
}

export interface AppStateActions {
  addTransaction: (transaction: Omit<Transaction, "id" | keyof WithTimestamps>) => void;
  updateTransaction: (transaction: AtLeast<Transaction, "id">) => void;
  deleteTransaction: (transactionID: Transaction["id"]) => void;
  addCategory: (category: Omit<TransactionCategory, "id" | keyof WithTimestamps>) => void;
  updateCategory: (category: AtLeast<TransactionCategory, "id">) => void;
  deleteCategory: (categoryID: TransactionCategory["id"]) => void;
  addAccount: (account: Omit<Account, "id" | keyof WithTimestamps>) => void;
  updateAccount: (account: AtLeast<Account, "id">) => void;
  deleteAccount: (accountID: Account["id"]) => void;
  updateState: <K extends keyof AppStateProperties>(key: K, value: AppStateProperties[K]) => void;
  reset: () => void;
}

export interface AppState extends AppStateProperties {
  actions: AppStateActions;
}

const chartColors = generateColors(categories.length);
shuffle(chartColors);

const DEFAULT_STATE: AppStateProperties = {
  accounts: arrayToMap(accounts, "id"),
  currency: CURRENCIES.NGN,
  transactions: {},
  categories: arrayToMap(categories, "id"),
  chartColors,
  defaultAccountID: accounts[0].id,
  _hasHydrated: false,
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      ...DEFAULT_STATE,

      actions: {
        addTransaction: (transaction) => {
          set((state) => {
            const { type, accountID, amount } = transaction;
            const account = state.accounts[accountID];
            if (account) {
              switch (type) {
                case "expense":
                  account.balance = subtractMoney(account.balance, amount);
                  break;
                case "income":
                  account.balance = addMoney(account.balance, amount);
                  break;
                case "transfer":
                // TODO: implements transfers, move amount from one account to other
                // do nothing
                default:
                // do nothing
              }
            }

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
          set((state) => {
            const prevTransaction = state.transactions[transaction.id];
            if (!prevTransaction) {
              console.warn("Cannot update transaction as it does not update");
              return;
            }

            // ?reverse previous change in account balance
            const prevAccount = state.accounts[prevTransaction.accountID];
            if (prevAccount) {
              // TODO: encapsulate in a function
              switch (prevTransaction.type) {
                case "expense":
                  prevAccount.balance = addMoney(prevAccount.balance, prevTransaction.amount);
                  break;
                case "income":
                  prevAccount.balance = subtractMoney(prevAccount.balance, prevTransaction.amount);
                  break;
                case "transfer":
                // do nothing for now
                // TODO: implements transfers, move amount from one account to other
                default:
                // do nothing
              }
            }

            const timestamp = new Date().toISOString();
            const updatedTransaction: Transaction = {
              ...prevTransaction,
              ...transaction,
              updatedAt: timestamp,
            };

            const account = state.accounts[updatedTransaction.accountID];
            if (account) {
              switch (updatedTransaction.type) {
                case "expense":
                  account.balance = subtractMoney(account.balance, updatedTransaction.amount);
                  break;
                case "income":
                  account.balance = addMoney(account.balance, updatedTransaction.amount);
                  break;
                case "transfer":
                // TODO: implements transfers, move amount from one account to other
                // do nothing
                default:
                // do nothing
              }
            }

            state.transactions[updatedTransaction.id] = updatedTransaction;
          });
        },

        deleteTransaction: (transactionID) => {
          set((state) => {
            const transaction = state.transactions[transactionID];
            if (!transaction) return;

            // revert  transaction from balance
            const { type, accountID, amount } = transaction;
            const account = state.accounts[accountID];
            if (account) {
              // TODO: encapsulate in a function
              switch (type) {
                case "expense":
                  account.balance = addMoney(account.balance, amount);
                  break;
                case "income":
                  account.balance = subtractMoney(account.balance, amount);
                  break;
                case "transfer":
                // do nothing for now
                // TODO: implements transfers, move amount from one account to other
                default:
                // do nothing
              }

              // delete
              delete state.transactions[transactionID];
            }
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
            const relatedTransactions = Object.values(state.transactions).filter(
              (t) => t?.categoryID === categoryID
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
            delete state.accounts[accountID];
          });
        },

        updateState: (key, value) => {
          set((state) => {
            (state as AppStateProperties)[key] = value;
          });
        },
        reset: () => {
          set(DEFAULT_STATE);
        },
      },
    })),
    {
      name: "app-storage",
      version: 2, // TODO: change back to 0
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
