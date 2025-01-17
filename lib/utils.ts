import { NonEmptyArray, PartialRecord } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";
import { ReadonlyDeep } from "type-fest";

/**
 * Deeply freezes an object by recursively freezing all of its properties.
 * - https://gist.github.com/tkrotoff/e997cd6ff8d6cf6e51e6bb6146407fc3
 */
export function deepFreeze<T extends object>(obj: T) {
  Object.values(obj).forEach((value) => Object.isFrozen(value) || deepFreeze(value));
  return Object.freeze(obj) as ReadonlyDeep<T>;
}

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

export const arrayToMap = <T extends {}, K extends PropertyKey>(
  items: Array<T>,
  keySelector: (item: T, index: number) => K
) => {
  const res: PartialRecord<K, T> = {};
  for (let i = 0; i < items.length; i++) {
    const key = keySelector(items[i]!, i);

    res[key] = items[i];
  }

  return res;
};

export const isDateValid = (date: Date) => {
  return !Number.isNaN(date.getTime());
};

export const valueToDate = (value: any) => {
  const date = new Date(value);
  console.log({ datetime: date.getTime });
  return isDateValid(date) ? date : undefined;
};

export const valueToNumber = (value: unknown) => {
  if (typeof value == "number") {
    return value;
  }
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return undefined;
  }
  return numberValue;
};

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

// typescript helper that gives a compiler error if I don't cover a case in switch of union types
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

// todo: fix colors, not random
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

export function excludeKey<T extends object, K extends keyof T>(obj: T, key: K) {
  const { [key]: _, ...rest } = obj;
  return rest;
}

export function setDifference<A extends B, B>(a: Set<A>, b: Set<B>) {
  return new Set(Array.from(a).filter((item) => !b.has(item)));
}

export const randomDate = (start: Dayjs, end: Dayjs) => {
  const startTime = start.valueOf();
  const endTime = end.valueOf();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return dayjs(randomTime);
};

export const convertAllObjectValuesToNewValue = <T extends object, V>(record: T, newValue: V) => {
  const result: Partial<Record<keyof T, V>> = {};

  for (let key of Object.keys(record)) {
    result[key as keyof T] = newValue;
  }

  return result as Record<keyof T, V>;
};

export const randomElement = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)] as T;
};
