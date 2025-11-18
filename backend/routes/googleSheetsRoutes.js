const express = require('express');
const router = express.Router();
const { getMySheets } = require('../controllers/googleSheetsController');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /api/sheets/my-sheets
// @desc    Get user's Google Sheets
// @access  Private
router.get('/my-sheets', isAuthenticated, getMySheets);

module.exports = router;
