import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { useCurrency } from "../context/currencyContext";
import { formatDate } from "../lib/dates";
import type { Transaction } from "../types";

type TypeFilter = "all" | "income" | "expense";

const filters: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expenses" },
];

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  hasLoaded: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-40 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

export default function TransactionList({ transactions, loading, hasLoaded }: TransactionListProps) {
  const { format } = useCurrency();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const visible =
    typeFilter === "all"
      ? transactions
      : transactions.filter((item) => item.type === typeFilter);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-border bg-surface p-6 transition-opacity ${
        loading && hasLoaded ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-muted">Transactions</h3>
          <p className="mt-0.5 text-xs text-muted">
            {visible.length} {visible.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="inline-flex rounded-full border border-border bg-background p-1">
          {filters.map((item) => {
            const active = item.key === typeFilter;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTypeFilter(item.key)}
                className={`relative rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  active ? "text-accent-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="type-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 max-h-[36rem] overflow-y-auto">
        {!hasLoaded ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
              <Receipt size={22} />
            </span>
            <p className="mt-4 font-display text-2xl">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted">
              Transactions in this period will show up here.
            </p>
          </div>
        ) : (
          <ul>
            <AnimatePresence mode="popLayout">
              {visible.map((item, index) => {
                const isIncome = item.type === "income";

                return (
                  <motion.li
                    key={item._id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.03 }}
                    className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-surface-muted"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.category}</p>
                      <p className="truncate text-sm text-muted">
                        {formatDate(item.date)}
                        {item.note ? ` · ${item.note}` : ""}
                      </p>
                    </div>

                    <p
                      className={`shrink-0 font-medium tabular-nums ${
                        isIncome ? "text-income" : "text-ink"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {format(item.amount)}
                    </p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.section>
  );
}