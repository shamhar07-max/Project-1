const express = require("express");
const prisma = require("../db");
const { requireRole } = require("../auth");
const { checkCurriculumGraph } = require("../curriculumHealth");
const { COURSES, BUNDLES, courseByCode } = require("../data");

const router = express.Router();

const VALID_ROLES = ["learner", "reviewer", "verifier", "admin"];

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

router.get("/users", ...requireRole("admin"), async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.json({ users: users.map(publicUser) });
});

router.patch("/users/:id/role", ...requireRole("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  const { role } = req.body || {};
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: "Role must be one of: " + VALID_ROLES.join(", ") + "." });
  }
  if (targetId === req.currentUser.id) {
    return res.status(400).json({ error: "You cannot change your own role — ask another admin." });
  }
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return res.status(404).json({ error: "User not found." });

  const updated = await prisma.user.update({ where: { id: targetId }, data: { role } });
  res.json({ user: publicUser(updated) });
});

router.get("/curriculum-health", ...requireRole("admin"), (req, res) => {
  const problems = checkCurriculumGraph();
  const bundleProblems = [];
  BUNDLES.forEach((b) => {
    b.includes.forEach((code) => {
      if (!courseByCode(code)) bundleProblems.push(`Bundle ${b.id} references unknown course ${code}`);
    });
  });
  res.json({
    courseCount: COURSES.length,
    bundleCount: BUNDLES.length,
    problems: problems.concat(bundleProblems)
  });
});

module.exports = router;
