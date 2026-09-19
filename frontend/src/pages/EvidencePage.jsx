import { useAppData } from "../context/AppDataContext";

export default function EvidencePage() {
  const { records } = useAppData();

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Evidence and Failure Passport</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Failures, feedback, corrections, and recovery notes remain useful learning evidence.
      </p>
      <div className="mt-6 space-y-3">
        {records.length ? (
          records.map((r) => {
            const label = (r.unitCode || "Learner profile") + " · " + (r.status || r.recordType);
            const body = r.submissionText || r.reviewerComment || r.checkpointNotes || r.toolNote || "Recorded learning event.";
            const when = r.createdAt ? new Date(r.createdAt).toLocaleString() : "";
            return (
              <article key={r.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <b>{label}</b>
                  <span className="text-xs text-muted">{when}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#52636c]">{body}</p>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl bg-mint p-5 text-sm">
            No evidence history yet. Save a draft or complete a checkpoint to begin your record.
          </div>
        )}
      </div>
    </section>
  );
}
