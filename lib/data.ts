import { CURRENCIES, createMoney } from "@/lib/money";
import { nanoid } from "nanoid";
import "react-native-get-random-values";
import { Account, Transaction, TransactionCategory } from "./types";

export const getInitialData = () => {
  const accounts: Array<Account> = [
    {
      name: "Account",
      id: nanoid(),
      type: "general",
      balance: createMoney(0, CURRENCIES.NGN),
      currency: CURRENCIES.NGN,
    },
  ];

  const categories: Array<TransactionCategory> = [
    {
      id: "household",
      name: "Household",
      color: "hsla(0 100% 50% / 0.1)",
      icon: {
        type: "emoji",
        emoji: "🏠",
      },
    },
    {
      id: "food",
      name: "Food",
      color: "hsla(60 100% 50% / 0.1)",
      icon: {
        type: "emoji",
        emoji: "🍽️",
      },
    },
    {
      id: "transport",
      name: "Transport",
      color: "hsla(120 100% 50% / 0.1)",
      icon: {
        type: "emoji",
        emoji: "🚌",
      },
    },
    {
      id: "apparel",
      name: "Apparel",
      color: "hsla(180 100% 50% / 0.1)",
      icon: {
        type: "emoji",
        emoji: "👕",
      },
    },
    {
      id: "life",
      name: "Life and Entertainment",
      color: "hsla(240 100% 50% / 0.1)",
      icon: {
        type: "emoji",
        emoji: "🛋️",
      },
    },
  ];

  const transactions: Array<Transaction> = [
    {
      id: "fuel",
      title: "Fuel",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel1",
      title: "Fuel 1",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel2",
      title: "Fuel 2",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel3",
      title: "Fuel 3",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel4",
      title: "Fuel 4",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date(2719187958746).toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel5",
      title: "Fuel 5",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel6",
      title: "Fuel 6",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel7",
      title: "Fuel 7",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel8",
      title: "Fuel 8",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
    {
      id: "fuel9",
      title: "Fuel 9",
      categoryID: "household",
      accountID: accounts[0].id,
      datetime: new Date().toISOString(),
      type: "debit",
      amount: {
        valueInMinorUnits: 1000000,
        currency: CURRENCIES.NGN,
      },
    },
  ];

  return { accounts, categories, transactions };
};
