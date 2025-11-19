const { nanoid } = require('nanoid');

/**
 * Mock user data
 */
const mockUser = {
  googleId: 'test-google-id-123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  googleTokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiryDate: Date.now() + 3600000 // 1 hour from now
  }
};

/**
 * Mock invitation card data
 */
const mockInvitationCard = {
  cardId: nanoid(10),
  title: 'Test Birthday Party',
  canvasData: {
    elements: [
      {
        id: 'elem-1',
        type: 'image',
        src: 'https://example.com/image.png',
        x: 100,
        y: 100,
        width: 200,
        height: 200
      }
    ]
  },
  eventDetails: {
    location: '123 Test Street, Test City',
    dateTime: new Date('2025-12-31T18:00:00Z'),
    description: 'Join us for a wonderful birthday celebration!'
  },
  googleSheetId: 'test-sheet-id-123',
  isPublished: true
};

/**
 * Mock RSVP data
 */
const mockRSVP = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  numberOfGuests: 2,
  attending: true,
  message: 'Looking forward to it!'
};

/**
 * Mock Google Sheets data
 */
const mockGoogleSheets = [
  {
    id: 'sheet-id-1',
    name: 'Wedding Guest List',
    createdTime: '2025-01-01T00:00:00Z',
    modifiedTime: '2025-01-15T12:00:00Z'
  },
  {
    id: 'sheet-id-2',
    name: 'Birthday Party RSVPs',
    createdTime: '2025-01-10T00:00:00Z',
    modifiedTime: '2025-01-18T14:30:00Z'
  }
];

/**
 * Create a mock Express request object
 */
const mockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    user: null,
    session: {},
    ...overrides
  };
};

/**
 * Create a mock Express response object
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock Express next function
 */
const mockNext = () => jest.fn();

module.exports = {
  mockUser,
  mockInvitationCard,
  mockRSVP,
  mockGoogleSheets,
  mockRequest,
  mockResponse,
  mockNext
};
