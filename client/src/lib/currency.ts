export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
}

export const currencies: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "en-IE" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
  { code: "NGN", label: "Nigerian Naira", locale: "en-NG" },
  { code: "CAD", label: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", label: "Australian Dollar", locale: "en-AU" },
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
  { code: "ZAR", label: "South African Rand", locale: "en-ZA" },
  { code: "KES", label: "Kenyan Shilling", locale: "en-KE" },
  { code: "GHS", label: "Ghanaian Cedi", locale: "en-GH" },
];

const STORAGE_KEY = "spendly_currency";

const regionCurrency: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  CA: "CAD",
  AU: "AUD",
  IN: "INR",
  ZA: "ZAR",
  KE: "KES",
  GH: "GHS",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  IE: "EUR",
  PT: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
};

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, code: string): string {
  let formatter = formatters.get(code);

  if (!formatter) {
    const option = currencies.find((item) => item.code === code) ?? currencies[0];
    formatter = new Intl.NumberFormat(option.locale, {
      style: "currency",
      currency: option.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(code, formatter);
  }

  return formatter.format(value);
}

export function getInitialCurrency(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && currencies.some((item) => item.code === saved)) {
      return saved;
    }

    const region = new Intl.Locale(navigator.language).region;
    if (region && regionCurrency[region]) {
      return regionCurrency[region];
    }
  } catch {
    // fall back to the default below
  }

  return "USD";
}

export function saveCurrency(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // the choice still works for this session
  }
}