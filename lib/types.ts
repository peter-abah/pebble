export const TRANSACTION_TYPES = ["debit" , "credit" , "transfer"] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export type AccountType = "cash" | "card" | "general";

export interface Currency {
  isoCode: string;
  symbol: string;
  name: string;
  minorUnit: number;
}

export interface Money {
  currency: Currency;
  valueInMinorUnits: number; // Stored in minor unit of currency
}

export interface TransactionCategory {
  name: string;
  id: string; // unique
  parentID?: string | null;
}

export interface Account {
  name: string;
  id: string;
  balance: Money;
  type: AccountType;
  currency: Currency;
}

export interface Transaction {
  id: string; // unique
  amount: Money;
  datetime: string;
  type: TransactionType;
  categoryID: TransactionCategory["id"];
  accountID: Account["id"];
  title?: string;
  note?: string;
  tags?: string[];
}
