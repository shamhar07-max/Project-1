const LOOP = ["Brief", "Learn", "Investigate", "Try", "Build", "Break", "Fix", "Test", "Explain", "Defend", "Ship", "Evidence"];

const STAGE_HELP = {
  Brief: "Understand the situation and scope the mission.",
  Learn: "Get only the essential context.",
  Investigate: "Find constraints, facts, and assumptions.",
  Try: "Make a safe first attempt.",
  Build: "Create the working result.",
  Break: "Find a failure case on purpose.",
  Fix: "Improve what failed.",
  Test: "Show normal and failure results.",
  Explain: "Describe your reasoning.",
  Defend: "Prepare review answers.",
  Ship: "Prepare a usable handover.",
  Evidence: "Package proof of the work."
};

const COURSES = [
  ["DB-00", "Digital Foundations", "Foundation", "L1", "None", "Decision"],
  ["DB-01", "Real-World Problem Solving & Product Thinking", "Product", "L1", "DB-00", "Decision"],
  ["DB-02", "Professional Web Development", "Software Engineering", "L2", "DB-01", "Build"],
  ["DB-03", "Backend, APIs & Databases", "Software Engineering", "L2", "DB-02", "Build"],
  ["DB-04", "AI-Native Software Development", "AI Engineering", "L3", "DB-03", "Explain"],
  ["DB-05", "Data, PostgreSQL & Business Data", "Data & Analytics", "L3", "DB-03", "Test"],
  ["DB-06", "Production Engineering", "DevOps / Cloud / Production", "L3", "DB-03", "Test"],
  ["DB-07", "Secure Software & Cybersecurity", "Cybersecurity", "L3", "DB-03", "Break"],
  ["DB-08", "Software Testing & Quality Engineering", "Quality Engineering", "L3", "DB-02", "Test"],
  ["DB-17", "From Idea to MVP", "Product / Founder", "L4", "DB-01", "Build"],
  ["DB-22", "Professional Challenge", "Master", "L5", "DB-17", "Defend"]
].map(([code, title, family, level, prereq, kind]) => ({
  code,
  title,
  family,
  level,
  prereq,
  kind,
  skills: "requirements, testing, evidence",
  missionId: code + "-mission-01"
}));

const TOOLS = [
  { name: "Canva", category: "Design", url: "https://www.canva.com", prompt: "Create a clear evidence board for this mission." },
  { name: "Figma", category: "Design", url: "", prompt: "Sketch one testable learner journey." },
  { name: "GitHub", category: "Code", url: "", prompt: "Document the project decision and test evidence." },
  { name: "Playwright", category: "Testing", url: "", prompt: "Write a normal-path and failure-path test plan." }
];

const CAPABILITY_LEVELS = [
  "L1 Guided basics",
  "L2 Scenario capability",
  "L3 Published assessment",
  "L4 Production delivery",
  "L5 Repeated verified delivery"
];

function courseByCode(code) {
  return COURSES.find((c) => c.code === code) || null;
}

module.exports = { LOOP, STAGE_HELP, COURSES, TOOLS, CAPABILITY_LEVELS, courseByCode };
