const { google } = require('googleapis');
const {
  getGoogleSheetsClient,
  getUserSheets,
  addRSVPToSheet,
  initializeSheet
} = require('../../../config/googleSheets');
const User = require('../../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../../testDbHelper');
const { mockUser, mockGoogleSheets, mockRSVP } = require('../../mockData');

// Mock googleapis
jest.mock('googleapis');

describe('GoogleSheets Config Unit Tests', () => {
  let testUser;
  const mockOAuth2Client = {
    setCredentials: jest.fn(),
    refreshAccessToken: jest.fn()
  };
  const mockSheetsClient = {
    spreadsheets: {
      values: {
        get: jest.fn(),
        update: jest.fn(),
        append: jest.fn()
      }
    }
  };
  const mockDriveClient = {
    files: {
      list: jest.fn()
    }
  };

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();

    // Setup googleapis mocks
    google.auth = {
      OAuth2: jest.fn().mockReturnValue(mockOAuth2Client)
    };
    google.sheets = jest.fn().mockReturnValue(mockSheetsClient);
    google.drive = jest.fn().mockReturnValue(mockDriveClient);

    // Create test user
    testUser = new User(mockUser);
    await testUser.save();
  });

  describe('getGoogleSheetsClient', () => {
    it('should return sheets client with valid tokens', async () => {
      const result = await getGoogleSheetsClient(mockUser.googleTokens, testUser._id.toString());

      expect(result.client).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(google.auth.OAuth2).toHaveBeenCalled();
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: mockUser.googleTokens.accessToken,
        refresh_token: mockUser.googleTokens.refreshToken,
        expiry_date: mockUser.googleTokens.expiryDate
      });
    });

    it('should return null client when tokens are missing', async () => {
      const result = await getGoogleSheetsClient(null);

      expect(result.client).toBeNull();
    });

    it('should return null client when accessToken is missing', async () => {
      const invalidTokens = {
        ...mockUser.googleTokens,
        accessToken: null
      };

      const result = await getGoogleSheetsClient(invalidTokens);

      expect(result.client).toBeNull();
    });

    it('should handle token refresh when token is expired', async () => {
      // Set up expired token
      const expiredTokens = {
        ...mockUser.googleTokens,
        expiryDate: Date.now() - 1000 // 1 second ago
      };

      // Mock refresh response
      mockOAuth2Client.refreshAccessToken.mockResolvedValue({
        credentials: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expiry_date: Date.now() + 3600000
        }
      });

      const result = await getGoogleSheetsClient(expiredTokens, testUser._id.toString());

      expect(mockOAuth2Client.refreshAccessToken).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('new-access-token');
    });
  });

  describe('getUserSheets', () => {
    it('should return list of Google Sheets', async () => {
      mockDriveClient.files.list.mockResolvedValue({
        data: {
          files: mockGoogleSheets
        }
      });

      const result = await getUserSheets(mockUser.googleTokens, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGoogleSheets);
      expect(mockDriveClient.files.list).toHaveBeenCalledWith({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 20
      });
    });

    it('should return empty array when user has no sheets', async () => {
      mockDriveClient.files.list.mockResolvedValue({
        data: {
          files: []
        }
      });

      const result = await getUserSheets(mockUser.googleTokens, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle authentication errors (401)', async () => {
      const authError = new Error('Authentication failed');
      authError.code = 401;
      mockDriveClient.files.list.mockRejectedValue(authError);

      const result = await getUserSheets(mockUser.googleTokens, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle permission errors (403)', async () => {
      const permError = new Error('Permission denied');
      permError.code = 403;
      mockDriveClient.files.list.mockRejectedValue(permError);

      const result = await getUserSheets(mockUser.googleTokens, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should return error when tokens are missing', async () => {
      const result = await getUserSheets(null);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not authenticated');
    });
  });

  describe('addRSVPToSheet', () => {
    const spreadsheetId = 'test-sheet-id';

    it('should add RSVP to Google Sheet', async () => {
      mockSheetsClient.spreadsheets.values.append.mockResolvedValue({
        data: { updates: { updatedRows: 1 } }
      });

      const result = await addRSVPToSheet(
        spreadsheetId,
        mockRSVP,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(true);
      expect(mockSheetsClient.spreadsheets.values.append).toHaveBeenCalled();

      const callArgs = mockSheetsClient.spreadsheets.values.append.mock.calls[0][0];
      expect(callArgs.spreadsheetId).toBe(spreadsheetId);
      expect(callArgs.range).toBe('Sheet1!A:G');
      expect(callArgs.valueInputOption).toBe('RAW');
    });

    it('should format RSVP data correctly', async () => {
      mockSheetsClient.spreadsheets.values.append.mockResolvedValue({
        data: { updates: { updatedRows: 1 } }
      });

      await addRSVPToSheet(
        spreadsheetId,
        mockRSVP,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      const callArgs = mockSheetsClient.spreadsheets.values.append.mock.calls[0][0];
      const values = callArgs.resource.values[0];

      expect(values[1]).toBe(mockRSVP.name);
      expect(values[2]).toBe(mockRSVP.email);
      expect(values[3]).toBe(mockRSVP.phone);
      expect(values[4]).toBe(mockRSVP.numberOfGuests);
      expect(values[5]).toBe('Yes'); // attending: true
      expect(values[6]).toBe(mockRSVP.message);
    });

    it('should handle missing phone and message', async () => {
      mockSheetsClient.spreadsheets.values.append.mockResolvedValue({
        data: { updates: { updatedRows: 1 } }
      });

      const rsvpWithoutOptional = {
        ...mockRSVP,
        phone: null,
        message: null
      };

      await addRSVPToSheet(
        spreadsheetId,
        rsvpWithoutOptional,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      const callArgs = mockSheetsClient.spreadsheets.values.append.mock.calls[0][0];
      const values = callArgs.resource.values[0];

      expect(values[3]).toBe('');
      expect(values[6]).toBe('');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Auth failed');
      authError.code = 401;
      mockSheetsClient.spreadsheets.values.append.mockRejectedValue(authError);

      const result = await addRSVPToSheet(
        spreadsheetId,
        mockRSVP,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle spreadsheet not found errors', async () => {
      const notFoundError = new Error('Not found');
      notFoundError.code = 404;
      mockSheetsClient.spreadsheets.values.append.mockRejectedValue(notFoundError);

      const result = await addRSVPToSheet(
        spreadsheetId,
        mockRSVP,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('initializeSheet', () => {
    const spreadsheetId = 'test-sheet-id';

    it('should add headers to empty sheet', async () => {
      // Mock empty sheet
      mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] }
      });

      mockSheetsClient.spreadsheets.values.update.mockResolvedValue({
        data: { updatedRows: 1 }
      });

      const result = await initializeSheet(
        spreadsheetId,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(true);
      expect(mockSheetsClient.spreadsheets.values.update).toHaveBeenCalled();

      const callArgs = mockSheetsClient.spreadsheets.values.update.mock.calls[0][0];
      const headers = callArgs.resource.values[0];

      expect(headers).toContain('Timestamp');
      expect(headers).toContain('Name');
      expect(headers).toContain('Email');
      expect(headers).toContain('Phone');
      expect(headers).toContain('Number of Guests');
      expect(headers).toContain('Attending');
      expect(headers).toContain('Message');
    });

    it('should not add headers if sheet already has them', async () => {
      // Mock sheet with existing headers
      mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [['Timestamp', 'Name', 'Email']]
        }
      });

      const result = await initializeSheet(
        spreadsheetId,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(true);
      expect(mockSheetsClient.spreadsheets.values.update).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Sheet error');
      error.code = 404;
      mockSheetsClient.spreadsheets.values.get.mockRejectedValue(error);

      const result = await initializeSheet(
        spreadsheetId,
        mockUser.googleTokens,
        testUser._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
