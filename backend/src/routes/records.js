const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../auth");
const { courseByCode, STAGES } = require("../data");
const { stagesFor, statusFor, isEnrolled, isLocked, courseState, nextStage, summarizeAll } = require("../progress");

const router = express.Router();

async function loadRecords(userId) {
  return prisma.record.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
}

function evidenceRecordTypes() {
  return ["failure", "review", "submission", "verification", "checkpoint", "draft", "tool_use", "diagnostic"];
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
  const state = courseState(records, code);
  if (state === "Enrolled" || state === "Completed") {
    return res.json({ alreadyEnrolled: true });
  }
  if (state !== "Available") {
    const reason =
      state === "Locked"
        ? course.prereq === "Foundation diagnostic"
          ? "Pass the Foundation Diagnostic before enrolling in this course."
          : "This course remains locked until prerequisite evidence is issued for " + course.prereq + "."
        : `This course is currently "${state}" and is not open for enrolment.`;
    return res.status(409).json({ error: reason });
  }

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "enrolment",
      unitCode: course.code,
      missionId: course.missionId,
      missionKind: course.missionKind,
      status: "Enrolled",
      submissionText: "Learner enrolled in " + course.code
    }
  });

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
  if (!["Draft", "Request Changes"].includes(currentStatus)) {
    return res.status(409).json({ error: "This mission is already " + currentStatus.toLowerCase() + " — nothing to submit right now." });
  }

  const missing = [];
  const done = stagesFor(records, code).size;
  if (done < STAGES.length) missing.push(STAGES.length - done + " task checkpoints");
  const hasDraft = records.some((r) => r.unitCode === code && r.recordType === "draft");
  if (!hasDraft) missing.push("saved work or evidence");
  const allChecked = Array.isArray(confirmations) && confirmations.length === 3 && confirmations.every(Boolean);
  if (!allChecked) missing.push("all evidence confirmations");
  const cleanText = String(text || "").trim();
  if (!cleanText) missing.push("submission summary");

  if (missing.length) {
    return res.status(400).json({ error: "Submission blocked: add " + missing.join(", ") + "." });
  }

  // A resubmission after Request Changes is tracked distinctly from a first
  // submission, per the PDF's canonical lifecycle, so the audit trail shows
  // whether a correction cycle happened.
  const nextStatus = currentStatus === "Request Changes" ? "Resubmitted" : "Submitted";

  await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "submission",
      unitCode: course.code,
      missionId: course.missionId,
      status: nextStatus,
      submissionText: cleanText
    }
  });

  const updated = await loadRecords(req.userId);
  res.status(201).json({ status: nextStatus, progress: summarizeAll(updated) });
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
