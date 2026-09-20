import { useNavigate } from "react-router-dom";
import Badge from "./Badge";

const MATURITY_EXPLANATION = {
  Planning: "This course is in Planning and is not yet open for enrolment.",
  Proposed: "This course is Proposed and enrolments are not open yet.",
  Restricted: "This course is Restricted to the Assessment Centre and cannot be enrolled directly."
};

export default function CourseCard({ course, compact, onEnrol }) {
  const navigate = useNavigate();
  const canWork = course.state === "Enrolled" || course.state === "Completed";
  const statusLabel = canWork ? course.status : course.state;

  let action;
  if (course.state === "Available") {
    action = (
      <button className="focus-ring rounded-lg bg-teal px-3 py-2 text-sm font-bold text-white" type="button" onClick={() => onEnrol(course.code)}>
        Enrol in course
      </button>
    );
  } else if (canWork) {
    action = (
      <button className="focus-ring rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal" type="button" onClick={() => navigate("/app/task/" + course.code)}>
        Open workspace
      </button>
    );
  } else if (course.state === "Locked") {
    const reason = course.prereq === "Foundation diagnostic" ? "Pass the Foundation Diagnostic to unlock" : "Locked until prerequisite evidence";
    action = (
      <button className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold text-muted" disabled type="button">
        {reason}
      </button>
    );
  } else {
    action = (
      <button className="focus-ring rounded-lg border border-line px-3 py-2 text-sm font-bold text-muted" disabled type="button">
        {MATURITY_EXPLANATION[course.state] || `Not open for enrolment (${course.state})`}
      </button>
    );
  }

  const dimmed = !canWork && course.state !== "Available";

  return (
    <article className={"card-action rounded-2xl border border-line p-5 " + (dimmed ? "bg-[#f5f8f6]" : "bg-white")}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-teal">
            {course.code} · {course.family} · {course.level}
          </p>
          <h2 className="serif mt-1 text-xl font-semibold">{course.title}</h2>
          <p className="mt-2 text-sm text-[#52636c]">
            {course.missionKind} mission · {course.hours} h · {course.completedStages}/12 checkpoints complete
          </p>
          {course.price != null && <p className="mt-1 text-sm font-bold">${course.price} proposed</p>}
        </div>
        <Badge status={statusLabel} />
      </div>
      {!compact && (
        <p className="mt-2 text-xs leading-5 text-muted">
          {course.prereq === "None"
            ? "No prerequisite."
            : course.prereq === "Foundation diagnostic"
              ? "Unlock requirement: a passed Foundation Diagnostic."
              : "Unlock requirement: Evidence Issued for " + course.prereq + "."}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">{action}</div>
    </article>
  );
}
