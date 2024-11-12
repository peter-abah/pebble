import ScreenWrapper from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BanknoteIcon } from "@/lib/icons/BankNote";
import { MaterialCommunityIcons } from "@/lib/icons/MaterialCommunityIcons";
import { PiggyBankIcon } from "@/lib/icons/PiggyBank";
import { SettingsIcon } from "@/lib/icons/Settings";
import { ShapesIcon } from "@/lib/icons/Shapes";
import { WalletCardsIcon } from "@/lib/icons/WalletCards";
import { CURRENCIES, createMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Transaction, TransactionCategory } from "@/lib/types";
import { randomElement, roundToZeros } from "@/lib/utils";
import dayjs, { Dayjs } from "dayjs";
import { Link } from "expo-router";
import { nanoid } from "nanoid";
import { ComponentProps, ReactNode, forwardRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const More = () => {
  return (
    <ScreenWrapper>
      <View className="flex-row gap-4 items-center pt-8 px-6 py-4 justify-between">
        <Text className="font-semibold text-2xl">More actions</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerClassName="gap-4">
        <Link href={"/accounts"} asChild>
          <ActionButton
            title="Accounts"
            icon={<WalletCardsIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>
        <Link href={"/categories"} asChild>
          <ActionButton
            title="Categories"
            icon={<ShapesIcon size={24} className="text-foreground mr-2" />}
          />
        </Link>
        <ActionButton
          title="Debts and Loans"
          icon={<BanknoteIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Subscriptions"
          icon={
            <MaterialCommunityIcons
              name="calendar-refresh-outline"
              size={24}
              className="text-foreground mr-2"
            />
          }
        />
        <ActionButton
          title="Scheduled"
          icon={
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={24}
              className="text-foreground mr-2"
            />
          }
        />
        <ActionButton
          title="Savings"
          icon={<PiggyBankIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Settings"
          icon={<SettingsIcon size={24} className="text-foreground mr-2" />}
        />
        <ActionButton
          title="Load test data"
          onPress={loadData}
          icon={
            <MaterialCommunityIcons name="database" size={24} className="text-foreground mr-2" />
          }
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

function randomDate(start: Dayjs, end: Dayjs) {
  const startTime = start.valueOf();
  const endTime = end.valueOf();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return dayjs(randomTime);
}

const loadData = () => {
  const titles: Record<string, Array<string>> = {
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
    "13": [
      "Birthday Present",
      "Holiday Gift",
      "Anniversary Gift",
      "Wedding Gift",
      "Graduation Gift",
    ],
    "14": ["Online Course", "Textbooks", "Workshop Fee", "Certification Course", "School Supplies"],
    "15": [
      "Paint Supplies",
      "Furniture Purchase",
      "Garden Tools",
      "Repair Materials",
      "Home Decor",
    ],
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
    "21": [
      "Monthly Salary",
      "Year-End Bonus",
      "Commission Payment",
      "Overtime Pay",
      "Holiday Bonus",
    ],
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

  function generateTransaction() {
    const appState = useAppStore.getState();
    const endDate = dayjs();
    const startDate = endDate.subtract(2, "year");
    const type = randomElement(["expense", "income"] as const);
    const categoryID = randomElement(
      (Object.values(appState.categories) as Array<TransactionCategory>).filter(
        (c) => type === c.type
      )
    ).id;
    const title = randomElement(titles[categoryID]);
    const amount =
      type === "expense"
        ? roundToZeros(Math.random() * (500_000 - 500) + 500, 3)
        : roundToZeros(Math.random() * (1_000_000 - 50_000) + 50_000, 3);

    return {
      id: nanoid(),
      amount: createMoney(amount, CURRENCIES.NGN),
      datetime: randomDate(startDate, endDate).toISOString(),
      type,
      categoryID,
      accountID: appState.defaultAccountID,
      title,
    } as Transaction;
  }

  const appState = useAppStore.getState();
  appState.actions.reset();
  for (let i = 0; i < 50; i++) {
    appState.actions.addTransaction(generateTransaction());
  }
};

interface ActionButtonProps extends ComponentProps<typeof Button> {
  title: string;
  icon: ReactNode;
}
const ActionButton = forwardRef<View, ActionButtonProps>(({ title, icon, ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      className="flex-row items-center justify-start py-3 px-4 h-auto"
      variant={"outline"}
      {...rest}
    >
      {icon}
      <Text className="font-medium text-lg">{title}</Text>
    </Button>
  );
});

ActionButton.displayName = "ActionButton";
export default More;
