const bcrypt = require("bcryptjs");
const prisma = require("./db");

// Local-demo-only convenience so the reviewer/verifier/admin workflows are
// testable without a manual bootstrap step. Roles can ONLY be granted this
// way or by an existing admin via PATCH /api/admin/users/:id/role — never by
// the account itself. Disabled by default in production; explicitly opt in
// with SEED_DEMO_STAFF=true if a production deployment genuinely wants it
// (not recommended — create real staff accounts via the admin panel instead).
const DEMO_PASSWORD = process.env.DEMO_STAFF_PASSWORD || "academy-demo-2026";

const DEMO_STAFF = [
  { role: "reviewer", email: "reviewer.demo@digitalburj.local", name: "Demo Reviewer" },
  { role: "verifier", email: "verifier.demo@digitalburj.local", name: "Demo Verifier" },
  { role: "admin", email: "admin.demo@digitalburj.local", name: "Demo Admin" }
];

async function seedDemoStaff() {
  const explicit = process.env.SEED_DEMO_STAFF;
  const shouldSeed = explicit === "true" || (explicit !== "false" && process.env.NODE_ENV !== "production");
  if (!shouldSeed) return;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const staff of DEMO_STAFF) {
    const existing = await prisma.user.findUnique({ where: { email: staff.email } });
    if (existing) {
      if (existing.role !== staff.role) {
        await prisma.user.update({ where: { id: existing.id }, data: { role: staff.role } });
      }
      continue;
    }
    await prisma.user.create({
      data: { name: staff.name, email: staff.email, passwordHash, role: staff.role, consentGiven: true }
    });
  }
  console.log(
    `Seeded demo staff accounts (password: "${DEMO_PASSWORD}"): ` +
      DEMO_STAFF.map((s) => s.email).join(", ")
  );
}

module.exports = { seedDemoStaff, DEMO_STAFF, DEMO_PASSWORD };
