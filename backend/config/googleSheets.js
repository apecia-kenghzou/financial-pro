const { google } = require('googleapis');
const logger = require('./logger');
const User = require('../models/User');

/**
 * Refresh access token if expired
 * @param {String} userId - User ID
 * @param {Object} userTokens - User's Google OAuth tokens
 * @returns {Object} Updated tokens or original tokens
 */
const refreshTokenIfNeeded = async (userId, userTokens) => {
  try {
    // Check if token is expired or will expire in next 5 minutes
    const now = Date.now();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!userTokens.expiryDate || now >= userTokens.expiryDate - expiryBuffer) {
      logger.info(`Refreshing expired token for user: ${userId}`);

      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/auth/google/callback`
      );

      // Set current credentials
      oauth2Client.setCredentials({
        refresh_token: userTokens.refreshToken
      });

      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update tokens object
      const updatedTokens = {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || userTokens.refreshToken,
        expiryDate: credentials.expiry_date
      };

      // Update user in database
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          googleTokens: updatedTokens,
          lastLogin: new Date()
        });
        logger.info(`Token refreshed and saved for user: ${userId}`);
      }

      return updatedTokens;
    }

    return userTokens;
  } catch (error) {
    logger.error('Error refreshing token:', error);
    // Return original tokens if refresh fails
    return userTokens;
  }
};

/**
 * Get Google Sheets client using user's OAuth tokens
 * @param {Object} userTokens - User's Google OAuth tokens
 * @param {String} userId - Optional user ID for token refresh
 * @returns {Object} Object containing sheets client and potentially updated tokens
 */
const getGoogleSheetsClient = async (userTokens, userId = null) => {
  try {
    if (!userTokens || !userTokens.accessToken) {
      logger.warn('No user tokens provided for Google Sheets');
      return { client: null, tokens: userTokens };
    }

    // Refresh token if needed
    const refreshedTokens = userId
      ? await refreshTokenIfNeeded(userId, userTokens)
      : userTokens;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );

    // Set credentials with refreshed tokens
    oauth2Client.setCredentials({
      access_token: refreshedTokens.accessToken,
      refresh_token: refreshedTokens.refreshToken,
      expiry_date: refreshedTokens.expiryDate
    });

    // Create and return sheets client
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    return { client: sheets, tokens: refreshedTokens };
  } catch (error) {
    logger.error('Error initializing Google Sheets client:', error);
    return { client: null, tokens: userTokens };
  }
};

/**
 * Get list of user's Google Sheets
 * @param {Object} userTokens - User's Google OAuth tokens
 * @param {String} userId - Optional user ID for token refresh
 * @returns {Object} Result with list of spreadsheets
 */
const getUserSheets = async (userTokens, userId = null) => {
  try {
    if (!userTokens || !userTokens.accessToken) {
      logger.warn('No user tokens provided for getting sheets');
      return { success: false, message: 'User not authenticated or no tokens available' };
    }

    // Refresh token if needed
    const refreshedTokens = userId
      ? await refreshTokenIfNeeded(userId, userTokens)
      : userTokens;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );

    // Set credentials with refreshed tokens
    oauth2Client.setCredentials({
      access_token: refreshedTokens.accessToken,
      refresh_token: refreshedTokens.refreshToken,
      expiry_date: refreshedTokens.expiryDate
    });

    // Create Drive API client with OAuth2 client
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // List user's spreadsheets
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 20
    });

    logger.info(`Successfully fetched ${response.data.files?.length || 0} sheets for user`);

    return {
      success: true,
      data: response.data.files || []
    };
  } catch (error) {
    logger.error('Error fetching user sheets:', error);

    // Handle specific error cases
    if (error.code === 401) {
      return { success: false, error: 'Authentication failed. Please sign in again.' };
    }
    if (error.code === 403) {
      return { success: false, error: 'Permission denied. Please grant access to Google Drive.' };
    }

    return { success: false, error: error.message || 'Failed to fetch Google Sheets' };
  }
};

/**
 * Add RSVP data to user's Google Sheet
 * @param {String} spreadsheetId - Google Sheet ID
 * @param {Object} rsvpData - RSVP data to add
 * @param {Object} userTokens - User's Google OAuth tokens
 * @param {String} userId - Optional user ID for token refresh
 * @returns {Object} Result of operation
 */
const addRSVPToSheet = async (spreadsheetId, rsvpData, userTokens, userId = null) => {
  try {
    const { client: sheets } = await getGoogleSheetsClient(userTokens, userId);

    if (!sheets) {
      logger.warn('Google Sheets client not available, skipping sheet update');
      return { success: false, message: 'Google Sheets client not available' };
    }

    const values = [[
      new Date(rsvpData.createdAt || Date.now()).toLocaleString(),
      rsvpData.name,
      rsvpData.email,
      rsvpData.phone || '',
      rsvpData.numberOfGuests,
      rsvpData.attending ? 'Yes' : 'No',
      rsvpData.message || ''
    ]];

    const resource = { values };

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'RAW',
      resource,
    });

    logger.info(`RSVP added to sheet ${spreadsheetId}: ${rsvpData.email}`);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Error adding RSVP to Google Sheets:', error);

    // Handle specific error cases
    if (error.code === 401) {
      return { success: false, error: 'Authentication failed. Token may have expired.' };
    }
    if (error.code === 403) {
      return { success: false, error: 'Permission denied. Please ensure the sheet is accessible.' };
    }
    if (error.code === 404) {
      return { success: false, error: 'Spreadsheet not found.' };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Initialize Google Sheet with headers
 * @param {String} spreadsheetId - Google Sheet ID
 * @param {Object} userTokens - User's Google OAuth tokens
 * @param {String} userId - Optional user ID for token refresh
 * @returns {Object} Result of operation
 */
const initializeSheet = async (spreadsheetId, userTokens, userId = null) => {
  try {
    const { client: sheets } = await getGoogleSheetsClient(userTokens, userId);

    if (!sheets) {
      return { success: false, message: 'Google Sheets client not available' };
    }

    // Check if sheet has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:G1',
    });

    // If no headers, add them
    if (!response.data.values || response.data.values.length === 0) {
      const values = [[
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Number of Guests',
        'Attending',
        'Message'
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:G1',
        valueInputOption: 'RAW',
        resource: { values },
      });

      logger.info(`Initialized headers for spreadsheet: ${spreadsheetId}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error initializing Google Sheet:', error);

    if (error.code === 401) {
      return { success: false, error: 'Authentication failed. Please sign in again.' };
    }
    if (error.code === 403) {
      return { success: false, error: 'Permission denied. Please ensure the sheet is accessible.' };
    }
    if (error.code === 404) {
      return { success: false, error: 'Spreadsheet not found.' };
    }

    return { success: false, error: error.message };
  }
};

module.exports = {
  getGoogleSheetsClient,
  getUserSheets,
  addRSVPToSheet,
  initializeSheet
};
