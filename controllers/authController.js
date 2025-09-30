// controllers/authController.js
const axios = require("axios");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper to generate JWT
const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide username, email, and password" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: "user"
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Since JWT is stateless, just return success
    // Client should remove token from storage
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Redirect user to GitHub login page
const githubLogin = (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
  res.redirect(redirectUrl);
};

// Handle GitHub callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: "Authorization code missing" });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Failed to get access token" });
    }

    // Fetch user profile
    const githubUser = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubEmails = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const primaryEmail = githubEmails.data.find((e) => e.primary && e.verified)?.email;
    if (!primaryEmail) {
      return res.status(400).json({ success: false, message: "No verified primary email found" });
    }

    // Find or create user in DB
    let user = await User.findOne({ email: primaryEmail });
    if (!user) {
      user = await User.create({
        username: githubUser.data.login,
        email: primaryEmail,
        password: "oauth_github",
        role: "admin", // assign admin role for GitHub login
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "GitHub login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GitHub OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { register, login, logout, githubLogin, githubCallback };
