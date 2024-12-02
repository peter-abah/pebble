import { accountsTable, categoriesTable } from "@/db/schema";
import { NAME_TO_GROUP_COLOR } from "@/lib/constants";

export const ACCOUNTS: Array<typeof accountsTable.$inferInsert> = [
  {
    name: "Main",
    balance_value_in_minor_units: 0,
    currency_code: "NGN",
    color: NAME_TO_GROUP_COLOR["blue-dark"].color,
  },
];

export const BALANCE_CREDIT_CATEGORY_ID: string = "BALANCE_CREDIT_CATEGORY_ID";
export const BALANCE_DEBIT_CATEGORY_ID: string = "BALANCE_DEBIT_CATEGORY_ID";

// ? Freeze object to ensure it is not mutated anywhere else in the app
export const SPECIAL_CATEGORIES = Object.freeze({
  [BALANCE_CREDIT_CATEGORY_ID]: {
    name: "Balance credit",
    id: BALANCE_CREDIT_CATEGORY_ID,
    type: "income" as const,
    color: NAME_TO_GROUP_COLOR["green"].color,
    icon: { name: "bank", type: "icon" },
  },
  [BALANCE_DEBIT_CATEGORY_ID]: {
    name: "Balance debit",
    id: BALANCE_DEBIT_CATEGORY_ID,
    type: "expense" as const,
    color: NAME_TO_GROUP_COLOR["red"].color,
    icon: { name: "bank", type: "icon" },
  },
  UNKNOWN: {
    name: "Unknown",
    id: "UNKNOWN",
    color: NAME_TO_GROUP_COLOR["gray-dark"].color,
    icon: { name: "question-mark", type: "icon" },
  },
});

export const CATEGORIES: Array<typeof categoriesTable.$inferInsert> = [
  {
    name: "Groceries",

    type: "expense" as const,
    color: "#33cc33", // hsla(120 60% 50%)
    icon: { emoji: "🛒", type: "emoji" as const },
  },
  {
    name: "Rent",

    type: "expense" as const,
    color: "#3333cc", // hsla(240 60% 50%)
    icon: { emoji: "🏠", type: "emoji" as const },
  },
  {
    name: "Utilities",

    type: "expense" as const,
    color: "#cccc33", // hsla(60 60% 50%)
    icon: { emoji: "💡", type: "emoji" as const },
  },
  {
    name: "Transportation",

    type: "expense" as const,
    color: "#cc6633", // hsla(30 60% 50%)
    icon: { emoji: "🚗", type: "emoji" as const },
  },
  {
    name: "Dining",

    type: "expense" as const,
    color: "#cc33cc", // hsla(300 60% 50%)
    icon: { emoji: "🍽️", type: "emoji" as const },
  },
  {
    name: "Entertainment",

    type: "expense" as const,
    color: "#3399cc", // hsla(210 60% 50%)
    icon: { emoji: "🎬", type: "emoji" as const },
  },
  {
    name: "Health",

    type: "expense" as const,
    color: "#66cc33", // hsla(90 60% 50%)
    icon: { emoji: "💊", type: "emoji" as const },
  },
  {
    name: "Fitness",

    type: "expense" as const,
    color: "#cc3399", // hsla(330 60% 50%)
    icon: { emoji: "🏋️", type: "emoji" as const },
  },
  {
    name: "Clothing",

    type: "expense" as const,
    color: "#9933cc", // hsla(270 60% 50%)
    icon: { emoji: "👗", type: "emoji" as const },
  },
  {
    name: "Subscriptions",

    type: "expense" as const,
    color: "#33cccc", // hsla(180 60% 50%)
    icon: { emoji: "📺", type: "emoji" as const },
  },
  {
    name: "Insurance",

    type: "expense" as const,
    color: "#33cc66", // hsla(150 60% 50%)
    icon: { emoji: "🛡️", type: "emoji" as const },
  },
  {
    name: "Travel",

    type: "expense" as const,
    color: "#3366cc", // hsla(240 60% 45%) - slight tweak to make it unique
    icon: { emoji: "✈️", type: "emoji" as const },
  },
  {
    name: "Gifts",

    type: "expense" as const,
    color: "#cc3399", // hsla(330 60% 55%) - already used
    icon: { emoji: "🎁", type: "emoji" as const },
  },
  {
    name: "Education",

    type: "expense" as const,
    color: "#cccc66", // hsla(60 60% 55%) - slight tweak
    icon: { emoji: "🎓", type: "emoji" as const },
  },
  {
    name: "Home Improvement",

    type: "expense" as const,
    color: "#33cc33", // hsla(120 60% 55%)
    icon: { emoji: "🔨", type: "emoji" as const },
  },
  {
    name: "Pets",

    type: "expense" as const,
    color: "#33cccc", // hsla(180 60% 45%) - adjusted saturation
    icon: { emoji: "🐕", type: "emoji" as const },
  },
  {
    name: "Investments",

    type: "income" as const,
    color: "#9933cc", // hsla(270 60% 45%)
    icon: { emoji: "📈", type: "emoji" as const },
  },
  {
    name: "Charity",

    type: "expense" as const,
    color: "#3399cc", // hsla(210 60% 55%)
    icon: { emoji: "❤️", type: "emoji" as const },
  },
  {
    name: "Taxes",

    type: "expense" as const,
    color: "#66cc66", // hsla(90 60% 45%) - slight tweak
    icon: { emoji: "💰", type: "emoji" as const },
  },
  {
    name: "Miscellaneous",

    type: "expense" as const,
    color: "#cc6633", // hsla(30 60% 55%) - slight tweak
    icon: { emoji: "📦", type: "emoji" as const },
  },
  {
    name: "Salary",

    type: "income" as const,
    color: "#3399cc", // hsla(200 60% 55%)
    icon: { emoji: "💼", type: "emoji" as const },
  },
  {
    name: "Freelance Income",

    type: "income" as const,
    color: "#6644cc", // hsla(250 60% 45%)
    icon: { emoji: "🖥️", type: "emoji" as const },
  },
  {
    name: "Bonus",

    type: "income" as const,
    color: "#33cc66", // hsla(160 60% 55%)
    icon: { emoji: "💸", type: "emoji" as const },
  },
  {
    name: "Interest",

    type: "income" as const,
    color: "#66cc33", // hsla(100 60% 55%)
    icon: { emoji: "🏦", type: "emoji" as const },
  },
  {
    name: "Rental Income",

    type: "income" as const,
    color: "#3366cc", // hsla(220 60% 45%) - slight tweak
    icon: { emoji: "🏢", type: "emoji" as const },
  },
  {
    name: "Unknown",

    color: "#33cc99", // hsla(170 60% 55%)
    icon: { emoji: "❓", type: "emoji" as const },
  },
];

export const CATEGORIES_MAP = CATEGORIES.reduce((result, curr) => {
  result[curr.name] = curr;
  return result;
}, {} as Record<string, any>);
