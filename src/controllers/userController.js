const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// 🔐 Generate JWT Token
const signToken = (user_id) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// 🎁 Create & Send Token in Cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: true // Uncomment in production (HTTPS only)
  };

  res.cookie("jwt", token, cookieOptions);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: userObj },
  });
};

// 📝 Register
exports.register = async (req, res) => {
  try {
    const { name, email, isAdmin,mobile, password, bio, availability } = req.body;

    if (!name || !email || !mobile || !password || !bio ||!availability) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const newUser = await User.create({ name, email, mobile, password, bio,isAdmin, availability });
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

// 🔐 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Email or Password." });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

// 👤 Get User Profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user.", error: error.message });
  }
};

// 🔧 Update User Profile
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed.", error: error.message });
  }
};

// 🚪 Logout
exports.logout = async (req, res) => {
  res.status(200)
    .cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      status: "success",
      message: "Logged Out Successfully.",
    });
};
