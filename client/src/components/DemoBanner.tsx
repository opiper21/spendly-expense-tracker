import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Info } from "lucide-react";
import { useAuth } from "../context/authContext";

export default function DemoBanner() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleCreateAccount() {
    logout();
    navigate("/register");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-accent/10 px-5 py-3 text-sm"
    >
      <p className="flex items-center gap-2">
        <Info size={16} className="shrink-0 text-accent" />
        You are exploring a demo with sample data. Add, edit and delete freely. It resets after 24
        hours.
      </p>
      <button
        type="button"
        onClick={handleCreateAccount}
        className="rounded-full bg-accent px-4 py-1.5 font-semibold text-accent-ink transition hover:opacity-90"
      >
        Create a free account
      </button>
    </motion.div>
  );
}