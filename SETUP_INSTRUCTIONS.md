# Setup Instructions for Screenshots

## Option 1: Frontend Only (Quick Screenshots)

This option shows the UI without backend functionality.

```bash
# Start frontend only
cd /home/user/financial-pro/frontend
npm start
```

**Access:** http://localhost:3000

**What works:**
- ✅ All UI components and layouts
- ✅ Canvas drag-and-drop interface
- ✅ Form inputs and interactions
- ✅ Navbar and navigation
- ❌ Authentication (will show loading/errors)
- ❌ Save/Publish functionality
- ❌ Google Sheets integration

---

## Option 2: Full Stack (Complete Functionality)

### Step 1: Install MongoDB

**Option A - Using apt (if you have sudo):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Option B - Using MongoDB Atlas (Free Cloud Database):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get connection string
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invitation-cards
   ```

**Option C - Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Configure Google OAuth

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create a new project** (or select existing)

3. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Enable "Google Sheets API"
   - Enable "Google Drive API"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Invitation Card Creator"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5000
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```

5. **Copy credentials:**
   - Client ID: Something like `123456789-abcdef.apps.googleusercontent.com`
   - Client Secret: A random string

6. **Update backend/.env:**
   ```bash
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

7. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User type: "External"
   - Add your email as test user
   - Scopes needed:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.readonly`

### Step 3: Install Dependencies (if not already installed)

```bash
# Backend
cd /home/user/financial-pro/backend
npm install

# Frontend
cd /home/user/financial-pro/frontend
npm install
```

### Step 4: Start Servers

**Terminal 1 - Backend:**
```bash
cd /home/user/financial-pro/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/financial-pro/frontend
npm start
```

### Step 5: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

---

## Quick Test Checklist

### Frontend Only:
- [ ] Home page loads
- [ ] Login page shows
- [ ] CardEditor shows (may show auth redirect)
- [ ] Canvas accepts drag-and-drop
- [ ] Forms can be filled

### Full Stack:
- [ ] Home page loads
- [ ] Click "Sign In" → Google OAuth flow works
- [ ] After login, navbar shows user avatar
- [ ] Can access /create page
- [ ] Can drag images to canvas
- [ ] Can fill event details
- [ ] Google Sheets dropdown shows your sheets
- [ ] Can save invitation
- [ ] Can publish invitation
- [ ] Public invitation view works
- [ ] Can submit RSVP
- [ ] RSVP appears in Google Sheet

---

## Current Status

✅ Frontend server starting on http://localhost:3000

⚠️ **MongoDB not running** - Install using one of the methods above

⚠️ **Google OAuth not configured** - Add credentials to backend/.env

⚠️ **Backend server not started** - Start after configuring MongoDB and OAuth

---

## For Screenshots:

**If you just want UI screenshots:**
- Frontend only is sufficient
- Take screenshots of pages as they load
- Some features will show loading/error states (this is OK for UI mockups)

**If you want fully functional screenshots:**
- Complete full stack setup
- Sign in with Google
- Create actual invitations
- Take screenshots of real workflows

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB is running: `systemctl status mongodb`
- Or use MongoDB Atlas cloud database

### "OAuth error" / "Invalid credentials"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env
- Check redirect URI matches: `http://localhost:5000/api/auth/google/callback`
- Ensure your email is added as test user in OAuth consent screen

### "Port already in use"
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`
- Backend (5000): `lsof -ti:5000 | xargs kill -9`

### Frontend shows errors
- Check browser console (F12)
- Verify backend is running (backend should be accessible at http://localhost:5000/api/health)

---

## Need Help?

Check the comprehensive architectural review in `first_review.md` for detailed technical information.
