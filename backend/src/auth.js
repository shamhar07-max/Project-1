const jwt = require("jsonwebtoken");
const prisma = require("./db");

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "db_academy_token";
const TOKEN_TTL = "30d";

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// In production the frontend is typically served from a different origin than
// this API (e.g. separate static host + API host), so the cookie must be
// SameSite=None to be sent on cross-origin fetch requests at all — SameSite=Lax
// is silently dropped on cross-site XHR/fetch (only same-site or top-level GET
// navigations still get it). SameSite=None requires Secure, which is fine once
// the API is served over HTTPS, as it should be in production.
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 30 * 24 * 60 * 60 * 1000
};

function setAuthCookie(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not signed in." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

// Loads the full current-user row (role included) fresh from the database on
// every call. Role changes made by an admin take effect on this user's very
// next request, rather than waiting for them to sign in again.
async function loadCurrentUser(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: "Not signed in." });
  req.currentUser = user;
  next();
}

// Role is never client-supplied or trusted from a cookie/JWT claim — it is
// re-checked against the database on every request that needs it, so a role
// change by an admin is authoritative immediately, and a client can never
// grant itself reviewer/verifier/admin access by editing local state.
function requireRole(...roles) {
  return [
    requireAuth,
    loadCurrentUser,
    (req, res, next) => {
      if (!roles.includes(req.currentUser.role)) {
        return res.status(403).json({ error: "You do not have permission to perform this action." });
      }
      next();
    }
  ];
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie, requireAuth, loadCurrentUser, requireRole };
