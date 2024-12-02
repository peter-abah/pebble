import { CURRENCIES_MAP } from "@/lib/data/currencies";
import { Currency, ExchangeRate, Money } from "@/lib/types";
import { roundNumber } from "@/lib/utils";

export const createMoney = (amountInMajorUnits: number, currency: Currency): Money => ({
  valueInMinorUnits: amountInMajorUnits * 10 ** currency.minorUnit,
  currencyCode: currency.isoCode,
});

export const convertMoney = (amount: Money, exchangeRate: ExchangeRate): Money => {
  if (exchangeRate.from !== amount.currencyCode) {
    throw new Error(
      `Wrong exchange rate. ${amount.currencyCode} does not match ${exchangeRate.from}`
    );
  }
  return {
    valueInMinorUnits: amount.valueInMinorUnits * exchangeRate.rate,
    currencyCode: exchangeRate.to,
  };
};

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error(
      `Money objects must match before they can be added a:${a.currencyCode} b:${b.currencyCode}`
    );
  }
  return {
    valueInMinorUnits: a.valueInMinorUnits + b.valueInMinorUnits,
    currencyCode: a.currencyCode,
  };
};

export const subtractMoney = (a: Money, b: Money): Money => {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error("Money objects must match before they can be subtracted");
  }
  return {
    valueInMinorUnits: a.valueInMinorUnits - b.valueInMinorUnits,
    currencyCode: a.currencyCode,
  };
};

export const formatMoney = ({ valueInMinorUnits, currencyCode }: Money) => {
  const currency = CURRENCIES_MAP[currencyCode];
  if (!currency) {
    throw new Error(`Currency with currency code: ${currencyCode} does not exist`);
  }

  const valueInMajorUnits = roundNumber(
    valueInMinorUnits / 10 ** currency.minorUnit,
    currency.minorUnit
  );
  const noFractionDigits = currency.minorUnit;
  const amountStr = valueInMajorUnits.toLocaleString(undefined, {
    maximumFractionDigits: noFractionDigits,
  });

  const currencySymbol = currency.symbol;
  return currencySymbol + amountStr;
};

export const getMoneyValueInMajorUnits = ({ valueInMinorUnits, currencyCode }: Money) => {
  const currency = CURRENCIES_MAP[currencyCode];
  if (!currency) {
    throw new Error(`Currency with currency code: ${currencyCode} does not exist`);
  }
  return valueInMinorUnits / 10 ** currency.minorUnit;
};

export const renderCurrencyLabel = (isoCode: Currency["isoCode"]) => {
  const currency = CURRENCIES_MAP[isoCode];
  if (!currency) return "";

  return `${currency.name} (${currency.isoCode})`;
};
