// todo: move gen types to separate file
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>;

export const TRANSACTION_TYPES = ["debit", "credit", "transfer"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

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

export type Icon =
  // can either be app provided icons or emojis
  | {
      name: string;
      type: "icon";
    }
  | {
      emoji: string;
      type: "emoji";
    };

export interface TransactionCategory {
  name: string;
  id: string; // unique
  parentID?: string | null;
  color: string; // css color
  icon: Icon;
  type?: TransactionType; // if undefined, then applies to all types
}

export interface Account {
  name: string;
  id: string;
  balance: Money;
  color: string;
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
