const express = require("express");
const { COURSES, TOOLS, LOOP, STAGE_HELP, CAPABILITY_LEVELS } = require("../data");

const router = express.Router();

router.get("/courses", (req, res) => {
  res.json({ courses: COURSES });
});

router.get("/tools", (req, res) => {
  res.json({ tools: TOOLS });
});

router.get("/loop", (req, res) => {
  res.json({ loop: LOOP, help: STAGE_HELP });
});

router.get("/capability-levels", (req, res) => {
  res.json({ levels: CAPABILITY_LEVELS });
});

module.exports = router;
