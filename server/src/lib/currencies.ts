export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "CAD",
  "AUD",
  "INR",
  "ZAR",
  "KES",
  "GHS",
  "KRW",
  "JPY",
  "CNY",
  "AED",
  "BRL",
  "CHF",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}