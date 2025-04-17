const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // 🔥 Added
const http = require("http");

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Import socket configuration
const { initializeSocket } = require('./config/socket');
const { io } = initializeSocket(server);

// Import services
const notificationService = require('./services/notificationService');
const socketService = require('./services/socketService');

// Initialize services with socket.io instance
notificationService.initialize(io);
socketService.initialize(io);


// 🌐 Enable CORS
app.use(cors({
    origin: ["*","http://localhost:3000", "http://127.0.0.1:5500"], // Add only trusted origins
    credentials: true,
  }));
  

// 🚫 Rate Limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

// 🧰 Other Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 Import Routes
const userRouter = require("./routes/userRoute");
const notificationRouter = require('./routes/notificationRoute');
const adminRouter = require('./routes/adminRoute');

// 🔗 Define Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Good mornign." });
})
app.use("/api/users", userRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);

// 🚀 Export app & server
module.exports = { app, server };
