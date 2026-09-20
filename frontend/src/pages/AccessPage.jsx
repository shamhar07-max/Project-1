import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AccessPage() {
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showSignin, setShowSignin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDemo() {
    setPending(true);
    try {
      const data = await api.demoLogin();
      setUser(data.user);
      toast("Demo workspace ready.");
      navigate("/app/home");
    } catch (e) {
      toast(e.message);
    } finally {
      setPending(false);
    }
  }

  async function handleSignin(e) {
    e.preventDefault();
    setMessage("");
    if (!email.includes("@") || !password) {
      setMessage("Enter a valid-looking email and a non-empty password.");
      return;
    }
    setPending(true);
    try {
      const data = await api.signin(email, password);
      setUser(data.user);
      toast("Signed in as " + data.user.name + ".");
      navigate("/app/home");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card overflow-hidden rounded-[2rem] bg-white">
      <div className="grid md:grid-cols-[1.05fr_.95fr]">
        <div className="bg-navy p-7 text-white md:p-10">
          <a
            href="https://digitalburj.com"
            className="focus-ring inline-flex items-center gap-1 rounded-lg text-xs font-bold uppercase tracking-[.15em] hover:text-white"
            style={{ color: "#9fd9cf" }}
            title="Back to the DigitalBurj corporate site"
          >
            ← DigitalBurj HQ
          </a>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.15em]" style={{ color: "#9fd9cf" }}>
            Practical capability academy
          </p>
          <h1 className="serif mt-3 max-w-xl font-semibold leading-tight text-white" style={{ fontSize: 32 }}>
            Build proof of capability, not just course completion.
          </h1>
          <p className="mt-4 max-w-xl leading-7" style={{ color: "#d5e8e4" }}>
            DigitalBurj Academy turns realistic work into visible evidence through missions, feedback,
            correction, independent verification, and practical capability records.
          </p>
          <img
            className="mt-7 h-52 w-full rounded-2xl object-cover"
            loading="lazy"
            src="https://images.pexels.com/photos/12899162/pexels-photo-12899162.jpeg?auto=compress&cs=tinysrgb&w=1280"
            alt="Two people discussing software work on a laptop"
          />
          <p className="mt-5 text-sm leading-6" style={{ color: "#d5e8e4" }}>
            Full-stack app: accounts, courses, and evidence are stored in a real database on the server.
          </p>
        </div>
        <div className="p-7 md:p-10">
          <h2 className="serif font-semibold" style={{ color: "#183444", fontSize: 26 }}>
            Enter the academy workspace
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use demo entry to explore the workflow instantly, or create a learner account that saves your
            progress, drafts, evidence, and feedback on the server.
          </p>
          <div className="mt-6 grid gap-3">
            <button
              className="focus-ring rounded-xl bg-teal px-5 py-3 font-bold text-white"
              type="button"
              disabled={pending}
              onClick={handleDemo}
            >
              Demo / Guest — enter now
            </button>
            <button
              className="focus-ring rounded-xl border border-navy bg-white px-5 py-3 font-bold text-navy"
              type="button"
              onClick={() => setShowSignin((s) => !s)}
            >
              Sign in / Register
            </button>
            <button
              className="focus-ring rounded-xl border border-teal bg-white px-5 py-3 font-bold text-teal"
              type="button"
              onClick={() => navigate("/setup")}
            >
              Set up my learner profile
            </button>
          </div>
          {showSignin && (
            <form className="mt-6 rounded-2xl bg-[#f5f8f6] p-4" onSubmit={handleSignin} noValidate>
              <h3 className="serif text-xl font-semibold">Sign in or create an account</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Use any email and a password of at least 6 characters. A new account is created automatically
                the first time you sign in with an email we haven't seen.
              </p>
              <label className="mt-4 mb-2 block text-sm font-bold" htmlFor="signin-email">
                Email address
              </label>
              <input
                id="signin-email"
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="mt-3 mb-2 block text-sm font-bold" htmlFor="signin-password">
                Password
              </label>
              <input
                id="signin-password"
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {message && (
                <p className="mt-3 text-sm text-rose" aria-live="polite">
                  {message}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="focus-ring rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white" type="submit" disabled={pending}>
                  Continue
                </button>
                <button
                  className="focus-ring rounded-xl border border-line px-4 py-3 text-sm font-bold"
                  type="button"
                  onClick={() => setShowSignin(false)}
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
