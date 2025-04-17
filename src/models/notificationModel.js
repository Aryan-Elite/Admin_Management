const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  message: { 
    type: String, 
    required: true 
  },
  isCritical: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'delivered', 'read', 'scheduled'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  deliveredAt: { 
    type: Date 
  },
  readAt: { 
    type: Date 
  }
});

// Add indexes for performance
NotificationSchema.index({ recipients: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);