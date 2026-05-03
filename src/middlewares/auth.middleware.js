const jwt = require("jsonwebtoken");

/**
 * verifyToken: Validates the JWT from the Authorization header
 * and attaches the decoded user data to the request object.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );
    req.user = decoded; // Passing decoded user data (e.g., email, role) to the next function
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/**
 * verifyAdmin: Checks if the user has an admin role.
 * This must be used AFTER verifyToken.
 */
const verifyAdmin = (req, res, next) => {
  // Ensure user exists and has the 'admin' role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access only.",
    });
  }
};

// Exporting as an object so they can be destructured in routes
module.exports = {
  verifyToken,
  verifyAdmin,
};
