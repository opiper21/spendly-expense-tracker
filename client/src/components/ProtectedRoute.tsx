import { Navigate, Outlet } from "react-router-dom";
import WakingNotice from "./WakingNotice";
import { useAuth } from "../context/authContext";
import { useSlowFlag } from "../hooks/useSlowFlag";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const slow = useSlowFlag(loading);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-muted">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p>Loading...</p>
        {slow && <WakingNotice />}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}