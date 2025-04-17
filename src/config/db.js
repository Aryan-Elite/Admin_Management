require("dotenv").config({ path: __dirname + "/../../.env" });

const mongoose = require("mongoose");

mongoose.set('strictQuery', true);


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    });

    console.log(`✅ DB connection established`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
