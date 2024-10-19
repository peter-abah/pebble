import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Key = string | number | symbol;
export function arrayToRecord<T extends {}>(items: Array<T>, keyName: keyof T) {
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
