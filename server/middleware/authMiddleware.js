const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Not authorized, token invalid" });
  }
};

const adminLikeOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized" });
  }

  if (!["admin", "demo_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin-style access only" });
  }

  next();
};

module.exports = {
  protect,
  adminLikeOnly,
};