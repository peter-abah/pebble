import { type TimePeriod } from "@/components/time-period-picker";
import { NonEmptyArray, type Transaction } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { memoize } from "proxy-memoize";
import { twMerge } from "tailwind-merge";

export const exhaustiveUnionTuple =
  <T>() =>
  <L extends NonEmptyArray<T>>(
    ...x: L extends any
      ? Exclude<T, L[number]> extends never
        ? L
        : Array<Exclude<T, L[number]>>
      : never
  ) =>
    x;

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

type Key = string | number | symbol;
export function arrayToMap<T extends {}>(items: Array<T>, keyName: keyof T) {
  const res: Record<Key, T> = {};
  for (let item of items) {
    const key = item[keyName] as Key;
    res[key] = item;
  }

  return res;
}

export const NUMBER_REGEX = /^[+-]?([0-9]*[.])?[0-9]+$/;
export function isStringNumeric(str: string) {
  return NUMBER_REGEX.test(str);
}

export const titleCase = (value: string) => {
  return value[0]?.toLocaleUpperCase() + value.slice(1);
};

export const roundToZeros = (num: number, zeros: number): number => {
  const factor = Math.pow(10, zeros);
  return Math.round(num / factor) * factor;
};

export const roundNumber = (num: number, dec: number) => {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
};

export function createRange(start: number, end: number) {
  const range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
}

// gives a compiler error if I don't cover a case in switch of union types
// can also be used for early return statements that are exhaustive
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function humanizeString(input: string) {
  return input
    .replace(/[_-]/g, " ") // Replace underscores and dashes with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
    .toLowerCase() // Convert to lowercase
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize the first letter
}

// todo: fix colors
export const generateColors = (n: number) => {
  let colors = [];
  for (let i = 0; i < n; i++) {
    let hue = ((i * 360) / n) % 360;
    colors.push(`hsl(${hue}, 100%, ${Math.random() * 40 + 50}%)`); //
  }
  shuffle(colors);
  return colors;
};

// shuffles in place
export const shuffle = <T>(array: Array<T>) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]] as [T, T];
  }
};

// generic type guard function for includes
// use case: checking an const array in typescript contains a value
export const isIn = <T>(values: ReadonlyArray<T>, x: any): x is T => {
  return values.includes(x);
};

export const randomDate = (start: Dayjs, end: Dayjs) => {
  const startTime = start.valueOf();
  const endTime = end.valueOf();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return dayjs(randomTime);
};

export const randomElement = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)] as T;
};

export const groupTransactionsByMonth = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    const monthAndYear = dayjs(transaction.datetime).format().slice(0, 7); // e.g 2024-10
    if (result[monthAndYear]) {
      result[monthAndYear]!.push(transaction);
    } else {
      result[monthAndYear] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

export const groupTransactionsByWeek = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    const firstDayOfWeek = dayjs(transaction.datetime).day(0).format().slice(0, 10); // first day of week e.g 2024-10-20
    if (result[firstDayOfWeek]) {
      result[firstDayOfWeek]!.push(transaction);
    } else {
      result[firstDayOfWeek] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

export const groupTransactionsByYear = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    // using format to convert the iso string to the iso string with time offset
    const year = dayjs(transaction.datetime).format().slice(0, 4); // e.g 2024
    if (result[year]) {
      result[year]!.push(transaction);
    } else {
      result[year] = [transaction];
    }
    return result;
  }, {} as Record<string, Array<Transaction>>)
);

export const groupTransactionsByPeriod = {
  monthly: groupTransactionsByMonth,
  annually: groupTransactionsByYear,
  weekly: groupTransactionsByWeek,
  // using a proxy so any string key returns the transaction array
  "all time": (transactions: Array<Transaction>) =>
    new Proxy<Record<string, Array<Transaction>>>({}, { get: () => transactions }),
} satisfies Record<TimePeriod["period"], unknown>;

// used to index transactions grouped by date functions above
export const dateToKey = ({ period, date }: TimePeriod): string => {
  switch (period) {
    case "annually":
      return date.year().toString(); // 2024
    case "monthly":
      return date.format().slice(0, 7); // 2024-10
    case "weekly":
      return date.day(0).format().slice(0, 10); // first day of week: 2024-10-20
    default:
      return date.format("MMM DD, YYYY");
  }
};
