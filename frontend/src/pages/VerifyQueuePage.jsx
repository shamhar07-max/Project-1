import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function VerifyQueuePage() {
  const toast = useToast();
  const [queue, setQueue] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const load = useCallback(async () => {
    const data = await api.verifyQueue();
    setQueue(data.queue);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify(entry) {
    const key = entry.learnerId + ":" + entry.code;
    setBusyKey(key);
    try {
      await api.verify(entry.learnerId, entry.code);
      await load();
      toast(`Evidence issued for ${entry.learnerName}'s ${entry.code}.`);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyKey(null);
    }
  }

  if (!queue) return null;

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Independent Verification Queue</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        You verify work a reviewer has already approved — a different authorized responsibility from review, and
        never your own submission. Verifying issues evidence in the same action.
      </p>
      <div className="mt-6 space-y-3">
        {queue.length ? (
          queue.map((entry) => {
            const key = entry.learnerId + ":" + entry.code;
            return (
              <article key={key} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <b>
                      {entry.learnerName} · {entry.code} · {entry.title}
                    </b>
                    <p className="mt-1 text-sm text-muted">{entry.learnerEmail}</p>
                  </div>
                  <Badge status={entry.status} />
                </div>
                {entry.submissionText && <p className="mt-3 text-sm leading-6 text-[#52636c]">"{entry.submissionText}"</p>}
                <button
                  className="focus-ring mt-3 rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white"
                  type="button"
                  disabled={busyKey === key}
                  onClick={() => handleVerify(entry)}
                >
                  Verify &amp; issue evidence
                </button>
              </article>
            );
          })
        ) : (
          <p className="rounded-xl bg-mint p-5 text-sm">No submissions waiting for independent verification.</p>
        )}
      </div>
    </section>
  );
}
