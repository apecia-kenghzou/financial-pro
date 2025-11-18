const { google } = require('googleapis');

let sheetsClient = null;

const getGoogleSheetsClient = () => {
  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('Google Sheets credentials not configured');
      return null;
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    return null;
  }
};

const addRSVPToSheet = async (spreadsheetId, rsvpData) => {
  try {
    const sheets = getGoogleSheetsClient();

    if (!sheets) {
      console.warn('Google Sheets client not available, skipping sheet update');
      return { success: false, message: 'Google Sheets not configured' };
    }

    const values = [[
      new Date(rsvpData.submittedAt).toLocaleString(),
      rsvpData.name,
      rsvpData.email,
      rsvpData.phone,
      rsvpData.numberOfGuests,
      rsvpData.attending ? 'Yes' : 'No',
      rsvpData.message
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
    console.error('Error adding RSVP to Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

const initializeSheet = async (spreadsheetId) => {
  try {
    const sheets = getGoogleSheetsClient();

    if (!sheets) {
      return { success: false, message: 'Google Sheets not configured' };
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
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing Google Sheet:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getGoogleSheetsClient,
  addRSVPToSheet,
  initializeSheet
};
