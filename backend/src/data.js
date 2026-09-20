// Curriculum, bundle and rollout data drawn from the DigitalBurj Academy
// planning PDF ("Academic & commercial structure", September 2026).
// DB-00..DB-22 are the canonical existing program units; PF-*, PC-* and
// AD-* are the PDF's proposed professional catalogue additions. Maturity
// values (Active/Planning/Proposed/Restricted) are load-bearing: only
// "Active" courses can ever be enrolled in — see progress.js.

const STAGES = ["BRIEF", "LEARN", "INVESTIGATE", "TRY", "BUILD", "BREAK", "FIX", "TEST", "EXPLAIN", "DEFEND", "SHIP", "EVIDENCE"];

const STAGE_HELP = {
  BRIEF: "Confirm the fictional scenario, users, scope and constraints.",
  LEARN: "Review only the concepts needed for this decision.",
  INVESTIGATE: "Find facts, assumptions and policy boundaries.",
  TRY: "Make a small, reversible first attempt.",
  BUILD: "Produce the practical output or workplace record.",
  BREAK: "Deliberately test a failure, exception or missing item.",
  FIX: "Correct the observed weakness and record the change.",
  TEST: "Show normal-path and failure-path results.",
  EXPLAIN: "Explain the decisions, trade-offs and evidence.",
  DEFEND: "Prepare to answer challenge questions against the rubric.",
  SHIP: "Package a usable handover, report, record or service outcome.",
  EVIDENCE: "Assemble the complete evidence pack for review."
};

// Existing DB-00..DB-22 canonical program units.
const DB_RAW = [
  ["DB-00", "Digital Foundations", 57, "L1", "None", "Active"],
  ["DB-01", "Real-World Problem Solving & Product Thinking", 36, "L1", "DB-00", "Active"],
  ["DB-02", "Professional Web Development", 115, "L2", "DB-01", "Active"],
  ["DB-03", "Backend, APIs & Databases", 115, "L2", "DB-02", "Active"],
  ["DB-04", "AI-Native Software Development", 64, "L3", "DB-03", "Planning"],
  ["DB-05", "Data, PostgreSQL & Business Data", 105, "L3", "DB-03", "Planning"],
  ["DB-06", "Production Engineering", 72, "L3", "DB-03", "Planning"],
  ["DB-07", "Secure Software & Cybersecurity", 70, "L3", "DB-03", "Planning"],
  ["DB-08", "Software Testing & Quality Engineering", 65, "L3", "DB-02", "Planning"],
  ["DB-09", "Payments, Ledgers, Webhooks & Money", 60, "L3", "DB-03", "Planning"],
  ["DB-10", "Real-Time Applications", 55, "L3", "DB-03", "Planning"],
  ["DB-11", "Documents, Uploads & Storage", 45, "L3", "DB-03", "Planning"],
  ["DB-12", "AI Agents, Automation & Business Workflows", 63, "L3", "DB-04", "Planning"],
  ["DB-13", "CRM / ERP / HRM", 52, "L2", "DB-00", "Planning"],
  ["DB-14", "Mobile App Builder", 58, "L2", "DB-02", "Planning"],
  ["DB-15", "Search & AI Visibility Engineering", 45, "L2", "DB-01", "Planning"],
  ["DB-16", "Social Media & Content Operations", 62, "L2", "DB-01", "Planning"],
  ["DB-17", "From Idea to MVP", 64, "L4", "DB-01", "Planning"],
  ["DB-18", "Build, Launch & Grow", 58, "L4", "DB-17", "Planning"],
  ["DB-19", "Digital Transformation Consulting", 72, "L4", "DB-13", "Planning"],
  ["DB-20", "Client Delivery & Freelancing", 48, "L4", "DB-17", "Planning"],
  ["DB-21", "Business Operations & Practice", 37, "L2", "DB-00", "Planning"],
  ["DB-22", "Professional Challenge", 72, "L5", "DB-17", "Restricted"]
];

// Proposed professional foundation — common core, PF-01..PF-10.
const PF_RAW = [
  ["PF-01", "Professional English for the Workplace", 15, 7],
  ["PF-02", "Business Email Writing & Communication", 8, 5],
  ["PF-03", "Excel for Office Work", 15, 9],
  ["PF-04", "Word & Business Documentation", 8, 5],
  ["PF-05", "Professional Customer Service", 10, 7],
  ["PF-06", "Office Administration Fundamentals", 12, 7],
  ["PF-07", "Business Mathematics & Calculations", 10, 5],
  ["PF-08", "Workplace Ethics, Confidentiality & Data Protection", 8, 5],
  ["PF-09", "Job Search & Interview Preparation", 8, 5],
  ["PF-10", "Workplace AI & Productivity Tools", 10, 7]
];

// Proposed professional career catalogue, PC-*.
const PC_RAW = [
  ["PC-RE01", "Real Estate & Property Management", 109, 49],
  ["PC-AD01", "Office Administration & Executive Assistance", 108, 39],
  ["PC-AC01", "Accounting & Bookkeeping", 157, 49],
  ["PC-LG01", "Freight Forwarding & Logistics", 179, 59],
  ["PC-DC01", "Document Clearing & Government Services Administration", 123, 49],
  ["PC-BF01", "Banking & Financial Services Operations", 147, 59],
  ["PC-IN01", "Insurance Operations & Administration", 119, 49],
  ["PC-IM01", "Immigration & Mobility Administration", 114, 49],
  ["PC-HR01", "Human Resources & Recruitment", 142, 49],
  ["PC-SM01", "SME Business Operations", 80, 39],
  ["PC-SA01", "Sales & Business Development", 75, 35],
  ["PC-CS01", "Customer Service & Call Centre Operations", 60, 29],
  ["PC-PC01", "Procurement & Purchasing", 90, 39],
  ["PC-WH01", "Warehouse & Inventory Management", 85, 39],
  ["PC-EC01", "E-Commerce Operations", 80, 39],
  ["PC-RT01", "Retail & Store Operations", 70, 29],
  ["PC-HT01", "Hospitality Administration", 85, 39],
  ["PC-TC01", "Travel & Tourism Operations", 90, 39],
  ["PC-HC01", "Healthcare Administration", 90, 39],
  ["PC-FM01", "Facilities Management Administration", 80, 39],
  ["PC-CC01", "Construction Project Administration", 90, 39],
  ["PC-PR01", "Payroll & Employee Benefits Administration", 85, 39],
  ["PC-EX01", "Import & Export Operations", 90, 39],
  ["PC-CM01", "Commercial Contracts Administration", 80, 39],
  ["PC-AR01", "Accounts Receivable & Collections", 70, 35]
];

// Advanced and international pathways, AD-*.
const AD_RAW = [
  ["AD-AC01", "Advanced Accounting & Financial Operations", 150, 79],
  ["AD-LG01", "Advanced Freight Forwarding & Trade Operations", 150, 79],
  ["AD-HR01", "Advanced HR & Payroll Operations", 140, 69],
  ["AD-RE01", "Advanced Real Estate Operations", 120, 69],
  ["AD-SM01", "SME Operations & Business Management", 140, 69],
  ["AD-PC01", "Advanced Procurement & Supply Chain", 150, 79],
  ["AD-BA01", "Business Analytics & Financial Reporting", 150, 79],
  ["AD-AI01", "AI-Powered Business Operations", 140, 79]
];

const COURSES = [
  ...DB_RAW.map(([code, title, hours, level, prereq, maturity]) => ({
    code,
    title,
    family: "Technology",
    hours,
    level,
    prereq,
    maturity,
    price: code === "DB-22" ? null : null,
    skills: "requirements, testing, evidence",
    modules: ["Foundations", "Scenario practice", "Evidence and assessment"],
    missionId: code + "-mission-01",
    missionKind: code === "DB-22" ? "Defend" : "Build"
  })),
  ...PF_RAW.map(([code, title, hours, price]) => ({
    code,
    title,
    family: "Professional Foundation",
    hours,
    level: "L1",
    prereq: "None",
    maturity: "Proposed",
    price,
    skills: "workplace communication, accuracy, professionalism",
    modules: ["Foundation instruction", "Guided practice", "Workplace exercise"],
    missionId: code + "-mission-01",
    missionKind: "Build"
  })),
  ...PC_RAW.map(([code, title, hours, price]) => ({
    code,
    title,
    family: "Professional Career",
    hours,
    level: "L2",
    prereq: "Foundation diagnostic",
    maturity: "Proposed",
    price,
    skills: "role fundamentals, simulated casework, integrated assessment",
    modules: ["Role fundamentals", "Simulated workplace cases", "Integrated final assessment"],
    missionId: code + "-mission-01",
    missionKind: "Build"
  })),
  ...AD_RAW.map(([code, title, hours, price]) => ({
    code,
    title,
    family: "Advanced Professional",
    hours,
    level: "L3",
    prereq: "Foundation diagnostic",
    maturity: "Proposed",
    price,
    skills: "specialist analysis, cross-functional case work, assessed evidence",
    modules: ["Specialist analysis", "Cross-functional case work", "Assessed evidence pack"],
    missionId: code + "-mission-01",
    missionKind: "Defend"
  }))
];

// Bundles credit any course a learner already owns — see routes/bundles.js.
const BUNDLES = [
  { id: "b-tech-found", name: "Digital Foundations", price: 25, hours: 57, includes: ["DB-00"], family: "Technology" },
  { id: "b-frontend", name: "Frontend Developer", price: 49, hours: 115, includes: ["DB-02"], family: "Technology" },
  { id: "b-backend", name: "Backend Developer", price: 59, hours: 115, includes: ["DB-03"], family: "Technology" },
  { id: "b-ai", name: "AI Automation & Applications", price: 59, hours: 127, includes: ["DB-04", "DB-12"], family: "Technology" },
  { id: "b-data", name: "Data Analyst Foundation", price: 49, hours: 105, includes: ["DB-05"], family: "Technology" },
  { id: "b-mkt", name: "Digital Marketing", price: 49, hours: 107, includes: ["DB-15", "DB-16"], family: "Technology" },
  { id: "b-bizsys", name: "Business Systems Specialist", price: 49, hours: 89, includes: ["DB-13", "DB-21"], family: "Technology" },
  { id: "b-pf", name: "Professional Foundation Bundle", price: 29, hours: 104, includes: PF_RAW.map((x) => x[0]), family: "Professional Foundation" },
  {
    id: "b-intl-wr",
    name: "International Workplace Readiness",
    price: 25,
    hours: 79,
    includes: [],
    family: "Pathway",
    countryModules: ["UAE", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "India", "Pakistan", "Bangladesh"]
  },
  { id: "b-office", name: "Office Career Starter", price: 49, hours: 108, includes: ["PF-01", "PF-02", "PF-03", "PF-06", "PC-AD01"], family: "Career Starter" },
  { id: "b-acc", name: "Accounting Career Starter", price: 59, hours: 157, includes: ["PF-03", "PF-07", "PC-AC01"], family: "Career Starter" },
  { id: "b-log", name: "International Logistics Career", price: 69, hours: 179, includes: ["PF-01", "PF-08", "PC-LG01"], family: "Career Starter" },
  { id: "b-re", name: "Real Estate Career Starter", price: 59, hours: 109, includes: ["PF-05", "PC-RE01"], family: "Career Starter" },
  { id: "b-hr", name: "HR & Administration Career", price: 59, hours: 142, includes: ["PF-06", "PC-HR01"], family: "Career Starter" },
  { id: "b-bank", name: "Banking Operations Career", price: 69, hours: 147, includes: ["PF-03", "PF-05", "PC-BF01"], family: "Career Starter" }
];

const CAPABILITY_LEVELS = [
  { code: "L1", label: "L1 Guided basics", description: "Understanding and supervised execution." },
  { code: "L2", label: "L2 Scenario capability", description: "Performance in realistic scenarios." },
  { code: "L3", label: "L3 Published assessment", description: "Assessed work passing published criteria." },
  { code: "L4", label: "L4 Production delivery", description: "Work meeting production-level delivery standards." },
  { code: "L5", label: "L5 Repeated verified delivery", description: "Repeated, independently verified real delivery." }
];

const PHASES = [
  {
    name: "Phase 1 · Shared foundations",
    build: "Catalogue, entitlements, learning player, common professional foundation, office, accounting, logistics, HR and customer service bundles.",
    gate: "Working assessments, support, refunds, credential accuracy and country-appropriate payment.",
    status: "Planning"
  },
  {
    name: "Phase 2 · Industry programs",
    build: "Real estate, document clearing, procurement, banking, insurance and immigration administration.",
    gate: "Reviewed industry content and country-specific regulatory boundaries.",
    status: "Planning"
  },
  {
    name: "Phase 3 · Full curriculum integration",
    build: "Convert remaining DB-00 to DB-22 program units into course products; add combined technology-professional bundles.",
    gate: "Curriculum graph and prerequisites tested; no duplicate entitlements.",
    status: "Planning"
  },
  {
    name: "Phase 4 · Verification and labs",
    build: "Practical simulation environments, independent verification, opt-in talent evidence and jobs integration.",
    gate: "Data protection, reviewer separation, auditability and explicit user consent.",
    status: "Setup required"
  }
];

const LABS = ["Virtual Office", "Accounting", "Freight Forwarding", "Real Estate", "HR", "Banking Operations", "Insurance Operations", "Document Processing", "Procurement", "Customer Service"];

// Section 11 of the planning PDF: audience -> recommended first step -> progression.
const AUDIENCES = [
  {
    code: "after_12th",
    label: "After 12th grade",
    firstStep: "Diagnostic + essential office/digital skills",
    progression: "Entry-level office, sales, service, retail, logistics administration pathways.",
    recommendedBundle: "b-office"
  },
  {
    code: "graduate",
    label: "Graduate seeking work",
    firstStep: "Prior-knowledge assessment + field-specific courses",
    progression: "Role-focused bundle, workplace simulation, assessed evidence.",
    recommendedBundle: "b-hr"
  },
  {
    code: "professional",
    label: "Working professional",
    firstStep: "Skip demonstrated basics",
    progression: "Specialist module or advanced pathway.",
    recommendedBundle: null
  },
  {
    code: "career_changer",
    label: "Career changer",
    firstStep: "Foundation gaps + transparent prerequisite check",
    progression: "Targeted job-role pathway with practical assessment.",
    recommendedBundle: "b-pf"
  },
  {
    code: "international",
    label: "International/GCC job seeker",
    firstStep: "Relevant occupation bundle",
    progression: "Optional country-specific employment and workplace-readiness material.",
    recommendedBundle: "b-intl-wr"
  },
  {
    code: "technology",
    label: "Technology learner",
    firstStep: "DB unit or technical learning path",
    progression: "Build, test, assess, independently verify and optionally publish evidence.",
    recommendedBundle: "b-tech-found"
  }
];

const TOOLS = [
  { name: "Canva", category: "Design", url: "https://www.canva.com", prompt: "Create a clear evidence board for this mission." },
  { name: "Figma", category: "Design", url: "", prompt: "Sketch one testable learner journey." },
  { name: "GitHub", category: "Code", url: "", prompt: "Document the project decision and test evidence." },
  { name: "Playwright", category: "Testing", url: "", prompt: "Write a normal-path and failure-path test plan." }
];

function courseByCode(code) {
  return COURSES.find((c) => c.code === code) || null;
}

function bundleById(id) {
  return BUNDLES.find((b) => b.id === id) || null;
}

module.exports = {
  STAGES,
  STAGE_HELP,
  COURSES,
  BUNDLES,
  CAPABILITY_LEVELS,
  PHASES,
  LABS,
  AUDIENCES,
  TOOLS,
  courseByCode,
  bundleById
};
