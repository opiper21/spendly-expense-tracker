import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DateRange } from "../lib/dates";
import type { Summary } from "../types";

interface SummaryResult {
  key: string;
  summary: Summary | null;
  error: string;
}

export function useSummary(range: DateRange, refreshKey = 0) {
  const key = `${range.from}|${range.to}|${refreshKey}`;
  const [result, setResult] = useState<SummaryResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    const query = params.toString();

    api<Summary>(`/summary${query ? `?${query}` : ""}`)
      .then((summary) => {
        if (!cancelled) setResult({ key, summary, error: "" });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key,
            summary: null,
            error: err instanceof Error ? err.message : "Could not load summary",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, range.from, range.to]);

  const loading = result === null || result.key !== key;

  return {
    summary: result?.summary ?? null,
    loading,
    error: loading ? "" : (result?.error ?? ""),
  };
}