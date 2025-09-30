// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Protect routes: only logged-in users
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Restrict to admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
};

module.exports = { protect, adminOnly };
