import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { formatMoney, getInitialCurrency, saveCurrency } from "../lib/currency";
import { CurrencyContext } from "./currencyContext";
import type { CurrencyContextValue } from "./currencyContext";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(getInitialCurrency);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    saveCurrency(code);
  }, []);

  const format = useCallback((value: number) => formatMoney(value, currency), [currency]);

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, format }),
    [currency, setCurrency, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}