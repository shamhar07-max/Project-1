const { COURSES, LOOP, courseByCode } = require("./data");

function eventsFor(records, code) {
  return records.filter((r) => r.unitCode === code);
}

function stagesFor(records, code) {
  const set = new Set();
  eventsFor(records, code).forEach((r) => {
    if (r.recordType === "checkpoint" && r.loopStage) set.add(r.loopStage);
  });
  return set;
}

function statusFor(records, code) {
  const relevant = eventsFor(records, code)
    .filter((r) => ["submission", "review", "verification"].includes(r.recordType))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
  return relevant.length ? relevant[0].status || "Draft" : "Draft";
}

function isEnrolled(records, code) {
  return eventsFor(records, code).some((r) => r.recordType === "enrolment");
}

function isComplete(records, code) {
  return statusFor(records, code) === "Evidence Issued";
}

function isLocked(records, code) {
  const course = courseByCode(code);
  if (!course || course.prereq === "None") return false;
  return !isComplete(records, course.prereq);
}

function courseState(records, code) {
  if (isComplete(records, code)) return "Completed";
  if (isEnrolled(records, code)) return "Enrolled";
  if (isLocked(records, code)) return "Locked";
  return "Available";
}

function nextStage(records, code) {
  const done = stagesFor(records, code);
  return LOOP.find((s) => !done.has(s)) || null;
}

function summarizeAll(records) {
  return COURSES.map((c) => ({
    code: c.code,
    title: c.title,
    family: c.family,
    level: c.level,
    prereq: c.prereq,
    kind: c.kind,
    missionId: c.missionId,
    state: courseState(records, c.code),
    status: statusFor(records, c.code),
    completedStages: stagesFor(records, c.code).size,
    enrolled: isEnrolled(records, c.code),
    locked: isLocked(records, c.code),
    complete: isComplete(records, c.code)
  }));
}

module.exports = {
  eventsFor,
  stagesFor,
  statusFor,
  isEnrolled,
  isComplete,
  isLocked,
  courseState,
  nextStage,
  summarizeAll
};
