import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function ReviewQueuePage() {
  const toast = useToast();
  const [queue, setQueue] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [comments, setComments] = useState({});

  const load = useCallback(async () => {
    const data = await api.reviewQueue();
    setQueue(data.queue);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(entry, action) {
    const key = entry.learnerId + ":" + entry.code;
    setBusyKey(key);
    try {
      if (action === "start") await api.startReview(entry.learnerId, entry.code);
      else if (action === "approve") await api.approve(entry.learnerId, entry.code);
      else if (action === "request-changes") await api.requestChanges(entry.learnerId, entry.code, comments[key]);
      await load();
      toast(`${entry.learnerName}'s ${entry.code} updated.`);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyKey(null);
    }
  }

  if (!queue) return null;

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Reviewer Queue</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        You review other learners' submissions — never your own. Approving a submission automatically forwards it to
        the independent verification queue; you cannot verify it yourself.
      </p>
      <div className="mt-6 space-y-3">
        {queue.length ? (
          queue.map((entry) => {
            const key = entry.learnerId + ":" + entry.code;
            return (
              <article key={key} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <b>
                      {entry.learnerName} · {entry.code} · {entry.title}
                    </b>
                    <p className="mt-1 text-sm text-muted">{entry.learnerEmail}</p>
                    <Badge status={entry.status} />
                  </div>
                </div>
                {entry.submissionText && <p className="mt-3 text-sm leading-6 text-[#52636c]">"{entry.submissionText}"</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {entry.status !== "In Review" && (
                    <button
                      className="focus-ring rounded-lg bg-navy px-3 py-2 text-sm font-bold text-white"
                      type="button"
                      disabled={busyKey === key}
                      onClick={() => act(entry, "start")}
                    >
                      Start review
                    </button>
                  )}
                  {entry.status === "In Review" && (
                    <>
                      <input
                        className="field max-w-xs"
                        placeholder="Optional comment for request-changes"
                        value={comments[key] || ""}
                        onChange={(e) => setComments((c) => ({ ...c, [key]: e.target.value }))}
                      />
                      <button
                        className="focus-ring rounded-lg bg-rose px-3 py-2 text-sm font-bold text-white"
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => act(entry, "request-changes")}
                      >
                        Request changes
                      </button>
                      <button
                        className="focus-ring rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white"
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => act(entry, "approve")}
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="rounded-xl bg-mint p-5 text-sm">No submissions waiting for review.</p>
        )}
      </div>
    </section>
  );
}
