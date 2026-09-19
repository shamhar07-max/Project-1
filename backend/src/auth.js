const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "db_academy_token";
const TOKEN_TTL = "30d";

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function setAuthCookie(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
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

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie, requireAuth };
