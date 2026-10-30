import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import Field from "./Field";
import { useCurrency } from "../context/currencyContext";
import { api } from "../lib/api";
import { toISODate } from "../lib/dates";
import type { RecurringFrequency, Transaction, TransactionType } from "../types";

const expenseCategories = [
  "Food",
  "Rent",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Savings",
];

const incomeCategories = ["Salary", "Freelance", "Business", "Gift", "Investment", "Other"];

const typeOptions: { key: TransactionType; label: string }[] = [
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
];

type RepeatOption = "none" | RecurringFrequency;

const repeatOptions: { key: RepeatOption; label: string }[] = [
  { key: "none", label: "Never" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

interface ModalContentProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalContent({ transaction, onClose, onSaved }: ModalContentProps) {
  const { currency } = useCurrency();
  const isEdit = transaction !== null;

  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [date, setDate] = useState(
    transaction ? transaction.date.slice(0, 10) : toISODate(new Date())
  );
  const [note, setNote] = useState(transaction?.note ?? "");
  const [repeat, setRepeat] = useState<RepeatOption>("none");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    if (!category.trim()) {
      setError("Pick or type a category");
      return;
    }

    if (!date) {
      setError("Choose a date");
      return;
    }

    setSubmitting(true);

    try {
      const cleanCategory = category.trim();
      const cleanNote = note.trim();

      if (transaction) {
        await api(`/transactions/${transaction._id}`, {
          method: "PUT",
          body: { type, amount: parsedAmount, category: cleanCategory, date, note: cleanNote },
        });
      } else if (repeat !== "none") {
        await api("/recurring", {
          method: "POST",
          body: {
            type,
            amount: parsedAmount,
            category: cleanCategory,
            note: cleanNote,
            frequency: repeat,
            startDate: date,
          },
        });
      } else {
        await api("/transactions", {
          method: "POST",
          body: { type, amount: parsedAmount, category: cleanCategory, date, note: cleanNote },
        });
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const suggestions = type === "income" ? incomeCategories : expenseCategories;
  const repeating = !isEdit && repeat !== "none";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <h2 id="transaction-modal-title" className="font-display text-3xl">
            {isEdit ? "Edit transaction" : "Add transaction"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {isEdit && transaction?.recurringId && (
          <p className="mt-2 text-xs text-muted">
            This entry was added by a repeating transaction. Changes here only affect this one.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 rounded-full border border-border bg-background p-1">
            {typeOptions.map((option) => {
              const active = option.key === type;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setType(option.key)}
                  className={`relative rounded-full py-2 text-sm font-medium transition-colors ${
                    active ? "text-accent-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="form-type-pill"
                      className={`absolute inset-0 rounded-full ${
                        option.key === "income" ? "bg-income" : "bg-expense"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-ink">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
                {currency}
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                autoFocus
                required
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-14 pr-3.5 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
            </div>
          </div>

          <Field
            id="category"
            label="Category"
            type="text"
            list="category-suggestions"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={type === "income" ? "Salary" : "Food"}
            maxLength={40}
            required
          />
          <datalist id="category-suggestions">
            {suggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          {!isEdit && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Repeat</p>
              <div className="grid grid-cols-3 rounded-full border border-border bg-background p-1">
                {repeatOptions.map((option) => {
                  const active = option.key === repeat;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setRepeat(option.key)}
                      className={`relative rounded-full py-2 text-sm font-medium transition-colors ${
                        active ? "text-accent-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="repeat-pill"
                          className="absolute inset-0 rounded-full bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence initial={false}>
                {repeating && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden text-xs leading-relaxed text-muted"
                  >
                    <span className="block pt-2">
                      {repeat === "weekly"
                        ? "Repeats every week from the start date. Dates in the past fill in the entries you missed."
                        : "Repeats every month on the same day (days 29 to 31 use the 28th). Dates in the past fill in the entries you missed."}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          <Field
            id="date"
            label={repeating ? "Starts on" : "Date"}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          <Field
            id="note"
            label="Note (optional)"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What was this for?"
            maxLength={200}
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden text-sm text-expense"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : repeating
                  ? "Add repeating transaction"
                  : "Add transaction"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface TransactionModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TransactionModal({
  open,
  transaction,
  onClose,
  onSaved,
}: TransactionModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <ModalContent
          key={transaction?._id ?? "new"}
          transaction={transaction}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </AnimatePresence>
  );
}