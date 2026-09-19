import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";

function activeCourseCode(progress) {
  const active =
    progress.find((c) => c.enrolled && !c.complete) ||
    progress.find((c) => !c.locked) ||
    progress[0];
  return active ? active.code : "DB-00";
}

function breadcrumbFor(pathname, selectedCode) {
  if (pathname.startsWith("/app/task")) return "My Learning / " + (selectedCode || "") + " / Task Workspace";
  if (pathname.startsWith("/app/catalogue")) return "Home / Course Catalogue";
  const last = pathname.split("/").filter(Boolean).pop() || "home";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export default function AppShell() {
  const { user, setUser, signout } = useAuth();
  const { progress } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const selectedCode = params.code;

  const navItems = [
    { to: "/app/home", label: "Home" },
    { to: "/app/learning", label: "My Learning" },
    { to: "/app/catalogue", label: "Course Catalogue" },
    { to: "/app/task/" + activeCourseCode(progress), label: "Task Workspace", matchPrefix: "/app/task" },
    { to: "/app/tools", label: "Tool Library" },
    { to: "/app/evidence", label: "Evidence" },
    { to: "/app/record", label: "Capability Record" },
    { to: "/app/profile", label: "Profile" }
  ];

  async function toggleReviewer() {
    const data = await api.setReviewerMode(!user.reviewerMode);
    setUser(data.user);
    toast(data.user.reviewerMode ? "Reviewer controls are visible." : "Learner-only workspace restored.");
  }

  async function handleSignout() {
    await signout();
    toast("Signed out. Sign in again to restore your saved workspace.");
    navigate("/access");
  }

  if (!user) return null;

  return (
    <div className="app-shell" style={{ minHeight: "100vh" }}>
      <header className="w-full px-4 pt-5 md:px-8 md:pt-7">
        <div className="card mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-teal">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="font-bold" style={{ color: "#183444", fontSize: 16 }}>
                DigitalBurj Academy
              </p>
              <p className="text-xs font-semibold text-muted" style={{ fontSize: 13 }}>
                Verified capability, not course consumption.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-teal">
              {user.name} · learner workspace
            </span>
            <button
              className="focus-ring rounded-lg border border-teal px-3 py-2 text-xs font-bold text-teal"
              type="button"
              aria-pressed={user.reviewerMode}
              onClick={toggleReviewer}
            >
              {user.reviewerMode ? "Reviewer demo on" : "Reviewer demo off"}
            </button>
            <button
              className="focus-ring rounded-lg border border-line px-3 py-2 text-xs font-bold"
              type="button"
              onClick={handleSignout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <nav className="mt-1 flex flex-wrap gap-2 rounded-2xl bg-white p-2 card" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.matchPrefix || item.to);
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={"nav-btn focus-ring rounded-xl px-3 py-2 text-sm font-bold" + (active ? " active" : "")}
              >
                {item.label}
              </NavLink>
            );
          })}
          {user.reviewerMode && (
            <NavLink
              to="/app/admin"
              className={({ isActive }) => "nav-btn focus-ring rounded-xl px-3 py-2 text-sm font-bold" + (isActive ? " active" : "")}
            >
              Admin / Reviewer
            </NavLink>
          )}
        </nav>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted">{breadcrumbFor(location.pathname, selectedCode)}</p>
          <button
            className="focus-ring rounded-lg border border-line px-3 py-2 text-xs font-bold"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
        <section className="mt-4">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
