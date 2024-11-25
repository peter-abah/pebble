import { MaterialCommunityIcons } from "@/lib/icons/MaterialCommunityIcons";

import { ReactNode } from "react";
import { MaterialIcons } from "./MaterialIcons";
import { NonEmptyArray } from "../types";

interface CategoryIconProps {
  className?: string;
  size: number;
  color?: string;
}
export const CATEGORY_ICONS = {
  home: (props) => <MaterialCommunityIcons name="home-outline" {...props} />,
  lightbulb: (props) => <MaterialCommunityIcons name="lightbulb" {...props} />,
  "gas-station": (props) => <MaterialCommunityIcons name="gas-station" {...props} />,
  trash: (props) => <MaterialCommunityIcons name="recycle" {...props} />,
  snacks: (props) => <MaterialCommunityIcons name="hamburger" {...props} />,
  phone: (props) => <MaterialCommunityIcons name="phone-outline" {...props} />,
  car: (props) => <MaterialCommunityIcons name="car" {...props} />,
  cart: (props) => <MaterialIcons name="local-grocery-store" {...props} />,
  store: (props) => <MaterialIcons name="store" {...props} />,
  transportation: (props) => <MaterialIcons name="emoji-transportation" {...props} />,
  restaurant: (props) => <MaterialIcons name="restaurant" {...props} />,
  movie: (props) => <MaterialIcons name="movie" {...props} />,
  entertainment: (props) => <MaterialIcons name="theater-comedy" {...props} />,
  clothing: (props) => <MaterialCommunityIcons name="tshirt-crew-outline" {...props} />,
  gym: (props) => <MaterialCommunityIcons name="dumbbell" {...props} />,
  school: (props) => <MaterialCommunityIcons name="school-outline" {...props} />,
  bank: (props) => <MaterialIcons name="account-balance" {...props} />,
  book: (props) => <MaterialCommunityIcons name="book-multiple-outline" {...props} />,
  gift: (props) => <MaterialCommunityIcons name="gift-outline" {...props} />,
  "credit-card": (props) => <MaterialIcons name="credit-card" {...props} />,
  laptop: (props) => <MaterialIcons name="laptop" {...props} />,
  family: (props) => <MaterialIcons name="family-restroom" {...props} />,
  child: (props) => <MaterialIcons name="child-friendly" {...props} />,
  pets: (props) => <MaterialIcons name="pets" {...props} />,
  repair: (props) => <MaterialIcons name="construction" {...props} />,
  savings: (props) => <MaterialIcons name="savings" {...props} />,
  coin: (props) => <MaterialIcons name="paid" {...props} />,
  clock: (props) => <MaterialIcons name="schedule" {...props} />,
  star: (props) => <MaterialIcons name="star" {...props} />,
  payment: (props) => <MaterialIcons name="payments" {...props} />,
  brush: (props) => <MaterialIcons name="brush" {...props} />,
  cake: (props) => <MaterialIcons name="cake" {...props} />,
  interests: (props) => <MaterialIcons name="interests" {...props} />,
  investment: (props) => <MaterialIcons name="stacked-line-chart" {...props} />,
  briefcase: (props) => <MaterialCommunityIcons name="briefcase" {...props} />,
} satisfies Record<string, (props: CategoryIconProps) => ReactNode>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;
export const CATEGORY_ICONS_NAMES = Object.keys(CATEGORY_ICONS) as NonEmptyArray<CategoryIconName>;
