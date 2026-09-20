// Foundation diagnostic question bank. Correct answers stay server-side —
// routes/diagnostic.js strips them before sending questions to the client,
// and grades submitted answer indices against this module directly.
// This replaces a self-declared "I've done a diagnostic" checkbox with an
// actual assessed checkpoint, matching the PDF's evidence-led principle
// that no capability claim should be self-attested.

const PASS_THRESHOLD = 3; // out of QUESTIONS.length

const QUESTIONS = [
  {
    id: "q1",
    prompt: "A client emails asking for an update on a task that isn't finished yet. What is the most professional reply?",
    options: [
      "Ignore it until the task is finished so there is good news to report.",
      "Reply with a short, honest status update and a realistic next check-in time.",
      "Reply saying it is finished to avoid a difficult conversation.",
      "Forward the email to a colleague without comment."
    ],
    correctIndex: 1
  },
  {
    id: "q2",
    prompt: "You need to share a spreadsheet so a colleague can review numbers but not accidentally change them. What should you do?",
    options: [
      "Give them edit access and ask them nicely not to change anything.",
      "Share a read-only or view-only copy, or protect the sheet before sharing.",
      "Email a screenshot of the whole file instead.",
      "Print it and post it to them."
    ],
    correctIndex: 1
  },
  {
    id: "q3",
    prompt: "A workplace record contains a customer's personal contact details. What does basic data protection practice require?",
    options: [
      "Share it with anyone in the company who asks, since it's for work.",
      "Keep it only where authorized, limit who can see it, and avoid posting it publicly.",
      "Copy it into a personal notebook for convenience.",
      "Delete it immediately regardless of business need."
    ],
    correctIndex: 1
  },
  {
    id: "q4",
    prompt: "You are asked to test a new booking form. What is the most complete way to test it?",
    options: [
      "Only try the one example the designer showed you.",
      "Try a normal, valid booking AND at least one invalid or edge case (e.g. empty field, wrong date).",
      "Assume it works because it looks correct.",
      "Ask someone else to test it and take their word for it."
    ],
    correctIndex: 1
  },
  {
    id: "q5",
    prompt: "Your task instructions are unclear about one requirement. What is the best first step?",
    options: [
      "Guess and proceed without telling anyone.",
      "Stop working entirely until someone notices.",
      "Ask a specific clarifying question, then proceed once you have an answer.",
      "Do the task twice, once each possible way, without telling anyone."
    ],
    correctIndex: 2
  }
];

function publicQuestions() {
  return QUESTIONS.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options }));
}

function grade(answers) {
  let score = 0;
  QUESTIONS.forEach((q) => {
    if (answers && answers[q.id] === q.correctIndex) score += 1;
  });
  return { score, total: QUESTIONS.length, passed: score >= PASS_THRESHOLD };
}

module.exports = { publicQuestions, grade, PASS_THRESHOLD, QUESTION_COUNT: QUESTIONS.length };
