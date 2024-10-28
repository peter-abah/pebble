import { type TimePeriod } from "@/components/time-period-picker";
import { type Transaction } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { memoize } from "proxy-memoize";
import { twMerge } from "tailwind-merge";
import { array } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Key = string | number | symbol;
export function arrayToMap<T extends {}>(items: Array<T>, keyName: keyof T) {
  const res: Partial<Record<Key, T>> = {};
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
  return value[0].toLocaleUpperCase() + value.slice(1);
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

export const generateColors = (n: number) => {
  let colors = [];
  for (let i = 0; i < n; i++) {
    let hue = ((i * 360) / n) % 360;
    colors.push(`hsl(${hue}, 100%, ${Math.random() * 80 + 10}%)`); //
  }
  shuffle(colors);
  return colors;
};

// shuffles in place
export const shuffle = <T>(array: Array<T>) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
};

export const randomElement = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const groupTransactionsByMonth = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    const monthAndYear = transaction.datetime.slice(0, 7); // e.g 2024-10
    if (result[monthAndYear]) {
      result[monthAndYear]!.push(transaction);
    } else {
      result[monthAndYear] = [transaction];
    }
    return result;
  }, {} as Partial<Record<string, Array<Transaction>>>)
);

export const groupTransactionsByWeek = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    const firstDayOfWeek = dayjs(transaction.datetime).day(0).toISOString().slice(0, 10); // first day of week e.g 2024-10-20
    if (result[firstDayOfWeek]) {
      result[firstDayOfWeek]!.push(transaction);
    } else {
      result[firstDayOfWeek] = [transaction];
    }
    return result;
  }, {} as Partial<Record<string, Array<Transaction>>>)
);

export const groupTransactionsByYear = memoize((transactions: Array<Transaction>) =>
  transactions.reduce((result, transaction) => {
    const year = transaction.datetime.slice(0, 4); // e.g 2024
    if (result[year]) {
      result[year]!.push(transaction);
    } else {
      result[year] = [transaction];
    }
    return result;
  }, {} as Partial<Record<string, Array<Transaction>>>)
);

// used to index transactions grouped by date functions above
export const dateToKey = ({ period, date }: TimePeriod) => {
  switch (period) {
    case "annually":
      return date.year().toString(); // 2024
    case "monthly":
      return date.toISOString().slice(0, 7); // 2024-10
    case "weekly":
      return date.day(0).toISOString().slice(0, 10); // first day of week: 2024-10-20
    default:
      return date.toISOString().slice(0, 10); // date: 2024-10-21
  }
};
