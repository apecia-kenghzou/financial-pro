const { google } = require('googleapis');
const logger = require('./logger');

/**
 * Get Google Sheets client using user's OAuth tokens
 * @param {Object} userTokens - User's Google OAuth tokens
 * @returns {Object} Google Sheets API client
 */
const getGoogleSheetsClient = (userTokens) => {
  try {
    if (!userTokens || !userTokens.accessToken) {
      logger.warn('No user tokens provided for Google Sheets');
      return null;
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: userTokens.accessToken,
      refresh_token: userTokens.refreshToken,
      expiry_date: userTokens.expiryDate
    });

    // Create and return sheets client
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    return sheets;
  } catch (error) {
    logger.error('Error initializing Google Sheets client:', error);
    return null;
  }
};

/**
 * Get list of user's Google Sheets
 * @param {Object} userTokens - User's Google OAuth tokens
 * @returns {Array} List of spreadsheets
 */
const getUserSheets = async (userTokens) => {
  try {
    const drive = google.drive({ version: 'v3', auth: getGoogleSheetsClient(userTokens)?._options?.auth });

    if (!drive) {
      return { success: false, message: 'Failed to initialize Drive client' };
    }

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 20
    });

    return {
      success: true,
      data: response.data.files || []
    };
  } catch (error) {
    logger.error('Error fetching user sheets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add RSVP data to user's Google Sheet
 * @param {String} spreadsheetId - Google Sheet ID
 * @param {Object} rsvpData - RSVP data to add
 * @param {Object} userTokens - User's Google OAuth tokens
 * @returns {Object} Result of operation
 */
const addRSVPToSheet = async (spreadsheetId, rsvpData, userTokens) => {
  try {
    const sheets = getGoogleSheetsClient(userTokens);

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

    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Error adding RSVP to Google Sheets:', error);

    // Handle specific error cases
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
 * @returns {Object} Result of operation
 */
const initializeSheet = async (spreadsheetId, userTokens) => {
  try {
    const sheets = getGoogleSheetsClient(userTokens);

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
