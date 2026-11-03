import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth, shiftMonth } from "../lib/dates";
import type { RangePreset } from "../lib/dates";

const presets: { key: RangePreset; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "30d", label: "Last 30 days" },
  { key: "year", label: "This year" },
  { key: "monthPick", label: "By month" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

interface DateFilterProps {
  preset: RangePreset;
  customFrom: string;
  customTo: string;
  pickedMonth: string;
  onPresetChange: (preset: RangePreset) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onPickedMonthChange: (value: string) => void;
}

const dateInputClass =
  "rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";

const stepButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-ink";

export default function DateFilter({
  preset,
  customFrom,
  customTo,
  pickedMonth,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
  onPickedMonthChange,
}: DateFilterProps) {
  return (
    <div>
      <div className="max-w-full overflow-x-auto">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {presets.map((item) => {
            const active = item.key === preset;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onPresetChange(item.key)}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-accent-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="range-pill"
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

      <AnimatePresence initial={false}>
        {preset === "monthPick" && (
          <motion.div
            key="month-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => onPickedMonthChange(shiftMonth(pickedMonth, -1))}
                aria-label="Previous month"
                className={stepButtonClass}
              >
                <ChevronLeft size={18} />
              </button>

              <motion.p
                key={pickedMonth}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                aria-live="polite"
                className="min-w-44 text-center font-display text-2xl"
              >
                {formatMonth(pickedMonth)}
              </motion.p>

              <button
                type="button"
                onClick={() => onPickedMonthChange(shiftMonth(pickedMonth, 1))}
                aria-label="Next month"
                className={stepButtonClass}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {preset === "custom" && (
          <motion.div
            key="custom-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                From
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(event) => onCustomFromChange(event.target.value)}
                  className={dateInputClass}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                To
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(event) => onCustomToChange(event.target.value)}
                  className={dateInputClass}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}