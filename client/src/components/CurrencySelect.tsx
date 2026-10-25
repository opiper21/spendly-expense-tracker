import { ChevronDown, Globe } from "lucide-react";
import { currencies } from "../lib/currency";
import { useCurrency } from "../context/currencyContext";

export default function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative">
      <Globe
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        aria-label="Currency"
        className="h-9 cursor-pointer appearance-none rounded-full border border-border bg-surface pl-9 pr-8 text-sm font-medium text-ink outline-none transition hover:bg-surface-muted focus:border-accent"
      >
        {currencies.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code} · {item.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}