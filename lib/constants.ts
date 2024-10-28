import tailwindColors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { PartialRecord } from "./types";

// TODO: cleanup, fix tailwind warning
export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 99%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

const tailwindKeys = (Object.keys(tailwindColors) as Array<keyof DefaultColors>).filter(
  (c) => typeof tailwindColors[c] === "object" && !c.toLocaleLowerCase().includes("gray")
);

type Color = { name: string; color: string };
type GroupColorsMapKey = keyof typeof tailwindColors | `${keyof typeof tailwindColors}-dark`;
export const HEX_TO_GROUP_COLOR = tailwindKeys
  .reduce((a, b) => {
    return [
      ...a,
      { name: b, color: tailwindColors[b][500] },
      { name: `${b}-dark`, color: tailwindColors[b][800] },
    ];
  }, [] as Array<{ name: string; color: string }>)
  .reduce((a, b) => ({ ...a, [b.color]: b }), {} as PartialRecord<string, Color>);

export const NAME_TO_GROUP_COLOR = tailwindKeys
  .reduce((a, b) => {
    return [
      ...a,
      { name: b, color: tailwindColors[b][500] },
      { name: `${b}-dark`, color: tailwindColors[b][800] },
    ];
  }, [] as Array<{ name: string; color: string }>)
  .reduce((a, b) => ({ ...a, [b.name]: b }), {} as Record<GroupColorsMapKey, Color>);

export const GROUP_COLORS = Object.values(HEX_TO_GROUP_COLOR) as Array<Color>;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
