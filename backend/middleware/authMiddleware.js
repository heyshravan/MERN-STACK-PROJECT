const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "User ID missing from authentication token.",
      });
    }

    // Lookup user to attach role and verify account existence
    const user = await User.findById(decoded.id).select("role name email");
    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists or has been deactivated.",
      });
    }

    req.user = {
      id: decoded.id,
      role: user.role || "user",
      name: user.name || "",
      email: user.email || "",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Administrator privileges are required.",
      });
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Admin authorization check failed." });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== "null" && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
          const user = await User.findById(decoded.id).select("role name email");
          req.user = {
            id: decoded.id,
            role: user?.role || "user",
            name: user?.name || "",
          };
        }
      }
    }
  } catch (error) {
    // Ignore invalid token for optional auth routes
  }
  next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.adminOnly = adminOnly;
module.exports.optionalAuth = optionalAuth;
