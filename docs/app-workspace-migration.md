# Academy → Unified Workspace Migration Notes

**Status:** Draft · **Date:** 2026-09-20
**Source specs:** Part 1 `id.digitalburj.com` (DigitalBurj Passport) · Part 2 `app.digitalburj.com` (Unified Workspace)
**Scope:** What must change in this repo (Project-1, DigitalBurj Academy) when Passport
and the universal workspace go live. Nothing here changes current behavior — it is a
migration plan, not a refactor ticket.

---

## 1. Where Academy stands today

A self-contained product: own Express API + SQLite, own JWT cookie
(`db_academy_token`, 30-day TTL), own `/app/*` route namespace, own AppShell with
role-aware nav, own billing/support/evidence/record pages. This satisfied the
"one connected account" direction as far as a single app can: server-controlled
roles re-checked per request (`requireRole`), separation of duties
(`forbidSelfAction`), real prerequisite enforcement, honest maturity gating.

Under Parts 1+2, Academy becomes **one domain module inside**
`app.digitalburj.com`, authenticated by Passport. The job is to dissolve the
Academy-owned copies of platform concerns while keeping every domain guarantee
that makes Academy trustworthy.

---

## 2. Route migration map

Academy route today → destination under the platform. `academy.` keeps **public
marketing/SEO surfaces only** (Part 2 §99); everything authenticated moves into
`app.digitalburj.com/academy/*`.

| Today (Academy) | Target | Notes |
|---|---|---|
| `/access` (sign in / register / demo) | `id.digitalburj.com/login` + onboarding intent | Academy access page retires; `academy.` root becomes marketing entry that hands off to Passport with return-to |
| `/setup` (learner profile + audience) | Academy onboarding step under `app/academy/` | Audience selection is Academy-owned data — it stays, but runs post-Passport-auth |
| `/orientation` | `app/academy/overview` (first-run variant) | Merge into overview with §76-style welcome, no long product tour |
| `/app/home` (role-aware) | `app/academy/overview` | Learner / reviewer / verifier / admin variants map to §82 role-aware modules |
| `/app/learning` | `app/academy/courses` | "My Courses" |
| `/app/catalogue` | **Split:** public SEO catalogue on `academy.` + authenticated view in `app/academy/courses` | Do not put public course SEO pages inside the app (§99) |
| `/app/bundles` | Same split as catalogue | Entitlement logic stays Academy-owned |
| `/app/diagnostic` | `app/academy/` (placement TBD — likely under assessments) | Part 2 academy nav has no explicit diagnostic slot; resolve before migration |
| `/app/task/:code` | `app/academy/missions/...` + course-nested deep links (§13) | Deep-link format must survive: notifications link to exact objects (§104) |
| `/app/tools` | TBD | Tool Library has no Part 2 counterpart; propose `app/academy/resources` or retire into mission context |
| `/app/evidence` | `app/academy/evidence` | Direct map; add §83 cross-link "Add to Talent Profile" |
| `/app/record` | Read by Talent, not moved | Capability Record becomes the feed Talent's passport consumes (§83 loop) — Academy remains the writer |
| `/app/billing` | `app/billing` (shared, context-aware) | Personal Academy purchases must never land in an employer's ledger (§52) |
| `/app/support` | `app/support` (shared) | Tickets auto-attach domain/object/org context (§54, §115) |
| `/app/profile` | `id.digitalburj.com/account/profile` | Identity owns profile; Academy must stop storing name/timezone-class fields (§12, §88) |
| `/app/review-queue` | `app/academy/reviews` (reviewer/admin) | Stays Academy domain logic, new address |
| `/app/verify-queue` | `app/academy/verification` (verifier/admin) | Same |
| `/app/admin/*` (users, curriculum-health, rollout) | `admin.digitalburj.com` | App is not the admin panel (§114) |

---

## 3. Auth migration (Passport)

1. **Cookie → Passport session.** Retire `db_academy_token`. Academy API accepts
   Passport-issued identity (cross-subdomain handoff, Part 1 §25). The 30-day
   sliding JWT becomes Passport-managed sessions with revocation (§11).
2. **`requireRole(...roles)` → permission checks.** Map Academy roles onto Part 1
   §17/§18 + Part 2 §103 keys, e.g. `academy.enrollment.view`,
   `academy.assessment.submit`, `academy.review.decide`, `academy.verify.decide`.
   Role stays a domain concept; the *membership → role → permission* chain lives
   in identity. Hiding a queue button is presentation, never protection (§65).
3. **User table splits.** Identity owns users/profiles/emails/phones/credentials/
   MFA/sessions/consents. Academy keeps enrollments, records, entitlements,
   diagnostic results. `consentGiven` on User migrates to identity consents.
4. **Demo staff seeding retires.** `seedDemoStaff.js` is replaced by the real
   admin invitation flow (Part 1 §15). No publicly-documented passwords in any
   environment the workspace touches.
5. **Tenant context arrives per request.** Every Academy endpoint must accept
   active organization/personal context and enforce it server-side — the
   `forbidSelfAction` instinct generalizes to `forbidCrossTenantAction` (§93).

---

## 4. Extraction order

Per the 11-system sequence (id → app → …) and Part 2 §101 (modular monolith
first, services only on justification):

1. **Passport (id) lands first.** Academy is the conforming first client:
   swap cookie auth, keep everything else untouched. Part 1 acceptance criterion
   "all other products can authenticate" is exercised here first.
2. **App shell mounts Academy read-only.** Dashboard module summaries
   (`GET /v1/workspace/home`, §102) read Academy progress/credentials via
   Academy API — no Academy UI moves yet.
3. **Shared modules extract:** support → billing → notifications → files.
   Academy deletes its local pages as each lands (profile goes with step 1).
4. **Academy UI re-addresses** to `app/academy/*` per §2 table. Public
   catalogue SEO ships on `academy.` in the same window.
5. **Cross-domain loops wire up:** evidence → Talent (§83), Studio cases →
   Academy missions (§84), Business AI cases → Academy (§85).

---

## 5. Guarantees that must survive (regression floor)

These are Academy's load-bearing behaviors today. Any migration step that breaks
one is rejected, regardless of schedule. They prefigure Part 2 §94 domain tests:

- Prerequisite locks enforced server-side, including the real graded diagnostic
  (never self-attested).
- Checkpoint ordering + submission completeness before review.
- `forbidSelfAction`: staff never review/verify/administer their own records.
- Maturity gating: only `Active` enrollable; Planning/Proposed/Restricted never sold.
- No dead ends: approve auto-forwards to verification; verify auto-issues evidence,
  each with a two-record audit trail.
- Approval ≠ verification, shown as separate states everywhere (§59).

---

## 6. Open mappings (resolve before step 4)

- Diagnostic placement in Part 2 academy nav (new slot vs. under assessments).
- Tool Library fate (own slot vs. mission-contextual vs. retired).
- `b-intl-wr`-style pathway bundles vs. Part 2 "Learning Paths" — same concept?
- Public `academy.` marketing IA (needs Part 3-adjacent Studio-style treatment;
  not covered by Parts 1–2).

---

## 7. Definition of done for Academy's migration

- One Passport login reaches Academy with no second credential.
- Personal/org context switching changes Academy data throughout (§4).
- All §2 routes resolve at their targets; old `/app/*` deep links redirect,
  never 404 (§104 notifications depend on this).
- Negative tests pass: cross-tenant access, self-review, Draft→Verified jumps,
  self-reported-as-verified display (§93–94).
- Audit events flow: `assessment.*`, `evidence.issued`, role changes (§68, §75).
- Demo seeding removed; admin invitations are the only staff path.
