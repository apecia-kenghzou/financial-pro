const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getCurrentUser, logout } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.FRONTEND_URL}/?login=success`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', isAuthenticated, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', isAuthenticated, logout);

module.exports = router;
