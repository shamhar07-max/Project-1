import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function TaskPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { courses, loop, stageHelp, progress, progressFor, refreshAll } = useAppData();

  const course = courses.find((c) => c.code === code);
  const info = progressFor(code);

  const [assist, setAssist] = useState("");
  const [collapseOpen, setCollapseOpen] = useState(true);
  const [checkpointText, setCheckpointText] = useState("");
  const [draftText, setDraftText] = useState("");
  const [submitText, setSubmitText] = useState("");
  const [checks, setChecks] = useState([false, false, false]);
  const [busy, setBusy] = useState(false);

  if (!course || !info) return null;

  const done = info.completedStages;
  const nextIndex = done;
  const nextStage = loop[nextIndex] || null;
  const allStagesComplete = !nextStage;
  const blocked = !info.enrolled || info.locked;
  const submittedFinal = ["Approved", "Pending Verification", "Verified", "Evidence Issued"].includes(info.status);
  const enrolledCourses = progress.filter((c) => c.enrolled);

  async function handleCheckpoint(e) {
    e.preventDefault();
    if (checkpointText.trim().length < 18) {
      toast("Add more detail: what you did, why it mattered, and what you noticed.");
      return;
    }
    setBusy(true);
    try {
      const data = await api.checkpoint(code, checkpointText.trim());
      setCheckpointText("");
      await refreshAll();
      toast(data.stage + " checkpoint saved.");
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDraft(e) {
    e.preventDefault();
    if (!draftText.trim()) {
      toast("Add a link, file description, or draft note before saving.");
      return;
    }
    setBusy(true);
    try {
      await api.draft(code, draftText.trim());
      toast("Draft saved. You can safely return later.");
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.submit(code, submitText.trim(), checks);
      setSubmitText("");
      setChecks([false, false, false]);
      await refreshAll();
      toast("Submitted for review. Approval and verification remain separate.");
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  let blockNotice = null;
  if (blocked) {
    const reason = !info.enrolled
      ? "Enrol in this course before beginning this mission."
      : "Issue evidence for " + course.prereq + " before beginning this mission.";
    blockNotice = (
      <div className="mt-5 rounded-xl border border-[#edc5b9] bg-[#fff8f5] p-4 text-sm text-[#7f3828]">
        <b>Workspace locked.</b> {reason}
      </div>
    );
  }

  return (
    <section className="card overflow-hidden rounded-[1.75rem] bg-white">
      <div className="bg-navy p-6 text-white">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: "#9fd9cf" }}>
              {course.code} · {course.kind} mission · {course.level}
            </p>
            <h1 className="serif mt-2 text-3xl font-semibold text-white">{course.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: "#d5e8e4" }}>
              Build a practical result, test one failure path, document evidence, and explain your reasoning.
            </p>
          </div>
          <Badge status={info.status} />
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[260px]">
            <label className="mb-1 block text-sm font-bold" htmlFor="course-switch">
              Course switcher
            </label>
            <select
              id="course-switch"
              className="field"
              value={code}
              onChange={(e) => navigate("/app/task/" + e.target.value)}
            >
              {enrolledCourses.length ? (
                enrolledCourses.map((x) => (
                  <option key={x.code} value={x.code}>
                    {x.code} · {x.title}
                  </option>
                ))
              ) : (
                <option value="">No enrolled courses</option>
              )}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal"
              type="button"
              onClick={() =>
                setAssist(
                  "Example: write a short customer journey, test an invalid enquiry, document the failure, improve the instruction, and record the before-and-after result."
                )
              }
            >
              Show example
            </button>
            <button
              className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal"
              type="button"
              onClick={() =>
                setAssist(
                  "Help: begin with a small decision. Describe what you changed, why it mattered, and how you tested the normal and failure paths."
                )
              }
            >
              Ask for help
            </button>
            <button
              className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold"
              type="button"
              onClick={() => navigate("/app/evidence")}
            >
              View feedback
            </button>
          </div>
        </div>
        {blockNotice}
        {assist && <div className="mt-5 rounded-xl bg-mint p-4 text-sm leading-6" aria-live="polite">{assist}</div>}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {loop.map((stage, i) => {
            const isDone = i < done;
            const isCurrent = i === nextIndex;
            const cls = isDone ? "complete" : isCurrent ? "current" : "locked";
            const disabled = !isDone && !isCurrent;
            return (
              <button
                key={stage}
                className={"stage focus-ring shrink-0 rounded-xl border px-3 py-2 text-left text-xs font-bold " + cls}
                type="button"
                disabled={disabled}
                onClick={() => toast(stage + ": " + (stageHelp[stage] || ""))}
              >
                <span className="block opacity-70">Stage {i + 1}</span>
                {stage}
              </button>
            );
          })}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            {allStagesComplete ? (
              <section className="rounded-2xl bg-mint p-5">
                <h2 className="serif text-2xl font-semibold">All checkpoints complete</h2>
                <p className="mt-3 leading-7">Every stage of the loop has been recorded. Review your evidence and submit when ready.</p>
              </section>
            ) : (
              <section className="rounded-2xl bg-mint p-5">
                <h2 className="serif text-2xl font-semibold">{nextStage}: one clear objective</h2>
                <p className="mt-3 leading-7">{stageHelp[nextStage]} Keep your scope small and make each decision reviewable.</p>
                <form className="mt-4" onSubmit={handleCheckpoint}>
                  <label className="mb-2 block text-sm font-bold" htmlFor="checkpoint-text">
                    Checkpoint note
                  </label>
                  <textarea
                    id="checkpoint-text"
                    className="field min-h-28"
                    placeholder="What did you do, why did it matter, and what did you notice?"
                    value={checkpointText}
                    onChange={(e) => setCheckpointText(e.target.value)}
                  />
                  <button className="focus-ring mt-3 rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white" type="submit" disabled={blocked || busy}>
                    Complete {nextStage}
                  </button>
                </form>
              </section>
            )}
            <section className={"collapse mt-5 rounded-2xl border border-line " + (collapseOpen ? "is-open" : "")}>
              <button
                className="focus-ring flex w-full items-center justify-between p-5 text-left"
                type="button"
                aria-expanded={collapseOpen}
                onClick={() => setCollapseOpen((o) => !o)}
              >
                <span className="serif text-xl font-semibold">Mission contract and rubric</span>
                <ChevronDown style={{ transform: collapseOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {collapseOpen && (
                <div className="px-5 pb-5 text-sm leading-6">
                  <p>
                    <b>Scenario:</b> A local service business needs a clearer, safer customer journey.
                  </p>
                  <p className="mt-2">
                    <b>Deliverables:</b> a working result, evidence link or description, normal and failure test results,
                    explanation, and reflection.
                  </p>
                  <p className="mt-2">
                    <b>Rubric:</b> clarity, working outcome, failure handling, test evidence, and reasoning.
                  </p>
                </div>
              )}
            </section>
          </div>
          <aside>
            <section className="rounded-2xl border border-line p-5">
              <h2 className="serif text-xl font-semibold">Draft, notes, and evidence</h2>
              <form className="mt-4" onSubmit={handleDraft}>
                <label className="mb-2 block text-sm font-bold" htmlFor="draft-text">
                  Work link, screenshot/file description, or draft
                </label>
                <textarea
                  id="draft-text"
                  className="field min-h-28"
                  placeholder="Paste a safe link or describe your saved file."
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="focus-ring rounded-xl border border-teal px-4 py-3 text-sm font-bold text-teal" type="submit" disabled={busy}>
                    Save draft
                  </button>
                  <button
                    className="focus-ring rounded-xl border border-line px-4 py-3 text-sm font-bold"
                    type="button"
                    onClick={() =>
                      toast("Attachments are supported here as safe links or file descriptions. Direct binary upload needs workspace setup.")
                    }
                  >
                    Upload / attach
                  </button>
                </div>
              </form>
            </section>
            <section className="mt-5 rounded-2xl bg-[#f5f8f6] p-5">
              <h2 className="serif text-xl font-semibold">Submit for review</h2>
              <form className="mt-4" onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-bold" htmlFor="submit-text">
                  Submission summary
                </label>
                <textarea
                  id="submit-text"
                  className="field min-h-24"
                  placeholder="What are you submitting and where is the evidence?"
                  value={submitText}
                  onChange={(e) => setSubmitText(e.target.value)}
                />
                {[
                  "I included a working result or clear description.",
                  "I included normal and failure test results.",
                  "I explained my decision and reflection."
                ].map((label, i) => (
                  <label key={label} className="mt-2 flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checks[i]}
                      onChange={(e) =>
                        setChecks((c) => {
                          const next = [...c];
                          next[i] = e.target.checked;
                          return next;
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
                <button
                  className="focus-ring mt-4 w-full rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white"
                  type="submit"
                  disabled={blocked || submittedFinal || busy}
                >
                  {info.status === "Request Changes" ? "Resubmit changes" : "Submit for review"}
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
