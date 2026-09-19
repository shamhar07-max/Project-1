import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import CourseCard from "../components/CourseCard";

export default function LearningPage() {
  const { progress, refreshAll } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const list = progress.filter((c) => c.enrolled);

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

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">My Learning</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your progress moves through recorded practical work, review, verification, and issued evidence.
      </p>
      <div className="mt-6 grid gap-4">
        {list.length ? (
          list.map((c) => <CourseCard key={c.code} course={c} compact onEnrol={handleEnrol} />)
        ) : (
          <div className="rounded-xl bg-mint p-5 text-sm">
            No enrolled courses yet. Open the Course Catalogue to choose an available course.
          </div>
        )}
      </div>
    </section>
  );
}
