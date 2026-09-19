import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

function stageHelpFallback(help, stage) {
  return help[stage] || "";
}

export default function OrientationPage() {
  const { loop, stageHelp } = useAppData();
  const navigate = useNavigate();

  return (
    <section className="card rounded-[2rem] bg-white p-6 md:p-9">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-teal">Orientation</p>
      <h1 className="serif mt-2 font-semibold" style={{ color: "#183444", fontSize: 30 }}>
        How the academy verifies capability
      </h1>
      <p className="mt-4 max-w-4xl leading-7 text-muted">
        This is not a passive course library. You build practical work, save evidence, receive feedback,
        correct failures, submit for approval, and then receive independent verification.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loop.map((stage, i) => (
          <article key={stage} className="rounded-xl border border-line bg-[#f5f8f6] p-3 text-sm">
            <b>
              {i + 1}. {stage}
            </b>
            <p className="mt-1 text-xs text-muted">{stageHelpFallback(stageHelp, stage)}</p>
          </article>
        ))}
      </div>
      <button
        className="focus-ring mt-7 rounded-xl bg-teal px-5 py-3 font-bold text-white"
        type="button"
        onClick={() => navigate("/app/catalogue")}
      >
        Choose my first course
      </button>
    </section>
  );
}
