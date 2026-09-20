import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Frontend-side role gate. The backend is the real authority (every queue
// and admin endpoint re-checks the role itself), but a learner should never
// even land on a staff console and see empty queues or 403 toasts — redirect
// them to their own home instead.
export default function RoleRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) return <Navigate to="/app/home" replace />;
  return <Outlet />;
}
