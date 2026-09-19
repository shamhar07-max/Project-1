import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name || "");
  const [goal, setGoal] = useState(user.learnerGoals || "");
  const [time, setTime] = useState(user.weeklyAvailability || "");
  const [busy, setBusy] = useState(false);

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

  return (
    <section className="card max-w-3xl rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Profile</h1>
      <p className="mt-2 text-sm text-muted">Edit your learner setup. Existing task history stays intact.</p>
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
    </section>
  );
}
