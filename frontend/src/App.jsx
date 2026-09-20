import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AppShell from "./components/AppShell";
import AccessPage from "./pages/AccessPage";
import SetupPage from "./pages/SetupPage";
import OrientationPage from "./pages/OrientationPage";
import HomePage from "./pages/HomePage";
import LearningPage from "./pages/LearningPage";
import CataloguePage from "./pages/CataloguePage";
import BundlesPage from "./pages/BundlesPage";
import DiagnosticPage from "./pages/DiagnosticPage";
import TaskPage from "./pages/TaskPage";
import ToolsPage from "./pages/ToolsPage";
import EvidencePage from "./pages/EvidencePage";
import RecordPage from "./pages/RecordPage";
import BillingPage from "./pages/BillingPage";
import SupportPage from "./pages/SupportPage";
import ProfilePage from "./pages/ProfilePage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import VerifyQueuePage from "./pages/VerifyQueuePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import CurriculumHealthPage from "./pages/admin/CurriculumHealthPage";
import RolloutPage from "./pages/admin/RolloutPage";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center text-muted">Loading…</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/app/home" : "/access"} replace />} />
      <Route
        path="/access"
        element={
          <GuestOnly>
            <AccessRoot />
          </GuestOnly>
        }
      />
      <Route
        path="/setup"
        element={
          <GuestOnly>
            <SetupRoot />
          </GuestOnly>
        }
      />
      <Route path="/orientation" element={<ProtectedRoute />}>
        <Route index element={<OrientationRoot />} />
      </Route>
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="home" element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<RoleRoute roles={["learner"]} />}>
            <Route path="learning" element={<LearningPage />} />
            <Route path="catalogue" element={<CataloguePage />} />
            <Route path="bundles" element={<BundlesPage />} />
            <Route path="diagnostic" element={<DiagnosticPage />} />
            <Route path="task/:code" element={<TaskPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="record" element={<RecordPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          <Route element={<RoleRoute roles={["reviewer", "admin"]} />}>
            <Route path="review-queue" element={<ReviewQueuePage />} />
          </Route>
          <Route element={<RoleRoute roles={["verifier", "admin"]} />}>
            <Route path="verify-queue" element={<VerifyQueuePage />} />
          </Route>
          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/curriculum-health" element={<CurriculumHealthPage />} />
            <Route path="admin/rollout" element={<RolloutPage />} />
          </Route>

          <Route index element={<Navigate to="home" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? "/app/home" : "/access"} replace />} />
    </Routes>
  );
}

// Redirects away from guest-only pages (access / setup) if a session already
// existed when this route was first reached. Deliberately does NOT react to
// later `user` changes made by this page's own login/setup flow, otherwise
// its own post-action `navigate()` call would race the route's redirect.
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const checked = useRef(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !checked.current) {
      checked.current = true;
      if (user) setRedirect(true);
    }
  }, [loading, user]);

  if (loading) return null;
  if (redirect) return <Navigate to="/app/home" replace />;
  return children;
}

function AccessRoot() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <AccessPage />
    </div>
  );
}

function SetupRoot() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <SetupPage />
    </div>
  );
}

function OrientationRoot() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <OrientationPage />
    </div>
  );
}
