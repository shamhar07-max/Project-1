import { useEffect, useState } from "react";
import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function DiagnosticPage() {
  const { diagnostic, refreshDiagnostic } = useAppData();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [passThreshold, setPassThreshold] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.diagnosticQuestions().then((data) => {
      setQuestions(data.questions);
      setPassThreshold(data.passThreshold);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      toast("Answer every question before submitting.");
      return;
    }
    setBusy(true);
    try {
      const data = await api.diagnosticSubmit(answers);
      setResult(data);
      await refreshDiagnostic();
      toast(data.passed ? "Diagnostic passed." : "Diagnostic not passed this time.");
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card rounded-2xl bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="serif text-3xl font-semibold">Foundation Diagnostic</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            This is a short, server-graded assessment — not a self-declared checkbox. A pass here is what actually
            unlocks Professional Career and Advanced Professional courses whose prerequisite is "Foundation
            diagnostic," the moment any such course is marked Active.
          </p>
        </div>
        <Badge status={diagnostic.passed ? "Verified" : "Setup required"} />
      </div>

      {diagnostic.passed && (
        <div className="mt-5 rounded-xl bg-mint p-4 text-sm">
          You already have a passing diagnostic on record ({diagnostic.record?.score}/{questions.length || 5}). You
          can retake it below if you want a fresh attempt.
        </div>
      )}

      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border border-line p-4">
            <legend className="px-1 text-sm font-bold">
              {i + 1}. {q.prompt}
            </legend>
            <div className="mt-3 grid gap-2">
              {q.options.map((option, idx) => (
                <label key={idx} className="flex gap-2 rounded-lg p-2 text-sm hover:bg-[#f5f8f6]">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === idx}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {questions.length > 0 && (
          <button className="focus-ring w-fit rounded-xl bg-teal px-5 py-3 text-sm font-bold text-white" type="submit" disabled={busy}>
            Submit diagnostic
          </button>
        )}
      </form>

      {result && (
        <div className={"mt-6 rounded-xl p-4 text-sm " + (result.passed ? "bg-mint" : "bg-[#fff0eb]")}>
          <b>{result.passed ? "Passed" : "Not passed"}</b> — scored {result.score}/{result.total} (pass mark:{" "}
          {passThreshold}/{result.total}).
        </div>
      )}
    </section>
  );
}
