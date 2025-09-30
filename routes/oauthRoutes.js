// routes/oauthRoutes.js
const express = require('express');
const { githubAuth, githubCallback } = require('../controllers/oauthController');

const router = express.Router();

// Login route → redirects to GitHub
router.get('/login', githubAuth);

// GitHub callback route
router.get('/auth/github/callback', githubCallback);

module.exports = router;





// index.js (updated excerpt