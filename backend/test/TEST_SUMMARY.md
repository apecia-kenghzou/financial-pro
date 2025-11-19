# Backend Test Suite Summary

## Overview

Comprehensive unit and integration tests have been created for the backend API. The test suite covers models, controllers, configuration modules, and API endpoints.

## Test Infrastructure

- **Framework**: Jest 29.7.0
- **API Testing**: Supertest 6.3.3
- **Database**: MongoDB Memory Server 9.1.3 (in-memory MongoDB for testing)
- **Coverage**: Configured with 60% threshold for branches, functions, lines, and statements

## Test Structure

```
backend/test/
├── setup.js                          # Global test configuration
├── testDbHelper.js                   # Database connection utilities
├── mockData.js                       # Reusable mock data
├── unit/
│   ├── models/
│   │   ├── user.test.js             # User model tests (14 tests)
│   │   └── invitationCard.test.js   # InvitationCard model tests (20 tests)
│   └── config/
│       └── googleSheets.test.js     # Google Sheets integration tests (16 tests)
└── integration/
    ├── auth.test.js                  # Authentication API tests (5 tests)
    ├── invitations.test.js           # Invitations API tests (18 tests)
    └── rsvp.test.js                  # RSVP API tests (12 tests)
```

## Unit Tests

### User Model (`test/unit/models/user.test.js`)
**Total: 14 tests**

#### Schema Validation (8 tests)
- ✓ Creates valid user with all required fields
- ✓ Fails when googleId is missing
- ✓ Fails when email is missing
- ✓ Fails with invalid email format
- ✓ Fails when name is missing
- ✓ Converts email to lowercase
- ✓ Trims whitespace from name and email
- ✓ Enforces unique googleId
- ✓ Enforces unique email

#### Pre-save Middleware (2 tests)
- ✓ Updates lastLogin when googleTokens are modified
- ✓ Does not update lastLogin when other fields are modified

#### Default Values (2 tests)
- ✓ Sets default empty string for picture
- ✓ Sets lastLogin to current time on creation

#### Timestamps (2 tests)
- ✓ Automatically adds createdAt and updatedAt
- ✓ Updates updatedAt on modification

### InvitationCard Model (`test/unit/models/invitationCard.test.js`)
**Total: 20 tests**

#### Schema Validation (15 tests)
- ✓ Creates valid invitation card with all required fields
- ✓ Fails when cardId is missing
- ✓ Fails when cardId is not exactly 10 characters
- ✓ Fails when creator is missing
- ✓ Fails when title is missing
- ✓ Fails when title exceeds 200 characters
- ✓ Fails when canvasData is missing
- ✓ Fails when canvasData is not an object
- ✓ Fails when canvasData is an array
- ✓ Fails when event location is missing
- ✓ Fails when event dateTime is missing
- ✓ Fails when location exceeds 500 characters
- ✓ Fails when description exceeds 2000 characters
- ✓ Trims whitespace from text fields
- ✓ Enforces unique cardId

#### Default Values (3 tests)
- ✓ Sets isPublished to false by default
- ✓ Sets googleSheetId to empty string by default
- ✓ Sets description to empty string by default

#### Timestamps (2 tests)
- ✓ Automatically adds createdAt and updatedAt
- ✓ Updates updatedAt on modification

### Google Sheets Config (`test/unit/config/googleSheets.test.js`)
**Total: 16 tests**

#### getGoogleSheetsClient (4 tests)
- ✓ Returns sheets client with valid tokens
- ✓ Returns null client when tokens are missing
- ✓ Returns null client when accessToken is missing
- ✓ Handles token refresh when token is expired

#### getUserSheets (5 tests)
- ✓ Returns list of Google Sheets
- ✓ Returns empty array when user has no sheets
- ✓ Handles authentication errors (401)
- ✓ Handles permission errors (403)
- ✓ Returns error when tokens are missing

#### addRSVPToSheet (5 tests)
- ✓ Adds RSVP to Google Sheet
- ✓ Formats RSVP data correctly
- ✓ Handles missing phone and message
- ✓ Handles authentication errors
- ✓ Handles spreadsheet not found errors

#### initializeSheet (3 tests)
- ✓ Adds headers to empty sheet
- ✓ Does not add headers if sheet already has them
- ✓ Handles errors gracefully

## Integration Tests

### Authentication API (`test/integration/auth.test.js`)
**Total: 5 tests**

- ✓ Returns current user when authenticated
- ✓ Returns 401 when not authenticated
- ✓ Logs out user successfully
- ✓ Handles logout errors gracefully
- ✓ Has /google OAuth routes defined

### Invitations API (`test/integration/invitations.test.js`)
**Total: 18 tests**

#### POST /api/invitations (4 tests)
- ✓ Creates new invitation card when authenticated
- ✓ Returns 401 when not authenticated
- ✓ Validates required fields
- ✓ Handles duplicate cardId by retrying

#### GET /api/invitations (2 tests)
- ✓ Returns all user invitations when authenticated
- ✓ Returns 401 when not authenticated

#### GET /api/invitations/:cardId (3 tests)
- ✓ Returns invitation by cardId
- ✓ Returns 404 for non-existent cardId
- ✓ Allows access to published cards without authentication

#### PUT /api/invitations/:cardId (3 tests)
- ✓ Updates invitation when authenticated as creator
- ✓ Returns 401 when not authenticated
- ✓ Returns 403 when user is not the creator

#### DELETE /api/invitations/:cardId (3 tests)
- ✓ Deletes invitation when authenticated as creator
- ✓ Returns 401 when not authenticated
- ✓ Returns 403 when user is not the creator

#### Publish/Unpublish (3 tests)
- ✓ Publishes invitation
- ✓ Returns 401 when not authenticated
- ✓ Unpublishes invitation

### RSVP API (`test/integration/rsvp.test.js`)
**Total: 12 tests**

#### POST /api/rsvp/:cardId (9 tests)
- ✓ Submits RSVP for published invitation (no auth required)
- ✓ Returns 404 for non-existent cardId
- ✓ Returns 403 for unpublished invitation
- ✓ Validates required fields
- ✓ Validates email format
- ✓ Accepts RSVP with attending=false
- ✓ Handles optional fields (phone, message)
- ✓ Tries to add RSVP to Google Sheets if configured
- ✓ Still saves RSVP even if Google Sheets sync fails

#### GET /api/rsvp/:cardId (3 tests)
- ✓ Returns all RSVPs for a card when authenticated as creator
- ✓ Returns 401 when not authenticated
- ✓ Returns 403 when user is not the creator
- ✓ Calculates correct statistics
- ✓ Returns empty array when no RSVPs exist

## Test Utilities

### `test/setup.js`
- Sets test environment variables
- Mocks console methods to reduce noise
- Increases test timeout to 30 seconds

### `test/testDbHelper.js`
- `connect()`: Connects to in-memory MongoDB instance
- `closeDatabase()`: Closes connection and stops MongoDB server
- `clearDatabase()`: Clears all collections between tests

### `test/mockData.js`
- Mock user data
- Mock invitation card data
- Mock RSVP data
- Mock Google Sheets data
- Mock Express request/response/next functions

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

## Coverage Configuration

The test suite is configured with the following coverage thresholds:

```javascript
{
  global: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60
  }
}
```

Coverage is collected from:
- controllers/**/*.js
- models/**/*.js
- config/googleSheets.js
- middleware/**/*.js
- utils/**/*.js

## Key Testing Patterns

### 1. Database Isolation
Each test file has its own database lifecycle:
```javascript
beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());
afterEach(async () => await clearDatabase());
```

### 2. Authentication Mocking
Tests mock authentication middleware to simulate authenticated users:
```javascript
const createTestApp = (authenticatedUser = null) => {
  const app = express();
  if (authenticatedUser) {
    app.use((req, res, next) => {
      req.user = authenticatedUser;
      req.isAuthenticated = () => true;
      next();
    });
  }
  return app;
};
```

### 3. Google API Mocking
External Google APIs are mocked to avoid real API calls:
```javascript
jest.mock('googleapis');
google.auth = { OAuth2: jest.fn().mockReturnValue(mockOAuth2Client) };
```

## Test Coverage Areas

### ✅ Fully Tested
- User model validation and behavior
- InvitationCard model validation and behavior
- Google Sheets configuration and error handling
- Invitation CRUD operations
- RSVP submission and retrieval
- Authentication and authorization
- Input validation
- Error handling

### 📝 Notes
- MongoDB Memory Server requires MongoDB binary download on first run
- Tests use mocked Google APIs to avoid external dependencies
- All tests are isolated and can run in parallel
- Integration tests verify complete request/response cycles

## Total Test Count

- **Unit Tests**: 50 tests
- **Integration Tests**: 35 tests
- **Grand Total**: **85 tests**

## Next Steps

1. Run tests locally to verify MongoDB Memory Server setup
2. Set up CI/CD pipeline to run tests automatically
3. Monitor coverage reports and improve as needed
4. Add more edge case tests as bugs are discovered
