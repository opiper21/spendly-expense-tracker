import { createContext, useContext } from "react";

export interface CurrencyContextValue {
  currency: string;
  setCurrency: (code: string) => void;
  format: (value: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }
  return context;
}