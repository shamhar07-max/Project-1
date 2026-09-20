const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error((data && data.error) || "Request failed.");
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  me: () => request("/auth/me"),
  demoLogin: () => request("/auth/demo", { method: "POST" }),
  signin: (email, password) => request("/auth/signin", { method: "POST", body: { email, password } }),
  setup: (payload) => request("/auth/setup", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: payload }),
  resetDemo: () => request("/auth/reset", { method: "POST" }),

  courses: () => request("/courses"),
  bundles: () => request("/bundles"),
  tools: () => request("/tools"),
  loop: () => request("/loop"),
  capabilityLevels: () => request("/capability-levels"),
  phases: () => request("/phases"),
  audiences: () => request("/audiences"),

  progress: () => request("/records/progress"),
  records: () => request("/records"),
  enrol: (code) => request("/records/enrol", { method: "POST", body: { code } }),
  checkpoint: (code, text) => request("/records/checkpoint", { method: "POST", body: { code, text } }),
  draft: (code, text) => request("/records/draft", { method: "POST", body: { code, text } }),
  submit: (code, text, confirmations) =>
    request("/records/submit", { method: "POST", body: { code, text, confirmations } }),
  toolUse: (payload) => request("/records/tool-use", { method: "POST", body: payload }),

  bundleStatus: () => request("/bundles/status"),
  enrolBundle: (id) => request(`/bundles/${id}/enrol`, { method: "POST" }),

  diagnosticQuestions: () => request("/diagnostic/questions"),
  diagnosticStatus: () => request("/diagnostic/status"),
  diagnosticSubmit: (answers) => request("/diagnostic/submit", { method: "POST", body: { answers } }),

  reviewQueue: () => request("/queues/review"),
  verifyQueue: () => request("/queues/verify"),
  startReview: (learnerId, code) => request(`/queues/review/${learnerId}/${code}/start`, { method: "POST" }),
  requestChanges: (learnerId, code, comment) =>
    request(`/queues/review/${learnerId}/${code}/request-changes`, { method: "POST", body: { comment } }),
  approve: (learnerId, code) => request(`/queues/review/${learnerId}/${code}/approve`, { method: "POST" }),
  verify: (learnerId, code) => request(`/queues/verify/${learnerId}/${code}/verify`, { method: "POST" }),

  adminUsers: () => request("/admin/users"),
  adminSetRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: "PATCH", body: { role } }),
  curriculumHealth: () => request("/admin/curriculum-health")
};
