const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// Public Routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected Routes (Require Authentication)

// Get user profile
router.get("/profile", authController.isAuthenticated, userController.getUser);

// Update user profile (name, mobile, bio, availability)
router.put("/profile", authController.isAuthenticated, userController.updateUser);

// Send notification to one or many users
// router.post("/notify", authController.isAuthenticated, userController.sendNotification);

// Logout user
router.get("/logout", authController.isAuthenticated,userController.logout);

module.exports = router;
