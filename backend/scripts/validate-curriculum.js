#!/usr/bin/env node
const { checkCurriculumGraph } = require("../src/curriculumHealth");
const { COURSES, BUNDLES, courseByCode } = require("../src/data");

const problems = checkCurriculumGraph();

// Bundles reference course codes too — check those against the real catalogue.
BUNDLES.forEach((b) => {
  b.includes.forEach((code) => {
    if (!courseByCode(code)) problems.push(`Bundle ${b.id} references unknown course ${code}`);
  });
});

console.log(`Checked ${COURSES.length} courses and ${BUNDLES.length} bundles.`);

if (problems.length) {
  console.error(`\nFound ${problems.length} curriculum problem(s):`);
  problems.forEach((p) => console.error("  - " + p));
  process.exit(1);
}

console.log("Curriculum graph is healthy: unique course codes, valid prerequisite references, no circular chains, all bundle references resolve.");
