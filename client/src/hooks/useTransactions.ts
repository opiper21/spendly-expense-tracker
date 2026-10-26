import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DateRange } from "../lib/dates";
import type { Transaction } from "../types";

interface TransactionsResult {
  key: string;
  transactions: Transaction[];
  error: string;
}

export function useTransactions(range: DateRange, refreshKey = 0) {
  const key = `${range.from}|${range.to}|${refreshKey}`;
  const [result, setResult] = useState<TransactionsResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    const query = params.toString();

    api<{ count: number; transactions: Transaction[] }>(
      `/transactions${query ? `?${query}` : ""}`
    )
      .then((data) => {
        if (!cancelled) setResult({ key, transactions: data.transactions, error: "" });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key,
            transactions: [],
            error: err instanceof Error ? err.message : "Could not load transactions",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, range.from, range.to]);

  const loading = result === null || result.key !== key;

  return {
    transactions: result?.transactions ?? [],
    loading,
    hasLoaded: result !== null,
    error: loading ? "" : (result?.error ?? ""),
  };
}