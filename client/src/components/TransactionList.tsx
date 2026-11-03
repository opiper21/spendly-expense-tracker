import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  ListFilter,
  Pencil,
  Receipt,
  Repeat,
  Trash2,
} from "lucide-react";
import SelectMenu from "./SelectMenu";
import { useCurrency } from "../context/currencyContext";
import { api } from "../lib/api";
import { formatDate } from "../lib/dates";
import type { Transaction } from "../types";

type TypeFilter = "all" | "income" | "expense";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

const ALL_CATEGORIES = "__all__";

const filters: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expenses" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest", label: "Lowest amount" },
];

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  hasLoaded: boolean;
  onEdit: (transaction: Transaction) => void;
  onChanged: () => void;
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

export default function TransactionList({
  transactions,
  loading,
  hasLoaded,
  onEdit,
  onChanged,
}: TransactionListProps) {
  const { format } = useCurrency();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [sort, setSort] = useState<SortOption>("newest");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const categories = Array.from(new Set(transactions.map((item) => item.category))).sort(
    (a, b) => a.localeCompare(b)
  );
  const activeCategory =
    category !== ALL_CATEGORIES && categories.includes(category) ? category : ALL_CATEGORIES;

  const categoryOptions = [
    { value: ALL_CATEGORIES, label: "All categories" },
    ...categories.map((name) => ({ value: name, label: name })),
  ];

  const filtered = transactions.filter(
    (item) =>
      (typeFilter === "all" || item.type === typeFilter) &&
      (activeCategory === ALL_CATEGORIES || item.category === activeCategory)
  );

  const visible =
    sort === "newest"
      ? filtered
      : [...filtered].sort((a, b) => {
          switch (sort) {
            case "oldest":
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "highest":
              return b.amount - a.amount;
            case "lowest":
              return a.amount - b.amount;
            default:
              return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        });

  const hasActiveFilters = typeFilter !== "all" || activeCategory !== ALL_CATEGORIES;

  function clearFilters() {
    setTypeFilter("all");
    setCategory(ALL_CATEGORIES);
  }

  async function handleDelete(id: string) {
    setActionError("");
    setDeletingId(id);

    try {
      await api(`/transactions/${id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not delete the transaction");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

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
            {hasLoaded
              ? `${visible.length} ${visible.length === 1 ? "entry" : "entries"}`
              : "Loading..."}
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

      {hasLoaded && transactions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SelectMenu
            label="Category"
            value={activeCategory}
            options={categoryOptions}
            onChange={setCategory}
            icon={<ListFilter size={15} />}
            align="left"
          />
          <SelectMenu
            label="Sort"
            value={sort}
            options={sortOptions}
            onChange={(value) => setSort(value as SortOption)}
            icon={<ArrowUpDown size={15} />}
            align="right"
          />
        </div>
      )}

      {actionError && <p className="mt-3 text-sm text-expense">{actionError}</p>}

      <div className="mt-4 max-h-[36rem] overflow-y-auto">
        {!hasLoaded ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : visible.length === 0 ? (
          hasActiveFilters && transactions.length > 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
                <ListFilter size={22} />
              </span>
              <p className="mt-4 font-display text-2xl">No matches</p>
              <p className="mt-1 text-sm text-muted">
                No transactions match these filters in this period.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
                <Receipt size={22} />
              </span>
              <p className="mt-4 font-display text-2xl">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted">
                Transactions in this period will show up here.
              </p>
            </div>
          )
        ) : (
          <ul>
            <AnimatePresence mode="popLayout">
              {visible.map((item, index) => {
                const isIncome = item.type === "income";
                const confirming = confirmingId === item._id;
                const deleting = deletingId === item._id;

                return (
                  <motion.li
                    key={item._id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.03 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-muted sm:gap-4 sm:px-3"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-medium">
                        <span className="truncate">{item.category}</span>
                        {item.recurringId && (
                          <span
                            title="Added automatically by a recurring transaction"
                            className="shrink-0 text-muted"
                          >
                            <Repeat size={13} aria-hidden="true" />
                            <span className="sr-only">Recurring</span>
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {formatDate(item.date)}
                        {item.note ? ` · ${item.note}` : ""}
                      </p>

                      {!confirming && (
                        <div className="mt-1 flex items-center gap-4 text-xs font-medium text-muted sm:hidden">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="transition hover:text-ink"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(item._id)}
                            className="transition hover:text-expense"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {confirming ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden text-sm text-muted sm:inline">Delete?</span>
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
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting}
                          className="rounded-full bg-expense px-3 py-1 text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
                        >
                          {deleting ? "Deleting..." : "Delete"}
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
                          {format(item.amount)}
                        </p>

                        <div className="hidden shrink-0 items-center gap-1 transition-opacity sm:flex [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            aria-label="Edit transaction"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-ink"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(item._id)}
                            aria-label="Delete transaction"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-expense"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </>
                    )}
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