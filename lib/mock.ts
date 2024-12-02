import { db } from "@/db/client";
import { resetDB } from "@/db/mutations/helpers";
import { batchInsertTransaction, InsertTransactionPayload } from "@/db/mutations/transactions";
import { accountsTable, categoriesTable, SchemaAccount, SchemaCategory } from "@/db/schema";
import dayjs from "dayjs";
import { ACCOUNTS, CATEGORIES } from "./data";
import { CURRENCIES_MAP } from "./data/currencies";
import { randomDate, randomElement, roundToZeros } from "./utils";

const MOCK_TITLES = [
  "Walmart Grocery",
  "Farmer's Market",
  "Costco Food Items",
  "Supermarket Groceries",
  "Organic Produce",

  "Apartment Rent",
  "Office Rent",
  "Monthly Rent Payment",
  "Rental Deposit",
  "Sublease Income",

  "Electricity Bill",
  "Water Bill",
  "Internet Payment",
  "Heating Bill",
  "Trash Collection Fee",

  "Gas for Car",
  "Bus Pass",
  "Ride Share",
  "Taxi Fare",
  "Subway Card",
  "Restaurant Bill",
  "Takeout Dinner",
  "Coffee Shop",
  "Lunch Out",
  "Snack Purchase",
  "Movie Tickets",
  "Concert",
  "Streaming Service",
  "Comedy Show",
  "Museum Entry",

  "Pharmacy Purchase",
  "Doctor Appointment",
  "Therapy Session",
  "Health Supplements",
  "Annual Check-Up",

  "Gym Membership",
  "Yoga Class",
  "Fitness Equipment",
  "Online Workout",
  "Personal Trainer Fee",

  "New Jacket",
  "Running Shoes",
  "Casual Outfit",
  "Accessories",
  "Formal Wear",

  "Magazine Subscription",
  "Streaming Service Subscription",
  "Online Newspaper",
  "Fitness App",
  "Software Subscription",

  "Health Insurance",
  "Car Insurance",
  "Home Insurance",
  "Life Insurance",
  "Dental Insurance",

  "Airplane Ticket",
  "Hotel Booking",
  "Train Fare",
  "Car Rental",
  "Travel Insurance",
  "Birthday Present",
  "Holiday Gift",
  "Anniversary Gift",
  "Wedding Gift",
  "Graduation Gift",
  "Online Course",
  "Textbooks",
  "Workshop Fee",
  "Certification Course",
  "School Supplies",
  "Paint Supplies",
  "Furniture Purchase",
  "Garden Tools",
  "Repair Materials",
  "Home Decor",
  "Dog Food",
  "Pet Grooming",
  "Vet Appointment",
  "Pet Toys",
  "Pet Accessories",

  "Stock Purchase",
  "Dividend Payment",
  "Mutual Fund Investment",
  "Cryptocurrency Investment",
  "Bond Purchase",

  "Charity Donation",
  "Fundraiser Contribution",
  "Non-Profit Donation",
  "Community Fund",
  "Charity Auction",

  "Income Tax",
  "Property Tax",
  "Sales Tax",
  "Capital Gains Tax",
  "Business Tax",

  "Miscellaneous Purchase",
  "One-time Expense",
  "Unplanned Purchase",
  "Impulse Buy",
  "Special Event Cost",

  "Monthly Salary",
  "Year-End Bonus",
  "Commission Payment",
  "Overtime Pay",
  "Holiday Bonus",

  "Freelance Project Payment",
  "Consulting Income",
  "Graphic Design Job",
  "Writing Assignment",
  "Coding Project",

  "Performance Bonus",
  "Referral Bonus",
  "Sales Bonus",
  "Incentive Reward",
  "Team Achievement Bonus",

  "Bank Interest",
  "Savings Account Interest",
  "Bond Interest",
  "Fixed Deposit Interest",
  "Loan Interest",

  "House Rental Income",
  "Commercial Property Rent",
  "Apartment Lease Income",
  "Short-Term Rental",
  "Vacation Rental Income",

  "Uncategorized Transaction",
  "Miscellaneous Entry",
  "Unknown Expense",
  "Non-classified Payment",
  "Other Income/Expense",
];

export const generateRandomTransactionValues = (
  category: SchemaCategory,
  account: SchemaAccount
): InsertTransactionPayload => {
  const endDate = dayjs();
  const startDate = endDate.subtract(2, "year");
  const type = randomElement(["expense", "income"] as const);

  const title = randomElement(MOCK_TITLES);
  const amount =
    type === "expense"
      ? roundToZeros(Math.random() * (500_000 - 500) + 500, 3)
      : roundToZeros(Math.random() * (1_000_000 - 50_000) + 50_000, 3);
  const currency = CURRENCIES_MAP[account.currency_code];
  if (!currency) {
    throw new Error(`Currency with code: ${account.currency_code} does not exist`);
  }

  return {
    amount_value_in_minor_units: amount * 10 ** currency.minorUnit,
    amount_currency_code: currency.isoCode,
    datetime: randomDate(startDate, endDate).toISOString(),
    type,
    category_id: category.id,
    account_id: account.id,
    title,
  };
};

export const loadMockData = async () => {
  await resetDB();

  const categories = await db.insert(categoriesTable).values(CATEGORIES).returning();
  const accounts = await db.insert(accountsTable).values(ACCOUNTS).returning();

  const transactionValues = Array.from({ length: 50 }, () =>
    generateRandomTransactionValues(randomElement(categories), randomElement(accounts))
  );

  await batchInsertTransaction(transactionValues);
};
