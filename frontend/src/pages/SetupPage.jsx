import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SetupPage() {
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    experienceLevel: "",
    weeklyAvailability: "",
    goals: "",
    consent: false
  });
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setPending(true);
    try {
      const data = await api.setup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        experienceLevel: form.experienceLevel,
        weeklyAvailability: form.weeklyAvailability,
        learnerGoals: form.goals.trim(),
        consent: form.consent
      });
      setUser(data.user);
      toast("Setup saved. Review how the academy verifies capability.");
      navigate("/orientation");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card mx-auto max-w-3xl rounded-[2rem] bg-white p-6 md:p-9">
      <button className="focus-ring text-sm font-bold text-teal" type="button" onClick={() => navigate("/access")}>
        ← Back to access
      </button>
      <h1 className="serif mt-4 font-semibold" style={{ color: "#183444", fontSize: 28 }}>
        Set up your learner workspace
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        Tell us how you want to learn so the academy can recommend a practical starting point. You can update
        these details later from Profile.
      </p>
      <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="learner-name">
            What should we call you?
          </label>
          <input
            id="learner-name"
            className="field"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="learner-email">
            Email address
          </label>
          <input
            id="learner-email"
            className="field"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="learner-password">
            Choose a password
          </label>
          <input
            id="learner-password"
            className="field"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="experience">
            Experience level
          </label>
          <select id="experience" className="field" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
            <option value="">Choose one</option>
            <option>New to digital work</option>
            <option>Some practical experience</option>
            <option>Working practitioner</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="availability">
            Weekly availability
          </label>
          <select id="availability" className="field" value={form.weeklyAvailability} onChange={(e) => set("weeklyAvailability", e.target.value)}>
            <option value="">Choose one</option>
            <option>1–3 hours</option>
            <option>4–6 hours</option>
            <option>7+ hours</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold" htmlFor="goals">
            Learning goal
          </label>
          <input
            id="goals"
            className="field"
            placeholder="For example: build useful web services"
            value={form.goals}
            onChange={(e) => set("goals", e.target.value)}
          />
        </div>
        <label className="md:col-span-2 flex gap-3 rounded-xl bg-mint p-4 text-sm leading-6">
          <input
            id="consent"
            className="mt-1 h-4 w-4 accent-teal"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
          />
          <span>I consent to saving my learning progress, evidence, drafts, and feedback on this server.</span>
        </label>
        <div className="md:col-span-2">
          <button className="focus-ring rounded-xl bg-teal px-5 py-3 font-bold text-white" type="submit" disabled={pending}>
            Save setup and continue
          </button>
          {message && (
            <p className="mt-3 text-sm text-rose" aria-live="polite">
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
