const OK = ["Approved", "Verified", "Evidence Issued", "Completed", "Enrolled", "Healthy", "Configured"];
const CHANGES = ["Request Changes"];
const REVIEW = ["Submitted", "In Review", "Pending Verification", "Recoverable", "Setup required"];

export default function Badge({ status }) {
  let cls = "status-draft";
  if (OK.includes(status)) cls = "status-ok";
  else if (CHANGES.includes(status)) cls = "status-changes";
  else if (REVIEW.includes(status)) cls = "status-review";

  return <span className={"status " + cls}>{status}</span>;
}
