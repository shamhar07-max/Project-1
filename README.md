# DigitalBurj Academy

A full-stack rebuild of the DigitalBurj Academy prototype: a "practical capability" learning
platform where learners work through 11 courses, each driven by a 12-stage mission loop
(Brief → Learn → Investigate → Try → Build → Break → Fix → Test → Explain → Defend → Ship →
Evidence). Work moves through submission, review, approval, verification, and issued evidence,
with prerequisite courses locking until evidence is issued for the course before them.

The original prototype was a single static HTML file that kept all state in `localStorage`.
This version splits it into a real client/server application:

- **`backend/`** — Node.js + Express API with a SQLite database (via Prisma), real user
  accounts (bcrypt-hashed passwords, JWT session cookies), and server-side validation of every
  workflow rule (prerequisite locks, checkpoint ordering, submission requirements, review-state
  transitions).
- **`frontend/`** — React + Vite single-page app (React Router, Tailwind CSS) that talks to the
  API. No application state lives in the browser beyond the session cookie; everything else is
  fetched from the server.

## Project structure

```
backend/
  prisma/schema.prisma   # User + Record tables
  src/
    data.js              # Static course catalogue, tool library, mission loop stages
    progress.js          # Derives per-course status/locking/stage progress from records
    auth.js               # JWT cookie helpers + auth middleware
    routes/auth.js        # Register / sign in / demo / profile / reviewer-mode / reset
    routes/catalogue.js   # Courses, tools, loop stages, capability levels
    routes/records.js     # Enrol, checkpoint, draft, submit, review, tool-use
    server.js
frontend/
  src/
    api.js                       # fetch wrapper for the backend API
    context/                     # Auth, app data (courses/progress/records), toast
    components/                  # AppShell (nav/header), CourseCard, Badge, route guards
    pages/                       # One component per screen (Access, Setup, Orientation,
                                  # Home, My Learning, Catalogue, Task Workspace, Tools,
                                  # Evidence, Capability Record, Profile, Admin/Reviewer)
```

## Running locally

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # adjust JWT_SECRET for anything beyond local use
npx prisma migrate deploy   # creates prisma/dev.db (SQLite)
npm run dev                 # http://localhost:4000
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
production the frontend is almost always served from a different origin than the API (e.g. a
static host + a separate API host) rather than through Vite's dev-only same-origin proxy. Set
`CLIENT_ORIGIN` to the exact origin (scheme + host) the frontend is deployed at — CORS with
credentials requires an exact match, not a wildcard.

## How the app works

- **Demo / Guest** creates a brand-new, isolated account instantly — no form to fill in.
- **Sign in / Register** takes an email + password: it signs you in if the account exists
  (checking the password), or creates the account on the spot if it doesn't (min. 6-character
  password).
- **Set up my learner profile** is the full registration form (name, email, password,
  experience level, availability, goal, consent) and leads into the orientation screen before
  the main app.
- Every learning action — enrolling, completing a mission-loop checkpoint, saving a draft,
  submitting for review, moving a submission through review → approval → verification →
  evidence issuance, using a tool — is a validated API call that appends an immutable record to
  the database. The **Evidence** page and **Capability Record** page are both derived entirely
  from that record history, exactly like the original prototype's evidence/failure passport.
- **Reviewer demo** is a per-user toggle (as in the original prototype) that reveals an
  Admin/Reviewer tab for moving your own submissions through the review pipeline — it's a demo
  of the review workflow, not a separate reviewer role over other users' work.
- **Reset demo state** permanently deletes your account and all of its records from the
  database (not just local storage).

## Notes on the rewrite

- All prerequisite-locking, checkpoint-ordering, and submission-completeness checks that used
  to run only in browser JavaScript are re-validated on the server (`backend/src/routes/records.js`),
  so the rules can't be bypassed by calling the API directly.
- Course/tool/mission-loop content is still a static catalogue (`backend/src/data.js`), matching
  the original prototype's constants — only the learner-generated data (accounts, enrolments,
  checkpoints, drafts, submissions, reviews, tool usage) is persisted per-user in the database.
