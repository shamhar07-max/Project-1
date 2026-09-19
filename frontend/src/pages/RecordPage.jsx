import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

export default function RecordPage() {
  const { progress, levels } = useAppData();
  const navigate = useNavigate();
  const issued = progress.filter((c) => c.complete);

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Capability Record</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Capability claims are supported only by issued evidence.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {levels.map((label, i) => {
          const supported = issued.some((c) => c.level === "L" + (i + 1));
          return (
            <article key={label} className="rounded-2xl border border-line p-5">
              <h2 className="serif text-xl font-semibold">{label}</h2>
              <p className="mt-3 text-sm font-bold">{supported ? "Evidence issued" : "Not yet supported"}</p>
            </article>
          );
        })}
      </div>
      <button
        className="focus-ring mt-6 rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white"
        type="button"
        onClick={() => navigate("/app/learning")}
      >
        Return to My Learning
      </button>
    </section>
  );
}
