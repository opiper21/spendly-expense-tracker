import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import AppFooter from "../components/AppFooter";
import Field from "../components/Field";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/authContext";
import { api } from "../lib/api";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDeleting(true);

    try {
      await api("/account", {
        method: "DELETE",
        body: user?.isDemo ? {} : { password },
      });
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  function cancel() {
    setConfirming(false);
    setPassword("");
    setError("");
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
          <h1 className="mt-6 font-display text-5xl">Account</h1>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="mt-0.5 font-medium">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="mt-0.5 font-medium">
                  {user?.isDemo ? "Demo account (sample data, deleted after 24 hours)" : user?.email}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-muted">
              Read how your data is handled on the{" "}
              <Link to="/privacy" className="font-medium text-accent hover:underline">
                privacy page
              </Link>
              .
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-expense/40 bg-surface p-6">
            <h2 className="font-display text-2xl text-expense">Delete account</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This permanently removes your profile and every transaction you added. It cannot be
              undone.
            </p>

            {!confirming && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-5 flex items-center gap-2 rounded-full border border-expense/50 px-5 py-2.5 text-sm font-semibold text-expense transition hover:bg-expense/10"
              >
                <Trash2 size={16} />
                Delete my account
              </button>
            )}

            <AnimatePresence initial={false}>
              {confirming && (
                <motion.form
                  onSubmit={handleDelete}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-5">
                    {!user?.isDemo && (
                      <Field
                        id="confirm-password"
                        label="Enter your password to confirm"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    )}

                    {error && <p className="text-sm text-expense">{error}</p>}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={deleting}
                        className="rounded-full bg-expense px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Yes, delete everything"}
                      </button>
                      <button
                        type="button"
                        onClick={cancel}
                        disabled={deleting}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted transition hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}