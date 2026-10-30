import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Repeat, Trash2 } from "lucide-react";
import AppFooter from "../components/AppFooter";
import ThemeToggle from "../components/ThemeToggle";
import { useCurrency } from "../context/currencyContext";
import { api } from "../lib/api";
import { formatDate } from "../lib/dates";
import type { RecurringRule } from "../types";

function ordinal(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  timeZone: "UTC",
});

function describe(rule: RecurringRule): string {
  const start = new Date(rule.startDate);

  if (rule.frequency === "weekly") {
    return `Every week on ${weekdayFormatter.format(start)}`;
  }

  return `Every month on the ${ordinal(start.getUTCDate())}`;
}

export default function Recurring() {
  const { format } = useCurrency();
  const [rules, setRules] = useState<RecurringRule[] | null>(null);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api<{ count: number; rules: RecurringRule[] }>("/recurring")
      .then((data) => {
        if (!cancelled) setRules(data.rules);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load repeating transactions");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    setError("");
    setDeletingId(id);

    try {
      await api(`/recurring/${id}`, { method: "DELETE" });
      setRules((current) => (current ? current.filter((rule) => rule._id !== id) : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete it");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link to="/" className="font-display text-2xl sm:text-3xl">
          Spendly
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="mt-6 font-display text-5xl">Repeating</h1>
          <p className="mt-2 text-muted">
            Rent, salary, subscriptions. Set it once and Spendly adds it for you.
          </p>

          {error && <p className="mt-6 text-sm text-expense">{error}</p>}

          <div className="mt-8">
            {rules === null && !error ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
                <div className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
              </div>
            ) : rules !== null && rules.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
                  <Repeat size={22} />
                </span>
                <p className="mt-4 font-display text-2xl">Nothing repeats yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  On the dashboard, tap Add transaction and choose Weekly or Monthly under Repeat.
                </p>
                <Link
                  to="/"
                  className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:opacity-90"
                >
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {(rules ?? []).map((rule) => {
                    const isIncome = rule.type === "income";
                    const confirming = confirmingId === rule._id;
                    const deleting = deletingId === rule._id;

                    return (
                      <motion.li
                        key={rule._id}
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:gap-4"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                          }`}
                        >
                          <Repeat size={18} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{rule.category}</p>
                          <p className="truncate text-sm text-muted">{describe(rule)}</p>
                          <p className="truncate text-xs text-muted">
                            Next: {formatDate(rule.nextDue)}
                            {rule.note ? ` · ${rule.note}` : ""}
                          </p>
                        </div>

                        {confirming ? (
                          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              disabled={deleting}
                              className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted transition hover:text-ink"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(rule._id)}
                              disabled={deleting}
                              className="rounded-full bg-expense px-3 py-1 text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
                            >
                              {deleting ? "Deleting..." : "Stop"}
                            </button>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`shrink-0 text-sm font-medium tabular-nums sm:text-base ${
                                isIncome ? "text-income" : "text-ink"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {format(rule.amount)}
                            </p>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(rule._id)}
                              aria-label={`Stop repeating ${rule.category}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-expense"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {rules !== null && rules.length > 0 && (
            <p className="mt-6 text-xs text-muted">
              Stopping a repeating transaction only prevents new entries. The ones already added
              stay in your history.
            </p>
          )}
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}