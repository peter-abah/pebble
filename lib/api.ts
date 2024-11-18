const EXCHANGE_RATE_API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
export async function fetchExchangeRates(code: string) {
  const response = await fetch(`${EXCHANGE_RATE_API_URL}${code.toLocaleLowerCase()}.min.json`);

  if (!response.ok) {
    return { error: { msg: `Unable to fetch exchange rates for ${code}` } };
  }

  type ReponseData = { date: string } & Record<string, Record<string, number>>;
  const data: ReponseData = await response.json();
  return { data: { date: data.date, rates: data[code.toLocaleLowerCase()]! } };
}
