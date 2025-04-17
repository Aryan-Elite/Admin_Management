const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Send admin notification (can be critical)
router.post('/notifications/send',authController.isAuthenticated, authController.adminAuth, AdminController.sendAdminNotification);

module.exports = router;