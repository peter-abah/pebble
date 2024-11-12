import { Currency, ExchangeRate, Money } from "@/lib/types";
import { roundNumber } from "@/lib/utils";

export const CURRENCIES: Record<"NGN" | "USD", Currency> & Partial<Record<string, Currency>> = {
  NGN: {
    symbol: "₦",
    isoCode: "NGN",
    name: "Naira",
    minorUnit: 2,
  },
  USD: {
    symbol: "$",
    isoCode: "USD",
    name: "Dollar",
    minorUnit: 2,
  },
};

export const createMoney = (amountInMajorUnits: number, currency: Currency): Money => ({
  valueInMinorUnits: amountInMajorUnits * 10 ** currency.minorUnit,
  currency,
});

export const convertMoney = (amount: Money, exchangeRate: ExchangeRate): Money => {
  if (exchangeRate.from.isoCode !== amount.currency.isoCode) {
    throw new Error(
      `Wrong exchange rate. ${amount.currency.name} does not match ${exchangeRate.from.name}`
    );
  }
  return {
    valueInMinorUnits: amount.valueInMinorUnits * exchangeRate.rate,
    currency: exchangeRate.to,
  };
};

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency.isoCode !== b.currency.isoCode) {
    throw new Error(
      `Money objects must match before they can be added a:${a.currency.isoCode} b:${b.currency.isoCode}`
    );
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
  const valueInMajorUnits = roundNumber(
    valueInMinorUnits / 10 ** currency.minorUnit,
    currency.minorUnit
  );
  const noFractionDigits = Number.isInteger(valueInMajorUnits) ? 0 : currency.minorUnit;
  const amountStr = valueInMajorUnits.toLocaleString(undefined, {
    maximumFractionDigits: noFractionDigits,
    minimumFractionDigits: noFractionDigits,
  });
  const currencySymbol = currency.symbol;
  return currencySymbol + amountStr;
};

export const getMoneyValueInMajorUnits = ({ valueInMinorUnits, currency }: Money) => {
  return valueInMinorUnits / 10 ** currency.minorUnit;
};

export const renderCurrencyLabel = (isoCode: Currency["isoCode"]) => {
  const currency = CURRENCIES[isoCode];
  if (!currency) return "";

  return `${currency.name} (${currency.isoCode})`;
};
