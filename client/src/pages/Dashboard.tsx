import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/authContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="font-display text-3xl">Spendly</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">Hi, {user?.name}</span>
          <ThemeToggle />
          <button
            onClick={logout}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="p-6">
        <p className="text-muted">Your dashboard is coming soon.</p>
      </main>
    </div>
  );
}