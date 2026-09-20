const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../auth");
const { publicQuestions, grade, PASS_THRESHOLD, QUESTION_COUNT } = require("../diagnosticQuestions");

const router = express.Router();

router.use(requireAuth);

router.get("/questions", (req, res) => {
  res.json({ questions: publicQuestions(), passThreshold: PASS_THRESHOLD, questionCount: QUESTION_COUNT });
});

router.get("/status", async (req, res) => {
  const best = await prisma.record.findFirst({
    where: { userId: req.userId, recordType: "diagnostic", passed: true },
    orderBy: { createdAt: "asc" }
  });
  res.json({ passed: !!best, record: best || null });
});

router.post("/submit", async (req, res) => {
  const { answers } = req.body || {};
  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Submit an answer for each question." });
  }

  const result = grade(answers);

  const record = await prisma.record.create({
    data: {
      userId: req.userId,
      recordType: "diagnostic",
      score: result.score,
      passed: result.passed,
      submissionText: `Foundation diagnostic: ${result.score}/${result.total}`
    }
  });

  res.status(201).json({ ...result, record });
});

module.exports = router;
