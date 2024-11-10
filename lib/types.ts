// todo: move gen types to separate file
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>;
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

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

export interface Transaction extends WithTimestamps {
  id: string; // unique
  amount: Money;
  datetime: string;
  type: TransactionType;
  categoryID: TransactionCategory["id"];
  accountID: Account["id"];
  title?: string;
  note?: string;
  tags?: Array<string>;
}
