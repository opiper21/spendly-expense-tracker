import { useAuth } from "../context/authContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold">Spendly</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Hi, {user?.name}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="p-6">
        <p className="text-slate-400">Your dashboard is coming soon.</p>
      </main>
    </div>
  );
}