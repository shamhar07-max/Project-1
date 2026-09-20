import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import Badge from "../components/Badge";

export default function BillingPage() {
  const { bundles, progress } = useAppData();
  const navigate = useNavigate();
  const owned = progress.filter((c) => c.enrolled || c.complete);

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Orders & Billing</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Checkout is setup-required. This prototype does not collect payments or claim a transaction occurred — every
        enrolment recorded here is a local entitlement only, exactly as the planning PDF specifies.
      </p>

      <section className="mt-6 rounded-2xl bg-mint p-5">
        <h2 className="serif text-xl font-semibold">Your entitlements</h2>
        {owned.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {owned.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3">
                <span>
                  {c.code} · {c.title}
                </span>
                <Badge status={c.state} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm">No entitlements yet — enrol in a course or bundle to see it here.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="serif text-xl font-semibold">Bundles at a glance</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {bundles.map((b) => (
            <div key={b.id} className="rounded-xl border border-line p-4 text-sm">
              <div className="flex justify-between gap-2">
                <b>{b.name}</b>
                <span>${b.price}</span>
              </div>
              <p className="mt-1 text-muted">
                {b.ownedCount}/{b.courses.length || 0} owned
              </p>
            </div>
          ))}
        </div>
        <button className="focus-ring mt-4 rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/bundles")}>
          Manage entitlements in Bundles
        </button>
      </section>

      <p className="mt-6 rounded-xl bg-[#fff5df] p-4 text-sm">
        Before pricing becomes active, the academy must publish currency conversion, taxes, refund conditions,
        access term and third-party fee notices.
      </p>
    </section>
  );
}
