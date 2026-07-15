// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Reads "Authorization: Bearer <token>", verifies it, and attaches
// { id, role } to req.user for every route that uses this.
function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized — invalid or expired token" });
  }
}

// Usage: router.post("/", protect, authorize("instructor"), handler)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden — you don't have access to this" });
    }
    next();
  };
}

module.exports = { protect, authorize };