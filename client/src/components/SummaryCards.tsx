import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { useCurrency } from "../context/currencyContext";
import type { Summary } from "../types";

interface CardProps {
  index: number;
  label: string;
  icon: ReactNode;
  iconClass: string;
  value: number;
  valueClass: string;
  caption: string;
  large?: boolean;
}

function Card({ index, label, icon, iconClass, value, valueClass, caption, large }: CardProps) {
  const { format } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="min-w-0 rounded-2xl border border-border bg-surface p-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>
          {icon}
        </span>
      </div>
      <p
        className={`mt-4 break-words font-display ${large ? "text-4xl sm:text-5xl" : "text-4xl"} ${valueClass}`}
      >
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="mt-2 text-sm text-muted">{caption}</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 h-10 w-40 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-3 w-32 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

interface SummaryCardsProps {
  summary: Summary | null;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (!summary) {
    if (!loading) return null;

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const count = summary.transactionCount;

  return (
    <div
      className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-3 ${
        loading ? "opacity-60" : "opacity-100"
      }`}
    >
      <Card
        index={0}
        label="Balance"
        icon={<Wallet size={18} />}
        iconClass="bg-accent/10 text-accent"
        value={summary.balance}
        valueClass={summary.balance < 0 ? "text-expense" : "text-ink"}
        caption={`${count} ${count === 1 ? "transaction" : "transactions"} in this period`}
        large
      />
      <Card
        index={1}
        label="Income"
        icon={<ArrowDownLeft size={18} />}
        iconClass="bg-income/10 text-income"
        value={summary.totalIncome}
        valueClass="text-income"
        caption="Money in"
      />
      <Card
        index={2}
        label="Expenses"
        icon={<ArrowUpRight size={18} />}
        iconClass="bg-expense/10 text-expense"
        value={summary.totalExpenses}
        valueClass="text-expense"
        caption="Money out"
      />
    </div>
  );
}