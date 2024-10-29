// filter out deprecated colors and current, transparent and inherit

import _tailwindColors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { isIn } from "./utils";

const excludedKeys = [
  "inherit",
  "current",
  "transparent",
  "blueGray",
  "trueGray",
  "warmGray",
  "lightBlue",
  "coolGray",
  "white",
  "black",
] as const;

const propertyDescriptors = Object.getOwnPropertyDescriptors(_tailwindColors);
type Keys = Exclude<keyof DefaultColors, (typeof excludedKeys)[number]>;

type Values = (typeof propertyDescriptors)[Keys];
const entries = (Object.entries(propertyDescriptors) as Array<[Keys, Values]>).filter(
  ([key]) => !isIn(excludedKeys, key)
);

export const tailwindColors = Object.fromEntries(
  entries.map(([key, descriptor]) => [key, descriptor.value])
) as Record<Keys, DefaultColors[Keys]>;

export type TailwindColors = typeof tailwindColors;
