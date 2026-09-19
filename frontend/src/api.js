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
  } catch (e) {
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
  setReviewerMode: (reviewerMode) => request("/auth/reviewer-mode", { method: "PATCH", body: { reviewerMode } }),
  resetDemo: () => request("/auth/reset", { method: "POST" }),

  courses: () => request("/courses"),
  tools: () => request("/tools"),
  loop: () => request("/loop"),
  capabilityLevels: () => request("/capability-levels"),

  progress: () => request("/records/progress"),
  records: () => request("/records"),
  enrol: (code) => request("/records/enrol", { method: "POST", body: { code } }),
  checkpoint: (code, text) => request("/records/checkpoint", { method: "POST", body: { code, text } }),
  draft: (code, text) => request("/records/draft", { method: "POST", body: { code, text } }),
  submit: (code, text, confirmations) =>
    request("/records/submit", { method: "POST", body: { code, text, confirmations } }),
  review: (code, status) => request("/records/review", { method: "POST", body: { code, status } }),
  toolUse: (payload) => request("/records/tool-use", { method: "POST", body: payload })
};
