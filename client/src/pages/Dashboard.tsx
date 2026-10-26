import { useMemo, useState } from "react";
import { motion } from "motion/react";
import CategoryChart from "../components/CategoryChart";
import CurrencySelect from "../components/CurrencySelect";
import DateFilter from "../components/DateFilter";
import SummaryCards from "../components/SummaryCards";
import ThemeToggle from "../components/ThemeToggle";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/authContext";
import { useSummary } from "../hooks/useSummary";
import { useTransactions } from "../hooks/useTransactions";
import { getRange } from "../lib/dates";
import type { RangePreset } from "../lib/dates";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [preset, setPreset] = useState<RangePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo(
    () => getRange(preset, customFrom, customTo),
    [preset, customFrom, customTo]
  );

  const { summary, loading, error } = useSummary(range);
  const {
    transactions,
    loading: transactionsLoading,
    hasLoaded,
    error: transactionsError,
  } = useTransactions(range);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="font-display text-3xl">Spendly</h1>
        <div className="flex items-center gap-3">
          <CurrencySelect />
          <ThemeToggle />
          <button
            onClick={logout}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-4xl sm:text-5xl">
            {getGreeting()}, {firstName}
          </h2>
          <p className="mt-2 text-muted">Here is where your money stands.</p>
        </motion.div>

        <DateFilter
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onPresetChange={setPreset}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        {(error || transactionsError) && (
          <p className="text-sm text-expense">{error || transactionsError}</p>
        )}

        <SummaryCards summary={summary} loading={loading} />

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CategoryChart summary={summary} loading={loading} />
          </div>

          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              loading={transactionsLoading}
              hasLoaded={hasLoaded}
            />
          </div>
        </div>
      </main>
    </div>
  );
}