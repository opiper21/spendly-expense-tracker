import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PiggyBank } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useCurrency } from "../context/currencyContext";
import { useTheme } from "../context/themeContext";
import { chartColors } from "../lib/chartColors";
import type { Summary } from "../types";

interface CategoryChartProps {
  summary: Summary | null;
  loading: boolean;
}

function formatPercent(value: number): string {
  if (value > 0 && value < 1) return "<1%";
  return `${Math.round(value)}%`;
}

export default function CategoryChart({ summary, loading }: CategoryChartProps) {
  const { format } = useCurrency();
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  if (!summary) {
    return loading ? (
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface" />
    ) : null;
  }

  const palette = chartColors[theme];
  const total = summary.totalExpenses;

  const data = summary.spendingByCategory.map((item, index) => ({
    category: item.category,
    total: item.total,
    color: palette[index % palette.length],
    percent: total > 0 ? (item.total / total) * 100 : 0,
  }));

  const activeItem = active !== null ? data[active] : undefined;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-border bg-surface p-6 transition-opacity ${
        loading ? "opacity-60" : "opacity-100"
      }`}
    >
      <h3 className="text-sm font-medium text-muted">Spending by category</h3>

      {data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
            <PiggyBank size={22} />
          </span>
          <p className="mt-4 font-display text-2xl">No spending yet</p>
          <p className="mt-1 text-sm text-muted">Expenses in this period will show up here.</p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-60 w-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={2}
                  cornerRadius={6}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={!reduceMotion}
                  animationDuration={900}
                  onMouseEnter={(_, index) => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.category}
                      fill={item.color}
                      opacity={active === null || active === index ? 1 : 0.3}
                      style={{ transition: "opacity 0.2s" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="max-w-32 truncate text-xs text-muted">
                {activeItem ? activeItem.category : "Total spent"}
              </p>
              <p className="font-display text-2xl tabular-nums">
                {format(activeItem ? activeItem.total : total)}
              </p>
              {activeItem && (
                <p className="text-xs text-muted">{formatPercent(activeItem.percent)} of spending</p>
              )}
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {data.map((item, index) => (
              <motion.li
                key={item.category}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease: "easeOut" }}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                className={`cursor-default transition-opacity ${
                  active === null || active === index ? "opacity-100" : "opacity-40"
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.category}
                  </span>
                  <span className="tabular-nums text-muted">
                    {format(item.total)} · {formatPercent(item.percent)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </motion.section>
  );
}