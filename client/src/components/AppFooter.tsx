import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function AppFooter() {
  const { user } = useAuth();

  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-6 text-sm text-muted sm:px-6">
      <p>Spendly, a portfolio project by PiperX</p>
      <nav className="flex flex-wrap items-center gap-5">
        {user && (
          <Link to="/recurring" className="transition hover:text-ink">
            Repeating
          </Link>
        )}
        <Link to="/privacy" className="transition hover:text-ink">
          Privacy
        </Link>
        {user && (
          <Link to="/account" className="transition hover:text-ink">
            Account
          </Link>
        )}
        <a
          href="https://github.com/opiper21/spendly-expense-tracker"
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-ink"
        >
          GitHub
        </a>
      </nav>
    </footer>
  );
}