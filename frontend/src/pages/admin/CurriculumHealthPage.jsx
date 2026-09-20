import { useEffect, useState } from "react";
import { api } from "../../api";

export default function CurriculumHealthPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.curriculumHealth().then(setHealth);
  }, []);

  if (!health) return null;

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Curriculum Health</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Validates the course graph: unique course codes, prerequisites that resolve to a real course (or a genuine
        terminal condition), no circular prerequisite chains, and every bundle referencing courses that actually
        exist.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-mint p-4 text-sm">
          <b>{health.courseCount}</b> courses checked
        </div>
        <div className="rounded-xl bg-mint p-4 text-sm">
          <b>{health.bundleCount}</b> bundles checked
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-line p-5">
        {health.problems.length ? (
          <>
            <p className="text-sm font-bold text-rose">{health.problems.length} problem(s) found:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {health.problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm font-bold text-teal">
            Healthy: unique course codes, valid prerequisite references, no circular chains, all bundle references
            resolve.
          </p>
        )}
      </div>
    </section>
  );
}
