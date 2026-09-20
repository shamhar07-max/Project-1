const FAQS = [
  ["Prerequisite", "Learning or evidence required before a course unlocks. A prerequisite is either another course's issued evidence, or a passed Foundation Diagnostic — never a self-declared claim."],
  ["Evidence", "A record, output, test result or reflection that supports a capability claim. Failed attempts and corrections remain part of the evidence trail, not just successes."],
  ["Review", "A reviewer's first read of a submission. Reviewers can request changes or approve — they cannot independently verify their own approval."],
  ["Verification", "Independent confirmation after approval, performed by a different authorized role (a verifier). It is not the same as course completion or review approval."],
  ["Jurisdiction", "The country or legal context a topic applies to. Country-specific immigration, tax, real estate, insurance, banking and labor-law content requires qualified local review."],
  ["Entitlement", "Your right to access a course or bundle. It is separate from completion, review, and verification — owning access is not the same as having evidence issued."]
];

export default function SupportPage() {
  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Support</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Need help understanding a prerequisite, evidence, review, verification, jurisdiction or entitlement? This
        prototype offers guidance only — no live support ticketing is connected yet.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {FAQS.map(([term, def]) => (
          <article key={term} className="rounded-xl bg-mint p-4">
            <b>{term}</b>
            <p className="mt-1 text-sm leading-6">{def}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
