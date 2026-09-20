# DigitalBurj Academy

A full-stack "practical capability" academy platform, built from the DigitalBurj Academy
planning PDF (*Academic & Commercial Structure*, September 2026): 66 course units across four
tracks (Technology, Professional Foundation, Professional Career, Advanced Professional),
15 bundles, a 12-stage mission loop per course (Brief → Learn → Investigate → Try → Build →
Break → Fix → Test → Explain → Defend → Ship → Evidence), and a submission lifecycle with real
separation of duties: **Draft → Submitted → In Review → Request Changes → Resubmitted →
Approved → Pending Verification → Verified → Evidence Issued**.

- **`backend/`** — Node.js + Express API, SQLite via Prisma, bcrypt-hashed passwords, JWT
  session cookies, and server-side enforcement of every workflow rule (prerequisite locks —
  including a real server-graded diagnostic, not a self-declared field — checkpoint ordering,
  submission completeness, and who is allowed to move a submission through which lifecycle
  status).
- **`frontend/`** — React + Vite SPA (React Router, Tailwind CSS). No application state lives in
  the browser beyond the session cookie.

## Roles — the central design decision

Earlier drafts of this app (and the reference prototype it was checked against) let a learner
flip their own role via a dropdown, and let the same account submit *and* review/approve its own
work. Neither is how a real academy works. This build fixes both:

- **Role is server-controlled, never self-service.** `learner` / `reviewer` / `verifier` /
  `admin` lives on the `User` row and is checked fresh from the database on every request
  (`backend/src/auth.js`'s `requireRole`). Only an admin can change someone else's role
  (`PATCH /api/admin/users/:id/role`) — never their own, to avoid an accidental lockout, and
  never their own submission even as staff (`forbidSelfAction` in `routes/queues.js`).
- **Reviewers and verifiers act on other learners' work**, surfaced through shared queues
  (`GET /api/queues/review`, `GET /api/queues/verify`), not a private per-user toggle.
- **No dead ends.** Approving a submission automatically forwards it into the verification
  queue, and verifying automatically issues evidence — both as a single authorized action by the
  reviewer/verifier, with a full two-record audit trail. (The two statuses the PDF names,
  `Pending Verification` and after `Verified`, had no UI trigger anywhere in the reference
  design, so nothing could ever reach `Evidence Issued`.)
- **Prerequisites are never self-attested.** A course whose prerequisite is "Foundation
  diagnostic" checks for an actual passing record from a server-graded quiz
  (`backend/src/diagnosticQuestions.js` — correct answers never reach the client), not a
  dropdown the learner fills in about themselves.
- **Course maturity is honest.** Only courses marked `Active` can ever be enrolled in.
  `Planning` / `Proposed` / `Restricted` are real catalogue entries (so prerequisite chains,
  pricing and bundle contents display correctly) but are never live — per the PDF's own
  instruction not to advertise a planned offering as available. Only DB-00 through DB-03 are
  `Active` today; everything else is catalogue-only until promoted.

Because of that, the reviewer/verifier/admin flows need real staff accounts to exercise. The
backend seeds three on startup (local development only — see **Demo accounts** below).

## Project structure

```
backend/
  prisma/schema.prisma       # User (role, audience) + Record (learner + acting-staff audit trail)
  scripts/validate-curriculum.js  # `npm run validate:curriculum` — catches bad hand-entered data
  src/
    data.js                  # 66-course catalogue, bundles, rollout phases, audiences (from the PDF)
    curriculumHealth.js       # duplicate-ID / dangling-prereq / circular-chain checks
    diagnosticQuestions.js    # Foundation Diagnostic question bank (answers never sent to client)
    progress.js               # Derives per-course status/maturity-gated state from records
    auth.js                   # JWT cookie + requireAuth/requireRole middleware
    seedDemoStaff.js          # Seeds reviewer.demo / verifier.demo / admin.demo (dev only)
    routes/
      auth.js                 # Register / sign in / demo / profile / reset
      catalogue.js             # Courses, bundles, tools, loop stages, capability levels, phases, audiences
      records.js               # Enrol, checkpoint, draft, submit (learner-only, self-scoped)
      queues.js                 # Review/verify queues + actions (staff acting on OTHER learners)
      bundles.js                 # Bundle status + dedup-aware entitlement grant
      diagnostic.js               # Diagnostic questions/status/submit
      admin.js                     # User list, role changes, curriculum health
frontend/
  src/
    api.js                    # fetch wrapper for the backend API
    context/                  # Auth, app data (catalogue/progress/records/bundles/diagnostic), toast
    components/                # AppShell (role-aware nav), CourseCard, Badge, ProtectedRoute, RoleRoute
    pages/                     # Access, Setup, Orientation, Home (role-aware), My Learning, Catalogue,
                                # Bundles, Diagnostic, Task Workspace, Tools, Evidence, Capability Record,
                                # Billing, Support, Profile, Review Queue, Verify Queue
    pages/admin/                # Users & Roles, Curriculum Health, Release & Rollout
```

## Running locally

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # adjust JWT_SECRET for anything beyond local use
npx prisma migrate deploy   # creates prisma/dev.db (SQLite)
npm run validate:curriculum # sanity-checks the 66-course data (should print "healthy")
npm run dev                 # http://localhost:4000 — also seeds demo staff accounts
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:4000`, so open
`http://localhost:5173` and the app will talk to the local API with no extra configuration.

### Production build

```bash
cd frontend && npm run build   # outputs frontend/dist — serve behind any static host
cd backend && npm start        # run the API behind a reverse proxy; set CLIENT_ORIGIN
```

Set `NODE_ENV=production` on the backend for a real deployment. This does two things: it marks
the auth cookie `Secure` (HTTPS-only), and it switches it to `SameSite=None` — required because
`SameSite=Lax` cookies are silently dropped on cross-origin `fetch`/XHR requests, and in
production the frontend is almost always served from a different origin than the API. Set
`CLIENT_ORIGIN` to the exact origin (scheme + host) the frontend is deployed at — CORS with
credentials requires an exact match, not a wildcard.

Demo staff seeding is **on by default outside production** and **off by default in
production** — set `SEED_DEMO_STAFF=true`/`false` to override either way. A real deployment
should create staff accounts through the admin panel instead of relying on the seeded,
publicly-documented demo password.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Reviewer | `reviewer.demo@digitalburj.local` | `academy-demo-2026` (or `DEMO_STAFF_PASSWORD`) |
| Verifier | `verifier.demo@digitalburj.local` | same |
| Admin | `admin.demo@digitalburj.local` | same |

Sign in as each from the same "Sign in / Register" form learners use — role isn't something you
pick, it's whatever the account already has.

## Trying the full lifecycle

1. **Demo / Guest** (or **Set up my learner profile**, which also asks which of the PDF's six
   learner audiences best describes you — it drives the Home page's recommended next step).
2. Enrol in **DB-00** (the only prerequisite-free `Active` course), complete all 12 checkpoints,
   save a draft, and submit for review.
3. Sign out, sign in as `reviewer.demo`, open **Review Queue**, "Start review" then "Approve" —
   this automatically forwards the submission into the verification queue.
4. Sign in as `verifier.demo`, open **Verify Queue**, "Verify & issue evidence."
5. Sign back in as your learner account — DB-00 now shows `Evidence Issued`, and **DB-01**
   (whose prerequisite is DB-00) is now `Available`.
6. Try the **Diagnostic** page (Home has a banner if you haven't passed it yet) — it's a real
   graded quiz gating any course whose prerequisite is "Foundation diagnostic" (currently the
   Professional Career and Advanced Professional tracks, all still `Proposed` maturity per the
   PDF, so nothing is enrollable through it yet — but the mechanism is real and ready).
7. Sign in as `admin.demo` for **Users & Roles** (change someone's role — never your own),
   **Curriculum Health** (validates the 66-course graph), and **Release & Rollout** (the PDF's
   four-phase plan).

## What's deliberately not implemented

The planning PDF proposes an 8-subdomain production topology
(`academy.`/`id.`/`app.`/`talent.`/`jobs.`/`admin.`/`support.`/`api.digitalburj.com`) and real
payment collection. Those are deployment and commerce infrastructure decisions, not application
logic — standing up 8 services and a payment processor for a single-app demo would be
disproportionate, and the PDF itself marks pricing/checkout as "setup-required." This app
implements the entitlement and workflow logic those subdomains would sit behind (a single
Express API playing the role of `api.`/`id.`/`app.`, and the SPA playing `academy.`/`app.`), and
is honest in the UI everywhere checkout, jobs matching, or a talent profile isn't actually live.
