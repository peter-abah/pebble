import dayjs from "dayjs";
import { useAppStore } from "./store";
import { randomDate, randomElement, roundToZeros } from "./utils";
import { Transaction, TransactionCategory } from "./types";
import { createMoney } from "./money";
import { nanoid } from "./nanoid";

const MOCK_TITLES: Record<string, Array<string>> = {
  "1": [
    "Walmart Grocery",
    "Farmer's Market",
    "Costco Food Items",
    "Supermarket Groceries",
    "Organic Produce",
  ],
  "2": [
    "Apartment Rent",
    "Office Rent",
    "Monthly Rent Payment",
    "Rental Deposit",
    "Sublease Income",
  ],
  "3": [
    "Electricity Bill",
    "Water Bill",
    "Internet Payment",
    "Heating Bill",
    "Trash Collection Fee",
  ],
  "4": ["Gas for Car", "Bus Pass", "Ride Share", "Taxi Fare", "Subway Card"],
  "5": ["Restaurant Bill", "Takeout Dinner", "Coffee Shop", "Lunch Out", "Snack Purchase"],
  "6": ["Movie Tickets", "Concert", "Streaming Service", "Comedy Show", "Museum Entry"],
  "7": [
    "Pharmacy Purchase",
    "Doctor Appointment",
    "Therapy Session",
    "Health Supplements",
    "Annual Check-Up",
  ],
  "8": [
    "Gym Membership",
    "Yoga Class",
    "Fitness Equipment",
    "Online Workout",
    "Personal Trainer Fee",
  ],
  "9": ["New Jacket", "Running Shoes", "Casual Outfit", "Accessories", "Formal Wear"],
  "10": [
    "Magazine Subscription",
    "Streaming Service Subscription",
    "Online Newspaper",
    "Fitness App",
    "Software Subscription",
  ],
  "11": [
    "Health Insurance",
    "Car Insurance",
    "Home Insurance",
    "Life Insurance",
    "Dental Insurance",
  ],
  "12": ["Airplane Ticket", "Hotel Booking", "Train Fare", "Car Rental", "Travel Insurance"],
  "13": ["Birthday Present", "Holiday Gift", "Anniversary Gift", "Wedding Gift", "Graduation Gift"],
  "14": ["Online Course", "Textbooks", "Workshop Fee", "Certification Course", "School Supplies"],
  "15": ["Paint Supplies", "Furniture Purchase", "Garden Tools", "Repair Materials", "Home Decor"],
  "16": ["Dog Food", "Pet Grooming", "Vet Appointment", "Pet Toys", "Pet Accessories"],
  "17": [
    "Stock Purchase",
    "Dividend Payment",
    "Mutual Fund Investment",
    "Cryptocurrency Investment",
    "Bond Purchase",
  ],
  "18": [
    "Charity Donation",
    "Fundraiser Contribution",
    "Non-Profit Donation",
    "Community Fund",
    "Charity Auction",
  ],
  "19": ["Income Tax", "Property Tax", "Sales Tax", "Capital Gains Tax", "Business Tax"],
  "20": [
    "Miscellaneous Purchase",
    "One-time Expense",
    "Unplanned Purchase",
    "Impulse Buy",
    "Special Event Cost",
  ],
  "21": ["Monthly Salary", "Year-End Bonus", "Commission Payment", "Overtime Pay", "Holiday Bonus"],
  "22": [
    "Freelance Project Payment",
    "Consulting Income",
    "Graphic Design Job",
    "Writing Assignment",
    "Coding Project",
  ],
  "23": [
    "Performance Bonus",
    "Referral Bonus",
    "Sales Bonus",
    "Incentive Reward",
    "Team Achievement Bonus",
  ],
  "24": [
    "Bank Interest",
    "Savings Account Interest",
    "Bond Interest",
    "Fixed Deposit Interest",
    "Loan Interest",
  ],
  "25": [
    "House Rental Income",
    "Commercial Property Rent",
    "Apartment Lease Income",
    "Short-Term Rental",
    "Vacation Rental Income",
  ],
  "26": [
    "Uncategorized Transaction",
    "Miscellaneous Entry",
    "Unknown Expense",
    "Non-classified Payment",
    "Other Income/Expense",
  ],
};

export const generateRandomTransaction = () => {
  const appState = useAppStore.getState();
  const endDate = dayjs();
  const startDate = endDate.subtract(2, "year");
  const type = randomElement(["expense", "income"] as const);

  const category = randomElement(
    Object.values(appState.categories).filter((c) => type === c!.type)
  ) as TransactionCategory;
  const title = randomElement(MOCK_TITLES[category.id]);
  const amount =
    type === "expense"
      ? roundToZeros(Math.random() * (500_000 - 500) + 500, 3)
      : roundToZeros(Math.random() * (1_000_000 - 50_000) + 50_000, 3);

  return {
    id: nanoid(),
    amount: createMoney(amount, appState.accounts[appState.defaultAccountID]!.currency),
    datetime: randomDate(startDate, endDate).toISOString(),
    type,
    categoryID: category.id,
    accountID: appState.defaultAccountID,
    title,
  } as Transaction;
};

export const loadMockData = () => {
  const appState = useAppStore.getState();
  appState.actions.reset();
  for (let i = 0; i < 50; i++) {
    appState.actions.addTransaction(generateRandomTransaction());
  }
};
