const asyncHandler = require('../utils/asyncHandler');
const { getUserSheets } = require('../config/googleSheets');
const logger = require('../config/logger');

// Get user's Google Sheets
const getMySheets = asyncHandler(async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    logger.warn('Attempt to access sheets without authentication');
    return res.status(401).json({
      success: false,
      message: 'User not authenticated. Please sign in.'
    });
  }

  // Check if user has Google tokens
  if (!req.user.googleTokens || !req.user.googleTokens.accessToken) {
    logger.warn(`User ${req.user._id} has no Google tokens`);
    return res.status(401).json({
      success: false,
      message: 'No Google account linked. Please sign in with Google.'
    });
  }

  logger.info(`Fetching sheets for user: ${req.user._id}`);

  // Fetch user's Google Sheets
  const result = await getUserSheets(req.user.googleTokens, req.user._id.toString());

  if (!result.success) {
    const errorMsg = result.error || result.message || 'Failed to fetch Google Sheets';
    logger.error(`Failed to fetch sheets for user ${req.user._id}:`, errorMsg);

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMsg.includes('Authentication failed') || errorMsg.includes('sign in again')) {
      statusCode = 401;
    } else if (errorMsg.includes('Permission denied') || errorMsg.includes('grant access')) {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMsg
    });
  }

  logger.info(`Successfully fetched ${result.data.length} sheets for user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: result.data
  });
});

module.exports = {
  getMySheets
};
