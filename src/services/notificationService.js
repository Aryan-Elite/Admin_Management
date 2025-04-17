const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { connectedUsers } = require('../config/socket');
const { isUserAvailable } = require('../utils/availability');

// Reference to Socket.io instance
let io;

/**
 * Initialize notification service with Socket.io instance
 */
function initialize(socketIO) {
  io = socketIO;
  
  // Set up periodic check for scheduled notifications
  setInterval(checkScheduledNotifications, 60000); // Every minute
}

/**
 * Process a new notification
 */
async function processNotification(senderId, recipientIds, message, isCritical = false) {
  try {
    // Create notification in DB
    const notification = await Notification.create({
      sender: senderId,
      recipients: recipientIds,
      message,
      isCritical,
      status: 'pending'
    });
    
    // Process each recipient
    await Promise.all(recipientIds.map(async (recipientId) => {
      try {
        const recipient = await User.findById(recipientId);
        if (!recipient) return;
        
        const socketId = connectedUsers.get(recipientId.toString());
        const isOnline = !!socketId;
        
        if (isOnline) {
          // User is online, deliver immediately
          await deliverNotification(notification, recipientId);
        } else {
          // User is offline
          if (isCritical) {
            // Critical notifications stay pending for immediate delivery on login
            // Status remains 'pending'
          } else {
            // Non-critical message - check availability
            const isAvailable = isUserAvailable(recipient);
            
            if (!isAvailable) {
              // Outside availability hours - mark as scheduled
              await Notification.updateOne(
                { _id: notification._id, recipients: recipientId },
                { status: 'scheduled' }
              );
            }
            // If available but offline, leave as pending for delivery on login
          }
        }
      } catch (error) {
        console.error(`Error processing notification for recipient ${recipientId}:`, error);
      }
    }));
    
    return notification;
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
}

/**
 * Deliver notification to a specific recipient
 */
async function deliverNotification(notification, recipientId) {
  try {
    const socketId = connectedUsers.get(recipientId.toString());
    
    if (socketId && io) {
      // Emit to specific socket
      io.to(socketId).emit('notification', {
        id: notification._id,
        message: notification.message,
        sender: notification.sender,
        isCritical: notification.isCritical,
        createdAt: notification.createdAt
      });
      
      // Update status
      await Notification.updateOne(
        { _id: notification._id, recipients: recipientId },
        { 
          status: 'delivered',
          deliveredAt: new Date()
        }
      );
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error delivering notification:', error);
    return false;
  }
}

/**
 * Check for scheduled notifications that can now be delivered
 */
async function checkScheduledNotifications() {
  try {
    const scheduledNotifications = await Notification.find({ status: 'scheduled' });
    // console.log("notificstion", scheduledNotifications )
    
    for (const notification of scheduledNotifications) {
      for (const recipientId of notification.recipients) {
        const recipient = await User.findById(recipientId);
        if (!recipient) continue;
        
        // Check if user is now available
        const isAvailable = isUserAvailable(recipient);
        
        if (isAvailable) {
          const socketId = connectedUsers.get(recipientId.toString());
          const isOnline = !!socketId;
          
          if (isOnline) {
            // User is available and online - deliver now
            await deliverNotification(notification, recipientId);
          } else {
            // User is available but offline - mark as pending
            await Notification.updateOne(
              { _id: notification._id, recipients: recipientId },
              { status: 'pending' }
            );
          }
        }
        // Else: still unavailable, keep as scheduled
      }
    }
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
  }
}

/**
 * Deliver pending notifications to a user who just came online
 */
async function deliverPendingNotifications(userId) {
  try {
    // Find all pending notifications for this user
    const pendingNotifications = await Notification.find({
      recipients: userId,
      status: 'pending'
    }).sort({ isCritical: -1, createdAt: 1 }); // Critical first, then oldest
    
    // Deliver each notification
    let deliveredCount = 0;
    
    for (const notification of pendingNotifications) {
      const delivered = await deliverNotification(notification, userId);
      if (delivered) deliveredCount++;
    }
    
    return deliveredCount;
  } catch (error) {
    console.error('Error delivering pending notifications:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId, userId) {
  try {
    const result = await Notification.updateOne(
      { _id: notificationId, recipients: userId },
      { 
        status: 'read',
        readAt: new Date()
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, options = {}) {
  try {
    const { limit = 20, skip = 0, status } = options;
    
    const query = { recipients: userId };
    if (status) query.status = status;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email');
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

module.exports = {
  initialize,
  processNotification,
  deliverNotification,
  deliverPendingNotifications,
  markAsRead,
  getUserNotifications
};