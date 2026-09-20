const express = require("express");
const prisma = require("../db");
const { requireRole } = require("../auth");
const { courseByCode } = require("../data");
const { statusFor } = require("../progress");

const router = express.Router();

const STATUS_RECORD_TYPES = ["submission", "review", "verification"];

// Cross-learner status lookup. This app's scale (a demo academy, not a
// production-volume one) makes the simple per-learner grouping below fine;
// it would want a real aggregate query if this ever needed to handle a large
// learner base.
async function loadAllStatusRecords() {
  return prisma.record.findMany({
    where: { recordType: { in: STATUS_RECORD_TYPES } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }]
  });
}

// Groups records by (learner, course) and keeps the latest one — the array
// is already chronological ascending, so the last write per key wins.
function latestPerLearnerCourse(records) {
  const map = new Map();
  records.forEach((r) => {
    map.set(r.userId + ":" + r.unitCode, r);
  });
  return map;
}

async function latestSubmissionText(userId, unitCode) {
  const rec = await prisma.record.findFirst({
    where: { userId, unitCode, recordType: "submission" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }]
  });
  return rec ? rec.submissionText : "";
}

async function buildQueueEntry(latest) {
  const course = courseByCode(latest.unitCode);
  const submissionText = await latestSubmissionText(latest.userId, latest.unitCode);
  return {
    learnerId: latest.userId,
    learnerName: latest.user.name,
    learnerEmail: latest.user.email,
    code: latest.unitCode,
    title: course ? course.title : latest.unitCode,
    status: latest.status,
    submissionText,
    updatedAt: latest.createdAt
  };
}

router.get("/review", ...requireRole("reviewer", "admin"), async (req, res) => {
  const records = await loadAllStatusRecords();
  const latest = latestPerLearnerCourse(records);
  const queueStatuses = ["Submitted", "Resubmitted", "In Review"];
  const entries = [...latest.values()].filter((r) => queueStatuses.includes(r.status));
  res.json({ queue: await Promise.all(entries.map(buildQueueEntry)) });
});

router.get("/verify", ...requireRole("verifier", "admin"), async (req, res) => {
  const records = await loadAllStatusRecords();
  const latest = latestPerLearnerCourse(records);
  const entries = [...latest.values()].filter((r) => r.status === "Pending Verification");
  res.json({ queue: await Promise.all(entries.map(buildQueueEntry)) });
});

async function currentStatusFor(learnerId, code) {
  const records = await prisma.record.findMany({ where: { userId: learnerId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
  return statusFor(records, code);
}

function forbidSelfAction(req, res, learnerId) {
  if (learnerId === req.currentUser.id) {
    res.status(403).json({ error: "You cannot review or verify your own submission — separation of duties applies even to staff accounts." });
    return true;
  }
  return false;
}

router.post("/review/:learnerId/:code/start", ...requireRole("reviewer", "admin"), async (req, res) => {
  const learnerId = Number(req.params.learnerId);
  const { code } = req.params;
  if (forbidSelfAction(req, res, learnerId)) return;
  if (!courseByCode(code)) return res.status(404).json({ error: "Unknown course." });

  const status = await currentStatusFor(learnerId, code);
  if (!["Submitted", "Resubmitted"].includes(status)) {
    return res.status(409).json({ error: `Cannot start review from status "${status}".` });
  }

  await prisma.record.create({
    data: { userId: learnerId, actedByUserId: req.currentUser.id, recordType: "review", unitCode: code, status: "In Review" }
  });
  res.status(201).json({ status: "In Review" });
});

router.post("/review/:learnerId/:code/request-changes", ...requireRole("reviewer", "admin"), async (req, res) => {
  const learnerId = Number(req.params.learnerId);
  const { code } = req.params;
  const { comment } = req.body || {};
  if (forbidSelfAction(req, res, learnerId)) return;
  if (!courseByCode(code)) return res.status(404).json({ error: "Unknown course." });

  const status = await currentStatusFor(learnerId, code);
  if (status !== "In Review") {
    return res.status(409).json({ error: `Cannot request changes from status "${status}".` });
  }

  await prisma.record.create({
    data: {
      userId: learnerId,
      actedByUserId: req.currentUser.id,
      recordType: "review",
      unitCode: code,
      status: "Request Changes",
      reviewerComment: String(comment || "Please add clearer failure-case evidence and resubmit.").trim()
    }
  });
  res.status(201).json({ status: "Request Changes" });
});

// Approving is deliberately a single authorized action that also forwards
// the submission into the verification queue: the PDF's lifecycle has a
// distinct "Pending Verification" status, but no page or role in the
// reference design ever triggers Approved -> Pending Verification, so
// nothing could ever reach "Evidence Issued". Recording both transitions
// here (with the reviewer as actedBy on both) keeps the full audit trail
// while closing that dead end.
router.post("/review/:learnerId/:code/approve", ...requireRole("reviewer", "admin"), async (req, res) => {
  const learnerId = Number(req.params.learnerId);
  const { code } = req.params;
  if (forbidSelfAction(req, res, learnerId)) return;
  if (!courseByCode(code)) return res.status(404).json({ error: "Unknown course." });

  const status = await currentStatusFor(learnerId, code);
  if (status !== "In Review") {
    return res.status(409).json({ error: `Cannot approve from status "${status}".` });
  }

  await prisma.record.create({
    data: { userId: learnerId, actedByUserId: req.currentUser.id, recordType: "review", unitCode: code, status: "Approved", reviewerComment: "Approved." }
  });
  await prisma.record.create({
    data: { userId: learnerId, actedByUserId: req.currentUser.id, recordType: "review", unitCode: code, status: "Pending Verification" }
  });
  res.status(201).json({ status: "Pending Verification" });
});

// Verifying likewise closes the Verified -> Evidence Issued dead end in one
// authorized action by the same independent verifier.
router.post("/verify/:learnerId/:code/verify", ...requireRole("verifier", "admin"), async (req, res) => {
  const learnerId = Number(req.params.learnerId);
  const { code } = req.params;
  if (forbidSelfAction(req, res, learnerId)) return;
  if (!courseByCode(code)) return res.status(404).json({ error: "Unknown course." });

  const status = await currentStatusFor(learnerId, code);
  if (status !== "Pending Verification") {
    return res.status(409).json({ error: `Cannot verify from status "${status}".` });
  }

  await prisma.record.create({
    data: { userId: learnerId, actedByUserId: req.currentUser.id, recordType: "verification", unitCode: code, status: "Verified", reviewerComment: "Verified independently." }
  });
  await prisma.record.create({
    data: { userId: learnerId, actedByUserId: req.currentUser.id, recordType: "verification", unitCode: code, status: "Evidence Issued", reviewerComment: "Evidence issued after independent verification." }
  });
  res.status(201).json({ status: "Evidence Issued" });
});

module.exports = router;
