const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../db");
const { setAuthCookie, clearAuthCookie, requireAuth } = require("../auth");

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    experienceLevel: user.experienceLevel,
    weeklyAvailability: user.weeklyAvailability,
    learnerGoals: user.learnerGoals,
    consentGiven: user.consentGiven,
    reviewerMode: user.reviewerMode,
    currentPage: user.currentPage,
    selectedCode: user.selectedCode
  };
}

function isValidEmail(email) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
}

// Full profile setup / registration (name, email, password, experience, availability, goals, consent)
router.post("/setup", async (req, res) => {
  const { name, email, password, experienceLevel, weeklyAvailability, learnerGoals, consent } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();

  if (!cleanName || !isValidEmail(cleanEmail) || !experienceLevel || !weeklyAvailability || !consent) {
    return res.status(400).json({ error: "Complete every field and confirm consent before continuing." });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Choose a password with at least 6 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Try signing in instead." });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      experienceLevel,
      weeklyAvailability,
      learnerGoals: String(learnerGoals || "").trim(),
      consentGiven: true,
      currentPage: "home",
      selectedCode: "DB-00"
    }
  });

  await prisma.record.create({
    data: {
      userId: user.id,
      recordType: "profile",
      status: "Active learner",
      submissionText: "Learner setup completed."
    }
  });

  setAuthCookie(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

// Sign in, or register on the fly if no account exists yet with this email.
router.post("/signin", async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!isValidEmail(cleanEmail) || !password) {
    return res.status(400).json({ error: "Enter a valid-looking email and a non-empty password." });
  }

  let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  if (user) {
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "That password does not match this account." });
    }
  } else {
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Choose a password with at least 6 characters to create your account." });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    user = await prisma.user.create({
      data: {
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        passwordHash,
        experienceLevel: "New to digital work",
        weeklyAvailability: "4–6 hours",
        learnerGoals: "Build practical confidence",
        consentGiven: true,
        currentPage: "home",
        selectedCode: "DB-00"
      }
    });
  }

  setAuthCookie(res, user.id);
  res.json({ user: publicUser(user) });
});

// Demo / Guest entry — creates a fresh, isolated demo account each time.
router.post("/demo", async (req, res) => {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const email = `guest-${suffix}@demo.digitalburj.local`;
  const passwordHash = await bcrypt.hash(suffix, 10);
  const user = await prisma.user.create({
    data: {
      name: "Demo Learner",
      email,
      passwordHash,
      experienceLevel: "New to digital work",
      weeklyAvailability: "4–6 hours",
      learnerGoals: "Build practical confidence",
      consentGiven: true,
      currentPage: "home",
      selectedCode: "DB-00"
    }
  });
  setAuthCookie(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: "Not signed in." });
  res.json({ user: publicUser(user) });
});

router.patch("/profile", requireAuth, async (req, res) => {
  const { name, learnerGoals, weeklyAvailability, currentPage, selectedCode } = req.body || {};
  const data = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof learnerGoals === "string") data.learnerGoals = learnerGoals.trim();
  if (typeof weeklyAvailability === "string" && weeklyAvailability.trim()) data.weeklyAvailability = weeklyAvailability.trim();
  if (typeof currentPage === "string") data.currentPage = currentPage;
  if (typeof selectedCode === "string") data.selectedCode = selectedCode;

  const user = await prisma.user.update({ where: { id: req.userId }, data });

  if (name || learnerGoals || weeklyAvailability) {
    await prisma.record.create({
      data: {
        userId: req.userId,
        recordType: "profile",
        status: "Profile updated",
        submissionText: "Learner profile updated."
      }
    });
  }

  res.json({ user: publicUser(user) });
});

router.patch("/reviewer-mode", requireAuth, async (req, res) => {
  const { reviewerMode } = req.body || {};
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { reviewerMode: !!reviewerMode }
  });
  res.json({ user: publicUser(user) });
});

router.post("/reset", requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.userId } });
  clearAuthCookie(res);
  res.json({ ok: true });
});

module.exports = router;
