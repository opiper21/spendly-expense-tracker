import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";

const points = [
  "See your balance, income and spending at a glance",
  "Log every expense in seconds",
  "Understand where your money goes, by category",
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-background text-ink lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-brand-ink lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

        <p className="relative font-display text-3xl">Spendly</p>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-6xl leading-[1.05]"
          >
            Know where your money goes.
          </motion.h2>

          <ul className="mt-8 space-y-3">
            {points.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + index * 0.12, ease: "easeOut" }}
                className="flex items-start gap-3 text-brand-ink/80"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                {point}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-ink/50">A portfolio project by PiperX</p>
      </div>

      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 lg:hidden">
            <p className="font-display text-3xl">Spendly</p>
            <p className="mt-1 text-sm text-muted">Know where your money goes.</p>
          </div>

          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-xs text-muted">
            <Link to="/privacy" className="transition hover:text-ink">
              Privacy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}