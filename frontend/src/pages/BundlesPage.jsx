import { useState } from "react";
import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

function stateBadgeStatus(state) {
  if (state === "Enrolled" || state === "Completed") return "Enrolled";
  if (state === "Available") return "Configured";
  return "Setup required";
}

export default function BundlesPage() {
  const { bundles, refreshAll } = useAppData();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  async function handleEnrol(bundle) {
    setBusyId(bundle.id);
    try {
      const data = await api.enrolBundle(bundle.id);
      await refreshAll();
      if (data.granted.length) {
        toast(`Enrolled: ${data.granted.join(", ")}.` + (data.alreadyOwned.length ? ` Already owned: ${data.alreadyOwned.join(", ")}.` : ""));
      } else if (data.alreadyOwned.length) {
        toast("You already own every currently available course in this bundle.");
      } else {
        toast("None of this bundle's courses are open for enrolment yet.");
      }
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Bundles & Pathways</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Enrolling in a bundle grants entitlement only for courses that are currently open for enrolment and that you
        don't already own — you are never charged twice for content you already have. No payment is collected here;
        checkout itself remains setup-required, as the planning PDF specifies.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {bundles.map((b) => (
          <article key={b.id} className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="serif text-xl font-semibold">{b.name}</h2>
              <Badge status={b.family} />
            </div>
            <p className="mt-2 text-sm">
              {b.hours} h · ${b.price} proposed
            </p>
            <p className="mt-2 text-sm text-muted">
              {b.courses.length
                ? b.courses.map((c) => `${c.code} (${c.state})`).join(", ")
                : "Planning — content not yet mapped to individual courses."}
            </p>
            {b.countryModules && (
              <p className="mt-2 text-xs text-muted">
                Optional country modules (not individually purchasable yet): {b.countryModules.join(", ")}.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {b.courses.map((c) => (
                <Badge key={c.code} status={stateBadgeStatus(c.state)} />
              ))}
            </div>
            <button
              className="focus-ring mt-4 rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              type="button"
              disabled={busyId === b.id || b.grantableCount === 0}
              onClick={() => handleEnrol(b)}
            >
              {b.grantableCount === 0 ? "Nothing new to enrol" : `Enrol (${b.grantableCount} course${b.grantableCount === 1 ? "" : "s"})`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
