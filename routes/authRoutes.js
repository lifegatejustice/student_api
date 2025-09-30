const express = require('express');
const { register, login, logout, githubLogin, githubCallback } = require('../controllers/authController');

const router = express.Router();

// Local auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// GitHub login route
router.get('/github', githubLogin);

// GitHub callback route
router.get('/github/callback', githubCallback);

module.exports = router;
