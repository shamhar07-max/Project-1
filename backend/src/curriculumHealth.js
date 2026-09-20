const { COURSES } = require("./data");

// A prerequisite of "None" or "Foundation diagnostic" is a real terminal
// condition (no course to look up), not a dangling reference.
const TERMINAL_PREREQS = new Set(["None", "Foundation diagnostic"]);

function checkCurriculumGraph() {
  const byCode = new Map();
  const problems = [];

  COURSES.forEach((c) => {
    if (byCode.has(c.code)) problems.push(`Duplicate course code: ${c.code}`);
    byCode.set(c.code, c);
  });

  const visiting = new Set();
  const visited = new Set();

  function dfs(code, trail) {
    if (visiting.has(code)) {
      problems.push(`Circular prerequisite: ${trail.concat(code).join(" → ")}`);
      return;
    }
    if (visited.has(code)) return;
    const c = byCode.get(code);
    if (!c) {
      problems.push(`Unknown course reference: ${code}`);
      return;
    }
    visiting.add(code);
    if (!TERMINAL_PREREQS.has(c.prereq)) {
      if (!byCode.has(c.prereq)) {
        problems.push(`${c.code} references missing prerequisite ${c.prereq}`);
      } else {
        dfs(c.prereq, trail.concat(code));
      }
    }
    visiting.delete(code);
    visited.add(code);
  }

  byCode.forEach((_, code) => dfs(code, []));

  COURSES.forEach((c) => {
    if (!c.modules || !c.modules.length) problems.push(`${c.code} has no modules defined`);
    if (!["Active", "Planning", "Proposed", "Restricted"].includes(c.maturity)) {
      problems.push(`${c.code} has an unrecognized maturity value: ${c.maturity}`);
    }
    if (!/^L[1-5]$/.test(c.level)) problems.push(`${c.code} has an unrecognized level value: ${c.level}`);
  });

  return problems;
}

module.exports = { checkCurriculumGraph };
