const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

// Send notification to specific users
router.post('/send', authController.isAuthenticated, notificationController.sendNotification);

// Get notifications for current user
router.get('/', authController.isAuthenticated, notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', authController.isAuthenticated, notificationController.markAsRead);

module.exports = router;