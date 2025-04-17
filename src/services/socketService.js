const { connectedUsers } = require('../config/socket');
const notificationService = require('./notificationService');

/**
 * Initialize socket service with Socket.io instance
 */
function initialize(io) {
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    // Register user when they connect
    socket.on('register', async () => {
      console.log(`User registered for notifications: ${userId}`);
      
      // Deliver any pending notifications
      const count = await notificationService.deliverPendingNotifications(userId);
      console.log(`Delivered ${count} pending notifications to user ${userId}`);
    });
    
    // Handle notification read events
    socket.on('notification:read', async (notificationId) => {
      await notificationService.markAsRead(notificationId, userId);
    });
  });
}

module.exports = { initialize };