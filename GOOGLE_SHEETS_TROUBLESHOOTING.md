# Google Sheets Integration - Troubleshooting Guide

## Issue: "Permission denied. Please grant access to Google Drive/Sheets"

This error occurs when the Google Drive API scope is not properly configured or granted.

## Root Cause

The application uses **Google Drive API** to list your spreadsheets (via `drive.files.list()`), which requires the Drive API scope in addition to the Sheets API scope.

**Required Scopes**:
1. `https://www.googleapis.com/auth/spreadsheets` - Read/write Google Sheets content
2. `https://www.googleapis.com/auth/drive.readonly` - List user's Google Sheets files

## Solution Steps

### Step 1: Enable Drive API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with your OAuth credentials)
3. Go to **APIs & Services** → **Library**
4. Search for "**Google Drive API**"
5. Click **Enable** (if not already enabled)

### Step 2: Verify OAuth Consent Screen Scopes

1. Go to **APIs & Services** → **OAuth consent screen**
2. Scroll down to **Scopes for Google APIs**
3. Click **Edit App**
4. Click **Add or Remove Scopes**
5. Ensure these scopes are added:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/spreadsheets`
   - `../auth/drive.readonly` ← **This must be present!**
6. Click **Update** and **Save and Continue**

### Step 3: Restart Backend

If you updated the code (already done in latest commit):

```bash
# If using Docker:
docker compose down
docker compose up --build

# If running locally:
npm run dev
```

### Step 4: Re-authenticate

**IMPORTANT**: You must log out and log back in to grant the new permissions!

1. In the app, click **Logout**
2. Click **Login with Google**
3. You should see a consent screen showing:
   - ✅ See and download all your Google Drive files
   - ✅ See, edit, create, and delete your spreadsheets
   - ✅ See your primary Google Account email address
   - ✅ See your personal info
4. Click **Continue** to grant permissions

## Verification

After re-authenticating, test the integration:

### Test 1: Check Token Status
```bash
GET http://localhost:5000/api/auth/debug/tokens
```

Expected response:
```json
{
  "success": true,
  "data": {
    "hasGoogleTokens": true,
    "hasAccessToken": true,
    "hasRefreshToken": true,
    "isTokenExpired": false
  }
}
```

### Test 2: List Google Sheets
```bash
GET http://localhost:5000/api/sheets/my-sheets
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1abc...",
      "name": "My Spreadsheet",
      "createdTime": "2025-01-01T00:00:00.000Z",
      "modifiedTime": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

## Common Issues

### Issue 1: "Access blocked: Authorization Error"

**Cause**: OAuth app is in testing mode and user not added as test user

**Solution**:
1. Go to **OAuth consent screen**
2. Under **Test users**, click **Add Users**
3. Add your email address
4. Save changes
5. Re-authenticate

### Issue 2: Still getting "Permission denied" after re-auth

**Cause**: Old tokens cached in database without new scope

**Solution** (Option 1 - Clean):
1. Logout from app
2. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
3. Find your app and click **Remove Access**
4. Log back into your app (this will request permissions again)

**Solution** (Option 2 - Database):
```bash
# Connect to MongoDB
mongo invitation_cards

# Delete user's tokens (forces re-auth)
db.users.updateOne(
  { email: "your@email.com" },
  { $unset: { googleTokens: "" } }
)
```

Then log back in.

### Issue 3: "Drive API has not been used in project"

**Cause**: Drive API not enabled in Google Cloud Console

**Solution**:
1. Follow Step 1 above to enable Drive API
2. Wait 1-2 minutes for propagation
3. Try again

### Issue 4: Consent screen doesn't show Drive permissions

**Cause**: Scopes not updated in code

**Solution**:
1. Verify `backend/routes/authRoutes.js` line 15:
   ```javascript
   'https://www.googleapis.com/auth/drive.readonly'
   ```
2. Verify `backend/config/passport.js` line 33:
   ```javascript
   'https://www.googleapis.com/auth/drive.readonly'
   ```
3. Restart backend
4. Clear browser cache
5. Try logging in again

## Understanding the Error

When you see "Permission denied. Please grant access to Google Drive":

1. **Frontend** sends API request with session cookie
2. **Backend** deserializes user with stored Google tokens
3. **Backend** tries to call Drive API: `drive.files.list()`
4. **Google API** returns 403 Forbidden because:
   - Token doesn't have `drive.readonly` scope
   - OR Drive API not enabled in project

The fix requires:
- ✅ Adding scope to OAuth configuration (code)
- ✅ Enabling Drive API in Google Cloud Console
- ✅ Re-authenticating to get new tokens with correct scopes

## Quick Checklist

Before asking for help, verify:

- [ ] Drive API is enabled in Google Cloud Console
- [ ] OAuth consent screen includes `drive.readonly` scope
- [ ] Backend code has both scopes (Sheets + Drive)
- [ ] Backend has been restarted
- [ ] User has logged out and logged back in
- [ ] Consent screen showed Drive permissions
- [ ] `/api/auth/debug/tokens` shows `hasGoogleTokens: true`

## Support

If issues persist after following all steps:

1. Check backend logs for detailed error messages:
   ```bash
   docker compose logs -f backend
   ```

2. Check browser console for frontend errors

3. Verify Google Cloud Console:
   - APIs & Services → Dashboard
   - Should show "Google Drive API" and "Google Sheets API" as enabled

4. Check OAuth credentials:
   - Redirect URIs should include: `http://localhost:5000/api/auth/google/callback`

## Files Modified

The following files were updated to add Drive API scope:

- `backend/routes/authRoutes.js` (line 15)
- `backend/config/passport.js` (line 33)

Changes are in commit: "fix: Add Google Drive API scope for listing sheets"
