import { SchemaCategory, SchemaTransaction } from "@/db/schema";
import { Dayjs } from "dayjs";

// todo: move gen types to separate file
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>;
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// only object keys are allowed in union keys
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributivePartial<T> = T extends any ? Partial<T> : never;
export type ValueOf<T> = T[keyof T];
export type Satisfies<U, T extends U> = T;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type NonEmptyArray<T> = [T, ...Array<T>];

// expands object types recursively
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> } & {}
    : never
  : T;

export type NonNullableObject<T> = { [K in keyof T]-?: NonNullable<T[K]> };
export type NonNullableFields<T, K extends keyof T> = T & NonNullableObject<Pick<T, K>>;

// usings distributive conditional types to pick of all keys of each union
export type AllKeys<T> = T extends any ? keyof T : never;
export type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
// merge all keys of a union of object types into one type
export type Merge<T extends object> = {
  [k in AllKeys<T>]: PickType<T, k>;
};

type ToStringIfExtends<T, K extends keyof T, E> = K extends E ? string : T[K];
// converts all specified keys to strings e.g StringifyValues<{a: number}, 'a'> = {a: string}
export type StringifyValues<T, Keys extends AllKeys<T>> = {
  [K in keyof T]: ToStringIfExtends<T, K, Keys>;
};

export interface WithTimestamps {
  created_at: string; // iso date time
  updated_at: string; // iso date time
}

export interface Currency {
  isoCode: string;
  symbol: string;
  name: string;
  minorUnit: number;
}

export interface Money {
  currencyCode: Currency["isoCode"];
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

export interface ExchangeRate {
  from: Currency["isoCode"];
  to: Currency["isoCode"];
  rate: number;
}

// UI STUFF
export interface Filters {
  categories: Array<SchemaCategory["id"]>;
  types: Array<SchemaTransaction["type"]>;
  accounts: Array<SchemaTransaction["id"]>;
}

export const PERIODS = ["monthly", "weekly", "yearly", "all time"] as const;
export interface TimePeriod {
  period: (typeof PERIODS)[number];
  date: Dayjs;
}
