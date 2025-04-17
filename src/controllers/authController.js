const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to check authentication
exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: "You are not logged in! Please log in." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const currentUser = await User.findById(decoded.user_id).select("-password");
    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token. Please log in again." });
  }
};



exports.adminAuth = (req, res, next) => {
  console.log(req.user);
  
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  };
  

