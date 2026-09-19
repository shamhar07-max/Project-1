const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../auth");
const { courseByCode, LOOP, STAGE_HELP } = require("../data");
const {
  stagesFor,
  statusFor,
  isEnrolled,
  isLocked,
  isComplete,
  nextStage,
  summarizeAll
} = require("../progress");

const router = express.Router();

async function loadRecords(userId) {
  return prisma.record.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
}

function evidenceRecordTypes() {
  return ["failure", "review", "submission", "verification", "checkpoint", "draft", "tool_use"];
}

router.use(requireAuth);

router.get("/progress", async (req, res) => {
  const records = await loadRecords(req.userId);
  res.json({ progress: summarizeAll(records) });
});

router.get("/", async (req, res) => {
  const records = await loadRecords(req.userId);
  const evidence = records
    .filter((r) => evidenceRecordTypes().includes(r.recordType))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
  res.json({ records: evidence });
});

router.post("/enrol", async (req, res) => {
  const { code } = req.body || {};
  const course = courseByCode(code);
  if (!course) return res.status(404).json({ error: "Unknown course." });

  const records = await loadRecords(req.userId);
  if (isLocked(records, code)) {
    return res.status(409).json({ error: "This course remains locked until prerequisite evidence is issued." });
  }
  if (isEnrolled(records, code)) {
    return res.json({ alreadyEnrolled: true });
  }

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "enrolment",
      unitCode: course.code,
      missionId: course.missionId,
      missionKind: course.kind,
      status: "Enrolled",
      submissionText: "Learner enrolled in " + course.code
    }
  });

  await prisma.user.update({ where: { id: req.userId }, data: { selectedCode: course.code } });

  const updated = await loadRecords(req.userId);
  res.status(201).json({ progress: summarizeAll(updated) });
});

router.post("/checkpoint", async (req, res) => {
  const { code, text } = req.body || {};
  const course = courseByCode(code);
  if (!course) return res.status(404).json({ error: "Unknown course." });

  const records = await loadRecords(req.userId);
  if (!isEnrolled(records, code) || isLocked(records, code)) {
    return res.status(409).json({ error: "Workspace locked. Enrol and clear prerequisites first." });
  }
  const stage = nextStage(records, code);
  if (!stage) {
    return res.status(409).json({ error: "All checkpoints are already complete." });
  }
  const cleanText = String(text || "").trim();
  if (cleanText.length < 18) {
    return res.status(400).json({ error: "Add more detail: what you did, why it mattered, and what you noticed." });
  }

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "checkpoint",
      unitCode: course.code,
      missionId: course.missionId,
      loopStage: stage,
      checkpointNotes: cleanText,
      submissionText: cleanText
    }
  });

  const updated = await loadRecords(req.userId);
  res.status(201).json({ stage, progress: summarizeAll(updated) });
});

router.post("/draft", async (req, res) => {
  const { code, text } = req.body || {};
  const course = courseByCode(code);
  if (!course) return res.status(404).json({ error: "Unknown course." });
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    return res.status(400).json({ error: "Add a link, file description, or draft note before saving." });
  }

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "draft",
      unitCode: course.code,
      missionId: course.missionId,
      submissionText: cleanText
    }
  });

  res.status(201).json({ ok: true });
});

router.post("/submit", async (req, res) => {
  const { code, text, confirmations } = req.body || {};
  const course = courseByCode(code);
  if (!course) return res.status(404).json({ error: "Unknown course." });

  const records = await loadRecords(req.userId);
  if (!isEnrolled(records, code) || isLocked(records, code)) {
    return res.status(409).json({ error: "Workspace locked. Enrol and clear prerequisites first." });
  }
  const currentStatus = statusFor(records, code);
  if (["Approved", "Pending Verification", "Verified", "Evidence Issued"].includes(currentStatus)) {
    return res.status(409).json({ error: "This mission has already been submitted for review." });
  }

  const missing = [];
  const done = stagesFor(records, code).size;
  if (done < LOOP.length) missing.push(LOOP.length - done + " task checkpoints");
  const hasDraft = records.some((r) => r.unitCode === code && r.recordType === "draft");
  if (!hasDraft) missing.push("saved work or evidence");
  const allChecked = Array.isArray(confirmations) && confirmations.length === 3 && confirmations.every(Boolean);
  if (!allChecked) missing.push("all evidence confirmations");
  const cleanText = String(text || "").trim();
  if (!cleanText) missing.push("submission summary");

  if (missing.length) {
    return res.status(400).json({ error: "Submission blocked: add " + missing.join(", ") + "." });
  }

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "submission",
      unitCode: course.code,
      missionId: course.missionId,
      status: "Submitted",
      submissionText: cleanText
    }
  });

  const updated = await loadRecords(req.userId);
  res.status(201).json({ progress: summarizeAll(updated) });
});

const REVIEW_TRANSITIONS = {
  Submitted: "In Review",
  "In Review": ["Request Changes", "Approved"],
  Approved: "Pending Verification",
  "Pending Verification": "Verified",
  Verified: "Evidence Issued"
};

router.post("/review", async (req, res) => {
  const { code, status: nextStatus } = req.body || {};
  const course = courseByCode(code);
  if (!course) return res.status(404).json({ error: "Unknown course." });

  const records = await loadRecords(req.userId);
  const current = statusFor(records, code);
  const allowed = REVIEW_TRANSITIONS[current];
  const isAllowed = Array.isArray(allowed) ? allowed.includes(nextStatus) : allowed === nextStatus;
  if (!isAllowed) {
    return res.status(409).json({ error: "That review action is not available from the current status." });
  }

  const isVerification = ["Verified", "Evidence Issued"].includes(nextStatus);
  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: isVerification ? "verification" : "review",
      unitCode: course.code,
      missionId: course.missionId,
      status: nextStatus,
      reviewerComment:
        nextStatus === "Request Changes"
          ? "Please add clearer failure-case evidence and resubmit."
          : "Demo reviewer action recorded."
    }
  });

  const updated = await loadRecords(req.userId);
  res.status(201).json({ progress: summarizeAll(updated) });
});

router.post("/tool-use", async (req, res) => {
  const { toolName, toolCategory, note, savedPromptText } = req.body || {};
  if (!toolName) return res.status(400).json({ error: "Missing tool name." });

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "tool_use",
      toolName,
      toolCategory: toolCategory || "",
      toolNote: note || "",
      savedPromptText: savedPromptText || ""
    }
  });

  res.status(201).json({ ok: true });
});

module.exports = router;
