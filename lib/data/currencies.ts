import { Currency, PartialRecord } from "../types";
import currenciesData from "./currencies.json";

export const CURRENCIES: Array<Currency> = Object.values(currenciesData).map(
  ({ name, code, decimal_digits, symbol }) => ({
    name,
    symbol,
    isoCode: code,
    minorUnit: decimal_digits,
  })
);

export const CURRENCIES_MAP: PartialRecord<string, Currency> = CURRENCIES.reduce((result, curr) => {
  result[curr.isoCode] = curr;
  return result;
}, {} as PartialRecord<string, Currency>);
