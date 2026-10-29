import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import AppFooter from "../components/AppFooter";
import ThemeToggle from "../components/ThemeToggle";

const sections = [
  {
    title: "The short version",
    paragraphs: [
      "Spendly is a portfolio project: a notebook for your own income and spending. It never asks for your bank login, card numbers or account numbers. You type in the figures you want to track, and nothing is connected to a bank.",
    ],
  },
  {
    title: "What Spendly stores",
    paragraphs: [
      "Your name, your email address, and your password (stored only as a scrambled hash, never as readable text), plus the transactions you add: type, amount, category, date and note.",
      "Your theme and currency choices are saved in your own browser, not on the server.",
    ],
  },
  {
    title: "What it does not do",
    paragraphs: [
      "No ads, no selling or sharing your data, and no connection to any bank. The hosting providers keep standard server logs, such as IP addresses, which is normal for any website.",
    ],
  },
  {
    title: "Where your data lives",
    paragraphs: [
      "The website runs on Vercel, the API on Render, and the data in a MongoDB Atlas database.",
    ],
  },
  {
    title: "Demo accounts",
    paragraphs: [
      "Each demo is a private account filled with sample data. Demo accounts and their data delete themselves automatically after 24 hours.",
    ],
  },
  {
    title: "Your control",
    paragraphs: [
      "You can delete your account at any time from the Account page. That removes your profile and every transaction you added from the live database.",
    ],
  },
  {
    title: "An honest note",
    paragraphs: [
      "Because I run the database, I can technically access what is stored in it. Please do not enter anything you consider highly sensitive, and treat Spendly as a notebook, not a bank.",
    ],
  },
  {
    title: "Questions",
    paragraphs: ["Open an issue on the project's GitHub page and I will get back to you."],
  },
];

export default function Privacy() {
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
          Back to Spendly
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="mt-6 font-display text-5xl">Privacy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: October 2026</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}