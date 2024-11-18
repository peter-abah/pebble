import { NAME_TO_GROUP_COLOR } from "@/lib/constants";
import { createMoney } from "@/lib/money";
import { Account, TransactionCategory } from "@/lib/types";
import { CURRENCIES_MAP } from "./currencies";

export const ACCOUNTS: Array<Account> = [
  {
    name: "Main",
    id: "1",
    balance: createMoney(0, CURRENCIES_MAP["NGN"]!),
    currency: CURRENCIES_MAP["NGN"]!,
    color: NAME_TO_GROUP_COLOR["blue-dark"].color,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CATEGORIES: Array<TransactionCategory> = [
  {
    name: "Groceries",
    id: "1",
    type: "expense",
    color: "#33cc33", // hsla(120 60% 50%)
    icon: { emoji: "🛒", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Rent",
    id: "2",
    type: "expense",
    color: "#3333cc", // hsla(240 60% 50%)
    icon: { emoji: "🏠", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Utilities",
    id: "3",
    type: "expense",
    color: "#cccc33", // hsla(60 60% 50%)
    icon: { emoji: "💡", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Transportation",
    id: "4",
    type: "expense",
    color: "#cc6633", // hsla(30 60% 50%)
    icon: { emoji: "🚗", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Dining",
    id: "5",
    type: "expense",
    color: "#cc33cc", // hsla(300 60% 50%)
    icon: { emoji: "🍽️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Entertainment",
    id: "6",
    type: "expense",
    color: "#3399cc", // hsla(210 60% 50%)
    icon: { emoji: "🎬", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Health",
    id: "7",
    type: "expense",
    color: "#66cc33", // hsla(90 60% 50%)
    icon: { emoji: "💊", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Fitness",
    id: "8",
    type: "expense",
    color: "#cc3399", // hsla(330 60% 50%)
    icon: { emoji: "🏋️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Clothing",
    id: "9",
    type: "expense",
    color: "#9933cc", // hsla(270 60% 50%)
    icon: { emoji: "👗", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Subscriptions",
    id: "10",
    type: "expense",
    color: "#33cccc", // hsla(180 60% 50%)
    icon: { emoji: "📺", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Insurance",
    id: "11",
    type: "expense",
    color: "#33cc66", // hsla(150 60% 50%)
    icon: { emoji: "🛡️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Travel",
    id: "12",
    type: "expense",
    color: "#3366cc", // hsla(240 60% 45%) - slight tweak to make it unique
    icon: { emoji: "✈️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Gifts",
    id: "13",
    type: "expense",
    color: "#cc3399", // hsla(330 60% 55%) - already used
    icon: { emoji: "🎁", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Education",
    id: "14",
    type: "expense",
    color: "#cccc66", // hsla(60 60% 55%) - slight tweak
    icon: { emoji: "🎓", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Home Improvement",
    id: "15",
    type: "expense",
    color: "#33cc33", // hsla(120 60% 55%)
    icon: { emoji: "🔨", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Pets",
    id: "16",
    type: "expense",
    color: "#33cccc", // hsla(180 60% 45%) - adjusted saturation
    icon: { emoji: "🐕", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Investments",
    id: "17",
    type: "income",
    color: "#9933cc", // hsla(270 60% 45%)
    icon: { emoji: "📈", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Charity",
    id: "18",
    type: "expense",
    color: "#3399cc", // hsla(210 60% 55%)
    icon: { emoji: "❤️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Taxes",
    id: "19",
    type: "expense",
    color: "#66cc66", // hsla(90 60% 45%) - slight tweak
    icon: { emoji: "💰", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Miscellaneous",
    id: "20",
    type: "expense",
    color: "#cc6633", // hsla(30 60% 55%) - slight tweak
    icon: { emoji: "📦", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Salary",
    id: "21",
    type: "income",
    color: "#3399cc", // hsla(200 60% 55%)
    icon: { emoji: "💼", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Freelance Income",
    id: "22",
    type: "income",
    color: "#6644cc", // hsla(250 60% 45%)
    icon: { emoji: "🖥️", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Bonus",
    id: "23",
    type: "income",
    color: "#33cc66", // hsla(160 60% 55%)
    icon: { emoji: "💸", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Interest",
    id: "24",
    type: "income",
    color: "#66cc33", // hsla(100 60% 55%)
    icon: { emoji: "🏦", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Rental Income",
    id: "25",
    type: "income",
    color: "#3366cc", // hsla(220 60% 45%) - slight tweak
    icon: { emoji: "🏢", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Unknown",
    id: "26",
    color: "#33cc99", // hsla(170 60% 55%)
    icon: { emoji: "❓", type: "emoji" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CATEGORIES_MAP = CATEGORIES.reduce((result, curr) => {
  result[curr.name] = curr;
  return result;
}, {} as Record<string, TransactionCategory>);
