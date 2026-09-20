import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name || "");
  const [goal, setGoal] = useState(user.learnerGoals || "");
  const [time, setTime] = useState(user.weeklyAvailability || "");
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api.updateProfile({ name, learnerGoals: goal, weeklyAvailability: time });
      setUser(data.user);
      toast("Profile changes saved.");
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    try {
      await api.resetDemo();
      setUser(null);
      toast("Account and all its records deleted.");
      navigate("/access");
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <section className="card max-w-3xl rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Profile</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge status={user.role} />
        {user.audience && <span className="text-xs text-muted">Audience: {user.audience.replace(/_/g, " ")}</span>}
      </div>
      <p className="mt-2 text-sm text-muted">
        {user.role === "learner"
          ? "Edit your learner setup. Existing task history stays intact."
          : "Your role is assigned by an admin and cannot be changed here."}
      </p>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-name">
            Name
          </label>
          <input id="profile-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-goal">
            Goal
          </label>
          <input id="profile-goal" className="field" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-time">
            Availability
          </label>
          <input id="profile-time" className="field" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <button className="focus-ring rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white" type="submit" disabled={busy}>
            Save profile changes
          </button>
        </div>
      </form>

      <section className="mt-8 rounded-2xl border border-[#edc5b9] bg-[#fff8f5] p-5">
        <h2 className="serif text-lg font-semibold">Danger zone</h2>
        <p className="mt-2 text-sm leading-6">
          Permanently delete your account and every record it owns (enrolments, checkpoints, drafts, submissions,
          diagnostic attempts). This cannot be undone.
        </p>
        {!confirmReset ? (
          <button className="focus-ring mt-3 rounded-lg border border-rose px-3 py-2 text-sm font-bold text-rose" type="button" onClick={() => setConfirmReset(true)}>
            Delete my account
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="focus-ring rounded-lg bg-rose px-3 py-2 text-sm font-bold text-white" type="button" onClick={handleReset}>
              Confirm delete
            </button>
            <button className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold" type="button" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
