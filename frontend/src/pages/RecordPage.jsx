import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import Badge from "../components/Badge";

export default function RecordPage() {
  const { progress, levels, diagnostic } = useAppData();
  const navigate = useNavigate();
  const issued = progress.filter((c) => c.complete);

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Capability Record</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        A completion record, assessed certificate, independent verification and actual workplace experience are
        separate claims. Capability at any level is supported only by evidence actually issued — never
        self-claimed.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl bg-mint p-4 text-sm">
        <Badge status={diagnostic.passed ? "Verified" : "Setup required"} />
        <span>{diagnostic.passed ? "Foundation Diagnostic passed." : "Foundation Diagnostic not yet passed."}</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {levels.map((level) => {
          const supported = issued.some((c) => c.level === level.code);
          return (
            <article key={level.code} className="rounded-2xl border border-line p-5">
              <h2 className="serif text-xl font-semibold">{level.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{level.description}</p>
              <p className="mt-3 text-sm font-bold">{supported ? "Evidence issued" : "Not yet supported"}</p>
            </article>
          );
        })}
      </div>
      <button className="focus-ring mt-6 rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white" type="button" onClick={() => navigate("/app/learning")}>
        Return to My Learning
      </button>
    </section>
  );
}
