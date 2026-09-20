import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import CourseCard from "../components/CourseCard";

const DEFAULT_FILTERS = { search: "", family: "All", maturity: "All", sort: "code" };
const MATURITIES = ["All", "Active", "Planning", "Proposed", "Restricted"];

export default function CataloguePage() {
  const { progress, refreshAll } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);

  const families = useMemo(() => ["All", ...new Set(progress.map((c) => c.family))], [progress]);

  const list = useMemo(() => {
    const search = filters.search.toLowerCase();
    return progress
      .filter((c) => {
        const matchesFamily = filters.family === "All" || c.family === filters.family;
        const matchesMaturity = filters.maturity === "All" || c.maturity === filters.maturity;
        const haystack = (c.code + " " + c.title + " " + c.family).toLowerCase();
        return matchesFamily && matchesMaturity && haystack.includes(search);
      })
      .sort((a, b) => (filters.sort === "title" ? a.title.localeCompare(b.title) : a.code.localeCompare(b.code)));
  }, [progress, filters]);

  async function handleEnrol(code) {
    try {
      await api.enrol(code);
      await refreshAll();
      toast("Course enrolled. Your workspace is ready.");
      navigate("/app/task/" + code);
    } catch (e) {
      toast(e.message);
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    setFilters(draft);
  }

  function clearFilters() {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Course Catalogue</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        66 units from Technology, Professional Foundation, Professional Career and Advanced Professional. Only
        "Active" courses are open for enrolment — Planning/Proposed/Restricted are real catalogue entries, not yet
        live. Locked courses name the exact evidence (or diagnostic) requirement that unlocks them.
      </p>
      <form className="mt-6 grid gap-3 md:grid-cols-5" onSubmit={applyFilters}>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold" htmlFor="catalogue-search">
            Search courses
          </label>
          <input
            id="catalogue-search"
            className="field"
            placeholder="Search title, code, or family"
            value={draft.search}
            onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold" htmlFor="family-filter">
            Family
          </label>
          <select id="family-filter" className="field" value={draft.family} onChange={(e) => setDraft((d) => ({ ...d, family: e.target.value }))}>
            {families.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold" htmlFor="maturity-filter">
            Maturity
          </label>
          <select id="maturity-filter" className="field" value={draft.maturity} onChange={(e) => setDraft((d) => ({ ...d, maturity: e.target.value }))}>
            {MATURITIES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold" htmlFor="sort-filter">
            Sort
          </label>
          <select id="sort-filter" className="field" value={draft.sort} onChange={(e) => setDraft((d) => ({ ...d, sort: e.target.value }))}>
            <option value="code">Course code</option>
            <option value="title">Course title</option>
          </select>
        </div>
        <div className="md:col-span-5 flex flex-wrap gap-2">
          <button className="focus-ring rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white" type="submit">
            Apply filters
          </button>
          <button className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold" type="button" onClick={clearFilters}>
            Clear filters
          </button>
          <span className="ml-auto self-center text-xs text-muted">{list.length} of {progress.length} courses</span>
        </div>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.length ? (
          list.map((c) => <CourseCard key={c.code} course={c} onEnrol={handleEnrol} />)
        ) : (
          <div className="rounded-xl bg-mint p-5 text-sm md:col-span-2">
            No courses match those filters. Clear filters to view the complete catalogue.
          </div>
        )}
      </div>
    </section>
  );
}
