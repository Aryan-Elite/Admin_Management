const notificationService = require('../services/notificationService');

const AdminController = {
  // Send notification as admin
  async sendAdminNotification(req, res) {
    try {
      const { recipientIds, message, isCritical } = req.body;
      
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ message: 'Recipients are required' });
      }
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
      
      const notification = await notificationService.processNotification(
        req.user._id,
        recipientIds,
        message,
        isCritical || false // Admin can set critical flag
      );
      
      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error in sendAdminNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending admin notification',
        error: error.message
      });
    }
  }
};

module.exports = AdminController;