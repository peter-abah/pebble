import { Currency, Money } from "@/lib/types";

export const CURRENCIES: Record<"NGN" | "USD" | string, Currency> = {
  NGN: {
    symbol: "₦",
    isoCode: "NGN",
    name: "Naira",
    minorUnit: 2,
  },
  USD: {
    symbol: "₦",
    isoCode: "NGN",
    name: "Naira",
    minorUnit: 2,
  },
};

export const createMoney = (amountInMajorUnits: number, currency: Currency): Money => ({
  valueInMinorUnits: amountInMajorUnits * 10 ** currency.minorUnit,
  currency,
});

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency.isoCode !== b.currency.isoCode) {
    throw new Error("Money objects must match before they can be added");
  }
  return {
    valueInMinorUnits: a.valueInMinorUnits + b.valueInMinorUnits,
    currency: a.currency,
  };
};

export const subtractMoney = (a: Money, b: Money): Money => {
  if (a.currency.isoCode !== b.currency.isoCode) {
    throw new Error("Money objects must match before they can be subtracted");
  }
  return {
    valueInMinorUnits: a.valueInMinorUnits - b.valueInMinorUnits,
    currency: a.currency,
  };
};

export const formatMoney = ({ valueInMinorUnits, currency }: Money) => {
  const valueInMajorUnits = valueInMinorUnits / 10 ** currency.minorUnit;
  const noFractionDigits = Number.isInteger(valueInMajorUnits) ? 0 : currency.minorUnit;
  const amountStr = valueInMajorUnits.toLocaleString(undefined, {
    maximumFractionDigits: noFractionDigits,
    minimumFractionDigits: noFractionDigits,
  });
  const currencySymbol = currency.symbol;
  return currencySymbol + amountStr;
};
