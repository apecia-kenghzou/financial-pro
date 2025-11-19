# Authentication Flow & Google Token Management

## Overview

This application uses **session-based authentication** with Google OAuth 2.0. The frontend does NOT manually pass Google tokens - instead, tokens are stored server-side and accessed via sessions.

## Architecture Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend    │         │   Google    │
│   (React)   │         │   (Express)  │         │    OAuth    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                         │
       │  1. Click "Login"      │                         │
       ├───────────────────────>│                         │
       │                        │  2. Redirect to Google  │
       │                        ├────────────────────────>│
       │                        │                         │
       │       3. User authorizes app                     │
       │                        │<────────────────────────┤
       │                        │  4. Auth code + tokens  │
       │                        │                         │
       │  5. Save to DB         │                         │
       │    ┌──────────────┐    │                         │
       │    │   MongoDB    │    │                         │
       │    │  googleTokens│<───┤                         │
       │    └──────────────┘    │                         │
       │                        │                         │
       │<───────────────────────┤                         │
       │   6. Redirect with     │                         │
       │      session cookie    │                         │
       │                        │                         │
       │  7. API call with cookie                         │
       ├───────────────────────>│                         │
       │                        │  8. Load user from DB   │
       │                        │     (includes tokens)   │
       │                        │                         │
       │                        │  9. Use tokens for API  │
       │                        ├────────────────────────>│
       │                        │                         │
       │<───────────────────────┤                         │
       │   10. Return data      │                         │
```

## Step-by-Step Flow

### 1. User Login

**Frontend** (`frontend/src/services/api.js:17-19`):
```javascript
loginWithGoogle: () => {
  window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/google`;
}
```

**Backend** (`backend/routes/authRoutes.js:10-18`):
```javascript
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  accessType: 'offline',  // Get refresh token
  prompt: 'consent'        // Force consent to ensure refresh token
}));
```

### 2. Google OAuth Callback

**Backend** (`backend/config/passport.js:37-77`):
```javascript
async (accessToken, refreshToken, profile, done) => {
  // Store tokens in database
  user.googleTokens = {
    accessToken,
    refreshToken,
    expiryDate: Date.now() + 3600 * 1000  // 1 hour
  };
  await user.save();
  return done(null, user);
}
```

### 3. Session Management

**Serialize User** (`backend/config/passport.js:7-9`):
```javascript
passport.serializeUser((user, done) => {
  done(null, user.id);  // Only store user ID in session
});
```

**Deserialize User** (`backend/config/passport.js:12-20`):
```javascript
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);  // Load FULL user with tokens
  done(null, user);
});
```

**Session Config** (`backend/server.js:33-47`):
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));
```

### 4. Frontend API Calls

**Axios Configuration** (`frontend/src/services/api.js:5-11`):
```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // ✅ CRITICAL: Sends cookies with every request
});
```

### 5. Backend Token Access

**Controller Example** (`backend/controllers/googleSheetsController.js:27-28`):
```javascript
const result = await getUserSheets(
  req.user.googleTokens,  // ✅ Tokens available here!
  req.user._id.toString()
);
```

## How Tokens Flow

### ❌ What Does NOT Happen:
- Frontend does NOT store tokens
- Frontend does NOT send tokens in headers
- Frontend does NOT manage token refresh

### ✅ What Actually Happens:

1. **Storage**: Tokens stored in MongoDB (`User.googleTokens`)
2. **Session**: Session cookie contains only user ID
3. **Request**: Frontend sends session cookie with each request (`withCredentials: true`)
4. **Deserialization**: Backend loads full user object from database (including tokens)
5. **Access**: Controllers access `req.user.googleTokens` directly
6. **Refresh**: Backend automatically refreshes expired tokens (`backend/config/googleSheets.js:11-60`)

## Token Refresh Mechanism

**Auto-refresh** (`backend/config/googleSheets.js:11-60`):
```javascript
const refreshTokenIfNeeded = async (userId, userTokens) => {
  const now = Date.now();
  const expiryBuffer = 5 * 60 * 1000;  // 5 minutes

  if (!userTokens.expiryDate || now >= userTokens.expiryDate - expiryBuffer) {
    // Refresh the token
    const oauth2Client = new google.auth.OAuth2(...);
    oauth2Client.setCredentials({ refresh_token: userTokens.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update in database
    await User.findByIdAndUpdate(userId, {
      googleTokens: {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || userTokens.refreshToken,
        expiryDate: credentials.expiry_date
      }
    });
  }
};
```

## Debugging Guide

### Test 1: Check if Frontend Sends Cookies

Open browser DevTools → Network tab:
1. Make any API call to backend
2. Check Request Headers
3. Look for `Cookie: connect.sid=...`

**Expected**: ✅ Cookie header present
**If missing**: ❌ Check `withCredentials: true` in axios config

### Test 2: Check if Backend Has Tokens

Call the debug endpoint:
```bash
# After logging in, call:
curl -X GET http://localhost:5000/api/auth/debug/tokens \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  --cookie-jar cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "hasGoogleTokens": true,
    "hasAccessToken": true,
    "hasRefreshToken": true,
    "tokenExpiry": "2025-11-19T10:30:00.000Z",
    "isTokenExpired": false,
    "sessionValid": true
  }
}
```

**If `hasGoogleTokens: false`**:
- User not logged in via Google OAuth
- Tokens not saved during login
- Check backend logs for OAuth errors

### Test 3: Check MongoDB

```javascript
// Connect to MongoDB
use invitation_cards

// Check user document
db.users.findOne({ email: "your@email.com" })

// Should see:
{
  _id: ObjectId("..."),
  email: "your@email.com",
  googleTokens: {
    accessToken: "ya29.a0...",
    refreshToken: "1//0g...",
    expiryDate: 1700396400000
  }
}
```

### Test 4: Check Backend Logs

In backend logs, look for:
```
Google OAuth callback for user: 123456789
Updated existing user: user@example.com
Token refreshed and saved for user: 507f1f77bcf86cd799439011
```

### Test 5: Test Google Sheets API

After logging in, try:
```bash
curl -X GET http://localhost:5000/api/sheets/my-sheets \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**Expected**: List of your Google Sheets
**If fails**: Check debug tokens endpoint first

## Common Issues & Solutions

### Issue 1: "User not authenticated"

**Cause**: Session cookie not sent
**Fix**: Verify `withCredentials: true` in frontend axios config

### Issue 2: "No Google tokens available"

**Cause**: Tokens not saved during OAuth flow
**Fix**:
1. Check if Google OAuth scopes include spreadsheets
2. Verify `accessType: 'offline'` in OAuth config
3. Check if `refreshToken` is being saved

### Issue 3: "Authentication failed. Please sign in again."

**Cause**: Tokens expired and refresh failed
**Fix**:
1. Check if `refreshToken` exists in database
2. Verify refresh token is valid (not revoked)
3. Check Google OAuth credentials are correct

### Issue 4: "Permission denied. Please grant access to Google Drive."

**Cause**: User didn't grant Sheets permission during OAuth
**Fix**:
1. Use `prompt: 'consent'` to force re-authorization
2. Ensure scopes include: `https://www.googleapis.com/auth/spreadsheets`

## Security Considerations

### ✅ Good Practices (Implemented):

1. **Tokens never sent to frontend**
   - Stored only in backend database
   - Not included in `/api/auth/me` response

2. **HttpOnly cookies**
   - Session cookies can't be accessed by JavaScript
   - Prevents XSS attacks

3. **Automatic token refresh**
   - Backend handles refresh transparently
   - 5-minute buffer before expiry

4. **Secure cookies in production**
   - HTTPS-only cookies when deployed
   - SameSite protection

### ❌ What NOT to Do:

1. Don't send tokens to frontend
2. Don't store tokens in localStorage/sessionStorage
3. Don't include tokens in URL parameters
4. Don't log tokens in console

## File Reference

**Frontend**:
- `frontend/src/services/api.js` - Axios config with `withCredentials`
- `frontend/src/context/UserContext.js` - User state management

**Backend**:
- `backend/config/passport.js` - OAuth strategy & serialize/deserialize
- `backend/config/googleSheets.js` - Token refresh & Google API calls
- `backend/server.js` - Session & CORS configuration
- `backend/routes/authRoutes.js` - Auth endpoints
- `backend/controllers/authController.js` - Auth logic
- `backend/controllers/googleSheetsController.js` - Sheets API with tokens
- `backend/models/User.js` - User schema with googleTokens field

## Testing Checklist

- [ ] User can log in with Google
- [ ] Session cookie is created
- [ ] Tokens are saved to database
- [ ] `/api/auth/me` returns user info (without tokens)
- [ ] `/api/auth/debug/tokens` shows `hasGoogleTokens: true`
- [ ] `/api/sheets/my-sheets` returns Google Sheets list
- [ ] Tokens auto-refresh before expiry
- [ ] Logout clears session and cookies

## Conclusion

The frontend does NOT manually pass Google tokens. Instead:

1. **Login**: User authenticates with Google → tokens saved to database
2. **Session**: Session cookie links requests to user in database
3. **Request**: Frontend sends cookie → backend loads user with tokens
4. **API**: Backend uses `req.user.googleTokens` for Google API calls

This is a **secure, industry-standard pattern** for OAuth token management.
