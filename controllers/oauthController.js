// controllers/oauthController.js
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Redirect to GitHub for login
const githubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  const scope = 'user:email';
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  res.redirect(githubUrl);
};

// GitHub OAuth callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Failed to get GitHub access token' });
    }

    // Fetch user info from GitHub
    const githubUser = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubEmails = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const primaryEmail = githubEmails.data.find((e) => e.primary && e.verified)?.email;
    if (!primaryEmail) {
      return res.status(400).json({ success: false, message: 'No verified email found on GitHub account' });
    }

    // Find or create user
    let user = await User.findOne({ email: primaryEmail });
    if (!user) {
      user = await User.create({
        username: githubUser.data.login,
        email: primaryEmail,
        password: 'oauth_github', // dummy password
        role: 'admin' // assign admin role
      });
    }

    // Generate JWT with admin role
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'GitHub OAuth successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { githubAuth, githubCallback };