// todo: move gen types to separate file
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>;
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributivePartial<T> = T extends any ? Partial<T> : never;
export type ValueOf<T> = T[keyof T];
export type NonEmptyArray<T> = [T, ...Array<T>];

export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface WithTimestamps {
  createdAt: string; // iso date time
  updatedAt: string; // iso date time
}

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

export interface TransactionCategory extends WithTimestamps {
  name: string;
  id: string; // unique
  parentID?: string | null;
  color: string; // css color
  icon: Icon;
  type?: TransactionType; // if undefined, then applies to all types
}

export interface Account extends WithTimestamps {
  name: string;
  id: string;
  balance: Money;
  color: string;
  currency: Currency;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
}

interface BaseTransaction extends WithTimestamps {
  id: string; // unique
  amount: Money;
  datetime: string;
  title?: string;
  note?: string;
  tags?: Array<string>;
}

export interface NormalTransaction extends BaseTransaction {
  type: "expense" | "income";
  categoryID: TransactionCategory["id"];
  accountID: Account["id"];
}

export interface TransferTransaction extends BaseTransaction {
  type: "transfer";
  from: Account["id"];
  to: Account["id"];
  exchangeRate: ExchangeRate;
}

export type Transaction = NormalTransaction | TransferTransaction;

export interface Budget extends WithTimestamps {
  id: string;
  name: string;
  categories: Array<TransactionCategory["id"]>;
  accounts: Array<Account["id"]>;
  period: "weekly" | "monthly" | "yearly";
  amount: Money;
  color: string;
}
