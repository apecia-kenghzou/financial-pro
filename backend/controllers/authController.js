const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      googleId: req.user.googleId,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    }
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error('Error logging out:', err);
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error('Error destroying session:', err);
      }
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});

module.exports = {
  getCurrentUser,
  logout
};
