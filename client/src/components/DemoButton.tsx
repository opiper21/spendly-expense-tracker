import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/authContext";

export default function DemoButton() {
  const { startDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;

    const timer = window.setTimeout(() => setSlow(true), 4000);

    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [loading]);

  async function handleClick() {
    setError("");
    setLoading(true);

    try {
      await startDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the demo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 font-semibold transition hover:bg-surface-muted disabled:opacity-60"
      >
        <Sparkles size={18} className="text-accent" />
        {loading ? "Starting your demo..." : "Try the demo"}
      </motion.button>

      <p className="mt-2 text-center text-xs text-muted">
        No sign-up needed. Explore a dashboard full of sample data.
      </p>

      {slow && (
        <p className="mt-2 text-center text-sm text-muted">
          Waking up the free server. This can take up to a minute.
        </p>
      )}

      {error && <p className="mt-2 text-center text-sm text-expense">{error}</p>}
    </div>
  );
}