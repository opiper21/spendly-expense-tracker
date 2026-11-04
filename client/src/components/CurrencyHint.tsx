import { motion } from "motion/react";
import type { Summary } from "../types";

interface CurrencyHintProps {
  summary: Summary | null;
  onSwitch: (code: string) => void;
}

export default function CurrencyHint({ summary, onSwitch }: CurrencyHintProps) {
  if (!summary) return null;

  const others = summary.currencies.filter((item) => item.currency !== summary.currency);
  if (others.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-2 text-sm text-muted"
    >
      <span>Viewing {summary.currency}. Also tracking:</span>
      {others.map((item) => (
        <button
          key={item.currency}
          type="button"
          onClick={() => onSwitch(item.currency)}
          className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:bg-surface-muted"
        >
          {item.currency} · {item.count}
        </button>
      ))}
    </motion.div>
  );
}