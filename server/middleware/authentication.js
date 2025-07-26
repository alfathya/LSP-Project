const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";

function authenticateToken(req, res, next) {
  console.log("Authentication middleware called");

  // Get token from Authorization header with Bearer format
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader);

  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  console.log("Extracted token:", token ? "Token exists" : "No token");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    console.log("Token verified successfully, user payload:", user);
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
};
