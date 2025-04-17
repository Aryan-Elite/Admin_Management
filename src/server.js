require("dotenv").config({ path: __dirname + "/../.env" });
const { app, server } = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
