import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center text-muted">Loading your workspace…</div>;
  }
  if (!user) {
    return <Navigate to="/access" replace />;
  }
  return <Outlet />;
}
