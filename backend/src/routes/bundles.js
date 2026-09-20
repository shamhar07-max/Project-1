const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../auth");
const { BUNDLES, bundleById } = require("../data");
const { courseState, summarizeAll } = require("../progress");

const router = express.Router();

router.use(requireAuth);

async function loadRecords(userId) {
  return prisma.record.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
}

function bundlePreview(records, bundle) {
  const lines = bundle.includes.map((code) => ({ code, state: courseState(records, code) }));
  return {
    ...bundle,
    courses: lines,
    ownedCount: lines.filter((l) => l.state === "Enrolled" || l.state === "Completed").length,
    grantableCount: lines.filter((l) => l.state === "Available").length
  };
}

router.get("/status", async (req, res) => {
  const records = await loadRecords(req.userId);
  res.json({ bundles: BUNDLES.map((b) => bundlePreview(records, b)) });
});

// Grants entitlement (an enrolment record) for every included course that is
// currently Active/eligible and not already owned — never re-grants or
// re-charges for content the learner already has, and never silently
// "succeeds" on a course that is still Locked/Planning/Proposed/Restricted.
// No payment is collected here; per the PDF, checkout itself is
// setup-required, but the entitlement logic it will sit behind should still
// be correct on its own.
router.post("/:id/enrol", async (req, res) => {
  const bundle = bundleById(req.params.id);
  if (!bundle) return res.status(404).json({ error: "Unknown bundle." });

  if (!bundle.includes.length) {
    return res.status(409).json({ error: "This bundle's content is not yet mapped to individually enrollable courses." });
  }

  const records = await loadRecords(req.userId);
  const granted = [];
  const alreadyOwned = [];
  const notYetAvailable = [];

  for (const code of bundle.includes) {
    const state = courseState(records, code);
    if (state === "Enrolled" || state === "Completed") {
      alreadyOwned.push(code);
    } else if (state === "Available") {
      granted.push(code);
    } else {
      notYetAvailable.push({ code, state });
    }
  }

  for (const code of granted) {
    await prisma.record.create({
      data: {
        userId: req.userId,
        recordType: "enrolment",
        unitCode: code,
        status: "Enrolled",
        bundleId: bundle.id,
        submissionText: `Enrolled via bundle: ${bundle.name}`
      }
    });
  }

  const updated = await loadRecords(req.userId);
  res.status(granted.length ? 201 : 200).json({
    granted,
    alreadyOwned,
    notYetAvailable,
    progress: summarizeAll(updated)
  });
});

module.exports = router;
