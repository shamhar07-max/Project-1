const { COURSES, STAGES, courseByCode } = require("./data");

const FINAL_STATUSES = ["Approved", "Pending Verification", "Verified", "Evidence Issued"];
const IN_FLIGHT_STATUSES = ["Submitted", "Resubmitted", "In Review"];

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

// Status-bearing record types, in the order the lifecycle actually visits
// them: the learner creates "submission" records (Submitted/Resubmitted),
// a reviewer creates "review" records (In Review/Request Changes/Approved/
// Pending Verification), and a verifier creates "verification" records
// (Verified/Evidence Issued). See routes/queues.js for who can create which.
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

function hasPassedDiagnostic(records) {
  return records.some((r) => r.recordType === "diagnostic" && r.passed === true);
}

// A prerequisite is either "None" (no gate), "Foundation diagnostic" (gated
// by an actual server-graded assessment — see diagnosticQuestions.js, not a
// self-declared field), or another course code (gated by that course having
// issued evidence).
function prereqMet(records, code) {
  const course = courseByCode(code);
  if (!course) return false;
  if (course.prereq === "None") return true;
  if (course.prereq === "Foundation diagnostic") return hasPassedDiagnostic(records);
  return isComplete(records, course.prereq);
}

function isLocked(records, code) {
  return !prereqMet(records, code);
}

// Maturity is the honesty gate from the planning PDF: only "Active" courses
// can ever be enrolled in. Planning/Proposed/Restricted are real catalogue
// entries (so prerequisite chains and pricing display correctly) but are
// never enrollable, regardless of prerequisites — the frontend must not
// let a learner enrol just because a locked/planning course "looks done".
function courseState(records, code) {
  const course = courseByCode(code);
  if (!course) return "Unknown";
  if (isComplete(records, code)) return "Completed";
  if (isEnrolled(records, code)) return "Enrolled";
  if (course.maturity !== "Active") return course.maturity; // Planning | Proposed | Restricted
  if (isLocked(records, code)) return "Locked";
  return "Available";
}

function nextStage(records, code) {
  const done = stagesFor(records, code);
  return STAGES.find((s) => !done.has(s)) || null;
}

function summarizeOne(records, c) {
  return {
    code: c.code,
    title: c.title,
    family: c.family,
    hours: c.hours,
    level: c.level,
    prereq: c.prereq,
    maturity: c.maturity,
    price: c.price,
    modules: c.modules,
    missionId: c.missionId,
    missionKind: c.missionKind,
    state: courseState(records, c.code),
    status: statusFor(records, c.code),
    completedStages: stagesFor(records, c.code).size,
    enrolled: isEnrolled(records, c.code),
    locked: isLocked(records, c.code),
    complete: isComplete(records, c.code)
  };
}

function summarizeAll(records) {
  return COURSES.map((c) => summarizeOne(records, c));
}

module.exports = {
  FINAL_STATUSES,
  IN_FLIGHT_STATUSES,
  eventsFor,
  stagesFor,
  statusFor,
  isEnrolled,
  isComplete,
  isLocked,
  prereqMet,
  hasPassedDiagnostic,
  courseState,
  nextStage,
  summarizeOne,
  summarizeAll
};
