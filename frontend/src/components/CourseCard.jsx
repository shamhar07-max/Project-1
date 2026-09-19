import { useNavigate } from "react-router-dom";
import Badge from "./Badge";

export default function CourseCard({ course, compact, onEnrol }) {
  const navigate = useNavigate();
  const statusLabel = course.state === "Enrolled" ? course.status : course.state;
  const locked = course.state === "Locked";

  let action;
  if (course.state === "Available") {
    action = (
      <button
        className="focus-ring rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white"
        type="button"
        onClick={() => onEnrol(course.code)}
      >
        Enrol in course
      </button>
    );
  } else if (locked) {
    action = (
      <button className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold text-muted" disabled type="button">
        Locked until prerequisite evidence
      </button>
    );
  } else {
    action = (
      <button
        className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal"
        type="button"
        onClick={() => navigate("/app/task/" + course.code)}
      >
        Open workspace
      </button>
    );
  }

  return (
    <article className={"card-action rounded-2xl border border-line p-5 " + (locked ? "bg-[#f5f8f6]" : "bg-white")}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-teal">
            {course.code} · {course.family} · {course.level}
          </p>
          <h2 className="serif mt-1 text-xl font-semibold">{course.title}</h2>
          <p className="mt-2 text-sm text-[#52636c]">
            {course.kind} mission · {course.completedStages}/12 checkpoints complete
          </p>
        </div>
        <Badge status={statusLabel} />
      </div>
      {!compact && (
        <p className="mt-2 text-xs leading-5 text-muted">
          {course.prereq === "None" ? "No prerequisite." : "Unlock requirement: Evidence Issued for " + course.prereq + "."}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">{action}</div>
    </article>
  );
}
