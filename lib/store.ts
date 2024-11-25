import { addMoney, convertMoney, createMoney, subtractMoney } from "@/lib/money";
import {
  Account,
  AtLeast,
  Budget,
  DistributiveOmit,
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
import { NAME_TO_GROUP_COLOR } from "./constants";
import { ACCOUNTS, CATEGORIES } from "./data";
import { CURRENCIES_MAP } from "./data/currencies";
import { nanoid } from "./nanoid";
import { arrayToMap, assertUnreachable, generateColors, shuffle } from "./utils";

setAutoFreeze(false);

export interface AppStateProperties {
  transactions: Record<Transaction["id"], Transaction>;
  accounts: Record<Account["id"], Account>;
  categories: Record<TransactionCategory["id"], TransactionCategory>;
  budgets: Record<Budget["id"], Budget>;
  defaultAccountID: Account["id"];
  chartColors: Array<string>;
  exchangeRates: Record<string, { date: string; rates: Record<string, number> }>;
  _hasHydrated: boolean;
}

export interface AppStateActions {
  addTransaction: (
    transaction: DistributiveOmit<Transaction, "id" | keyof WithTimestamps>
  ) => Transaction;
  updateTransaction: (transaction: Transaction) => Transaction;
  deleteTransaction: (transactionID: Transaction["id"]) => void;

  addCategory: (
    category: Omit<TransactionCategory, "id" | keyof WithTimestamps>
  ) => TransactionCategory;
  updateCategory: (category: AtLeast<TransactionCategory, "id">) => TransactionCategory;
  deleteCategory: (categoryID: TransactionCategory["id"]) => void;

  addAccount: (account: Omit<Account, "id" | keyof WithTimestamps>) => Account;
  updateAccount: (account: AtLeast<Account, "id">) => Account;
  deleteAccount: (accountID: Account["id"]) => void;

  addBudget: (budget: Omit<Budget, "id" | keyof WithTimestamps>) => Budget;
  updateBudget: (budget: Budget) => Budget;
  deleteBudget: (budgetID: Budget["id"]) => void;

  updateState: <K extends keyof AppStateProperties>(key: K, value: AppStateProperties[K]) => void;
  updateExchangeRate: (code: string, data: { date: string; rates: Record<string, number> }) => void;
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
  budgets: {
    "1": {
      id: "1",
      name: "test",
      amount: createMoney(50000, CURRENCIES_MAP["NGN"]!),
      categories: ["1", "2", "3", "4"],
      accounts: ["1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: NAME_TO_GROUP_COLOR["emerald-dark"].color,
      period: "yearly",
    },
  },
  categories: arrayToMap(CATEGORIES, "id"),
  chartColors,
  defaultAccountID: ACCOUNTS[0]?.id || "1", // TODO:
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
            const type = transaction.type;
            switch (type) {
              case "expense":
              case "lent":
              case "paid_loan": {
                const account = state.accounts[transaction.accountID];
                if (!account) {
                  throw new Error(
                    `Account with id ${transaction.accountID} does not exist. Transaction not created`
                  );
                }
                account.balance = subtractMoney(account.balance, transaction.amount);

                break;
              }
              case "income":
              case "borrowed":
              case "collected_debt": {
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
                break;
              }
              default:
                assertUnreachable(type);
            }
          });
        },
        _updateAccountBalanceForRemovedTransaction: (transaction) => {
          set((state) => {
            const type = transaction.type;
            switch (type) {
              case "expense":
              case "lent":
              case "paid_loan": {
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
              case "income":
              case "borrowed":
              case "collected_debt": {
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
                break;
              }
              default:
                assertUnreachable(type);
            }
          });
        },

        addTransaction: (transaction) => {
          // update balance
          get().actions._updateAccountBalanceForNewTransaction(transaction);

          const id = nanoid();
          const timeStamp = new Date().toISOString();
          const newTransaction: Transaction = {
            ...transaction,
            id,
            createdAt: timeStamp,
            updatedAt: timeStamp,
          };
          set((state) => {
            state.transactions[id] = newTransaction;
          });

          return newTransaction;
        },
        updateTransaction: (transaction) => {
          const state = get();
          const prevTransaction = state.transactions[transaction.id];
          if (!prevTransaction) {
            // TODO: handle error upstream
            throw new Error("Cannot update transaction as it does not exist");
          }

          // ? reverse previous change in account balance
          state.actions._updateAccountBalanceForRemovedTransaction(prevTransaction);
          // ? update balance
          state.actions._updateAccountBalanceForNewTransaction(transaction);
          const updatedTransaction: Transaction = {
            ...transaction,
            updatedAt: new Date().toISOString(),
          };
          set((state) => {
            state.transactions[transaction.id] = updatedTransaction;
          });
          return updatedTransaction;
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
          const id = nanoid();
          const timestamp = new Date().toISOString();
          const newCategory = { ...category, id, createdAt: timestamp, updatedAt: timestamp };
          set((state) => {
            state.categories[id] = newCategory;
          });

          return newCategory;
        },
        updateCategory: (category) => {
          const timestamp = new Date().toISOString();
          const prevCategory = get().categories[category.id];
          if (!prevCategory) {
            // TODO: handle error upstream
            throw new Error("Cannot update category as it does not exist in state");
          }
          const updatedCategory = { ...prevCategory, ...category, updatedAt: timestamp };
          set((state) => {
            state.categories[category.id] = updatedCategory;
          });
          return updatedCategory;
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
              t?.type === "income" || t?.type === "expense" ? t?.categoryID === categoryID : false
            ) as Array<Transaction>;
            relatedTransactions.forEach((transaction) =>
              state.actions.deleteTransaction(transaction.id)
            );
          });
        },

        addAccount: (account) => {
          const id = nanoid();
          const timestamp = new Date().toISOString();
          const newAccount = { ...account, id, createdAt: timestamp, updatedAt: timestamp };
          set((state) => {
            state.accounts[id] = newAccount;
          });
          return newAccount;
        },
        updateAccount: (account) => {
          // TODO: updating account currency should change transaction currency
          // maybe a different action to update currency
          const timestamp = new Date().toISOString();
          const prevAccount = get().accounts[account.id];
          if (!prevAccount) {
            // todo: handle error upstream
            throw new Error("Cannot update account as it does not exist in state");
          }
          const updatedAccount = { ...prevAccount, ...account, updatedAt: timestamp };
          set((state) => {
            state.accounts[account.id] = updatedAccount;
          });
          return updatedAccount;
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
              state.defaultAccountID = (accounts[0] as Account).id;
            }
          });
        },

        addBudget: (budget) => {
          const id = nanoid();
          const timestamp = new Date().toISOString();
          const newBudget = { ...budget, id, createdAt: timestamp, updatedAt: timestamp };
          set((state) => {
            state.budgets[id] = newBudget;
          });
          return newBudget;
        },
        updateBudget: (budget) => {
          const timestamp = new Date().toISOString();
          const prevBudget = get().budgets[budget.id];
          if (!prevBudget) {
            // todo: handle error upstream
            throw new Error("Cannot update budget as it does not exist in state");
          }
          const updatedBudget = { ...prevBudget, ...budget, updatedAt: timestamp };
          set((state) => {
            state.budgets[budget.id] = updatedBudget;
          });
          return updatedBudget;
        },

        deleteBudget: (budgetID) => {
          set((state) => {
            delete state.budgets[budgetID];
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
