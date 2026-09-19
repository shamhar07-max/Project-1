import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function ToolsPage() {
  const { tools, refreshRecords } = useAppData();
  const toast = useToast();

  async function openTool(tool) {
    window.open(tool.url, "_blank", "noopener,noreferrer");
    await api.toolUse({ toolName: tool.name, toolCategory: tool.category, note: "Opened configured tool" });
    await refreshRecords();
    toast("Opened in a new tab. Your workspace remains here.");
  }

  async function useOrSave(tool, save) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tool.prompt);
      }
    } catch (e) {
      /* clipboard may be blocked */
    }
    await api.toolUse({
      toolName: tool.name,
      toolCategory: tool.category,
      note: save ? "Saved prompt: " + tool.prompt : "Prepared task prompt: " + tool.prompt,
      savedPromptText: tool.prompt
    });
    await refreshRecords();
    toast(save ? "Prompt saved and copied where supported." : "Task prompt copied where supported and logged.");
  }

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Tool Library</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Configured tools open safely in a new tab. Unconfigured tools clearly report setup required.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const configured = !!tool.url;
          return (
            <article key={tool.name} className="rounded-2xl border border-line p-5">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="serif text-xl font-semibold">{tool.name}</h2>
                  <p className="text-xs font-bold uppercase text-muted">{tool.category}</p>
                </div>
                <Badge status={configured ? "Configured" : "Setup required"} />
              </div>
              <p className="mt-3 text-sm text-[#52636c]">{tool.prompt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {configured ? (
                  <button
                    className="focus-ring rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white"
                    type="button"
                    onClick={() => openTool(tool)}
                  >
                    Open tool
                  </button>
                ) : (
                  <button
                    className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold"
                    type="button"
                    onClick={() => toast(tool.name + " requires setup before it can open safely.")}
                  >
                    Setup required
                  </button>
                )}
                <button
                  className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal"
                  type="button"
                  onClick={() => useOrSave(tool, false)}
                >
                  Use for this task
                </button>
                <button
                  className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold"
                  type="button"
                  onClick={() => useOrSave(tool, true)}
                >
                  Save prompt
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
