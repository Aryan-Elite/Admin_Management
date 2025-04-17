// src/models/userModel.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
  },
  availability: {
    from: String, // e.g., "09:00"
    to: String,   // e.g., "18:00"
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // never return password by default
  },
}, { timestamps: true });

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔐 Method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
