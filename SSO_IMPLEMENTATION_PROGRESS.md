# Google SSO Implementation Progress

## Overview
Implementing Google OAuth 2.0 SSO for invitation creators to authenticate and link their own Google Sheets. RSVP forms remain **completely public** for guests.

---

## ✅ COMPLETED - Backend

### 1. Dependencies Added
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management
- `connect-mongo` - MongoDB session store

### 2. User Model Created
**File**: `backend/models/User.js`
- Stores Google OAuth tokens (access + refresh tokens)
- Stores user profile (email, name, picture)
- Tracks last login
- Indexes for performance

### 3. InvitationCard Model Updated
**File**: `backend/models/InvitationCard.js`
- Added `creator` field (references User model)
- Added index for creator queries
- Links each invitation to its creator

### 4. Google OAuth Strategy Configured
**File**: `backend/config/passport.js`
- Google OAuth 2.0 strategy
- Requests Google Sheets API scope
- Gets refresh token for long-term access
- Creates/updates users on login
- Stores OAuth tokens in database

### 5. Authentication Middleware
**File**: `backend/middleware/auth.js`
- `isAuthenticated` - Check if user logged in
- `isOwner` - Check if user owns resource
- Protects routes requiring authentication

### 6. Authentication Routes & Controllers
**Files**:
- `backend/routes/authRoutes.js`
- `backend/controllers/authController.js`

**Routes**:
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### 7. Google Sheets Integration Updated
**File**: `backend/config/googleSheets.js`

**Major Changes**:
- Removed service account approach
- Now uses **user's OAuth tokens**
- New function: `getUserSheets()` - Lists user's sheets
- Updated: `addRSVPToSheet()` - Takes user tokens
- Updated: `initializeSheet()` - Takes user tokens
- Better error handling (403, 404)

### 8. Google Sheets Routes
**File**: `backend/routes/googleSheetsRoutes.js`
- `GET /api/sheets/my-sheets` - Get user's Google Sheets (protected)

### 9. Server Configuration Updated
**File**: `backend/server.js`
- Added session middleware with MongoDB store
- Added Passport initialization
- Added auth and sheets routes
- Session persists for 7 days
- Secure cookies in production

### 10. Environment Configuration Updated
**File**: `backend/.env.example`

**New Variables**:
```env
BACKEND_URL=http://localhost:5000
SESSION_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Removed** (no longer needed):
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`

### 11. Invitation Controller Partially Updated
**File**: `backend/controllers/invitationController.js`
- ✅ `createInvitationCard` - Now requires auth, links to creator, uses user tokens
- ⚠️ Other functions still need update (see TODO below)

---

## 🚧 IN PROGRESS / TODO

### Backend

#### 1. Complete Invitation Controller Updates
**File**: `backend/controllers/invitationController.js`

**Functions to update**:

```javascript
// ✅ DONE
const createInvitationCard = asyncHandler(async (req, res) => {
  // Now uses req.user._id as creator
  // Uses req.user.googleTokens for sheet initialization
});

// TODO: Update these functions
const getAllInvitationCards = asyncHandler(async (req, res) => {
  // Filter by creator: InvitationCard.find({ creator: req.user._id })
  // Only show current user's cards (when authenticated)
});

const getInvitationCard = asyncHandler(async (req, res) => {
  // Keep PUBLIC - anyone can view published invitations
  // No auth required
});

const updateInvitationCard = asyncHandler(async (req, res) => {
  // Check ownership: invitationCard.creator.toString() === req.user._id.toString()
  // Use user tokens for sheet initialization
});

const publishInvitationCard = asyncHandler(async (req, res) => {
  // Check ownership before publishing
});

const deleteInvitationCard = asyncHandler(async (req, res) => {
  // Check ownership before deleting
});
```

#### 2. Update RSVP Controller
**File**: `backend/controllers/rsvpController.js`

**Critical Change**:
```javascript
const submitRSVP = asyncHandler(async (req, res) => {
  // 1. Find invitation card
  // 2. Populate creator field
  // 3. Get creator's Google tokens
  // 4. Pass creator tokens to addRSVPToSheet()

  const invitationCard = await InvitationCard.findOne({ cardId }).populate('creator');

  if (invitationCard.googleSheetId && invitationCard.creator.googleTokens) {
    await addRSVPToSheet(
      invitationCard.googleSheetId,
      rsvp.toObject(),
      invitationCard.creator.googleTokens  // <-- Creator's tokens!
    );
  }
});
```

#### 3. Update Invitation Routes
**File**: `backend/routes/invitationRoutes.js`

Add authentication to protected routes:
```javascript
const { isAuthenticated } = require('../middleware/auth');

// Protected routes (require login)
router.post('/', isAuthenticated, invitationValidation, validate, createInvitationCard);
router.get('/', isAuthenticated, getAllInvitationCards);
router.put('/:cardId', isAuthenticated, cardIdValidation, validate, updateInvitationCard);
router.post('/:cardId/publish', isAuthenticated, cardIdValidation, validate, publishInvitationCard);
router.delete('/:cardId', isAuthenticated, cardIdValidation, validate, deleteInvitationCard);

// Public route (no auth needed)
router.get('/:cardId', cardIdValidation, validate, getInvitationCard);
```

#### 4. Update Validation Middleware
**File**: `backend/middleware/validation.js`

Remove `creator` validation (automatically set from req.user):
```javascript
// invitationValidation should NOT validate creator
// It's automatically set from authenticated user
```

---

### Frontend

#### 1. Add Auth API Endpoints
**File**: `frontend/src/services/api.js`

```javascript
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }
};

export const sheetsAPI = {
  getMySheets: () => api.get('/sheets/my-sheets')
};
```

#### 2. Create User Context
**File**: `frontend/src/context/UserContext.js`

```javascript
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    authAPI.loginWithGoogle();
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
```

#### 3. Create Login Page/Component
**File**: `frontend/src/pages/Login.js`

```javascript
const Login = () => {
  const { login } = useUserContext();

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Invitation Card Creator
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Sign in with Google to create and share beautiful invitations
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={login}
      >
        Sign in with Google
      </Button>
    </Box>
  );
};
```

#### 4. Create Navigation Bar with Auth
**File**: `frontend/src/components/Navbar.js`

```javascript
const Navbar = () => {
  const { user, logout } = useUserContext();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Invitation Card Creator
        </Typography>
        {user ? (
          <>
            <Avatar src={user.picture} alt={user.name} />
            <Typography sx={{ mx: 2 }}>{user.name}</Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
```

#### 5. Create Google Sheets Selector
**File**: `frontend/src/components/GoogleSheetsSelector.js`

```javascript
const GoogleSheetsSelector = ({ value, onChange }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await sheetsAPI.getMySheets();
      setSheets(response.data.data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Select Google Sheet</InputLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {sheets.map((sheet) => (
          <MenuItem key={sheet.id} value={sheet.id}>
            {sheet.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

#### 6. Update EventDetailsForm
**File**: `frontend/src/components/EventDetailsForm.js`

Replace text input with GoogleSheetsSelector:
```javascript
import GoogleSheetsSelector from './GoogleSheetsSelector';

// Replace the TextField for Google Sheet ID with:
<GoogleSheetsSelector
  value={googleSheetId}
  onChange={setGoogleSheetId}
/>
```

#### 7. Update CardEditor Page
**File**: `frontend/src/pages/CardEditor.js`

Add authentication check:
```javascript
const CardEditor = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ... rest of component
};
```

#### 8. Update App.js with User Context
**File**: `frontend/src/App.js`

```javascript
import { UserProvider } from './context/UserContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <CardProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create" element={<CardEditor />} />
              <Route path="/invitation/:cardId" element={<InvitationView />} />
            </Routes>
          </Router>
        </CardProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

#### 9. Update Axios Config for Credentials
**File**: `frontend/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // <-- IMPORTANT for cookies/sessions
});
```

---

## Setup Instructions

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**
3. **Enable APIs**:
   - Google Sheets API
   - Google Drive API (for listing sheets)
4. **Create OAuth 2.0 Credentials**:
   - Go to: APIs & Services > Credentials
   - Click: Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret

5. **Configure OAuth Consent Screen**:
   - Add scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/spreadsheets`
   - Add test users (for development)

### 2. Backend Environment Setup

Update `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invitation-cards
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Session
SESSION_SECRET=super-secret-key-minimum-32-characters-long

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

### 3. Install New Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Test OAuth Flow

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`
4. Go to: http://localhost:3000
5. Click "Sign in with Google"
6. Authorize the application
7. You should be redirected back logged in

---

## Authentication Flow

### 1. Creator (Inviter) Flow
```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions (profile + Google Sheets access)
4. Google redirects to: /api/auth/google/callback
5. Backend:
   - Creates/updates User in database
   - Stores OAuth tokens (access + refresh)
   - Creates session
6. User redirected to frontend (logged in)
7. User can now:
   - Create invitations
   - Select their Google Sheets
   - Publish invitations
```

### 2. Guest (RSVP) Flow
```
1. Guest receives invitation link
2. Opens: /invitation/{cardId}
3. Views invitation (NO AUTH REQUIRED)
4. Fills out RSVP form (NO AUTH REQUIRED)
5. Submits RSVP
6. Backend:
   - Saves RSVP to database
   - Fetches invitation creator
   - Uses CREATOR'S OAuth tokens
   - Adds RSVP to CREATOR'S Google Sheet
7. Guest sees confirmation (NO ACCOUNT NEEDED)
```

---

## Key Benefits

✅ **Secure**: Each user can only access their own Google Sheets
✅ **No Service Account**: No shared credentials to manage
✅ **Better UX**: Users see their actual sheets in a dropdown
✅ **Flexible**: Each invitation can use different sheets
✅ **Guest-Friendly**: RSVP requires no login/account
✅ **Scalable**: No API quota issues (each user has their own)

---

## Security Considerations

1. **Session Security**:
   - Secure cookies in production (HTTPS)
   - HTTPOnly cookies prevent XSS
   - SameSite prevents CSRF

2. **Token Storage**:
   - Tokens stored in MongoDB (not localStorage)
   - Refresh token allows long-term access
   - Access token refreshed automatically

3. **Authorization**:
   - Users can only modify their own invitations
   - Ownership checks on all mutation endpoints
   - Public endpoints (view, RSVP) don't require auth

4. **CORS**:
   - Credentials: true
   - Origin validation
   - Specific allowed origins

---

## Testing Checklist

### Backend
- [ ] User can sign in with Google
- [ ] User profile stored correctly
- [ ] OAuth tokens stored securely
- [ ] Session persists across requests
- [ ] User can logout
- [ ] Protected routes require authentication
- [ ] Users can only modify their own invitations
- [ ] Google Sheets API works with user tokens
- [ ] RSVP uses creator's tokens (not submitter's)

### Frontend
- [ ] Login button visible when not authenticated
- [ ] User redirected to login when accessing protected pages
- [ ] User profile displayed after login
- [ ] Google Sheets dropdown shows user's sheets
- [ ] User can create invitations while logged in
- [ ] User can view own invitations
- [ ] Logout works correctly
- [ ] Public invitation view works without login
- [ ] RSVP submission works without login

---

## Next Steps

1. **Complete Backend Updates**:
   - Finish updating invitation controller
   - Update RSVP controller
   - Add authentication to routes
   - Test all endpoints

2. **Complete Frontend Implementation**:
   - Create User context
   - Create Login page
   - Create Navbar with auth
   - Create Google Sheets selector
   - Update Card Editor
   - Update API service
   - Test authentication flow

3. **Testing**:
   - Test full OAuth flow
   - Test sheet selection
   - Test RSVP with creator's sheet
   - Test ownership checks

4. **Documentation**:
   - Update main README
   - Document OAuth setup
   - Add troubleshooting guide

---

## Progress Status

| Component | Status |
|-----------|--------|
| Backend - User Model | ✅ Complete |
| Backend - OAuth Strategy | ✅ Complete |
| Backend - Auth Routes | ✅ Complete |
| Backend - Auth Middleware | ✅ Complete |
| Backend - Google Sheets Update | ✅ Complete |
| Backend - Server Config | ✅ Complete |
| Backend - Invitation Controller | 🚧 In Progress (50%) |
| Backend - RSVP Controller | ⚠️ TODO |
| Backend - Route Protection | ⚠️ TODO |
| Frontend - User Context | ⚠️ TODO |
| Frontend - Login Page | ⚠️ TODO |
| Frontend - Navbar | ⚠️ TODO |
| Frontend - Sheets Selector | ⚠️ TODO |
| Frontend - API Updates | ⚠️ TODO |
| Frontend - Protected Routes | ⚠️ TODO |
| Testing | ⚠️ TODO |
| Documentation | ⚠️ TODO |

---

**Last Updated**: Current Session
**Estimated Remaining Work**: 6-8 hours
**Status**: Backend ~60% complete, Frontend not started
