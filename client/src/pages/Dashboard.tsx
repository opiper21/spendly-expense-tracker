import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, Plus } from "lucide-react";
import AppFooter from "../components/AppFooter";
import CategoryChart from "../components/CategoryChart";
import CurrencySelect from "../components/CurrencySelect";
import DateFilter from "../components/DateFilter";
import DemoBanner from "../components/DemoBanner";
import SummaryCards from "../components/SummaryCards";
import ThemeToggle from "../components/ThemeToggle";
import TransactionList from "../components/TransactionList";
import TransactionModal from "../components/TransactionModal";
import { useAuth } from "../context/authContext";
import { useSummary } from "../hooks/useSummary";
import { useTransactions } from "../hooks/useTransactions";
import { getRange } from "../lib/dates";
import type { RangePreset } from "../lib/dates";
import type { Transaction } from "../types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [preset, setPreset] = useState<RangePreset>(user?.isDemo ? "30d" : "month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const range = useMemo(
    () => getRange(preset, customFrom, customTo),
    [preset, customFrom, customTo]
  );

  const { summary, loading, error } = useSummary(range, refreshKey);
  const {
    transactions,
    loading: transactionsLoading,
    hasLoaded,
    error: transactionsError,
  } = useTransactions(range, refreshKey);
  const firstName = user?.name.split(" ")[0] ?? "";

  const handleAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => setModalOpen(false), []);

  const handleChanged = useCallback(() => setRefreshKey((key) => key + 1), []);

  const handleSaved = useCallback(() => {
    setModalOpen(false);
    setRefreshKey((key) => key + 1);
  }, []);

  const handleLogoClick = useCallback(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <h1 className="font-display text-2xl sm:text-3xl">
          <Link
            to="/"
            onClick={handleLogoClick}
            aria-label="Spendly, back to the top of the dashboard"
            className="transition hover:opacity-70"
          >
            Spendly
          </Link>
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <CurrencySelect />
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm font-medium transition hover:bg-surface-muted sm:w-auto sm:px-4"
          >
            <LogOut size={16} className="sm:hidden" />
            <span className="hidden whitespace-nowrap sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {user?.isDemo && <DemoBanner />}

        <div className="flex flex-wrap items-end justify-between gap-4">
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

          <motion.button
            type="button"
            onClick={handleAdd}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:opacity-90"
          >
            <Plus size={18} />
            Add transaction
          </motion.button>
        </div>

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

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-2">
            <CategoryChart summary={summary} loading={loading} />
          </div>

          <div className="min-w-0 lg:col-span-3">
            <TransactionList
              transactions={transactions}
              loading={transactionsLoading}
              hasLoaded={hasLoaded}
              onEdit={handleEdit}
              onChanged={handleChanged}
            />
          </div>
        </div>
      </main>

      <AppFooter />

      <TransactionModal
        open={modalOpen}
        transaction={editing}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </div>
  );
}