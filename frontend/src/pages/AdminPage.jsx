import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

const REVIEW_ACTIONS = {
  Submitted: [{ label: "Start review", status: "In Review", cls: "bg-navy" }],
  "In Review": [
    { label: "Request changes", status: "Request Changes", cls: "bg-rose" },
    { label: "Approve", status: "Approved", cls: "bg-teal" }
  ],
  Approved: [{ label: "Send to verification", status: "Pending Verification", cls: "bg-navy" }],
  "Pending Verification": [{ label: "Verify independently", status: "Verified", cls: "bg-teal" }],
  Verified: [{ label: "Issue evidence", status: "Evidence Issued", cls: "bg-teal" }]
};

export default function AdminPage() {
  const { setUser } = useAuth();
  const { progress, records, refreshAll } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const enrolledList = progress.filter((c) => c.enrolled);

  async function handleReview(code, status) {
    setBusy(true);
    try {
      await api.review(code, status);
      await refreshAll();
      toast(status + " recorded.");
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
      toast("Local demo state reset.");
      navigate("/access");
    } catch (e) {
      toast(e.message);
    }
  }

  const health = [
    ["Navigation", "Healthy", "Route and Back control active"],
    ["Accounts", "Healthy", "Real accounts with hashed passwords stored on the server"],
    ["Course actions", "Healthy", "Enrolment, prerequisite, and workspace actions checked"],
    ["Task actions", "Healthy", "Draft, stage, evidence, and submission validation active"],
    ["Tool Library", "Healthy", "Configured links and setup-required states checked"],
    ["Server records", "Healthy", records.length + " record(s) stored in the database."]
  ];

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Admin / Reviewer Area</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Demo-only reviewer controls preserve the review path without changing learner controls.
      </p>
      <div className="mt-6 grid gap-4">
        {enrolledList.length ? (
          enrolledList.map((c) => (
            <article key={c.code} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <b>
                    {c.code} · {c.title}
                  </b>
                  <p className="mt-1 text-sm text-muted">Current: {c.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(REVIEW_ACTIONS[c.status] || []).map((action) => (
                    <button
                      key={action.status}
                      className={"focus-ring rounded-lg px-3 py-2 text-xs font-bold text-white " + action.cls}
                      type="button"
                      disabled={busy}
                      onClick={() => handleReview(c.code, action.status)}
                    >
                      {action.label}
                    </button>
                  ))}
                  {!(REVIEW_ACTIONS[c.status] || []).length && (
                    <span className="text-xs text-muted">No reviewer action available</span>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm">No learner enrolments to review.</p>
        )}
      </div>
      <section className="mt-6 rounded-2xl bg-mint p-5">
        <h2 className="serif text-xl font-semibold">Interaction check / System health</h2>
        <div className="mt-4 space-y-2">
          {health.map((h) => (
            <div key={h[0]} className="flex flex-wrap justify-between gap-2 rounded-xl bg-white p-3 text-sm">
              <span>
                <b>{h[0]}</b>
                <span className="ml-2 text-muted">{h[2]}</span>
              </span>
              <Badge status={h[1]} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="focus-ring rounded-lg border border-rose px-4 py-3 text-sm font-bold text-rose"
            type="button"
            onClick={() => setConfirmReset(true)}
          >
            Reset demo state
          </button>
        </div>
        {confirmReset && (
          <div className="mt-4 rounded-xl border border-[#edc5b9] bg-[#fff8f5] p-4 text-sm">
            <b>Reset your account?</b> This permanently deletes your account, drafts, records, and route on the
            server.
            <div className="mt-3 flex gap-2">
              <button className="focus-ring rounded-lg bg-rose px-3 py-2 font-bold text-white" type="button" onClick={handleReset}>
                Confirm reset
              </button>
              <button
                className="focus-ring rounded-lg border border-line px-3 py-2 font-bold"
                type="button"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-line p-5">
        <h2 className="serif text-xl font-semibold">DB-22 Assessment Centre</h2>
        <p className="mt-2 text-sm leading-6">
          DB-22 requires readiness checks, a constrained build/demo, injected incidents, live defence, a full
          evidence pack, evaluator notes, and independent verification.
        </p>
      </section>
    </section>
  );
}
