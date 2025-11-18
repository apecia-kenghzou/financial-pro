const asyncHandler = require('../utils/asyncHandler');
const { getUserSheets } = require('../config/googleSheets');
const logger = require('../config/logger');

// Get user's Google Sheets
const getMySheets = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.googleTokens) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated or no Google tokens available'
    });
  }

  const result = await getUserSheets(req.user.googleTokens);

  if (!result.success) {
    logger.error('Failed to fetch user sheets:', result.error || result.message);
    return res.status(500).json({
      success: false,
      message: result.error || result.message || 'Failed to fetch Google Sheets'
    });
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

module.exports = {
  getMySheets
};
