import { useAppData } from "../../context/AppDataContext";
import Badge from "../../components/Badge";

export default function RolloutPage() {
  const { phases, labs } = useAppData();

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Release &amp; Rollout</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        The planning PDF's phased rollout. Nothing here changes what is live — course maturity is what actually
        gates enrolment.
      </p>
      <div className="mt-6 grid gap-4">
        {phases.map((p) => (
          <article key={p.name} className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="serif text-xl font-semibold">{p.name}</h2>
              <Badge status={p.status} />
            </div>
            <p className="mt-3 text-sm">
              <b>Build scope:</b> {p.build}
            </p>
            <p className="mt-2 text-sm">
              <b>Launch gate:</b> {p.gate}
            </p>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-2xl bg-mint p-5">
        <h2 className="serif text-xl font-semibold">Professional simulation labs (roadmap)</h2>
        <p className="mt-2 text-sm leading-6">
          {labs.join(" · ")} — begin with fictional records and downloadable templates; add interactive
          environments only after teaching and assessment workflows are validated.
        </p>
      </section>
    </section>
  );
}
