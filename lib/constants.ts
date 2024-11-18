import { TailwindColors, tailwindColors } from "./tailwind-colors";
import { Satisfies, TransactionType } from "./types";
import { exhaustiveUnionTuple } from "./utils";

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

type Color = { name: string; color: string };
type GroupColorsMapKey = keyof TailwindColors | `${keyof TailwindColors}-dark`;
const tailwindKeys = Object.keys(tailwindColors) as Array<keyof TailwindColors>;

export const HEX_TO_GROUP_COLOR = tailwindKeys
  .reduce((a, b) => {
    return [
      ...a,
      { name: b, color: tailwindColors[b][500] },
      { name: `${b}-dark`, color: tailwindColors[b][800] },
    ];
  }, [] as Array<{ name: string; color: string }>)
  .reduce((a, b) => ({ ...a, [b.color]: b }), {} as Record<string, Color>);

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
export const DEFAULT_GROUP_COLOR = NAME_TO_GROUP_COLOR.cyan;

export const TRANSACTION_TYPES = exhaustiveUnionTuple<TransactionType>()(
  "income",
  "expense",
  "transfer",
  "lent",
  "borrowed",
  "paid_loan",
  "collected_debt"
);
export const DEBIT_TRANSACTION_TYPES = ["expense", "lent", "paid_loan"] as const;
export type DebitTransactionType = Satisfies<
  TransactionType,
  (typeof DEBIT_TRANSACTION_TYPES)[number]
>;
export const CREDIT_TRANSACTION_TYPES = ["income", "collected_debt", "borrowed"] as const;
export type CreditTransactionType = Satisfies<
  TransactionType,
  (typeof CREDIT_TRANSACTION_TYPES)[number]
>;
export const LOAN_TRANSACTION_TYPES = ["lent", "borrowed"] as const;
export type LoanTransactionType = Satisfies<
  TransactionType,
  (typeof LOAN_TRANSACTION_TYPES)[number]
>;
