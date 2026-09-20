const express = require("express");
const { COURSES, TOOLS, STAGES, STAGE_HELP, CAPABILITY_LEVELS, BUNDLES, PHASES, LABS, AUDIENCES } = require("../data");

const router = express.Router();

router.get("/courses", (req, res) => {
  res.json({ courses: COURSES });
});

router.get("/bundles", (req, res) => {
  res.json({ bundles: BUNDLES });
});

router.get("/tools", (req, res) => {
  res.json({ tools: TOOLS });
});

router.get("/loop", (req, res) => {
  res.json({ loop: STAGES, help: STAGE_HELP });
});

router.get("/capability-levels", (req, res) => {
  res.json({ levels: CAPABILITY_LEVELS });
});

router.get("/phases", (req, res) => {
  res.json({ phases: PHASES, labs: LABS });
});

router.get("/audiences", (req, res) => {
  res.json({ audiences: AUDIENCES });
});

module.exports = router;
