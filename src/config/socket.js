const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Store user socket connections
const connectedUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIO(server,{
    cors: {
      origin: ["*","http://localhost:3000", "http://127.0.0.1:5500"],
      credentials: true,
    }
  });
  
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user_id;
      // Check if user exists
      const user = await User.findById(decoded.user_id);
      if (!user) {
        return next(new Error('User not found'));
      }
      
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });
  
  return { io, connectedUsers };
};

module.exports = { initializeSocket, connectedUsers };