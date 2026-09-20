import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";

function Metric({ label, value }) {
  return (
    <article className="card rounded-2xl bg-white p-5">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="serif mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function StaffHome({ user }) {
  const navigate = useNavigate();
  const [reviewCount, setReviewCount] = useState(null);
  const [verifyCount, setVerifyCount] = useState(null);

  useEffect(() => {
    if (user.role === "reviewer" || user.role === "admin") {
      api.reviewQueue().then((d) => setReviewCount(d.queue.length));
    }
    if (user.role === "verifier" || user.role === "admin") {
      api.verifyQueue().then((d) => setVerifyCount(d.queue.length));
    }
  }, [user.role]);

  return (
    <>
      <section className="card rounded-[1.75rem] bg-navy p-7 text-white md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em]" style={{ color: "#9fd9cf" }}>
          Staff dashboard · {user.role}
        </p>
        <h1 className="serif mt-2 font-semibold text-white" style={{ fontSize: 30 }}>
          Welcome back, {user.name}.
        </h1>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "#d5e8e4" }}>
          You act on other learners' submissions, never your own — separation of duties applies to staff accounts
          too.
        </p>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {reviewCount !== null && (
          <article className="card cursor-pointer rounded-2xl bg-white p-5" onClick={() => navigate("/app/review-queue")}>
            <p className="text-xs font-bold uppercase text-muted">Review queue</p>
            <p className="serif mt-2 text-2xl font-semibold">{reviewCount} waiting</p>
          </article>
        )}
        {verifyCount !== null && (
          <article className="card cursor-pointer rounded-2xl bg-white p-5" onClick={() => navigate("/app/verify-queue")}>
            <p className="text-xs font-bold uppercase text-muted">Verification queue</p>
            <p className="serif mt-2 text-2xl font-semibold">{verifyCount} waiting</p>
          </article>
        )}
      </section>
      {user.role === "admin" && (
        <section className="card mt-6 rounded-2xl bg-white p-6">
          <h2 className="serif text-xl font-semibold">Admin tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/admin/users")}>
              Users &amp; Roles
            </button>
            <button className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/admin/curriculum-health")}>
              Curriculum Health
            </button>
            <button className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/admin/rollout")}>
              Release &amp; Rollout
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { progress, records, diagnostic } = useAppData();
  const navigate = useNavigate();

  if (user.role !== "learner") return <StaffHome user={user} />;

  const active = progress.find((c) => c.enrolled && !c.complete) || progress.find((c) => c.state === "Available") || progress[0];
  const enrolledCount = records.filter((r) => r.recordType === "enrolment").length;
  const evidenceIssued = progress.filter((c) => c.complete).length;
  const pending = progress.filter((c) => ["Submitted", "Resubmitted", "In Review", "Request Changes"].includes(c.status)).length;

  if (!active) return null;

  return (
    <>
      <section className="card rounded-[1.75rem] bg-navy p-7 text-white md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em]" style={{ color: "#9fd9cf" }}>
          Learner dashboard
        </p>
        <h1 className="serif mt-2 font-semibold text-white" style={{ fontSize: 30 }}>
          Welcome back, {user.name}.
        </h1>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "#d5e8e4" }}>
          Continue your current mission, save practical evidence, and move through review and independent
          verification.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="focus-ring rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white" type="button" onClick={() => navigate("/app/task/" + active.code)}>
            Continue {active.code}
          </button>
          <button className="focus-ring rounded-xl border px-4 py-3 text-sm font-bold text-white" style={{ borderColor: "#9fd9cf" }} type="button" onClick={() => navigate("/app/catalogue")}>
            Browse courses
          </button>
        </div>
      </section>
      {!diagnostic.passed && (
        <section className="card mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mint p-5">
          <p className="text-sm leading-6">
            Professional Career and Advanced Professional courses require a passed Foundation Diagnostic — a real
            assessed checkpoint, not a self-declared claim.
          </p>
          <button className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/diagnostic")}>
            Take the diagnostic
          </button>
        </section>
      )}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="My Learning" value={enrolledCount + " enrolled"} />
        <Metric label="Current course" value={active.code} />
        <Metric label="Evidence issued" value={evidenceIssued} />
        <Metric label="Pending feedback" value={pending} />
      </section>
      <section className="card mt-6 rounded-2xl bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[.13em] text-teal">Recommended next step</p>
        <h2 className="serif mt-2 text-2xl font-semibold">
          {active.code} · {active.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Complete practical checkpoints, save work safely, and submit complete evidence only when ready.
        </p>
        <button className="focus-ring mt-4 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white" type="button" onClick={() => navigate("/app/task/" + active.code)}>
          Open course workspace
        </button>
      </section>
    </>
  );
}
