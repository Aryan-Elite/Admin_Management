const notificationService = require('../services/notificationService');

const NotificationController = {
  // Send notification as regular user
  async sendNotification(req, res) {
    try {
      const { recipientIds, message } = req.body;
      
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ message: 'Recipients are required' });
      }
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      console.log(req.user)
      
      const notification = await notificationService.processNotification(
        req.user._id,
        recipientIds,
        message,
        false // Not critical (regular user)
      );
      
      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error in sendNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending notification',
        error: error.message
      });
    }
  },
  
  // Get notifications for current user
  async getNotifications(req, res) {
    try {
      const { limit, skip, status } = req.query;
      
      const notifications = await notificationService.getUserNotifications(
        req.user._id,
        {
          limit: parseInt(limit) || 20,
          skip: parseInt(skip) || 0,
          status
        }
      );
      
      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving notifications',
        error: error.message
      });
    }
  },
  
  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;
      
      const success = await notificationService.markAsRead(notificationId, req.user._id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or already read'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read',
        error: error.message
      });
    }
  }
};

module.exports = NotificationController;